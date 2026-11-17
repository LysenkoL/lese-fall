import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, DSF, OUT] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF, hasTouch: true, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
const BASE = { view: 'spur', weiter: 'spur', spur: 1, i: 0, blatt: 0, fertig: [], tipps: {}, tippPerle: 0, geklaert: [], mix: [], intro: true, fs: 20, silben: true, fin: 0, name: '' };
const fb = (n) => Array.from({ length: n - 1 }, (_, k) => k + 1);
async function shot(name, st, after) {
  await p.goto('http://localhost:4173/v8.html');
  await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('lesefall.v8', JSON.stringify(s)); }, { ...BASE, ...st });
  await p.reload(); await sleep(900);
  if (st.view !== 'titel') { const k = await p.$('[data-a="start"]'); if (k) { await k.click(); await sleep(900); } }
  if (after) await after(p);
  await sleep(1300);
  await p.screenshot({ path: `${OUT}/${name}.png` });
}
const tool = async (p) => { await sleep(1500); await p.mouse.click(3, H / 2); };
const ri = (n) => p.evaluate((n) => window.__v8.steps(n).indexOf('raetsel'), n);
await shot('1_titel', { view: 'titel', weiter: 'intro', intro: false });
for (const bl of [0, 1, 2]) await shot(`2_lesen_s9_b${bl}`, { spur: 9, blatt: bl, fertig: fb(9) });
await shot('3_pullis', { spur: 6, i: await ri(6), fertig: fb(6) }, tool);
await shot('4_unterschiede', { spur: 2, i: await ri(2), fertig: fb(2) }, tool);
await shot('5_wasser', { spur: 3, i: await ri(3), fertig: fb(3) }, tool);
await shot('5b_schatten', { spur: 14, i: await ri(14), fertig: fb(14) }, tool);
await shot('6_brett', { spur: 5, i: 2, fertig: fb(6) });
await shot('7_tresor', { view: 'finale', weiter: 'finale', spur: 24, fertig: fb(25), fin: 2 });
await shot('8_urkunde', { view: 'finale', weiter: 'finale', spur: 24, fertig: fb(25), fin: 3, name: 'Lina' });
console.log('errors', errs.slice(0, 5));
await b.close();
