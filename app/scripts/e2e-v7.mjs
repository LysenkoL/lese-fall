/**
 * Durchlauf der Vorschau v7 (Kapitel 1): löst jeden Zug nach den Daten, prüft den Fehlerweg (Notizbuch → Text)
 * und legt Bilder in 03_screens/v7/ ab.  Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e-v7.mjs [breite höhe name [ab-szene [schriftgröße]]]
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME, START, FS] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon', +(process.argv[5] ?? 1), +(process.argv[6] ?? 20)];
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v7', NAME);
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true });
const fehler = [];
p.on('pageerror', (e) => fehler.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push(m.text()); });
let nr = 0;
const shot = async (name) => { await sleep(450); await p.screenshot({ path: `${OUT}/${String(++nr).padStart(2, '0')}_${name}.png` }); };
const klick = async (s) => { await p.click(s); await sleep(120); };
const messen = async (wo) => {
  await sleep(380); // Einblenden abwarten
  const m = await p.evaluate(() => {
    const W = innerWidth;
    const breit = [...document.querySelectorAll('#app *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > W + 1 || r.left < -1) && !e.closest('.tatort') && !e.classList.contains('lampe'); }).length;
    const bl = document.querySelector('.blatt:not(.probe)');
    return { breit, rollt: bl ? bl.scrollHeight > bl.clientHeight + 2 : false };
  });
  if (m.breit) fehler.push(`${wo}: ${m.breit} Elemente breiter als der Bildschirm`);
  if (m.rollt) fehler.push(`${wo}: Leseblatt läuft über`);
};
/** Satz im geöffneten Text suchen (blättern) und antippen */
async function satz(id) {
  for (let k = 0; k < 12; k++) {
    if (await p.$(`.blatt .satz[data-s="${id}"]`)) return klick(`.blatt .satz[data-s="${id}"]`);
    await klick('[data-a="next"]');
  }
  throw new Error('Satz nicht gefunden: ' + id);
}
async function lesen(spur, teil) {
  for (let k = 0; k < 12; k++) {
    await messen(`Spur ${spur} Teil ${teil} Blatt ${k + 1}`);
    if (k === 0 || spur <= 2 || teil) await shot(`s${spur}_lesen${teil ? 'B' : ''}_${k + 1}`);
    if (await p.$('#fuss [data-a="weiter"]')) break;
    await klick('#fuss [data-a="next"]');
  }
  await klick('#fuss [data-a="weiter"]');
}
async function zug(spur, st, k) {
  const z = st.z, name = `s${spur}_zug${st.nr}_${z.art}`;
  await shot(name);
  await messen(name);
  if (z.art === 'markieren') {
    await klick('[data-a="los"]'); await shot(name + '_text');
    if (spur === 1) { await klick('[data-a="fertig"]'); await shot(name + '_fehlt'); } // ohne Markierung: Tipp
    for (const id of z.muss) await satz(id);
    await shot(name + '_markiert');
    await klick('[data-a="fertig"]');
  } else if (z.art === 'wahl') {
    if (z.offen) await klick(`[data-o="${z.optionen[0].id}"]`);
    else {
      if (spur === 3) { // Fehlerweg: falsch → Notizbuch → Text → Satz
        await klick(`[data-o="${z.optionen.find((o) => !z.richtig.includes(o.id)).id}"]`); await shot(name + '_falsch');
        await klick('[data-a="beweis"]'); await shot(name + '_notizbuch');
        if (await p.$(`.heft [data-n="${z.beweis[0]}"]`)) await klick(`.heft [data-n="${z.beweis[0]}"]`);
        else { await klick('.heft [data-a="text"]'); await shot(name + '_imtext'); await satz(z.beweis[0]); await sleep(800); }
        await shot(name + '_beweis');
      }
      for (const id of z.richtig) await klick(`[data-o="${id}"]`);
      if (z.mehrere) await klick('[data-a="pruefen"]');
    }
  } else if (z.art === 'blick') {
    const a = z.ausschnitt ?? { x: 0, y: 0, w: 100, h: 100 };
    let r = await (await p.$('.tatort')).boundingBox();
    await p.mouse.click(r.x + r.width * 0.2, r.y + r.height * 0.2); await sleep(300); await shot(name + '_daneben');
    r = await (await p.$('.tatort')).boundingBox();
    await p.mouse.click(r.x + ((z.zone.x - a.x) / a.w) * r.width, r.y + ((z.zone.y - a.y) / a.h) * r.height);
  } else if (z.art === 'zwei') {
    if (await p.$(`.zi [data-n="${z.suche.id}"]`)) await klick(`.zi [data-n="${z.suche.id}"]`);
    else { await klick('[data-a="text"]'); await shot(name + '_imtext'); await satz(z.suche.id); await sleep(900); }
  } else if (z.art === 'sortieren') {
    for (const [i, c] of z.karten.entries()) { await klick(`[data-w="${i === 1 ? (c.stapel === 'sicher' ? 'verdacht' : 'sicher') : c.stapel}"]`); if (i === 1) await shot(name + '_fast'); }
  } else if (z.art === 'steckbrief') {
    for (const [i, r] of z.zeilen.entries()) await klick(`[data-z="${i}"][data-w="${r.wert}"]`);
    await klick('[data-a="pruefen"]');
  } else if (z.art === 'weg') {
    for (const id of z.reihenfolge) await klick(`[data-st="${id}"]`);
  }
  await sleep(300);
  await shot(name + '_ok');
  await messen(name + '_ok');
  await klick('#fuss [data-a="weiter"]');
}

