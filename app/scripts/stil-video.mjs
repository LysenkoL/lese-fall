/**
 * Kurzes Video eines Spur-1-Durchgangs im neuen Stil (zeigt die Animationen).
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/stil-video.mjs → 03_screens/stil_v2/spur1_zyklus.webm (+ .gif, wenn ffmpeg da ist)
 */
import { createRequire } from 'node:module';
import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.argv[2] ?? 'http://localhost:4173/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/stil_v2');
const TMP = resolve(OUT, '_video');
mkdirSync(TMP, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, recordVideo: { dir: TMP, size: { width: 390, height: 844 } } });
const p = await ctx.newPage();
await p.goto(URL); await sleep(300);
await p.evaluate(() => localStorage.setItem('lesefall.v1', JSON.stringify({ stil2: true, vorgeschichte: true, ort: { view: 'read', teil: 1, anker: 'head' } })));
await p.reload(); await sleep(900);
const btn = async (a, w = 700) => { await p.click(`[data-a="${a}"]`); await sleep(w); };
await btn('los', 1400);
while (!(await p.$('[data-a="end"]'))) await btn('next', 1100);
await sleep(1200);
await btn('end', 1200);
await p.click('[data-drag="mond"]'); await sleep(700);
await p.click('[data-zone="links"]'); await sleep(700);
await btn('pruefen', 2400);
await btn('sichern', 1400);
const box = await (await p.$('canvas.staub')).boundingBox();
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down();
for (let y = 4; y < box.height; y += 12) { await p.mouse.move(box.x + box.width - 6, box.y + y, { steps: 8 }); await p.mouse.move(box.x + 6, box.y + y + 9, { steps: 8 }); }
await p.mouse.up(); await sleep(2200);
await ctx.close(); await b.close();
const f = readdirSync(TMP).find((x) => x.endsWith('.webm'));
const webm = resolve(OUT, 'spur1_zyklus.webm');
renameSync(resolve(TMP, f), webm);
try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', 'fps=10,scale=260:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer', resolve(OUT, 'spur1_zyklus.gif')]);
  console.log('✓ gif');
} catch (e) { console.log('kein gif:', e.message); }
console.log('✓', webm);
