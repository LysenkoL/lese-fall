/**
 * Finger-Probe für die Vorschau v8 (echte Berührungen statt Maus):
 *   1. schnelles falsches Legen zählt nur als EIN Fehlversuch
 *   2. ein Kärtchen lässt sich mit dem Finger in ein Feld ziehen
 *   3. Wischen auf dem Brett blättert nicht zurück ins Lesen
 *   4. „Von vorn beginnen“ fragt erst nach
 *   5. große Schrift auf kleinem Bildschirm: kein Blatt schneidet Text ab
 *   6. Kapitel 2: Zwei Kisten (Ziehen, Tippen, falscher Platz), Mond umdrehen per Wischen, Suchbild (Tippen am Rand), Geheimschrift
 * Aufruf: npx vite preview --port 4173 &  →  node scripts/e2e-v8-finger.mjs
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.env.URL ?? 'http://localhost:4173/v8.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruef = (ok, text) => { console.log((ok ? '✓ ' : '✗ ') + text); if (!ok) fehler.push(text); };
const b = await chromium.launch();

async function seite(w, h, vorher) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => fehler.push('Seitenfehler: ' + e));
  if (vorher) await p.addInitScript(vorher);
  await p.goto(URL);
  await sleep(700);
  const cdp = await ctx.newCDPSession(p);
  const zieh = async (x0, y0, x1, y1) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * k) / 10, y: y0 + ((y1 - y0) * k) / 10 }] }); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(500);
  };
  const tipp = async (s) => { await p.tap(s); await sleep(250); };
  return { p, zieh, tipp };
}
const mitte = async (p, s) => { const r = await (await p.$(s)).boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };

/* ---- 1 bis 4: Telefon ---- */
{
  const { p, zieh, tipp } = await seite(390, 844);
  await tipp('[data-a="start"]');
  while (await p.$('#fuss [data-a="w"]')) await tipp('#fuss [data-a="w"]');
  for (let k = 0; k < 12 && !(await p.$('#fuss [data-a="weiter"]')); k++) await tipp('#fuss [data-a="next"]');
  await tipp('#fuss [data-a="weiter"]');
  await sleep(400);

  // 1. MOND schnell falsch legen: D, N, O, M
  const wort = await p.evaluate(() => window.__v8.D.spuren[0].raetsel.runden[0].wort);
  for (const ch of [...wort].reverse()) await p.tap(`.bs-lose .bk:text-is("${ch}")`);
  await sleep(1500);
  pruef(!(await p.$('#fuss [data-a="weiter"]')) && (await p.$$('.bs-felder .bk.ok')).length === 0, 'schnelles falsches Legen: ein Fehlversuch, die Raupe löst noch nicht');
  // Kind stellt um: alles zurück, dann richtig
  for (const k of await p.$$('.bs-felder .bk')) { await (await p.$('.bs-felder .bk')).tap(); await sleep(80); }
  for (const ch of wort) { await p.tap(`.bs-lose .bk:text-is("${ch}")`); await sleep(80); }
  await sleep(900);
  pruef((await p.$$('.bs-felder .bk.ok')).length === wort.length, 'zweiter Versuch richtig gelegt: Wort wird angenommen');
  await tipp('#fuss [data-a="weiter"]');
  await sleep(300);

  // 2. Kärtchen mit dem Finger ziehen
  const [x0, y0] = await mitte(p, '.bs-lose .bk');
  const [x1, y1] = await mitte(p, '.bs-felder .feld');
  await zieh(x0, y0, x1, y1);
  pruef((await p.$$('.bs-felder .feld:first-child .bk')).length === 1, 'Kärtchen mit dem Finger ins erste Feld gezogen');

  // Rest des Rätsels lösen, bis das Brett da ist
  for (let k = 0; k < 8 && !(await p.$('.brett, [data-m="brett"]')); k++) {
    await p.evaluate(() => window.__v8.loese());
    await sleep(900);
    if (await p.$('#fuss [data-a="weiter"]:not([disabled])')) await tipp('#fuss [data-a="weiter"]');
    await sleep(400);
  }
  const m0 = await p.evaluate(() => document.querySelector('#app').dataset.m);
  // 3. waagrecht über das Brett wischen
  await zieh(340, 300, 60, 310);
  await zieh(60, 300, 340, 310);
  const m1 = await p.evaluate(() => document.querySelector('#app').dataset.m);
  pruef(m0 === m1 && !(await p.$('#buehne .blatt')), `Wischen auf dem Brett blättert nicht (Modus ${m0} → ${m1})`);

  // 4. Neustart fragt nach
  await tipp('#bAa');
  await tipp('[data-a="neu"]');
  const spur = await p.evaluate(() => window.__v8.stand.fertig.length + '/' + window.__v8.stand.view);
  pruef(!!(await p.$('.einst.frage')), 'Neustart: Nachfrage erscheint');
  await tipp('.einst.frage [data-a="nein"]');
  pruef(spur === (await p.evaluate(() => window.__v8.stand.fertig.length + '/' + window.__v8.stand.view)) && !(await p.$('.einst.frage')), 'Neustart: „Nein“ lässt den Stand unverändert');
  await p.screenshot({ path: '../03_screens/v8/finger_brett.png' });
  await tipp('#bAa');
  await tipp('[data-a="neu"]');
  await p.screenshot({ path: '../03_screens/v8/finger_neustart.png' });
  await tipp('.einst.frage [data-a="ja"]');
  pruef((await p.evaluate(() => window.__v8.stand.view)) === 'titel', 'Neustart: „Ja“ führt zum Titel');
}