await p.goto('http://localhost:4173/v7.html'); await sleep(900);
if (START > 1 || FS !== 20) { // Stand vorgeben: ab Szene START, Schriftgröße FS
  await p.evaluate(([s, fs]) => localStorage.setItem('lesefall.v7b', JSON.stringify({ view: 'spur', spur: s, i: 0, blatt: 0, intro: s > 1, tipp: s > 1, fs, fertig: [...Array(s - 1)].map((_, i) => i + 1), tresor: [...Array(Math.floor((s - 1) / 6))].map((_, i) => i + 1) })), [START, FS]);
  await p.reload(); await sleep(900);
}
await shot('titel');
await klick('[data-a="start"]');
const karten = async (name) => { for (let k = 1; await p.$('#fuss [data-a="w"]'); k++) { await shot(`${name}_${k}`); await messen(`${name}_${k}`); await klick('#fuss [data-a="w"]'); } };
await karten('intro');
const N = await p.evaluate(() => window.__v7.D.spuren.length);
for (let spur = START; spur <= N; spur++) {
  const steps = await p.evaluate((n) => window.__v7.steps(n), spur);
  for (const [k, st] of steps.entries()) {
    const ist = await p.evaluate(() => ({ spur: window.__v7.stand.spur, i: window.__v7.stand.i }));
    if (ist.spur !== spur || ist.i !== k) throw new Error(`Ablauf verrutscht: erwartet Szene ${spur} Schritt ${k}, ist ${JSON.stringify(ist)}`);
    if (st.t === 'lesen') await lesen(spur, st.teil);
    else if (st.t === 'zug') await zug(spur, st, k);
    else { await shot(`s${spur}_${st.t}`); await messen(`s${spur}_${st.t}`); await klick('#fuss [data-a="weiter"]'); }
  }
  if (spur % 6 === 0) {
    await shot(`k${spur / 6}_tresor`); await klick('[data-a="auf"]'); await sleep(900); await shot(`k${spur / 6}_tresor_offen`); await messen(`k${spur / 6}_tresor_offen`);
    if (spur < N) { await klick('[data-a="kap"]'); await karten(`k${spur / 6 + 1}_karte`); }
  }
}
await klick('#bNotiz'); await shot('notizbuch'); await klick('.heft [data-a="zu"]');
await klick('#bAkte'); await shot('akte_gesamt');
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v7 ${NAME} ${W}×${H}: ${N} Szenen durchgespielt, ${nr} Bilder`);
