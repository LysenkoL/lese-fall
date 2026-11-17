/**
 * Layout-Prüfung: jeder Bildschirm von Kapitel 1, beide Stile, drei Telefongrößen, normale und große Schrift.
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/layout-audit.mjs [nur=alt|neu]
 *   → 03_screens/audit_layout/<stil>_<breite>x<höhe>[_gross].jpg (Kontaktbögen) und befunde.json (Messwerte)
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readdirSync, unlinkSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = 'http://localhost:4173/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/audit_layout');
mkdirSync(OUT, { recursive: true });
// alte Bilder des gewählten Stils löschen; Messwerte werden ergänzt (beide Stile laufen getrennt)
for (const f of readdirSync(OUT)) if (/\.(jpg|png)$/.test(f) && (!process.argv[2] || f.startsWith(process.argv[2]))) unlinkSync(`${OUT}/${f}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GROESSEN = [[360, 740], [390, 844], [412, 915]];
const NUR = process.argv[2];

/** Messwerte eines Bildschirms: Überlauf, Leerraum, verdeckte Knöpfe, doppeltes Rollen, abgeschnittener Text */
const MESSEN = () => {
  const W = innerWidth, H = innerHeight;
  const sheet = document.getElementById('sheet'), content = document.getElementById('content');
  const sr = sheet.getBoundingClientRect();
  const cs = getComputedStyle(sheet);
  const inner = sheet.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  // Höhe des sichtbaren Inhalts (ohne absolut gesetzte Deko)
  let bottom = 0;
  for (const el of content.children) { const p = getComputedStyle(el).position; if (p === 'absolute' || p === 'fixed') continue; bottom = Math.max(bottom, el.getBoundingClientRect().bottom); }
  const used = bottom - (sr.top + parseFloat(cs.paddingTop));
  const zuBreit = [...document.querySelectorAll('#app *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > W + 1 || r.left < -1) && !e.closest('.feld') && !e.closest('.konfetti') && !e.matches('.feld > img.bg'); }).length;
  const knoepfe = [...document.querySelectorAll('.app-foot button, .app-header button')].filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > H + 1 || r.top < -1 || r.right > W + 1; }).length;
  const roller = [...document.querySelectorAll('#app *')].filter((e) => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 2; }).length;
  const abgeschnitten = [...document.querySelectorAll('#content p, #content b, #content span.l, #content .opt, #content .fk span')].filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow === 'hidden').length;
  const lesen = sheet.dataset.art === 'lesen';
  return { art: sheet.dataset.art, fuellung: lesen ? Math.round((used / inner) * 100) : null, rollt: sheet.scrollHeight > sheet.clientHeight + 2, zuBreit, knoepfe, roller, abgeschnitten };
};

async function lauf(stil2, [w, h], gross) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const bilder = [], befunde = [];
  const shot = async (name) => { await sleep(700); bilder.push({ name, buf: await p.screenshot({ type: 'jpeg', quality: 70 }) }); befunde.push({ name, ...(await p.evaluate(MESSEN)) }); };
  const btn = async (a) => { await p.click(`[data-a="${a}"]`); await sleep(250); };
  const setze = async (st) => { await p.goto(URL); await sleep(300); await p.evaluate((s) => localStorage.setItem('lesefall.v1', JSON.stringify(s)), { stil2, fs: gross ? 26 : 20, vorgeschichte: true, ...st }); await p.reload(); await sleep(600); };
  const D = await (async () => { await p.goto(URL); await sleep(400); return p.evaluate(() => window.__lesefall.DATA); })();
  const alle = (n) => Object.fromEntries([...Array(n)].map((_, i) => [i + 1, 2]));

  await setze({}); await shot('00_titel');
  // Lesen: alle Blätter jeder Spur (und Vorgeschichte)
  for (let t = 0; t <= 6; t++) {
    await setze({ geloest: alle(Math.max(0, t - 1)), buchstaben: [...Array(Math.max(0, t - 1))].map((_, i) => i + 1), ort: { view: 'read', teil: t, anker: 'head' } });
    await btn('los');
    for (let k = 1; k < 20; k++) {
      await shot(`${t === 0 ? 'vg' : 's' + t}_blatt${k}`);
      if (await p.$('[data-a="end"]')) break;
      await btn('next'); await sleep(200);
    }
    if (t === 0) continue;
    // Spiel: Anfang, falsch, Beweissuche, gelöst
    await btn('end'); await shot(`s${t}_spiel`);
    const sp = D.spuren[t - 1].spiel;
    for (let k = 0; k < sp.schritte.length; k++) {
      const st = sp.schritte[k];
      await loesen(p, st);
      if (k === 0 && t === 1) { // einmal falsch für Fehler-Bildschirme
        await p.click('[data-drag="mond"]'); await p.click('[data-zone="rechts"]'); await btn('pruefen'); await shot('s1_falsch');
        await btn('beweis'); await shot('s1_beweis');
        for (let i = 0; i < 10 && !(await p.$(`[data-s="${st.beweis[0]}"]`)); i++) await btn('next');
        await p.click(`[data-s="${st.beweis[0]}"]`); await sleep(300); await shot('s1_beweis_gefunden');
        await btn('evback'); await shot('s1_nochmal');
        await loesen(p, st);
      }
      await btn('pruefen'); await sleep(500);
      if (k < sp.schritte.length - 1) { await shot(`s${t}_zwischen`); await btn('weiter'); await shot(`s${t}_spiel2`); }
    }
    await shot(`s${t}_sieg`);
    await btn('sichern'); await shot(`s${t}_wand_staub`);
    await p.evaluate(() => { window.__lesefall.stand.buchstaben.push(+window.__lesefall.stand.ort.teil || 0); });
  }
  // Spurenwand voll, Fazit, Tresor, Kapitel 2, Garderobe, Einstellungen
  await setze({ geloest: alle(6), buchstaben: [1, 2, 3, 4, 5, 6], ort: { view: 'wand', teil: 0, anker: '' } });
  await btn('los'); await shot('wand_voll');
  await p.click('[data-fund="2"]'); await shot('wand_fazit'); await p.evaluate(() => window.__lesefall.zurueck());
  await btn('go'); await sleep(2600); await shot('tresor');
  await p.click('[data-io="versteckt"]'); await shot('tresor_falsch');
  await p.click('[data-io="ja"]'); await shot('tresor_offen');
  await btn('kap2'); await shot('kapitel2');
  await p.click('#pearls'); await shot('garderobe');
  await p.click('[data-g="hut"]'); await shot('garderobe_kaufen'); await p.click('[data-k="ja"]'); await shot('garderobe_hut');
  await btn('gardZu'); await p.click('#aa'); await shot('einstellungen');
  await b.close();
  return { bilder, befunde };
}

