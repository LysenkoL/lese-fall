/**
 * Ende des Falls ohne die 24 Spuren davor: startet mit einem Speicherstand „alle Spuren gelöst“ direkt im Finale.
 * Finale nach D-19 (vier Bildschirme): Tresor-Code legen → Tresor offen mit goldener Lupe → Urkunde mit Wahl
 * „Detektiv / Detektivin“ und Satz der Raupe → Epilog. Dazu: Zurück/Vor durch die Kette Fallkarte ← Code ← Tresor ← Urkunde ← Epilog,
 * Android-Zurück, alter Spielstand (sieben Schritte), Haus der Lese-Raupe, Fall-Album (Spur noch einmal), Seite „Fall gelöst“,
 * „Meine Urkunde“ (Wahl sichtbar und änderbar), Neustart der App und die Ankündigung „Neu im Haus“ mitten im Buch.
 * Vorher: npm run build && npx vite preview --port 4173   (oder ein Dev-Server, dann BASE_URL setzen)
 * Aufruf: node scripts/e2e-v8-ende.mjs [breite höhe name]
 * Umgebung: BASE_URL (Standard http://localhost:4173), OUT_DIR (Standard 03_screens/v8_ende/<name>),
 *           FINALE_JSON = JSON-Datei mit `finale` (z. B. ../04_data/kapitel4_v8_raetsel.json): ersetzt das Finale der
 *           gebauten Daten in der Seite (Texte dann ohne Silben), solange buch1_v8.json noch nicht neu gebaut ist.
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon'];
const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '');
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR, NAME) : resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8_ende', NAME);
const FINALE = process.env.FINALE_JSON ? JSON.parse(readFileSync(process.env.FINALE_JSON, 'utf8')).finale : null;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: false });
p.setDefaultTimeout(10000);
// Finale aus FINALE_JSON: einsetzen, sobald main.ts window.__v8 setzt (vor dem ersten Bildschirm)
if (FINALE) await p.addInitScript((F) => {
  let v; Object.defineProperty(window, '__v8', { configurable: true, get: () => v, set: (x) => { v = x; const k = x?.D?.kapitel; if (k) k[k.length - 1].finale = F; } });
}, FINALE);
const fehler = [];
p.on('pageerror', (e) => fehler.push('Seitenfehler: ' + String(e)));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push('Konsole: ' + m.text()); });
let nr = 0;
const shot = async (name) => { await sleep(500); await p.screenshot({ path: `${OUT}/${String(++nr).padStart(2, '0')}_${name}.png` }); };
const klick = async (s) => { await p.click(s); await sleep(130); };
const ev = (f, a) => p.evaluate(f, a);
const messen = async (wo) => {
  await sleep(400);
  const m = await ev(() => {
    const A = document.getElementById('app').getBoundingClientRect();
    const breit = [...document.querySelectorAll('#app *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > A.right + 1 || r.left < A.left - 1) && !e.closest('.ausschn, .brush, .tv, .nt-bild, .konfetti, .feuerwerk') && !e.classList.contains('lampe');
    }).map((e) => e.className || e.tagName).slice(0, 3);
    const bl = document.querySelector('.blatt:not(.probe)'), br = document.querySelector('#buehne > .brett');
    return {
      breit, doc: document.documentElement.scrollWidth > innerWidth,
      rollt: bl ? bl.scrollHeight > bl.clientHeight + 2 : false,
      brettRollt: br ? br.scrollHeight > br.clientHeight + 2 : false,
      pipe: [...document.querySelectorAll('#app *')].filter((e) => !e.children.length && e.textContent.includes('|')).map((e) => e.textContent.slice(0, 30)).slice(0, 3),
      fussAb: (() => { const f = document.getElementById('fuss').getBoundingClientRect(); return f.bottom > innerHeight + 1; })(),
    };
  });
  if (m.breit.length) fehler.push(`${wo}: Elemente ragen seitlich hinaus: ${m.breit.join(', ')}`);
  if (m.pipe.length) fehler.push(`${wo}: sichtbares „|“ im Text: ${m.pipe.join(' / ')}`);
  if (m.doc) fehler.push(`${wo}: waagerechte Bildlaufleiste`);
  if (m.rollt) fehler.push(`${wo}: Leseblatt läuft über`);
  if (m.brettRollt) fehler.push(`${wo}: Brett läuft über`);
  if (m.fussAb) fehler.push(`${wo}: Fußzeile außerhalb`);
};
const S = async (name) => { await shot(name); await messen(name); };
const weiter = () => klick('#fuss [data-a="weiter"]');
const loese = async () => { await ev(() => window.__v8.loese()); await sleep(300); };
const wo = () => ev(() => ({ v: window.__v8.stand.view, f: window.__v8.stand.fin }));
/** Urkunde: sichtbare Überschrift, Wahl, Knöpfe ≥ 44 px, nichts in der Urkunde abgeschnitten */
const urkunde = (sel) => ev((sel) => {
  const u = document.querySelector(sel);
  if (!u) return null;
  const sichtbar = (e) => !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  const di = u.querySelector('.dipl-in'), R = di.getBoundingClientRect();
  return {
    wahl: u.dataset.wahl, titel: [...u.querySelectorAll('.dt > span')].filter(sichtbar).map((e) => e.textContent).join(''),
    knoepfe: [...u.querySelectorAll('.dw-b')].map((k) => ({ w: k.dataset.wahl, an: k.getAttribute('aria-pressed'), h: k.getBoundingClientRect().height, voll: k.scrollWidth > k.clientWidth + 1 })),
    ab: [...di.children].filter((c) => { const r = c.getBoundingClientRect(); return r.bottom > R.bottom + .5 || r.top < R.top - .5 || r.right > R.right + .5 || r.left < R.left - .5; }).map((c) => c.className || c.tagName),
    dtBreit: u.querySelector('.dt').scrollWidth > u.querySelector('.dt').clientWidth + 1,
  };
}, sel);
const pruefeUrkunde = (u, wo, wahl) => {
  if (!u) return fehler.push(`${wo}: Urkunde fehlt`);
  if (u.wahl !== wahl) fehler.push(`${wo}: Wahl ist „${u.wahl}“, erwartet „${wahl}“`);
  if (!u.titel.replace(/\|/g, '').endsWith(wahl === 'detektivin' ? 'Detektivin' : 'Detektiv')) fehler.push(`${wo}: Überschrift „${u.titel}“ passt nicht zu „${wahl}“`);
  if (u.knoepfe.length !== 2) fehler.push(`${wo}: nicht zwei Knöpfe Detektiv/Detektivin`);
  for (const k of u.knoepfe) {
    if (k.h < 44) fehler.push(`${wo}: Knopf ${k.w} nur ${Math.round(k.h)} px hoch`);
    if (k.voll) fehler.push(`${wo}: Text im Knopf ${k.w} passt nicht`);
    if ((k.an === 'true') !== (k.w === wahl)) fehler.push(`${wo}: Knopf ${k.w} zeigt die Wahl falsch an`);
  }
  if (u.ab.length) fehler.push(`${wo}: in der Urkunde abgeschnitten: ${u.ab.join(', ')}`);
  if (u.dtBreit) fehler.push(`${wo}: Überschrift der Urkunde zu breit`);
};

