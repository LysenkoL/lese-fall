import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [SRC, OUT] = [process.argv[2], process.argv[3]];
const font = (f) => 'data:font/woff2;base64,' + readFileSync(new URL('../../../assets/fonts/' + f, import.meta.url)).toString('base64');
const GER = {
  phone: { W: 1080, H: 1920, dw: 860, top: 120, h1: 74, h2: 40, gap: 70, r: 44 },
  tab7: { W: 1200, H: 1920, dw: 980, top: 120, h1: 78, h2: 42, gap: 70, r: 40 },
  tab10: { W: 1600, H: 2560, dw: 1320, top: 160, h1: 104, h2: 54, gap: 90, r: 48 },
};
const BILDER = [
  ['1_titel', 'Ein Krimi zum Selberlesen', 'Fall 1: Der verschwundene Mond'],
  ['2_lesen_s9_b0', 'Lesen mit farbigen Silben', 'Blau und rot – Silbe für Silbe'],
  ['3_pullis', 'Nach jeder Spur ein Rätsel', '24 Rätsel passend zur Geschichte'],
  ['4_unterschiede', 'Genau hinsehen', 'Was hat sich verändert?'],
  ['5_wasser', 'Versteckte Buchstaben', 'Die Leucht-Fühler helfen beim Suchen'],
  ['5b_schatten', 'Mitdenken wie ein Detektiv', 'Hinweise lesen, Schlüsse ziehen'],
  ['6_brett', 'Alle Funde am Brett', 'Hinweise sammeln und Fragen klären'],
  ['8_urkunde', 'Fall gelöst!', 'Urkunde für Meister-Detektive'],
];
const b = await chromium.launch();
for (const dev of ['phone', 'tab7', 'tab10']) {
  const g = GER[dev];
  const p = await b.newPage({ viewport: { width: g.W, height: g.H }, deviceScaleFactor: 1 });
  let n = 0;
  for (const [f, h1, h2] of BILDER) {
    const img = 'data:image/png;base64,' + readFileSync(`${SRC}/${dev}/${f}.png`).toString('base64');
    await p.setContent(`<!doctype html><html><head><style>
@font-face{font-family:I;src:url(${font('Inter-ExtraBold.woff2')});font-weight:800}
@font-face{font-family:I;src:url(${font('Inter-SemiBold.woff2')});font-weight:600}
*{margin:0;box-sizing:border-box}
body{width:${g.W}px;height:${g.H}px;overflow:hidden;font-family:I;font-feature-settings:'cv05' 1,'cv11' 1;
background:radial-gradient(circle at 85% 6%,rgba(255,226,140,.35) 0,rgba(255,226,140,0) ${g.W*0.18}px),linear-gradient(#1D2E57,#2C4176 45%,#5A6FA0);
display:flex;flex-direction:column;align-items:center;text-align:center;color:#fff}
h1{margin-top:${g.top}px;font-weight:800;font-size:${g.h1}px;line-height:1.1;color:#F4C243;padding:0 50px;letter-spacing:-.5px}
h2{margin-top:${g.h1*0.3}px;font-weight:600;font-size:${g.h2}px;line-height:1.25;color:#E8EEFA;padding:0 60px}
.d{margin-top:${g.gap}px;width:${g.dw}px;border-radius:${g.r}px;overflow:hidden;border:${Math.round(g.W/90)}px solid #0F1834;
box-shadow:0 30px 80px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.12)}
.d img{display:block;width:100%}
</style></head><body><h1>${h1}</h1><h2>${h2}</h2><div class="d"><img src="${img}"></div></body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    const dir = { phone: 'telefon', tab7: 'tablet_7', tab10: 'tablet_10' }[dev];
    await p.screenshot({ path: `${OUT}/${dir}/${String(++n).padStart(2, '0')}_${f.replace(/^\w+?_/, '').replace(/_s9_b0$/, '')}.png` });
  }
  await p.close();
}
await b.close();
