/**
 * Ende des Falls ohne die 24 Spuren davor: startet mit einem Speicherstand „alle Spuren gelöst“ direkt im Finale.
 * Prüft Tresor (Bild groß), goldene Lupe, Urkunde, letztes Wort, Epilog, Haus der Lese-Raupe, Fall-Album (Spur noch einmal),
 * Seite „Fall gelöst“, Neustart der App und die Ankündigung „Neu im Haus“ mitten im Buch. Bilder: 03_screens/v8_ende/<name>/.
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e-v8-ende.mjs [breite höhe name]
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon'];
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8_ende', NAME);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: false });
p.setDefaultTimeout(10000);
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
      return r.width > 0 && (r.right > A.right + 1 || r.left < A.left - 1) && !e.closest('.ausschn, .brush, .tv, .nt-bild') && !e.classList.contains('lampe');
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

const D = await (async () => { await p.goto('http://localhost:4173/v8.html'); await sleep(900); return ev(() => window.__v8.D); })();
/** Finale: Szene, Tresor-Code selbst legen (erst falsch, dann richtig, einmal ziehen), Tresor öffnet sich, Urkunde */
async function finale() {
  const wort = D.kapitel[0].code.wort;
  await S('finale_szene'); await klick('#fuss [data-a="weiter"]');
  await S('finale_code_start');
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
  await sleep(2400); await S('finale_tresor_auf_start'); await sleep(2800); await S('finale_tresor_offen');
  if (!(await p.$('.fin.fest .fest-bild'))) fehler.push('Finale: Bild aus dem Tresor wird nicht groß');
  await klick('#fuss [data-a="weiter"]');
  await sleep(600); await S('finale_lupe');
  if (!(await p.$('.lupe-gabe .glupe, .lupe-gabe img[src*="goldlupe"]'))) fehler.push('Finale: goldene Lupe fehlt');
  await klick('#fuss [data-a="weiter"]');
  await p.fill('#dname', 'Mia'); await sleep(200); await S('finale_urkunde');
  if (!(await p.$('.dipl .dt'))) fehler.push('Finale: Urkunde fehlt');
  await klick('#fuss [data-a="weiter"]'); await S('finale_raupe');
  if (await p.$('#fuss [data-a="neu"]')) fehler.push('Finale: „Von vorn beginnen“ steht noch am Ende');
  await klick('#fuss [data-a="weiter"]'); await sleep(1800); await S('finale_epilog');
  if (!(await p.$('#fuss [data-a="album"]')) || !(await p.$('#fuss [data-a="haus"]'))) fehler.push('Epilog: Wege „Fall-Album“ und „Lese-Raupe“ fehlen');
  if (!(await ev(() => window.__v8.stand.geloest))) fehler.push('Epilog: Fall nicht als gelöst gespeichert');
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
  const zu = await ev(() => document.querySelectorAll('.h-sache.zu').length);
  if (zu) fehler.push(`Haus: nach allen 24 Spuren sind noch ${zu} Sachen zu`);
  await klick('.h-sache[data-s="hut"]'); await sleep(300); await S('haus_hut');
  if (!(await ev(() => document.querySelector('.h-raupe img').src.includes('raupe_hut')))) fehler.push('Haus: Hut wird nicht angezogen');
  await klick('.h-sache[data-s="lupe"]'); await sleep(300); await S('haus_lupe');
  if (!(await p.$('.h-raupe .glupe, .h-raupe img[src*="goldlupe"]'))) fehler.push('Haus: Raupe hält die Lupe nicht');
  await klick('.haus [data-a="zu"]');
  await klick('#fuss [data-a="album"]'); await S('album');
  if ((await ev(() => document.querySelectorAll('.al-karte').length)) !== 6) fehler.push('Album: nicht 6 Spuren je Kapitel');
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
  await klick('.fg-urk'); await S('fall_geloest_urkunde'); await klick('.urk-box [data-a="zu"]');
  await p.reload(); await sleep(900); await S('titel_geloest');
  await klick('[data-a="start"]'); await sleep(400);
  if ((await ev(() => window.__v8.stand.view)) !== 'fertig') fehler.push('Nach Neustart: „Weiter“ führt nicht zu „Fall gelöst“');
  if ((await ev(() => window.__v8.stand.traegt)) !== 'lupe') fehler.push('Nach Neustart: Raupe trägt die Lupe nicht mehr');
}


const alle = D.spuren.map((s) => s.nr);
await ev((a) => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: a[a.length - 1], i: 0, fertig: a, tippPerle: 1, weiter: 'finale', fin: 0, intro: true, weit: 10000, gesehen: ['fliege', 'schal', 'brille', 'notizbuch', 'taschenlampe', 'hut', 'mondbrosche', 'tasche'] })), alle);
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(500);
await finale();
await nachDemFall();
// Mitten im Buch: Stand nach Spur 2 (4 Perlen)
await ev(() => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: 3, i: 0, fertig: [1, 2], weiter: 'spur', intro: true, geklaert: [] })));
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(600);
// Haus während des Lesens: neue Sache wird angekündigt (Spur 3 macht 6 Perlen voll), Tippen öffnet das Haus
await ev(() => { window.__v8.stand.i = window.__v8.steps(3).indexOf('raetsel'); window.__v8.zeige(); }); await sleep(500);
await loese(); await sleep(2200);
if (!(await p.$('.neuhaus'))) fehler.push('Haus: neue Sache bei 6 Perlen nicht angekündigt');
else { await shot('neu_im_haus'); await klick('.neuhaus'); await sleep(400); await S('haus_waehrend_buch');
  if (await ev(() => document.querySelector('.h-sache[data-s="fliege"]') === null)) fehler.push('Haus: Fliege bei 6 Perlen nicht frei');
  if (await p.$('.h-sache[data-s="lupe"]')) fehler.push('Haus: Lupe schon vor dem Ende da'); await klick('.haus [data-a="zu"]'); }
await klick('#kPerl'); await sleep(300); if (!(await p.$('.haus'))) fehler.push('Haus: Perlen im Kopf öffnen das Haus nicht'); else await klick('.haus [data-a="zu"]');
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v8 Ende ${NAME} ${W}×${H}: Finale, Haus, Album, Wiederholen, Neustart geprüft, ${nr} Bilder`);