const D = await (async () => { await p.goto(BASE + '/v8.html'); await sleep(900); return ev(() => window.__v8.D); })();
const F = D.kapitel[D.kapitel.length - 1].finale;
/** Finale: Tresor-Code selbst legen (erst falsch, dann richtig, einmal ziehen), Tresor offen mit Lupe, Urkunde, Epilog */
async function finale() {
  const wort = D.kapitel[0].code.wort;
  if ((await wo()).f !== 0) fehler.push('Finale beginnt nicht mit dem Tresor-Code');
  await S('finale_code_start');
  if (!(await p.$('.fin[data-art="tresorcode"] .fin-karten .fin-k'))) fehler.push('Finale: Tresor-Code fehlt');
  const karten = async () => ev(() => [...document.querySelectorAll('.fin-k:not(.weg)')].map((e) => ({ k: +e.dataset.k, c: e.textContent.trim() })));
  // 1. Versuch: Kärtchen in der angezeigten Reihenfolge antippen (ist nie die richtige)
  for (const k of await karten()) { await p.click(`.fin-k[data-k="${k.k}"]`); await sleep(80); }
  await sleep(300); await S('finale_code_falsch'); await sleep(1200);
  // danach: fehlende Felder von links nach rechts füllen, das erste Kärtchen mit der Maus ziehen
  let gezogen = false;
  for (let i = 0; i < wort.length; i++) {
    const voll = await ev((i) => document.querySelector(`.fin-f[data-f="${i}"]`).classList.contains('voll'), i);
    if (voll) continue;
    const k = (await karten()).find((q) => q.c === wort[i]);
    if (!gezogen) {
      gezogen = true;
      const a = await (await p.$(`.fin-k[data-k="${k.k}"]`)).boundingBox(), t = await (await p.$(`.fin-f[data-f="${i}"]`)).boundingBox();
      await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
      await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
      await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot('finale_ziehen'); await p.mouse.up(); await sleep(250);
    } else { await p.click(`.fin-k[data-k="${k.k}"]`); await sleep(150); }
  }
  await sleep(300); await shot('finale_code_richtig');
  // Tresor öffnet sich: erst Tür und Licht, dann liegt die goldene Lupe drin und die Raupe schenkt sie
  for (let t = 0; t < 40 && (await wo()).f !== 1; t++) await sleep(100);
  if ((await wo()).f !== 1) fehler.push('Finale: nach dem Code nicht beim offenen Tresor');
  if (await p.$('#fuss [data-a="weiter"]')) fehler.push('Tresor: „Danke!“ steht schon vor dem Öffnen da');
  await sleep(1000); await shot('finale_tresor_auf_start'); // Tür offen, Licht, Konfetti; Lupe erscheint
  await p.waitForSelector('#fuss [data-a="weiter"]', { timeout: 5000 }).catch(() => fehler.push('Tresor: „Danke!“ erscheint nicht'));
  await sleep(700); await S('finale_tresor_lupe');
  if (!(await p.$('.tresor-auf .tv.auf .tv-lupe img[src*="goldene_lupe"]'))) fehler.push('Tresor: goldene Lupe liegt nicht im offenen Tresor');
  if (await p.$('#buehne img[src*="finale_bild"]')) fehler.push('Tresor: altes Bild finale_bild wird noch gezeigt');
  if (!(await p.$('.tresor-auf .zr:not(.wartet) .rp'))) fehler.push('Tresor: Sprechblase der Raupe fehlt');
  if (await ev(() => [...document.querySelectorAll('#buehne > .konfetti, #buehne > .feuerwerk')].some((k) => !k.classList.contains('hinten')))) fehler.push('Tresor: Konfetti liegt nicht hinter dem Text');
  if (await ev(() => { const z = document.querySelector('.tresor-auf'); return z.scrollHeight > z.clientHeight + 2; })) fehler.push('Tresor: passt nicht auf den Bildschirm');
  await klick('#fuss [data-a="weiter"]'); // „Danke!“
  // Urkunde: Name, Wahl „Detektiv / Detektivin“, Satz der Raupe
  await p.fill('#dname', 'Mia'); await sleep(200); await S('finale_urkunde');
  if ((await wo()).f !== 2) fehler.push('Finale: nach „Danke!“ nicht bei der Urkunde');
  pruefeUrkunde(await urkunde('#buehne .urk'), 'Urkunde', 'detektiv');
  await klick('#buehne .dw-b[data-wahl="detektivin"]'); await S('finale_urkunde_detektivin');
  pruefeUrkunde(await urkunde('#buehne .urk'), 'Urkunde (Detektivin)', 'detektivin');
  if ((await ev(() => JSON.parse(localStorage.getItem('lesefall.v8')).titel)) !== 'detektivin') fehler.push('Urkunde: Wahl „Detektivin“ nicht gespeichert');
  if (F.raupeKurz && !(await p.$('#buehne .urk .rk-blase'))) fehler.push('Urkunde: Satz der Raupe (raupeKurz) fehlt');
  if (await ev(() => { const u = document.querySelector('#buehne > .urk'); return u.scrollHeight > u.clientHeight + 2; })) fehler.push('Urkunde: passt nicht auf den Bildschirm');
  await weiter(); await sleep(1800); await S('finale_epilog');
  if ((await wo()).f !== 3) fehler.push('Finale: nach der Urkunde nicht beim Epilog');
  if ((await ev(() => document.querySelectorAll('.ep-text p').length)) !== F.epilog.saetze.length) fehler.push('Epilog: Absätze fehlen');
  if (await p.$('#fuss [data-a="neu"]')) fehler.push('Finale: „Von vorn beginnen“ steht noch am Ende');
  if (!(await p.$('#fuss [data-a="album"]')) || !(await p.$('#fuss [data-a="haus"]'))) fehler.push('Epilog: Wege „Fall-Album“ und „Lese-Raupe“ fehlen');
  if (!(await ev(() => window.__v8.stand.geloest))) fehler.push('Epilog: Fall nicht als gelöst gespeichert');
}

