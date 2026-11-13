import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:4173/v8.html');
await new Promise((r) => setTimeout(r, 900));
for (const n of [13, 18, 19, 24, 3]) {
  await p.evaluate((n) => { const v = window.__v8; Object.assign(v.stand, { view: 'spur', spur: n, i: 0, blatt: 0 }); v.zeige(); }, n);
  await new Promise((r) => setTimeout(r, 800));
  console.log(n, await p.evaluate(() => { const A = document.getElementById('app').getBoundingClientRect(); return [...document.querySelectorAll('#app *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > A.right + 1 || r.left < A.left - 1); }).map((e) => e.tagName + '.' + e.className + ' ' + JSON.stringify(e.getBoundingClientRect())).slice(0, 4); }));
}
await b.close();
