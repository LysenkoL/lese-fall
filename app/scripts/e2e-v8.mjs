/**
 * Durchlauf der Vorschau v8 mit der Maus: Titel → Vorgeschichte → alle Kapitel mit allen Spuren (Lesen, Tipp-Frage,
 * Rätsel, Brett, Haken), Fallkarten (Kapitel 4: Flunker-Finder) und Ausblicken → erster Bildschirm des Finales.
 * Das Finale selbst (Tresor, Urkunde, Epilog), Haus und Album prüft e2e-v8-ende.mjs.
 * Bilder in 03_screens/v8/<name>/, auf jedem Bildschirm Prüfung der Anordnung (messen).
 * Rätsel: meist über __v8.loese() (so oft, bis „Weiter“ kommt; Zwischen-„Weiter“ und „Stempeln“ werden angetippt);
 * ein paar Rätsel mit echten Klicks, wo das wenig von der Bauart des Spiels abhängt.
 * Vorher: npm run build && npx vite preview --port 4173   (oder Dev-Server: npx vite --port 5184, dann BASE_URL setzen)
 * Aufruf: node scripts/e2e-v8.mjs [breite höhe name]
 * Umgebung: BASE_URL (Standard http://localhost:4173)
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon'];
const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '');
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8', NAME);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: false });
p.setDefaultTimeout(10000);
// Dev-Server: Die HMR-Verbindung bleibt stumm, sonst lädt Vite die Seite mitten im Durchlauf neu, sobald jemand Daten oder Code ändert
await p.routeWebSocket(/.*/, () => {});
const fehler = [];
p.on('pageerror', (e) => fehler.push('Seitenfehler: ' + String(e)));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push('Konsole: ' + m.text()); });
let nr = 0, gemessen = 0;
const shot = async (name) => { await sleep(500); await p.screenshot({ path: `${OUT}/${String(++nr).padStart(3, '0')}_${name}.png` }); };
const ev = (f, a) => p.evaluate(f, a);
/** Klick mit der Maus; das Ziel wird vorher in die Mitte der Bühne gerollt (der Pfeil „mehr unten“ liegt unten über der Fläche) */
const klick = async (s) => {
  const l = p.locator(s).first();
  await l.waitFor({ state: 'visible' });
  await l.evaluate((e) => { if (e.closest('#buehne')) e.scrollIntoView({ block: 'center', inline: 'nearest' }); });
  await l.click(); await sleep(130);
};
/** Knopf im Fuß sichtbar und bedienbar? */
const knopfDa = (a) => ev((a) => { const k = document.querySelector(`#fuss [data-a="${a}"]`); return !!k && !k.disabled && getComputedStyle(k).visibility !== 'hidden' && k.getClientRects().length > 0; }, a);
const warteKnopf = async (a, ms = 12000) => { for (let t = 0; t < ms; t += 150) { if (await knopfDa(a)) return true; await sleep(150); } return false; };
const wo = () => ev(() => { const s = window.__v8.stand; return { view: s.view, spur: s.spur, i: s.i, fin: s.fin }; });
const loese = async () => { await ev(() => window.__v8.loese()); await sleep(300); };
/** Werkzeug-Moment beim Rätselstart: abwarten, bis er weg ist (der erste Tipp würde nur ihn schließen) */
const ohneMoment = async () => { for (let t = 0; t < 30 && (await p.$('.wzm')); t++) await sleep(100); };
const messen = async (wo) => {
  await sleep(400);
  gemessen++;
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
/** echte Bedienung eines Rätsels: klappt sie nicht, ist das ein Befund; der Test löst danach mit __v8.loese() weiter */
const echt = async (n, f) => { try { await f(); } catch (e) { fehler.push(`${n}: echte Bedienung klappt nicht: ${String(e.message ?? e).split('\n')[0]}`); } };

const D = await (async () => { await p.goto(`${BASE}/v8.html`); await sleep(900); return ev(() => window.__v8.D); })();
const spurSchritt = (spur) => ev((n) => window.__v8.steps(n), spur);
const KAPITEL = [...new Set(D.spuren.map((s) => s.kap))];
const spurenVon = (kap) => D.spuren.filter((s) => s.kap === kap).map((s) => s.nr);
/** erwartete Buchstaben im Beutel (lose, in der Reihenfolge der Kapitel – ohne Plätze im Wort), wenn die Kapitel bis `bis` gelöst sind */
const codeSoll = (bis) => D.kapitel.filter((q) => q.nr <= bis).map((q) => q.code.buchstabe).join('');

async function lesen(spur) {
  for (let k = 0; k < 20; k++) {
    await messen(`Spur ${spur} Blatt ${k + 1}`);
    if (k === 0 || spur === 1) await shot(`s${spur}_lesen_${k + 1}`);
    if (k === 0 && spur === 3) await kopfKnoepfe();
    if (await knopfDa('weiter')) break;
    await klick('#fuss [data-a="next"]');
  }
  await shot(`s${spur}_lesen_letztes`);
  await weiter();
}

/** Kopf beim Lesen: Brett als Überlagerung, Schrift-Einstellungen */
async function kopfKnoepfe() {
  await klick('#bBrett'); await S('brett_ueberlagerung');
  if (!(await p.$('#ueber .brett.ueberl'))) fehler.push('Kopf: Knopf „Brett“ öffnet das Brett nicht');
  await klick('#ueber .schl [data-a="zu"]');
  await klick('#bAa'); await S('schrift');
  if (!(await p.$('#ueber .einst'))) fehler.push('Kopf: Knopf „Schrift“ öffnet die Einstellungen nicht');
  await klick('#ueber .schl [data-a="zu"]'); await sleep(300);
}

/** Pfeil „mehr unten“: einmal prüfen, dass Antippen weiterrollt (nur wenn er auf diesem Bildschirm zu sehen ist) */
let mehrGeprueft = false;
async function mehrPfeil(n) {
  if (mehrGeprueft || !(await p.$('#buehne > .mehr:not([hidden]) button'))) return;
  mehrGeprueft = true;
  await shot(n + '_mehr_unten');
  const y0 = await ev(() => document.querySelector('#buehne > .zug').scrollTop);
  await p.click('#buehne > .mehr button', { force: true }); await sleep(900); // der Pfeil hüpft ohne Ende
  const y1 = await ev(() => document.querySelector('#buehne > .zug').scrollTop);
  if (!(y1 > y0)) fehler.push(`${n}: Pfeil „mehr unten“ rollt nicht weiter (${y0} → ${y1})`);
  await shot(n + '_mehr_gerollt');
  await ev(() => document.querySelector('#buehne > .zug').scrollTo({ top: 0 }));
  await sleep(300);
}

/** Löst das laufende Rätsel: __v8.loese(), bis die Spur als gelöst zählt; Zwischen-„Weiter“ und „Stempeln“ antippen */
async function loesenBisFertig(spur, n) {
  for (let k = 0; k < 40; k++) {
    if (await ev((s) => window.__v8.stand.fertig.includes(s), spur)) return true;
    if (await knopfDa('stempeln')) { await shot(n + '_stempeln'); await klick('#fuss [data-a="stempeln"]'); await sleep(800); continue; }
    if (await knopfDa('weiter')) { await shot(`${n}_zwischen_${k}`); await weiter(); await sleep(500); continue; }
    await loese(); await sleep(500);
  }
  fehler.push(`${n}: Rätsel lässt sich mit __v8.loese() nicht lösen`);
  return false;
}

/** einige Rätsel mit echten Klicks (nur dort, wo die Bedienung einfach und stabil ist) */
const ECHT = {
  async buchstaben(n, z) { // erste Runde: Buchstaben in der richtigen Reihenfolge antippen
    const rd = z.runden[0];
    for (const [i, c] of [...rd.wort].entries()) { await klick(`.bs-lose .bk:text-is("${c}")`); if (i === 1) await shot(n + '_runde1_halb'); }
    await sleep(900); await S(n + '_runde1');
    if (!(await knopfDa('weiter'))) throw new Error('nach der ersten Runde kein „Weiter“');
  },
  async reihe(n, z) { // erst in der gegebenen (falschen) Reihenfolge legen, dann richtig
    for (const [i, k] of z.karten.entries()) { await klick(`.rh-pool [data-k="${k.id}"]`); await klick(`.rh-platz[data-p="${i}"]`); }
    await S(n + '_voll_falsch'); await klick('#fuss [data-a="fertig"]'); await sleep(1300); await shot(n + '_zurueck');
    for (const [i, id] of z.reihenfolge.entries()) if (!(await p.$(`.rh-platz[data-p="${i}"] [data-k="${id}"]`))) { await klick(`.rh-pool [data-k="${id}"]`); await klick(`.rh-platz[data-p="${i}"]`); }
    await S(n + '_voll'); await klick('#fuss [data-a="fertig"]'); await sleep(800);
  },
  async spiegel(n, z) {
    const falsch = z.lesungen.findIndex((_, i) => i !== z.richtig);
    await klick(`.sp-o[data-o="${falsch}"]`); await sleep(300); await S(n + '_falsch');
    await klick(`.sp-o[data-o="${z.richtig}"]`); await sleep(800);
  },
  async versteckt(n, z) {
    await klick(`.vb-o[data-o="${z.optionen.find((o) => o !== z.buchstabe)}"]`); await sleep(300); await S(n + '_falsch');
    await klick(`.vb-o[data-o="${z.buchstabe}"]`); await sleep(800);
  },
  async schatten(n, z) {
    const falsch = await p.$eval(`.sc-k:not([data-i="${z.richtig}"])`, (e) => e.dataset.i);
    await klick(`.sc-k[data-i="${falsch}"]`); await shot(n + '_vergleich'); await klick('#fuss [data-a="passt"]'); await sleep(400); await S(n + '_falsch');
    await klick(`.sc-k[data-i="${z.richtig}"]`); await klick('#fuss [data-a="passt"]'); await sleep(800);
  },
};

async function raetsel(spur, z) {
  const n = `s${spur}_${z.art}`;
  if (spur === D.spuren[0].nr) await shot(n + '_werkzeug');
  await ohneMoment();
  await S(n + '_start');
  await mehrPfeil(n);
  if (ECHT[z.art]) await echt(n, () => ECHT[z.art](n, z));
  else { await loese(); await sleep(900); await S(n + '_schritt'); }
  await loesenBisFertig(spur, n);
  if (!(await warteKnopf('weiter'))) fehler.push(`${n}: nach dem Lösen fehlt „Weiter“`);
  await S(n + '_geloest');
  await weiter();
}

async function brett(spur, kap) {
  await S(`s${spur}_brett_start`);
  if (await p.$('canvas.staub')) { // Staub mit der Maus wischen, den Rest löst der Test
    await shot(`s${spur}_brett_staub`);
    const c = await (await p.$('canvas.staub')).boundingBox();
    await p.mouse.move(c.x + 8, c.y + c.height * 0.3); await p.mouse.down();
    for (let i = 1; i <= 6; i++) await p.mouse.move(c.x + (i % 2 ? c.width - 8 : 8), c.y + c.height * (0.3 + i * 0.07), { steps: 4 });
    await p.mouse.up(); await sleep(300); await shot(`s${spur}_brett_gewischt`);
    if (await p.$('canvas.staub')) await loese();
    await sleep(900);
  } else if (await p.$('.fundov')) { // neuer Fund: das Kind tippt die Karte an, sie fliegt ans Brett
    await shot(`s${spur}_brett_fund`);
    await p.click('.fundov .fundk', { force: true }); await sleep(900); // die Karte wackelt ohne Ende, deshalb ohne Warten auf Stillstand
    if (await p.$('.fundov')) fehler.push(`Spur ${spur}: Fundkarte hängt nicht am Brett`);
  } else fehler.push(`Spur ${spur}: Brett ohne Staub und ohne neue Fundkarte`);
  // geklärte Frage („Geklärt! Tippe mich an.“): das Kind tippt sie an, wie ein Kind es täte
  if (await p.$('.zettel[data-ok]')) {
    await shot(`s${spur}_brett_frage`);
    await p.click('.zettel[data-ok]', { timeout: 3000 }).catch(() => {});
  }
  if (!(await warteKnopf('weiter', 15000))) fehler.push(`Spur ${spur}: Brett ohne „Weiter“`);
  await S(`s${spur}_brett`);
  // Brett nur mit Karten dieses Kapitels, je Spur ein Platz
  const eigene = spurenVon(kap);
  const br = await ev(() => ({ karten: document.querySelectorAll('.brett .bgrid .bkarte').length, fragen: document.querySelectorAll('.brett .zettel').length, nrs: [...document.querySelectorAll('.brett .bkarte[data-k]')].map((e) => +e.dataset.k) }));
  if (br.karten !== eigene.length) fehler.push(`Spur ${spur}: Brett hat ${br.karten} Plätze, Kapitel ${kap} hat ${eigene.length} Spuren`);
  if (br.fragen > 4) fehler.push(`Spur ${spur}: Brett hat ${br.fragen} offene Fragen (mehr als 4)`);
  if (br.nrs.some((x) => !eigene.includes(x))) fehler.push(`Spur ${spur}: Brett zeigt Karten fremder Kapitel: ${br.nrs}`);
  if (!br.nrs.includes(spur)) fehler.push(`Spur ${spur}: neue Karte fehlt auf dem Brett`);
  if (spur === eigene[0]) { // Buchstaben-Beutel: alle bisher verdienten Buchstaben liegen schon drin (keine Felder, keine leeren Plätze)
    if (await p.$('.brett .codez, .brett .wort i')) fehler.push(`Spur ${spur}: Brett zeigt noch Code-Felder statt des Beutels`);
    await klick('.brett .beutel[data-a="code"]'); await S(`s${spur}_brett_tresor`);
    const buch = await ev(() => [...document.querySelectorAll('.tresorinfo .bt-k')].map((i) => i.textContent.trim()).join(''));
    if (buch !== codeSoll(kap - 1)) fehler.push(`Spur ${spur}: Beutel zeigt „${buch}“, erwartet „${codeSoll(kap - 1)}“`);
    await klick('.tresorinfo [data-a="zu"]');
  }
  await weiter();
}

/** Fallkarte: Stempel (Kapitel 4: erst Flunker-Finder), dann den Code-Buchstaben freiwischen */
async function fallkarte(kap) {
  await sleep(300);
  if ((await wo()).view !== 'fallkarte') throw new Error(`Kapitel ${kap}: Fallkarte erwartet, ist ${JSON.stringify(await wo())}`);
  const flunker = !!(await p.$('.fall[data-art="flunker"]'));
  const n = `k${kap}_${flunker ? 'flunker' : 'fallkarte'}`;
  await ohneMoment();
  await S(n);
  await mehrPfeil(n);
  if (flunker) {
    for (let k = 0; k < 20 && !(await knopfDa('stempeln')); k++) { await loese(); await sleep(600); }
    await S(n + '_geloest');
  }
  if (!(await warteKnopf('stempeln'))) { fehler.push(`${n}: „Stempeln“ fehlt`); return; }
  await klick('#fuss [data-a="stempeln"]'); await sleep(1200); await S(n + '_gestempelt');
  for (let k = 0; k < 6 && !(await knopfDa('weiter')); k++) { await loese(); await sleep(700); }
  await S(n + '_code');
  await sleep(1500); // der Buchstabe hüpft in den Beutel
  const code = await ev(() => [...document.querySelectorAll('.fall .beutel .bt-k:not(.platz)')].map((i) => i.textContent.trim()).join(''));
  if (code !== codeSoll(kap)) fehler.push(`Fallkarte ${kap}: Beutel zeigt „${code}“, erwartet „${codeSoll(kap)}“`);
  await weiter();
}

await S('titel');
await klick('[data-a="start"]');
for (let k = 1; (await wo()).view === 'intro'; k++) { await S(`karte_${k}`); await klick('#fuss [data-a="w"]'); }
for (const kap of KAPITEL) {
  if (kap > 1) { // Ausblick → nächstes Kapitel
    if ((await wo()).view !== 'ausblick') throw new Error(`Ausblick nach Kapitel ${kap - 1} erwartet, ist ${JSON.stringify(await wo())}`);
    await S(`k${kap - 1}_ausblick`);
    await klick('#fuss [data-a="naechstes"]');
  }
  if ((await wo()).view !== 'kapitel') throw new Error(`Kapitelkarte ${kap} erwartet, ist ${JSON.stringify(await wo())}`);
  await S(`kap${kap}_karte`); await klick('#fuss [data-a="w"]');
  for (const sp of D.spuren.filter((s) => s.kap === kap)) {
    const spur = sp.nr;
    const st = await spurSchritt(spur);
    for (const [k, s] of st.entries()) {
      const ist = await wo();
      if (ist.view !== 'spur' || ist.spur !== spur || ist.i !== k) throw new Error(`Ablauf verrutscht: erwartet Spur ${spur} Schritt ${k} (${s}), ist ${JSON.stringify(ist)}`);
      if (s === 'lesen') await lesen(spur);
      else if (s === 'raetsel') await raetsel(spur, sp.raetsel);
      else if (s === 'brett') await brett(spur, kap);
      else if (s === 'tippFrage') {
        await S(`s${spur}_tippfrage`);
        await klick('.opt[data-o="a"]'); await shot(`s${spur}_tippfrage_gewaehlt`); await weiter();
      } else if (s === 'tippAufl') { await S(`s${spur}_tippaufl`); await weiter(); }
      else { await S(`s${spur}_haken`); await weiter(); }
    }
  }
  await fallkarte(kap);
}
// Finale: nur der erste Bildschirm (Tresor-Code); alles Weitere prüft e2e-v8-ende.mjs
await sleep(400);
const ende = await wo();
if (ende.view !== 'finale' || ende.fin !== 0) fehler.push(`Nach Kapitel ${KAPITEL[KAPITEL.length - 1]}: Finale (Schritt 0) erwartet, ist ${JSON.stringify(ende)}`);
await S('finale_start');
const alleFertig = await ev(() => window.__v8.stand.fertig.length);
if (alleFertig !== D.spuren.length) fehler.push(`Am Ende ${alleFertig} von ${D.spuren.length} Spuren gelöst`);
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v8 ${NAME} ${W}×${H}: Kapitel ${KAPITEL.join(', ')} (${D.spuren.length} Spuren) bis zum Finale durchgespielt, ${gemessen} Bildschirme gemessen, ${nr} Bilder`);