/* ---- 5: kleine Fläche, größte Schrift ---- */
{
  const { p } = await seite(320, 568, () => {});
  let abgeschnitten = 0, blaetter = 0;
  for (let s = 1; s <= 12; s++) {
    await p.evaluate((n) => { const v = window.__v8; Object.assign(v.stand, { view: 'spur', spur: n, i: 0, blatt: 0, fs: 26, intro: true }); document.documentElement.style.setProperty('--fs', '26px'); v.zeige(); }, s);
    await sleep(300);
    for (let k = 0; k < 30; k++) {
      const m = await p.evaluate(() => { const e = document.querySelector('#buehne .blatt'); return e ? [e.scrollHeight, e.clientHeight, getComputedStyle(e).fontSize] : null; });
      if (!m) break;
      blaetter++;
      if (m[0] > m[1] + 1) { abgeschnitten++; console.log(`  Spur ${s}, Blatt ${k + 1}: ${m[0]} > ${m[1]} (${m[2]})`); }
      if (!(await p.$('#fuss [data-a="next"]'))) break;
      await p.tap('#fuss [data-a="next"]');
      await sleep(120);
    }
  }
  pruef(blaetter > 40 && abgeschnitten === 0, `große Schrift 320×568: ${blaetter} Blätter, ${abgeschnitten} zu hoch`);
}

