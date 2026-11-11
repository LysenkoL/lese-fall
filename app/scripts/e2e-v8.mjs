/**
 * Durchlauf der Vorschau v8 (Kapitel 1, vom Titel bis „Fortsetzung folgt“) mit Bildern in 03_screens/v8/<name>/.
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e-v8.mjs [breite höhe name]
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon'];
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8', NAME);
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
      return r.width > 0 && (r.right > A.right + 1 || r.left < A.left - 1) && !e.closest('.ausschn, .brush') && !e.classList.contains('lampe');
    }).map((e) => e.className || e.tagName).slice(0, 3);
    const bl = document.querySelector('.blatt:not(.probe)'), br = document.querySelector('#buehne > .brett');
    return {
      breit, doc: document.documentElement.scrollWidth > innerWidth,
      rollt: bl ? bl.scrollHeight > bl.clientHeight + 2 : false,
      brettRollt: br ? br.scrollHeight > br.clientHeight + 2 : false,
      fussAb: (() => { const f = document.getElementById('fuss').getBoundingClientRect(); return f.bottom > innerHeight + 1; })(),
    };
  });
  if (m.breit.length) fehler.push(`${wo}: Elemente ragen seitlich hinaus: ${m.breit.join(', ')}`);
  if (m.doc) fehler.push(`${wo}: waagerechte Bildlaufleiste`);
  if (m.rollt) fehler.push(`${wo}: Leseblatt läuft über`);
  if (m.brettRollt) fehler.push(`${wo}: Brett läuft über`);
  if (m.fussAb) fehler.push(`${wo}: Fußzeile außerhalb`);
};
const S = async (name) => { await shot(name); await messen(name); };
const weiter = () => klick('#fuss [data-a="weiter"]');
const loese = async () => { await ev(() => window.__v8.loese()); await sleep(300); };

async function lesen(spur) {
  for (let k = 0; k < 14; k++) {
    await messen(`Spur ${spur} Blatt ${k + 1}`);
    if (k === 0 || spur === 1) await shot(`s${spur}_lesen_${k + 1}`);
    if (await p.$('#fuss [data-a="weiter"]')) break;
    await klick('#fuss [data-a="next"]');
  }
  await shot(`s${spur}_lesen_letztes`);
  await weiter();
}
const D = await (async () => { await p.goto('http://localhost:4173/v8.html'); await sleep(900); return ev(() => window.__v8.D); })();
const spurSchritt = (spur) => ev((n) => window.__v8.steps(n), spur);

async function raetsel(spur, z) {
  const n = `s${spur}_${z.art}`;
  await S(n + '_start');
  if (z.art === 'buchstaben') {
    for (const [i, rd] of z.runden.entries()) {
      const richtigKnopf = rd.passt ? 'ja' : 'nein', falschKnopf = rd.passt ? 'nein' : 'ja';
      await klick(`.bsk[data-w="${i === 0 ? falschKnopf : richtigKnopf}"]`); // Runde 1 absichtlich falsch
      await sleep(1800); await S(`${n}_runde${i + 1}`);
      if (i < z.runden.length - 1) await weiter();
    }
  } else if (z.art === 'unterschiede') {
    const r = await (await p.$('.ub-bild')).boundingBox();
    await p.mouse.click(r.x + r.width * 0.05, r.y + r.height * 0.9); await sleep(200); await shot(n + '_daneben');
    const d = z.dinge[1], bb = (await p.$$('.ub-bild'))[1];
    const r2 = await bb.boundingBox();
    await p.mouse.click(r2.x + r2.width * d.x / 100, r2.y + r2.height * d.y / 100); await sleep(300); await S(n + '_ein_treffer');
    await loese(); await sleep(700);
  } else if (z.art === 'versteckt') {
    const box = await (await p.$('.vb')).boundingBox();
    await p.mouse.move(box.x + box.width * .2, box.y + box.height * .3); await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + box.width * (.2 + i * .05), box.y + box.height * (.3 + (i % 2) * .3));
    await p.mouse.up();
    await shot(n + '_spur');
    await klick(`.vb-o[data-o="${z.optionen.find((o) => o !== z.buchstabe)}"]`); await shot(n + '_falsch');
    await klick(`.vb-o[data-o="${z.buchstabe}"]`); await sleep(300);
  } else if (z.art === 'merkmale') {
    await loese(); await sleep(1300); await S(n + '_pruefen');
    for (const [i, m] of z.merkmale.entries()) {
      if (m.seite === 'hinten') {
        await klick('.mm-wahl [data-w="unklar"]'); await sleep(200); await S(n + '_unklar');
        await klick('[data-a="dreh"]'); await sleep(700); await shot(n + '_hinten');
      }
      await klick(`.mm-wahl [data-w="${m.wert}"]`); await sleep(700);
      if (i === 0) await shot(n + '_m1');
    }
    await S(n + '_stempel');
    await klick('#fuss [data-a="stempeln"]'); await sleep(500);
  } else if (z.art === 'reihe') {
    const soll = z.reihenfolge, gegeben = z.karten.map((k) => k.id);
    for (const [i, id] of gegeben.entries()) { await klick(`.rh-pool [data-k="${id}"]`); if (i === 0) await shot(n + '_gewaehlt'); await klick(`.rh-platz[data-p="${i}"]`); }
    await S(n + '_voll');
    await klick('#fuss [data-a="fertig"]'); await sleep(1200); await shot(n + '_zurueck');
    for (const [i, id] of soll.entries()) {
      if (i === 0) { // einmal echt ziehen
        const a = await (await p.$(`.rh-pool [data-k="${id}"]`)).boundingBox(), t = await (await p.$(`.rh-platz[data-p="0"]`)).boundingBox();
        await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
        await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
        await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot(n + '_ziehen'); await p.mouse.up(); await sleep(200);
      } else { await klick(`.rh-pool [data-k="${id}"]`); await klick(`.rh-platz[data-p="${i}"]`); }
    }
    await klick('#fuss [data-a="fertig"]'); await sleep(500);
  } else if (z.art === 'ausschluss') {
    for (const [i, h] of z.hinweise.entries()) {
      if (i === 0) { await klick('.as-k[data-id="oskar"]'); await klick('#fuss [data-a="fertig"]'); await sleep(250); await S(n + '_falsch'); await sleep(700); }
      for (const id of h.raus) await klick(`.as-k[data-id="${id}"]`);
      if (i === 0) await shot(n + '_gewaehlt');
      await klick('#fuss [data-a="fertig"]'); await sleep(1500); await S(`${n}_hinweis${i + 2}`);
    }
    await sleep(500); await S(n + '_uebrig');
    await klick('#fuss [data-a="stempeln"]'); await sleep(500);
  }
  await S(n + '_geloest');
  await weiter();
}

await S('titel');
await klick('[data-a="start"]');
for (let k = 1; await p.$('#fuss [data-a="w"]'); k++) { await S(`karte_${k}`); await klick('#fuss [data-a="w"]'); }
for (let spur = 1; spur <= 6; spur++) {
  const st = await spurSchritt(spur);
  for (const [k, s] of st.entries()) {
    const ist = await ev(() => ({ spur: window.__v8.stand.spur, i: window.__v8.stand.i }));
    if (ist.spur !== spur || ist.i !== k) throw new Error(`Ablauf verrutscht: erwartet Spur ${spur} Schritt ${k}, ist ${JSON.stringify(ist)}`);
    if (s === 'lesen') await lesen(spur);
    else if (s === 'raetsel') await raetsel(spur, D.spuren[spur - 1].raetsel);
    else if (s === 'brett') {
      await S(`s${spur}_brett_staub`);
      await p.mouse.move(W / 2, 300); // echtes Wischen einmal anstoßen, dann sofort lösen
      await loese(); await sleep(900); await S(`s${spur}_brett`);
      if (await p.$('.zettel.wackelt')) { await p.click('.zettel.wackelt', { force: true }); await sleep(400); await shot(`s${spur}_brett_geklaert`); await sleep(1300); }
      await weiter();
    } else if (s === 'tippFrage') {
      await S(`s${spur}_tippfrage`);
      await klick('.opt[data-o="a"]'); await shot(`s${spur}_tippfrage_gewaehlt`); await weiter();
    } else if (s === 'tippAufl') { await S(`s${spur}_tippaufl`); await weiter(); }
    else { await S(`s${spur}_haken`); await weiter(); }
  }
}
await S('fallkarte');
await klick('#fuss [data-a="stempeln"]'); await sleep(1200); await S('fallkarte_gestempelt');
await loese(); await sleep(900); await S('fallkarte_code');
await weiter();
await S('ausblick');
// Kopfzeile, Brett, Schrift (nach Neustart bis Spur 2)
await ev(() => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: 3, i: 0, fertig: [1, 2], weiter: 'spur', intro: true, geklaert: [] })));
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(600);
await klick('#bBrett'); await S('brett_ueberlagerung'); await klick('.schl [data-a="zu"]');
await klick('#bAa'); await S('schrift'); await klick('.schl [data-a="zu"]');
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v8 ${NAME} ${W}×${H}: Kapitel 1 durchgespielt, ${nr} Bilder`);