/** Zurück und wieder vor: Fallkarte ← Code ← Tresor ← Urkunde ← Epilog (Android-Zurück und Pfeil), dann über Vor-Pfeil und Knöpfe zurück zum Epilog */
async function zurueckUndVor() {
  await ev(() => window.__v8.zurueck()); await sleep(400); // Android-Zurück
  let w = await wo();
  if (w.v !== 'finale' || w.f !== 2) fehler.push(`Zurück vom Epilog: nicht die Urkunde (${JSON.stringify(w)})`);
  pruefeUrkunde(await urkunde('#buehne .urk'), 'Urkunde nach Zurück', 'detektivin');
  if ((await ev(() => document.getElementById('dname').value)) !== 'Mia') fehler.push('Urkunde nach Zurück: Name fehlt');
  await klick('#fuss [data-a="zback"]'); await sleep(300); w = await wo();
  if (w.v !== 'finale' || w.f !== 1) fehler.push(`Zurück von der Urkunde: nicht der Tresor (${JSON.stringify(w)})`);
  await klick('#fuss [data-a="zback"]'); await sleep(300); w = await wo();
  if (w.v !== 'finale' || w.f !== 0) fehler.push(`Zurück vom Tresor: nicht der Code (${JSON.stringify(w)})`);
  await klick('#fuss [data-a="zback"]'); await sleep(300); w = await wo();
  if (w.v !== 'fallkarte') fehler.push(`Zurück vom Code: nicht die Fallkarte (${JSON.stringify(w)})`);
  await klick('#fuss [data-a="zvor"]'); await sleep(300); w = await wo();
  if (w.v !== 'finale' || w.f !== 0) fehler.push(`Vor von der Fallkarte: nicht der Code (${JSON.stringify(w)})`);
  await klick('#fuss [data-a="zvor"]'); await sleep(300); w = await wo(); // Code schon gelöst: Vor-Pfeil
  if (w.f !== 1) fehler.push(`Vor vom Code: nicht der Tresor (${JSON.stringify(w)})`);
  await sleep(3000); await weiter(); w = await wo();
  if (w.f !== 2) fehler.push(`„Danke!“: nicht die Urkunde (${JSON.stringify(w)})`);
  await weiter(); await sleep(400); w = await wo();
  if (w.f !== 3) fehler.push(`„Weiter“ auf der Urkunde: nicht der Epilog (${JSON.stringify(w)})`);
}