/* ---- 6: Kapitel 2 mit dem Finger ---- */
{
  const { p, zieh, tipp } = await seite(390, 844, () => {});
  const zustand = async (spur, i) => { await p.evaluate(([n, k]) => { const v = window.__v8; Object.assign(v.stand, { view: 'spur', spur: n, i: k, blatt: 0, intro: true, fertig: [1, 2, 3, 4, 5, 6, ...Array.from({ length: n - 7 }, (_, j) => 7 + j)], weiter: 'spur' }); v.zeige(); }, [spur, i]); await sleep(700); };
  const D = await p.evaluate(() => window.__v8.D);
  // Zwei Kisten
  await zustand(7, 1);
  const z7 = D.spuren[6].raetsel;
  const platz = (id) => `.so-ziel[data-z="${id}"]`;
  const [fx, fy] = await mitte(p, '.so-pool [data-d="fuchs"]'), [kx, ky] = await mitte(p, platz('kiste'));
  await zieh(fx, fy, kx, ky);
  pruef(!!(await p.$(`${platz('kiste')} [data-d="fuchs"]`)), 'Zwei Kisten: Puppe mit dem Finger in die Kiste gezogen');
  await tipp('.so-pool [data-d="papier"]'); await tipp(platz('tablett'));
  pruef(!!(await p.$(`${platz('tablett')} [data-d="papier"]`)), 'Zwei Kisten: Tippen (Sache, dann Platz) legt den Papierstapel aufs Tablett');
  await tipp('.so-pool [data-d="mond"]'); await tipp(platz('tablett'));
  pruef(!!(await p.$('.so-pool [data-d="mond"]')), 'Zwei Kisten: Mond aufs Tablett bleibt liegen (falsch)');
  const [mx, my] = await mitte(p, '.so-pool [data-d="mond"]'), [tx, ty] = await mitte(p, platz('kiste'));
  await zieh(mx, my, tx, ty);
  pruef(!!(await p.$(`${platz('kiste')} [data-d="mond"]`)), 'Zwei Kisten: Mond mit dem Finger in die grüne Kiste');
  // Mond umdrehen per Wischen
  await zustand(8, 1);
  const quelle = () => p.$eval('.um-mond img', (e) => e.getAttribute('src'));
  const q0 = await quelle();
  const [ux, uy] = await mitte(p, '.um-mond');
  await zieh(ux - 70, uy, ux + 70, uy); await sleep(300);
  pruef((await quelle()) !== q0, 'Mond umdrehen: Wischen über den Mond dreht ihn');
  await tipp('#fuss [data-a="legen"]'); await sleep(500);
  const zb = await (await p.$('.um-zone')).boundingBox();
  pruef(!!zb, 'Mond umdrehen: weiße Seite nach oben gelegt, jetzt kommt die Frage nach dem Kleber');
  await p.touchscreen.tap(zb.x + zb.width * 0.9, zb.y + zb.height * 0.9); await sleep(600);
  pruef(!!(await p.$('#fuss [data-a="weiter"]')), 'Mond umdrehen: Antippen am Rand der Kleber-Fläche löst');
  // Suchbild: am Rand jedes Gegenstands tippen
  await zustand(9, 1);
  const z9 = D.spuren[8].raetsel, bb = await (await p.$('.sb-bild')).boundingBox();
  for (const [i, x] of z9.dinge.entries()) {
    await p.touchscreen.tap(bb.x + bb.width * (x.x + (i % 2 ? 1 : -1) * x.w * 0.42) / 100, bb.y + bb.height * (x.y + (i < 2 ? -1 : 1) * x.h * 0.42) / 100); await sleep(300);
  }
  await sleep(700);
  pruef(!!(await p.$('#fuss [data-a="weiter"]')), 'Suchbild: alle vier Dinge mit dem Finger am Rand gefunden');
  // Geheimschrift
  await zustand(10, 1);
  await tipp(`.sp-o[data-o="${z9 && D.spuren[9].raetsel.richtig}"]`); await sleep(1100);
  pruef(!!(await p.$('#fuss [data-a="weiter"]')), 'Geheimschrift: richtige Lesung angetippt');
  // Fehlerregel: zweimal falsch zeigt die Raupe
  await zustand(10, 1);
  const falsch = D.spuren[9].raetsel.lesungen.findIndex((_, i) => i !== D.spuren[9].raetsel.richtig);
  await tipp(`.sp-o[data-o="${falsch}"]`); await tipp(`.sp-o[data-o="${falsch}"]`); await sleep(2000);
  pruef(!!(await p.$('#fuss [data-a="weiter"]')), 'Geheimschrift: nach zwei Fehlern zeigt die Raupe, man kommt weiter');
}
await b.close();
console.log(fehler.length ? `\n✗ ${fehler.length} Befunde` : '\n✓ Finger-Probe ohne Befunde');
process.exit(fehler.length ? 1 : 0);
