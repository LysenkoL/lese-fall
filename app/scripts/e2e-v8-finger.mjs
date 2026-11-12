/**
 * Finger-Probe für die Vorschau v8 (echte Berührungen statt Maus):
 *   1. schnelles falsches Legen zählt nur als EIN Fehlversuch
 *   2. ein Kärtchen lässt sich mit dem Finger in ein Feld ziehen
 *   3. Wischen auf dem Brett blättert nicht zurück ins Lesen
 *   4. „Von vorn beginnen“ fragt erst nach
 *   5. große Schrift auf kleinem Bildschirm: kein Blatt schneidet Text ab
 *   7. Kapitel 3: Lupe, Schatten, Unterschiede mit Sortieren, Kreise in drei Schritten, Agentencode, Plakat, Schlussfrage (Finger, Fehlerregel)
 *   8. Kapitel 4: Wort im Baum, Faden ziehen (Knopf gedrückt halten), Laub wischen, Finale mit Tresor-Code (Ziehen, Tippen) und Urkunde
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
  return { p, zieh, tipp, cdp };
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
  // Mond untersuchen: Wischen dreht, Kleber antippen, Karte und Grund wählen
  await zustand(8, 1);
  const quelle = () => p.$eval('.kl-mond img', (e) => e.getAttribute('src'));
  const q0 = await quelle();
  const [ux, uy] = await mitte(p, '.kl-mond');
  await zieh(ux - 70, uy, ux + 70, uy); await sleep(300);
  pruef((await quelle()) !== q0 && !!(await p.$('.kl-kleber')), 'Mond untersuchen: Wischen über den Mond dreht ihn, der nasse Kleber ist zu sehen');
  const zb = await (await p.$('.kl-zone')).boundingBox();
  await p.touchscreen.tap(zb.x + zb.width * 0.9, zb.y + zb.height * 0.9); await sleep(600);
  pruef(!!(await p.$('.kl-karten')), 'Mond untersuchen: Antippen am Rand der Kleber-Fläche öffnet die Fragen');
  await tipp('.kl-k[data-k="weiss"]'); await tipp('.kl-g[data-g="kleber"]'); await tipp('#fuss [data-a="pruefen"]'); await sleep(600);
  pruef(!!(await p.$('#fuss [data-a="weiter"]')), 'Mond untersuchen: richtiges Paar (Karte + Grund) löst');
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
/* ---- 7: Kapitel 3 mit dem Finger ---- */
{
  const { p, zieh, tipp } = await seite(390, 844, () => {});
  const D = await p.evaluate(() => window.__v8.D);
  const zustand = async (spur, i) => { await p.evaluate(([n, k]) => { const v = window.__v8; Object.assign(v.stand, { view: 'spur', spur: n, i: k, blatt: 0, intro: true, fertig: Array.from({ length: n - 1 }, (_, j) => 1 + j), weiter: 'spur' }); v.zeige(); }, [spur, i]); await sleep(700); };
  const weiterDa = () => p.$('#fuss [data-a="weiter"]');
  // Lupe: mit dem Finger über den Käse fahren (die Lupe liegt über dem Finger)
  const z13 = D.spuren[12].raetsel;
  await zustand(13, 1);
  let bx = await (await p.$('.lp-box')).boundingBox();
  await zieh(bx.x + bx.width * 0.2, bx.y + bx.height * 0.3 + 62, bx.x + bx.width * z13.ziel.x / 100, bx.y + bx.height * z13.ziel.y / 100 + 62);
  await sleep(500);
  pruef(!!(await weiterDa()), 'Lupe: mit dem Finger über den Faden gefahren (Lupe über dem Finger) löst');
  // Lupe: zweimal daneben tippen, dann zeigt die Raupe
  await zustand(13, 1);
  bx = await (await p.$('.lp-box')).boundingBox();
  await p.touchscreen.tap(bx.x + bx.width * 0.15, bx.y + bx.height * 0.2); await sleep(300);
  pruef(!(await weiterDa()), 'Lupe: ein Fehltipp löst noch nicht');
  await p.touchscreen.tap(bx.x + bx.width * 0.2, bx.y + bx.height * 0.15); await sleep(1100);
  pruef(!!(await weiterDa()), 'Lupe: nach zwei Fehltipps zeigt die Raupe den Faden');
  // Schatten: zweimal falsch, dann richtig
  const z14 = D.spuren[13].raetsel;
  await zustand(14, 1);
  const f = await p.$$eval('.sc-k', (es, r) => es.filter((e) => +e.dataset.i !== r).map((e) => e.dataset.i), z14.richtig);
  await tipp(`.sc-k[data-i="${f[0]}"]`); await tipp(`.sc-k[data-i="${f[1]}"]`); await sleep(1700);
  pruef(!!(await weiterDa()), 'Schatten: nach zwei Fehlern zeigt die Raupe den Vogel');
  await zustand(14, 1);
  await tipp(`.sc-k[data-i="${z14.richtig}"]`); await sleep(500);
  pruef(!!(await weiterDa()), 'Schatten: richtiger Vogel angetippt');
  // Spur 15: sechs Unterschiede mit dem Finger, dann sortieren
  const z15 = D.spuren[14].raetsel;
  await zustand(15, 1);
  const ub = await (await p.$$('.ub-bild'))[1].boundingBox();
  await p.touchscreen.tap(ub.x + ub.width * 0.06, ub.y + ub.height * 0.9); await sleep(300);
  pruef((await p.$$('.ub .ring.da')).length === 0, 'Unterschiede: Tipp daneben markiert nichts');
  await p.touchscreen.tap(ub.x + ub.width * z15.dinge[0].zonen[0].x / 100, ub.y + ub.height * z15.dinge[0].zonen[0].y / 100); await sleep(300);
  pruef((await p.$$('.ub .ring.da')).length === 2, 'Unterschiede: die drei braunen Flecken zählen als EIN Unterschied (Ring in beiden Bildern)');
  await p.evaluate(() => window.__v8.loese()); await sleep(1000);
  pruef(!!(await p.$('.so-ziele.drei')), 'Unterschiede: danach drei Felder zum Sortieren');
  const so = z15.sortieren.dinge[0], soFalsch = z15.sortieren.ziele.find((q) => q.id !== so.ziel).id;
  await tipp(`.so-pool [data-d="${so.id}"]`); await tipp(`.so-ziel[data-z="${soFalsch}"]`); await sleep(300);
  pruef(!!(await p.$(`.so-pool [data-d="${so.id}"]`)), 'Sortieren: falsches Feld, der Unterschied bleibt liegen');
  await p.evaluate(() => window.__v8.loese()); await sleep(700);
  pruef(!!(await weiterDa()), 'Sortieren: alle zugeordnet, weiter');
  // Kreise in drei Schritten (Finger): a) Merkmale, zweimal falsch, b) immer nur ein Kreis umgedreht, Kreuz-Knopf
  const z16 = D.spuren[15].raetsel;
  await zustand(16, 1);
  await tipp('.kr-mk[data-m="herz"]'); await tipp('#fuss [data-a="pruefen"]'); await sleep(1000);
  await tipp('.kr-mk[data-m="herz"]'); await tipp('#fuss [data-a="pruefen"]'); await sleep(3200);
  pruef(!!(await p.$('.kr-x')), 'Kreise a: nach zwei Fehlern zeigt die Raupe die drei Merkmale, es geht weiter');
  await tipp('.kr-k[data-id="k1"]'); await tipp('.kr-k[data-id="k2"]'); await sleep(400);
  pruef((await p.$$('.kr-um')).length === 1, 'Kreise b: es ist immer nur ein Kreis umgedreht');
  for (const id of z16.kreise.map((c) => c.id).filter((i) => i !== z16.loesung)) await tipp(`.kr-x[data-x="${id}"]`);
  pruef((await p.$$('.kr-k.weg')).length === 4, 'Kreise b: Kreuz-Knopf streicht den Kreis durch (nichts geschieht von selbst)');
  await tipp('#fuss [data-a="fertig"]'); await sleep(900);
  pruef(!!(await p.$(`.kr-k.rest[data-id="${z16.loesung}"]`)) && !!(await p.$('#fuss [data-a="stempeln"]')), 'Kreise c: Milas Mond bleibt übrig');
  await tipp('#fuss [data-a="stempeln"]'); await sleep(800);
  pruef(!!(await weiterDa()), 'Kreise c: Stempel setzt den Abschluss');
  // Geheimagenten-Code: alle zweiten Buchstaben antippen
  const z17 = D.spuren[16].raetsel;
  await zustand(17, 1);
  for (const [wi, w] of z17.woerter.entries()) for (let i = 1; i < w.code.length; i += 2) await p.tap(`.ag-feld .ag-t[data-w="${wi}"][data-i="${i}"]`);
  await tipp('#fuss [data-a="pruefen"]'); await sleep(600);
  pruef(!!(await weiterDa()), 'Geheimagenten-Code: richtig gestrichen, Botschaft gelesen');
  // Plakat: ein Stück mit dem Finger ziehen, zweimal falsch, dann Schlussfrage
  await zustand(18, 1);
  const N = D.spuren[17].raetsel.spalten * D.spuren[17].raetsel.zeilen;
  const [qx, qy] = await mitte(p, '.pk-pool .pk-st[data-s="0"]'), [rx, ry] = await mitte(p, '.pk-platz[data-p="0"]');
  // Hochkant-Plakat: Brett und Vorrat passen auf dem Telefon nicht zugleich auf den Schirm; dann gilt Antippen statt Ziehen
  if (qy < 820 && ry < 820 && qy > 0) await zieh(qx, qy, rx, ry); else { await tipp('.pk-pool .pk-st[data-s="0"]'); await tipp('.pk-platz[data-p="0"]'); }
  pruef(!!(await p.$('.pk-platz[data-p="0"] .pk-st[data-s="0"]')), 'Plakat: Stück mit dem Finger ins Feld gezogen');
  for (let runde = 0; runde < 2; runde++) {
    for (let i = 0; i < N; i++) {
      if (!(await p.$(`.pk-pool .pk-st[data-s="${i}"]`))) continue;
      const frei = await p.$$eval('.pk-platz:not(.voll)', (es) => es.map((e) => +e.dataset.p));
      const ziel = frei.find((q) => q !== i) ?? frei[0];
      await tipp(`.pk-pool .pk-st[data-s="${i}"]`); await tipp(`.pk-platz[data-p="${ziel}"]`);
    }
    await tipp('#fuss [data-a="fertig"]'); await sleep(runde ? 6000 : 1300);
  }
  pruef(!!(await p.$('.as-schluss')), 'Plakat: nach zwei Fehlversuchen setzt die Raupe, die Schlussfrage erscheint');
  const verd = D.spuren[17].raetsel.schluss.optionen.findIndex((o) => !o.sicher);
  await tipp(`.as-so[data-o="${verd}"]`); await sleep(300);
  pruef(!(await weiterDa()), 'Schluss: Verdacht angetippt löst nicht');
  await tipp(`.as-so[data-o="${D.spuren[17].raetsel.schluss.optionen.findIndex((o) => o.sicher)}"]`); await sleep(600);
  pruef(!!(await weiterDa()), 'Schluss: das Sichere angetippt löst');
}
/* ---- 8: Kapitel 4 und Finale mit dem Finger ---- */
{
  const { p, zieh, tipp, cdp } = await seite(390, 844, () => {});
  const D = await p.evaluate(() => window.__v8.D);
  const zustand = async (spur, i, extra = {}) => { await p.evaluate(([n, k, e]) => { const v = window.__v8; Object.assign(v.stand, { view: 'spur', spur: n, i: k, blatt: 0, intro: true, fertig: Array.from({ length: n - 1 }, (_, j) => 1 + j), weiter: 'spur', ...e }); v.zeige(); }, [spur, i, extra]); await sleep(700); };
  const weiterDa = () => p.$('#fuss [data-a="weiter"]');
  // Spur 19: drei Buchstaben antippen → Wort AST → Astgabel (erst falsch, dann richtig)
  const z19 = D.spuren[18].raetsel;
  await zustand(19, 1);
  for (const q of z19.runden) { await tipp(`.vb-o[data-o="${q.buchstabe}"]`); await sleep(1900); }
  await sleep(600);
  pruef((await p.$$('.ab-wort i.da')).length === 3, 'Astgabel: die drei Buchstaben stehen im Wort');
  await tipp('#fuss [data-a="weiter"]'); await sleep(400);
  for (const [i, c] of z19.erinnern.karten.entries()) if (c.ok) await tipp(`.ab-e[data-i="${i}"]`);
  await sleep(2000);
  const ab = await (await p.$('.ab-bild')).boundingBox();
  const gt = (g) => p.touchscreen.tap(ab.x + ab.width * g.x / 100, ab.y + ab.height * g.y / 100);
  await gt(z19.gabeln.find((g) => g.id !== z19.richtig)); await sleep(400);
  pruef(!!(await p.$('#fuss [data-a="nachsehen"]')) && !(await p.$('.ab-hin')), 'Astgabel: nach dem ersten Fehler erscheint der Knopf „Im Text nachsehen“, der Absatz noch nicht');
  await tipp('#fuss [data-a="nachsehen"]'); await sleep(300);
  pruef(!!(await p.$('.ab-hin')), 'Astgabel: Knopf zeigt den Absatz');
  await gt(z19.gabeln.find((g) => g.id === z19.richtig)); await sleep(1500);
  pruef(!!(await p.$('#fuss [data-a="stempeln"]')), 'Astgabel: richtige Gabel, der Stempel kommt');
  // Spur 22: Vorführung, dann mit dem Finger am Griff nach unten wischen
  await zustand(22, 1);
  for (let t = 0; t < 80 && !(await p.$('.fd-maus.achtung')); t++) await sleep(150);
  await sleep(2600);
  for (let t = 0; t < 120 && !((await p.$('.fd-maus.achtung')) && !(await p.$('.fd-mond.hoch'))); t++) await sleep(100);
  await sleep(300);
  const gb = await (await p.$('.fd-griff b')).boundingBox();
  await zieh(gb.x + gb.width / 2, gb.y + gb.height / 2, gb.x + gb.width / 2, gb.y + gb.height / 2 + 70); await sleep(400);
  pruef((await p.$$('.fd-zaehl i.an')).length >= 1, 'Faden ziehen: mit dem Finger am Griff nach unten gewischt, ein Punkt');
  // Spur 24: Laub mit dem Finger wegwischen, dann Nest, Band, Schlüssel antippen
  await zustand(24, 1);
  const nb = await (await p.$('.nt-bild')).boundingBox();
  for (let k = 0; k < 5; k++) await zieh(nb.x + 20, nb.y + 30 + k * nb.height / 6, nb.x + nb.width - 20, nb.y + 30 + k * nb.height / 6);
  await sleep(900);
  pruef(!(await p.$('canvas.staub.laub')) || !!(await p.$('canvas.staub.laub.weg')), 'Laub: mit dem Finger weggewischt');
  for (const t of D.spuren[23].raetsel.ziele) { const n2 = await (await p.$('.nt-bild')).boundingBox(); await p.touchscreen.tap(n2.x + n2.width * t.x / 100, n2.y + n2.height * t.y / 100); await sleep(1100); }
  await sleep(4300);
  pruef(!!(await weiterDa()), 'Nest: Nest, Band und Schlüssel gefunden, weiter');
  // Finale: Szene → Code legen (ein Kärtchen ziehen, den Rest antippen) → Tresor → Urkunde
  await p.evaluate(() => { const v = window.__v8; Object.assign(v.stand, { view: 'finale', fin: 1, weiter: 'finale', fertig: Array.from({ length: 24 }, (_, j) => 1 + j) }); v.zeige(); }); await sleep(700);
  const wort = D.kapitel[0].code.wort;
  const kk = async () => p.$$eval('.fin-k:not(.weg)', (es) => es.map((e) => ({ k: +e.dataset.k, c: e.textContent.trim() })));
  const k0 = (await kk()).find((q) => q.c === wort[0]);
  const [ax, ay] = await mitte(p, `.fin-k[data-k="${k0.k}"]`), [fx, fy] = await mitte(p, '.fin-f[data-f="0"]');
  await zieh(ax, ay, fx, fy);
  pruef((await p.$eval('.fin-f[data-f="0"]', (e) => e.textContent.trim())) === wort[0], 'Finale: Kärtchen mit dem Finger ins erste Feld gezogen');
  for (let i = 1; i < wort.length; i++) { const k = (await kk()).find((q) => q.c === wort[i]); await tipp(`.fin-k[data-k="${k.k}"]`); }
  await sleep(2600);
  pruef(!!(await p.$('.tv')), 'Finale: Code richtig gelegt, der Tresor erscheint');
  await sleep(3200);
  pruef(!!(await weiterDa()) && (await p.$eval('.tv', (e) => e.classList.contains('auf'))), 'Finale: Tresor ist aufgegangen');
  await tipp('#fuss [data-a="weiter"]'); await sleep(500);
  pruef(!!(await p.$('.dipl .dt')), 'Finale: Urkunde „Meister-Detektiv“ steht da');
}
await b.close();
console.log(fehler.length ? `\n✗ ${fehler.length} Befunde` : '\n✓ Finger-Probe ohne Befunde');
process.exit(fehler.length ? 1 : 0);