/** Nach dem Fall: Haus (füttern, anziehen, Lupe), Fall-Album, eine Spur noch einmal, Seite „Fall gelöst“, Neustart der App */
async function nachDemFall() {
  const vorher = await ev(() => ({ fertig: window.__v8.stand.fertig.length, tipp: window.__v8.stand.tippPerle, weit: window.__v8.stand.weit }));
  await klick('#fuss [data-a="haus"]'); await sleep(400); await S('haus');
  const blase0 = await ev(() => document.querySelector('.h-blase').textContent);
  await klick('.h-essen[data-f="blatt"]'); await sleep(800); await S('haus_gefuettert');
  const blase1 = await ev(() => document.querySelector('.h-blase').textContent);
  if (blase0 === blase1) fehler.push('Haus: Füttern ändert nichts');
  await klick('.h-essen[data-f="blatt"]'); await sleep(300);
  if ((await ev(() => document.querySelector('.h-blase').textContent)) === blase1) fehler.push('Haus: zweites Füttern sagt dasselbe');
  await klick('.h-essen[data-f="eis"]'); await sleep(700); await shot('haus_eis'); await sleep(1600);
  const zu = await ev(() => document.querySelectorAll('.h-sache.zu').length);
  if (zu) fehler.push(`Haus: nach allen 24 Spuren sind noch ${zu} Sachen zu`);
  await klick('.h-sache[data-s="hut"]'); await sleep(300); await S('haus_hut');
  if (!(await ev(() => document.querySelector('.h-raupe img').src.includes('raupe_hut')))) fehler.push('Haus: Hut wird nicht angezogen');
  await klick('.h-sache[data-s="lupe"]'); await sleep(300); await S('haus_lupe');
  if (!(await p.$('.h-raupe .glupe, .h-raupe img[src*="goldlupe"], .h-raupe img[src*="raupe_lupe"]'))) fehler.push('Haus: Raupe hält die Lupe nicht');
  await klick('.haus [data-a="zu"]');
  await klick('#fuss [data-a="album"]'); await S('album');
  const kap1 = D.spuren.filter((x) => x.kap === 1).length;
  if ((await ev(() => document.querySelectorAll('.al-karte').length)) !== kap1) fehler.push(`Album: nicht ${kap1} Spuren in Kapitel 1`);
  await klick('.al-reiter[data-k="3"]'); await S('album_kap3');
  const n = await ev(() => +document.querySelector('.al-karte').dataset.s);
  await klick(`.al-karte[data-s="${n}"]`); await sleep(500);
  const st = await ev(() => ({ v: window.__v8.stand.view, s: window.__v8.stand.spur, w: window.__v8.stand.wieder }));
  if (st.v !== 'spur' || st.s !== n || !st.w) fehler.push(`Album: Spur ${n} öffnet nicht (${JSON.stringify(st)})`);
  await S('album_spur_lesen');
  for (let k = 0; k < 14 && !(await p.$('#fuss [data-a="weiter"]')); k++) await klick('#fuss [data-a="next"]');
  await weiter(); await sleep(500); await loese(); await sleep(900); await S('album_spur_raetsel');
  const nachher = await ev(() => ({ fertig: window.__v8.stand.fertig.length, tipp: window.__v8.stand.tippPerle }));
  if (nachher.fertig !== vorher.fertig || nachher.tipp !== vorher.tipp) fehler.push('Album: Wiederholen ändert die Perlen');
  if (await p.$('.neuhaus')) fehler.push('Album: Hinweis „Neu im Haus“ beim Wiederholen');
  await weiter(); await sleep(300);
  if ((await ev(() => window.__v8.stand.view)) !== 'album') fehler.push('Album: nach der Spur nicht zurück im Album');
  await klick('#fuss [data-a="zback"]'); await S('fall_geloest');
  if ((await ev(() => window.__v8.stand.view)) !== 'fertig') fehler.push('Zurück aus dem Album führt nicht zu „Fall gelöst“');
  // „Meine Urkunde“: gleiche Urkunde, die Wahl aus dem Finale ist zu sehen und lässt sich ändern
  await klick('.fg-urk'); await S('fall_geloest_urkunde');
  pruefeUrkunde(await urkunde('.urk-box .urk'), 'Meine Urkunde', 'detektivin');
  if ((await ev(() => document.querySelector('.urk-box #dname').value)) !== 'Mia') fehler.push('Meine Urkunde: Name fehlt');
  await klick('.urk-box .dw-b[data-wahl="detektiv"]'); await S('fall_geloest_urkunde_detektiv');
  pruefeUrkunde(await urkunde('.urk-box .urk'), 'Meine Urkunde (Detektiv)', 'detektiv');
  if ((await ev(() => JSON.parse(localStorage.getItem('lesefall.v8')).titel)) !== 'detektiv') fehler.push('Meine Urkunde: Wahl nicht gespeichert');
  await klick('.urk-box [data-a="zu"]');
  await p.reload(); await sleep(900); await S('titel_geloest');
  await klick('[data-a="start"]'); await sleep(400);
  if ((await ev(() => window.__v8.stand.view)) !== 'fertig') fehler.push('Nach Neustart: „Weiter“ führt nicht zu „Fall gelöst“');
  if ((await ev(() => window.__v8.stand.traegt)) !== 'lupe') fehler.push('Nach Neustart: Raupe trägt die Lupe nicht mehr');
  // nach dem Neustart (ohne Finale in dieser Sitzung): Wahl bleibt und lässt sich wieder ändern
  await klick('.fg-urk'); await sleep(300);
  pruefeUrkunde(await urkunde('.urk-box .urk'), 'Meine Urkunde nach Neustart', 'detektiv');
  await klick('.urk-box .dw-b[data-wahl="detektivin"]');
  pruefeUrkunde(await urkunde('.urk-box .urk'), 'Meine Urkunde nach Neustart (Detektivin)', 'detektivin');
  if ((await ev(() => JSON.parse(localStorage.getItem('lesefall.v8')).titel)) !== 'detektivin') fehler.push('Meine Urkunde nach Neustart: Wahl nicht gespeichert');
  await klick('.urk-box [data-a="zu"]');
}

