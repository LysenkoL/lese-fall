/**
 * Stil v2 (Test): gleiche Bildschirme im alten und im neuen Stil, nebeneinander.
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/stil-vergleich.mjs  → 03_screens/stil_v2/
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, unlinkSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.argv[2] ?? 'http://localhost:4173/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/stil_v2');
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith('.png') || f.endsWith('.jpg')) unlinkSync(`${OUT}/${f}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEW = { width: 390, height: 844 };

/** spielt Spur 1–2 an und macht von jedem Schritt ein Bild */
async function lauf(stil2) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: VIEW, deviceScaleFactor: 2, hasTouch: true });
  const shots = {};
  const shot = async (k) => { await sleep(900); shots[k] = await p.screenshot({ type: 'png' }); };
  const btn = async (a) => { await p.click(`[data-a="${a}"]`); await sleep(150); };
  await p.goto(URL); await sleep(500);
  await p.evaluate((s) => localStorage.setItem('lesefall.v1', JSON.stringify({ stil2: s, vorgeschichte: true, ort: { view: 'read', teil: 1, anker: 'head' } })), stil2);
  await p.reload(); await sleep(800);
  await shot('01_titel');
  await btn('los'); await shot('02_spur1_erstes_blatt');
  while (!(await p.$('[data-a="end"]'))) { await btn('next'); await sleep(450); }
  await shot('03_spur1_letztes_blatt');
  await btn('end'); await shot('04_spur1_spiel');
  await p.click('[data-drag="mond"]'); await shot('05_spur1_ding_gewaehlt');
  await p.click('[data-zone="links"]'); await sleep(150);
  await btn('pruefen'); await sleep(300); await shot('06_spur1_sieg');
  await btn('sichern'); await shot('07_spurenwand_staub');
  const box = await (await p.$('canvas.staub')).boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down();
  for (let y = 4; y < box.height; y += 10) { await p.mouse.move(box.x + box.width - 6, box.y + y, { steps: 5 }); await p.mouse.move(box.x + 6, box.y + y + 9, { steps: 5 }); }
  await p.mouse.up(); await sleep(300);
  await shot('08_spurenwand_buchstabe');
  await btn('go'); await sleep(400);
  await btn('next'); await sleep(450); await shot('09_spur2_gedanke');
  while (!(await p.$('[data-a="end"]'))) { await btn('next'); await sleep(450); }
  await btn('end'); await shot('10_spur2_spiel');
  await b.close();
  return shots;
}

const alt = await lauf(false);
const neu = await lauf(true);
// nebeneinander: kleine HTML-Seite mit beiden Bildern, davon ein Bild
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 860, height: 960 }, deviceScaleFactor: 1 });
for (const k of Object.keys(alt)) {
  const src = (buf) => 'data:image/png;base64,' + buf.toString('base64');
  await p.setContent(`<body style="margin:0;background:#E9E4D8;font:600 18px system-ui;display:flex;gap:20px;padding:16px 20px">
    <figure style="margin:0"><figcaption style="margin-bottom:8px">alt</figcaption><img src="${src(alt[k])}" style="width:390px;border-radius:12px"></figure>
    <figure style="margin:0"><figcaption style="margin-bottom:8px">Neuer Stil (Test)</figcaption><img src="${src(neu[k])}" style="width:390px;border-radius:12px"></figure></body>`);
  await sleep(200);
  await p.screenshot({ path: `${OUT}/${k}.jpg`, type: 'jpeg', quality: 82, fullPage: true });
  console.log('✓', k);
}
await b.close();
void readFileSync;