/** löst einen Spielschritt nach den Daten (antippen → Platz antippen) */
async function loesen(p, st) {
  const c = async (s) => { await p.click(s); await sleep(80); };
  if (st.motor === 'zielfeld' || st.motor === 'slots') {
    for (const [id, z] of Object.entries(st.loesung)) if (z) { await c(`[data-drag="${id}"]`); await c(`[data-zone="${z}"]`); }
  } else if (st.motor === 'faden') {
    for (const [k, pl] of Object.entries(st.loesung)) { await c(`[data-kid="${k}"]`); await c(`[data-place="${pl}"]`); }
  } else if (st.motor === 'reihe') {
    for (const id of st.loesung) await c(`.rcard[data-drag="${id}"]`);
  } else if (st.motor === 'urteil') {
    if (st.art === 'vergleich') { await c('[data-flip]'); for (const z of st.zeilen) if (z.fehlt) await c(`[data-m="${z.id}"]`); await c(`[data-s="${st.loesung}"]`); }
    else if (st.art === 'einzeln') await c(`[data-o="${st.loesung}"]`);
  }
}

const BF = `${OUT}/befunde.json`;
const alleBefunde = existsSync(BF) && process.argv[2] ? JSON.parse(readFileSync(BF, 'utf8')) : {};
const k = await chromium.launch();
const kp = await k.newPage({ viewport: { width: 1600, height: 1000 } });
for (const stil2 of [false, true]) {
  if (NUR && NUR !== (stil2 ? 'neu' : 'alt')) continue;
  for (const g of GROESSEN) for (const gross of [false, true]) {
    if (gross && g[0] !== 360) continue; // große Schrift auf dem kleinsten Telefon
    const name = `${stil2 ? 'neu' : 'alt'}_${g[0]}x${g[1]}${gross ? '_gross' : ''}`;
    const { bilder, befunde } = await lauf(stil2, g, gross);
    alleBefunde[name] = befunde;
    // Kontaktbogen: Raster mit Nummern
    const html = `<body style="margin:0;padding:12px;background:#E9E4D8;font:600 13px system-ui"><h2 style="margin:0 0 8px">${name}</h2><div style="display:flex;flex-wrap:wrap;gap:10px">${bilder.map((x, i) => `<figure style="margin:0;width:${Math.round(g[0] * 0.45)}px"><figcaption>${String(i + 1).padStart(2, '0')} ${x.name}</figcaption><img style="width:100%;border:1px solid #999" src="data:image/jpeg;base64,${x.buf.toString('base64')}"></figure>`).join('')}</div></body>`;
    await kp.setContent(html); await sleep(300);
    await kp.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 75, fullPage: true });
    writeFileSync(BF, JSON.stringify(alleBefunde, null, 1));
    console.log('✓', name, bilder.length, 'Bildschirme');
  }
}
await k.close();
writeFileSync(`${OUT}/befunde.json`, JSON.stringify(alleBefunde, null, 1));