/** Alter Spielstand mit sieben Finale-Schritten (bis 25.11.2026) → vier Schritte; danach bleibt `fin`, wie es ist */
async function alterStand() {
  for (const [alt, neu] of [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 3], [6, 3]]) {
    await ev(({ a, alt }) => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: a[a.length - 1], i: 0, fertig: a, tippPerle: 1, weiter: 'finale', fin: alt, intro: true, weit: 10000 + alt, name: 'Mia' })), { a: alle, alt });
    await p.reload(); await sleep(800);
    await klick('[data-a="start"]'); await sleep(600);
    const w = await ev(() => ({ v: window.__v8.stand.view, f: window.__v8.stand.fin, weit: window.__v8.stand.weit }));
    if (w.v !== 'finale' || w.f !== neu || w.weit !== 10000 + neu) fehler.push(`Alter Stand fin=${alt}: erwartet Schritt ${neu}, ist ${JSON.stringify(w)}`);
    if (alt === 1 && await p.$('#fuss [data-a="zvor"]')) fehler.push('Alter Stand im Code: Vor-Pfeil überspringt den Code');
    if (alt >= 5) await S(`alter_stand_fin${alt}`);
  }
  await ev(({ a }) => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: a[a.length - 1], i: 0, fertig: a, tippPerle: 1, weiter: 'finale', fin: 1, finV: 2, intro: true, weit: 10003 })), { a: alle });
  await p.reload(); await sleep(800); await klick('[data-a="start"]'); await sleep(600);
  if ((await wo()).f !== 1) fehler.push('Neuer Stand fin=1 wird verändert');
}


