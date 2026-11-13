/**
 * Screenshots der Politur (Titel, Einführung, Lesen, Werkzeug-Moment, Rätsel je Werkzeug, Belohnung, Brett, Finale).
 * Aufruf: node scripts/politur-shots.mjs [breite höhe name]  → 03_screens/v8/politur/<name>_*.png
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'tel'];
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8/politur');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const fehler = [];
p.on('pageerror', (e) => fehler.push('Seitenfehler: ' + String(e)));
p.on('console', (m) => { if (m.type() === 'error') fehler.push('Konsole: ' + m.text()); });
let nr = 0;
const shot = async (n) => { await p.screenshot({ path: `${OUT}/${NAME}_${String(++nr).padStart(2, '0')}_${n}.png` }); };
await p.goto('http://localhost:4173/v8.html');
await sleep(900);
const gehe = async (o) => { await p.evaluate((o) => { const v = window.__v8; Object.assign(v.stand, o); v.zeige(); }, o); };
await sleep(500); await shot('titel');
await gehe({ view: 'intro' });
for (let k = 0; k < 6; k++) {
  await sleep(700);
  const t = await p.evaluate(() => !!document.querySelector('.wzraster'));
  if (t) { await shot('intro_werkzeuge'); break; }
  await p.click('#fuss [data-a="w"]');
}
await gehe({ view: 'kapitel', spur: 1 }); await sleep(600); await shot('kapitelkarte');
const schritt = (n, st) => p.evaluate(([n, st]) => window.__v8.steps(n).indexOf(st), [n, st]);
await gehe({ view: 'spur', spur: 3, i: 0, blatt: 0 }); await sleep(700); await shot('lesen');
for (const [spur, name] of [[3, 'fuehler'], [13, 'lupe'], [15, 'zeit'], [17, 'lesen']]) {
  const i = await schritt(spur, 'raetsel');
  await gehe({ view: 'spur', spur, i, blatt: 0, fertig: [] });
  await sleep(500); await shot(`s${spur}_${name}_moment`);
  await sleep(1500); await shot(`s${spur}_${name}_raetsel`);
}
// Belohnung: Rätsel 3 lösen
{
  const i = await schritt(3, 'raetsel');
  await gehe({ view: 'spur', spur: 3, i, blatt: 0, fertig: [] });
  await sleep(1800);
  await p.evaluate(() => window.__v8.loese());
  await sleep(350); await shot('belohnung_knall');
  await sleep(700); await shot('belohnung_flug');
  await sleep(1400); await shot('geloest');
}
{
  const i = await schritt(3, 'brett');
  await gehe({ view: 'spur', spur: 3, i, blatt: 0, fertig: [1, 2, 3] });
  await sleep(900); await shot('brett_staub');
  await p.evaluate(() => window.__v8.loese());
  await sleep(1200); await shot('brett');
}
await gehe({ view: 'finale', fin: 3, weiter: 'finale', fertig: Array.from({ length: 24 }, (_, j) => 1 + j), name: 'Mia' }); await sleep(900); await shot('urkunde');
await gehe({ view: 'finale', fin: 4, weiter: 'finale' }); await sleep(1200); await shot('finale_raupe');
console.log(fehler.length ? fehler.join('\n') : 'keine Fehler');
await b.close();