const alle = D.spuren.map((s) => s.nr);
await ev((a) => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: a[a.length - 1], i: 0, fertig: a, tippPerle: 1, weiter: 'finale', fin: 0, intro: true, weit: 10000, gesehen: ['fliege', 'schal', 'brille', 'notizbuch', 'taschenlampe', 'hut', 'mondbrosche', 'tasche'] })), alle);
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(500);
await finale();
await zurueckUndVor();
await nachDemFall();
await alterStand();
// Mitten im Buch: zwei Spuren gelöst (4 Perlen), dann eine Spur mit einem länger bestehenden Rätsel
// (neue Rätsel in Arbeit, z. B. Spur 3 „wort“, lassen sich mit __v8.loese() vielleicht noch nicht lösen)
const STABIL = ['merkmale', 'reihe', 'ausschluss', 'unterschiede', 'sortieren', 'buchstaben'];
const MITTE = D.spuren.find((s) => s.nr >= 3 && STABIL.includes(s.raetsel?.art))?.nr ?? 3;
await ev((n) => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: n, i: 0, fertig: [1, 2], weiter: 'spur', intro: true, geklaert: [] })), MITTE);
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(600);
// Haus während des Lesens: neue Sache wird angekündigt (die dritte gelöste Spur macht 6 Perlen voll), Tippen öffnet das Haus
await ev((n) => { window.__v8.stand.i = window.__v8.steps(n).indexOf('raetsel'); window.__v8.zeige(); }, MITTE); await sleep(500);
for (let k = 0; k < 8 && !(await ev((n) => window.__v8.stand.fertig.includes(n), MITTE)); k++) { await loese(); await sleep(500); } // Rätsel mit mehreren Phasen
await sleep(2200);
if (!(await p.$('.neuhaus'))) fehler.push('Haus: neue Sache bei 6 Perlen nicht angekündigt');
else { await shot('neu_im_haus'); await klick('.neuhaus'); await sleep(400); await S('haus_waehrend_buch');
  if (await ev(() => document.querySelector('.h-sache[data-s="fliege"]') === null)) fehler.push('Haus: Fliege bei 6 Perlen nicht frei');
  if (await p.$('.h-sache[data-s="lupe"]')) fehler.push('Haus: Lupe schon vor dem Ende da'); await klick('.haus [data-a="zu"]'); }
await klick('#kPerl'); await sleep(300); if (!(await p.$('.haus'))) fehler.push('Haus: Perlen im Kopf öffnen das Haus nicht'); else await klick('.haus [data-a="zu"]');
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v8 Ende ${NAME} ${W}×${H}: Finale, Haus, Album, Wiederholen, Neustart geprüft, ${nr} Bilder`);
