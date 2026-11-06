/**
 * Automatischer Durchlauf von Kapitel 1 (Telefon 390×844 und Tablet 820×1180).
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e.mjs [url]   → Screenshots in 03_screens/kapitel1/
 */
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.argv[2] ?? 'http://localhost:4173/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/kapitel1');
mkdirSync(OUT, { recursive: true });
// alte Screenshots weg, damit nur der aktuelle Durchlauf im Ordner liegt
for (const f of readdirSync(OUT)) if (/^(telefon|tablet)_.*\.jpg$/.test(f)) unlinkSync(`${OUT}/${f}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error('✗ ' + msg); } else console.log('✓ ' + msg); };

async function run(name, viewport, full, fs = 0, stil2 = false) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 1.5, hasTouch: true });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  let n = 0;
  const shot = async (label) => { n++; await sleep(450); await p.screenshot({ path: `${OUT}/${name}_${String(n).padStart(2, '0')}_${label}.jpg`, type: 'jpeg', quality: 82 }); };
  const click = async (sel) => { await p.click(sel); await sleep(120); };
  const btn = (a) => click(`[data-a="${a}"]`);
  const data = () => p.evaluate(() => window.__lesefall.DATA);
  /** keine senkrechte Rolle beim Lesen (A-02), Knöpfe nicht unter den Systemleisten */
  const checkSheet = async (where) => {
    const s = await p.evaluate(() => { const sh = document.getElementById('sheet'); return { scroll: sh.classList.contains('scroll'), over: sh.scrollHeight > sh.clientHeight + 2, footBottom: document.querySelector('.app-foot').getBoundingClientRect().bottom, h: innerHeight }; });
    if (!fs) ok(!s.scroll && !s.over, `${name}: ${where} ohne Rollen`);
    const hdr = await p.evaluate(() => { const h = document.querySelector('.app-header'); return h.scrollWidth <= h.clientWidth + 1 && [...h.querySelectorAll('.hb')].every((b) => b.getBoundingClientRect().width >= 44); });
    ok(hdr, `${name}: ${where} Kopfzeile passt, Knöpfe ≥ 44 px`);
    ok(s.footBottom <= s.h + 0.5, `${name}: ${where} Fußleiste im Bild`);
  };
  /** bis zum letzten Blatt blättern; prüft dabei jedes Blatt */
  const readToEnd = async (where) => {
    for (let i = 0; i < 20; i++) {
      await checkSheet(`${where} Blatt ${i + 1}`);
      if (await p.$('[data-a="end"]')) return;
      await btn('next'); await sleep(320);
    }
  };
  /** Beweis-Modus: einmal daneben tippen, dann den richtigen Satz suchen (ab Blatt 1) */
  const findEvidence = async (ids) => {
    const wrong = await p.$(`.sent:not(${ids.map((i) => `[data-s="${i}"]`).join(',')})`);
    if (wrong) { await wrong.click(); await sleep(200); }
    for (let i = 0; i < 20; i++) {
      for (const id of ids) { const el = await p.$(`[data-s="${id}"]`); if (el) { await el.click(); await sleep(300); return; } }
      await btn('next'); await sleep(320);
    }
  };
  const brush = async () => {
    const box = await (await p.$('canvas.staub')).boundingBox();
    // in der Karte beginnen (die Nachbarkarte überlappt die Ränder ein wenig)
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down();
    for (let y = 4; y < box.height; y += 10) {
      await p.mouse.move(box.x + box.width - 6, box.y + y, { steps: 6 });
      await p.mouse.move(box.x + 6, box.y + y + 9, { steps: 6 });
    }
    await p.mouse.up(); await sleep(300);
  };
  /** neuer Ablauf (A1): Sieg im Spiel → „Spur sichern“ → Karte an der Spurenwand abpinseln → weiter */
  const afterWin = async (spur, shots) => {
    ok(!(await p.$('[data-a="pinsel"]')) && !!(await p.$('[data-a="sichern"]')), `${name}: Spur ${spur} Sieg direkt im Spiel`);
    if (shots) await shot(`spur${spur}_sieg`);
    await btn('sichern'); await sleep(500);
    ok(await p.$eval('[data-a="go"]', (e) => e.disabled), `${name}: Spur ${spur} weiter erst nach dem Pinseln`);
    if (shots && spur === 1) await shot('spur1_staub');
    await brush();
    ok(await p.$eval('[data-a="go"]', (e) => !e.disabled), `${name}: Spur ${spur} Buchstabe abgepinselt`);
    if (shots) await shot(`spur${spur}_spurenwand`);
    await btn('go'); await sleep(400);
  };

  await p.goto(URL); await sleep(600);
  if (fs || stil2) { await p.evaluate(([f, s]) => localStorage.setItem('lesefall.v1', JSON.stringify({ ...(f ? { fs: f } : {}), stil2: s })), [fs, stil2]); await p.reload(); await sleep(800); }
  await shot('cover');
  await btn('los'); await sleep(300);
  await shot('vorgeschichte');
  await readToEnd('Vorgeschichte');
  await btn('end'); await sleep(400);

  const D = await data();
  for (let spur = 1; spur <= 6; spur++) {
    const sp = D.spuren[spur - 1].spiel;
    await shot(`spur${spur}_lesen`);
    await readToEnd(`Spur ${spur}`);
    await btn('end'); await sleep(300);
    if (full || spur === 1) await shot(`spur${spur}_spiel`);
    const g = await p.evaluate(() => ({ w: document.documentElement.scrollWidth <= innerWidth + 1, eng: [...document.querySelectorAll('.engine *')].filter((e) => !e.matches('.feld > img.bg')).every((e) => e.getBoundingClientRect().right <= innerWidth + 2), foot: document.querySelector('.app-foot').getBoundingClientRect().bottom <= innerHeight + 0.5 }));
    ok(g.w && g.eng && g.foot, `${name}: Spiel ${spur} passt in die Breite, Knöpfe im Bild`);
    if (spur === 1 && full) {
      // Android-Zurück im Spiel → Geschichte, dann wieder zum Spiel
      await p.evaluate(() => window.__lesefall.zurueck()); await sleep(300);
      ok(!!(await p.$('[data-b]')), `${name}: Zurück im Spiel führt zur Geschichte`);
      await btn('end'); await sleep(300);
    }
    const st = sp.schritte;
    if (spur === 1) {
      // absichtlich falsch → Zeig den Beweis! → richtiger Satz → zweiter Versuch
      await click('[data-drag="mond"]'); await click('[data-zone="rechts"]');
      await btn('pruefen'); await sleep(250);
      ok(!!(await p.$('[data-a="beweis"]')), `${name}: nach Fehler erscheint „Zeig den Beweis!“`);
      if (full) await shot('spur1_falsch');
      await btn('beweis'); await sleep(350);
      ok(await p.$eval('.zweig', () => false).catch(() => true), `${name}: Beweis-Modus ohne Zweig`);
      if (full) await shot('spur1_beweis_suchen');
      if (full) {
        await p.evaluate(() => window.__lesefall.zurueck()); await sleep(300);
        ok(!!(await p.$('[data-a="pruefen"],[data-a="beweis"]')) && !(await p.$('[data-b]')), `${name}: Zurück in der Beweissuche führt zum Spiel`);
        await btn('beweis'); await sleep(350);
      }
      await findEvidence(st[0].beweis);
      ok((await p.$$('.sent.found')).length === 2, `${name}: beide Beweissätze (Wolke + links daneben) markiert`);
      if (full) await shot('spur1_beweis_gefunden');
      await btn('evback'); await sleep(300);
      if (full) await shot('spur1_zweiter_versuch');
      await click('[data-drag="mond"]'); await click('[data-zone="links"]');
      if (full) await shot('spur1_gelegt');
      await btn('pruefen'); await sleep(300);
      ok(await p.$eval('.gain', (e) => e.textContent.includes('+2')), `${name}: Fund mit Beweis = 2 Perlen`);
    }
    if (spur === 2) {
      // Schritt 1: Vorhang + Wolke ans Theater, Mond → „Nicht mehr da“, Puppen bleiben liegen
      for (const [it, z] of [['vorhang', 'ziel'], ['wolke', 'ziel'], ['mond', 'weg']]) { await click(`[data-drag="${it}"]`); await click(`[data-zone="${z}"]`); }
      if (full) await shot('spur2_gelegt');
      await btn('pruefen'); await sleep(250);
      ok((await p.$eval('.fb', (e) => e.textContent)).includes('Vorhang und Wolke sind noch da'), `${name}: Zwischenstand nach Schritt 1 ohne „Spur entdeckt“`);
      if (full) await shot('spur2_schritt_fertig');
      await btn('weiter'); await sleep(250);
      if (full) await shot('spur2_schritt2');
      // Schritt 2: zweimal falsch → Im Text nachsehen → nach 2 Fehltipps richtiges Blatt ohne Markierung → Tipp
      await click('[data-drag="raupe"]'); await click('[data-zone="tisch"]'); await btn('pruefen'); await sleep(200);
      ok((await p.$eval('[data-a="beweis"]', (e) => e.textContent)).includes('Im Text nachsehen'), `${name}: Knopf „Im Text nachsehen“`);
      await btn('beweis'); await sleep(300);
      const z = st[1].beweis;
      for (let k = 0; k < 2; k++) { const w = await p.$(`.sent:not(${z.map((i) => `[data-s="${i}"]`).join(',')})`); await w.click(); await sleep(250); }
      ok(!!(await p.$(`[data-s="${z[0]}"]`)) && !(await p.$('.sent.found')), `${name}: nach 2 Fehltipps das richtige Blatt, nichts markiert`);
      if (full) await shot('spur2_richtiges_blatt');
      await findEvidence(z);
      await btn('evback'); await sleep(250);
      await click('[data-drag="raupe"]'); await click('[data-zone="topf"]'); await btn('pruefen'); await sleep(250);
      ok(!!(await p.$('.fb.help')), `${name}: nach 2. Fehler Tipp-Zeile`);
      if (full) await shot('spur2_tipp');
      await click('[data-drag="raupe"]'); await click('[data-zone="blatt"]'); await btn('pruefen'); await sleep(300);
      ok(await p.$eval('.gain', (e) => e.textContent.includes('+2')), `${name}: auch mit Hilfe +2 Perlen (A-05)`);
    }
    if (spur === 3) {
      for (const [k, pl] of Object.entries(st[0].loesung)) { await click(`[data-kid="${k}"]`); await click(`[data-place="${pl}"]`); }
      if (full) await shot('spur3_faeden');
      await btn('pruefen'); await sleep(300);
    }
    if (spur === 4) {
      await click('[data-flip]'); await sleep(700);
      for (const z of st[0].zeilen) if (z.fehlt) await click(`[data-m="${z.id}"]`);
      await click('[data-s="nicht"]');
      if (full) await shot('spur4_vergleich');
      await btn('pruefen'); await sleep(300);
    }
    if (spur === 5) {
      for (const id of st[0].loesung) await click(`.rcard[data-drag="${id}"]`);
      if (full) await shot('spur5_reihe');
      await btn('pruefen'); await sleep(300);
    }
    if (spur === 6) {
      for (const [item, zone] of Object.entries(st[0].loesung)) { await click(`[data-drag="${item}"]`); await click(`[data-zone="${zone}"]`); }
      if (full) await shot('spur6_tisch');
      await btn('pruefen'); await sleep(300);
    }
    ok(!!(await p.$('.win-top')), `${name}: Spur ${spur} gelöst`);
    await afterWin(spur, full || spur === 1);
  }
  // Mondtresor: Wort öffnet die Tür selbst, innen eine Frage
  await sleep(2400);
  ok(!!(await p.$('.tresor.open')) && !(await p.$('.tile')), `${name}: Mondtresor öffnet sich von selbst`);
  await shot('mondtresor');
  await click('[data-io="versteckt"]'); await sleep(200);
  ok(!!(await p.$('.fazit-liste')) && !(await p.$('[data-a="kap2"]')), `${name}: falsche Aussage: Hinweis auf die Spurenwand, kein Ende`);
  if (full) await shot('mondtresor_falsch');
  await click('[data-io="ja"]'); await sleep(300);
  await shot('mondtresor_offen');
  ok(!!(await p.$('[data-a="kap2"]')) && !!(await p.$('[data-a="fertig"]')), `${name}: Ende: Kapitel 2 oder Für heute fertig`);
  await btn('kap2'); await sleep(400);
  await shot('kapitel2_bald');
  const st = await p.evaluate(() => window.__lesefall.stand);
  ok(Object.keys(st.geloest).length === 6 && st.buchstaben.length === 6, `${name}: alle 6 Spuren und Buchstaben gespeichert`);
  ok(Object.values(st.geloest).reduce((a, b) => a + b, 0) === 12, `${name}: Perlen 6 × 2 = 12`);
  // Wand + Wiederholung ohne neue Perlen
  await click('#home'); await sleep(400);
  await shot('spurenwand_voll');
  await click('[data-fund="3"]'); await sleep(200);
  ok(!!(await p.$('.pop.fazit .beleg')), `${name}: Spur antippen zeigt Fazit und Beweissatz`);
  if (full) await shot('fazit');
  await click('[data-m="spiel"]'); await sleep(300);
  for (const [k, pl] of Object.entries(D.spuren[2].spiel.schritte[0].loesung)) { await click(`[data-kid="${k}"]`); await click(`[data-place="${pl}"]`); }
  await btn('pruefen'); await sleep(300);
  ok(!(await p.$('.gain')), `${name}: Wiederholung gibt keine Perlen`);
  const nach = await p.evaluate(() => JSON.stringify({ g: window.__lesefall.stand.geloest, b: window.__lesefall.stand.buchstaben, t: window.__lesefall.stand.tresorOffen }));
  ok(nach === JSON.stringify({ g: st.geloest, b: st.buchstaben, t: true }), `${name}: Wiederholung ändert den Fortschritt nicht`);
  // Silben + große Schrift, Lesestelle bleibt
  await click('#home'); await sleep(200);
  await click('[data-fund="2"]'); await click('[data-m="lesen"]'); await sleep(300);
  await btn('next'); await sleep(300);
  const silbenAn = () => p.evaluate(() => document.documentElement.classList.contains('silben'));
  ok(await silbenAn(), `${name}: Silben farbig ist voreingestellt`);
  await click('#sil'); ok(!(await silbenAn()), `${name}: Silben-Schalter in der Kopfzeile schaltet aus`);
  await shot('silben_aus');
  await click('#sil'); ok(await silbenAn(), `${name}: und wieder an`);
  await click('#aa');
  ok(await p.$eval('[data-sw="silben"]', (e) => e.getAttribute('aria-checked')) === 'true', `${name}: Schalter in „Aa“ synchron`);
  await click('[data-fs="26"]');
  await shot('einstellungen');
  await click('[data-reset]');
  ok(!!(await p.$('#elternzahl')) && !(await p.$('[data-loeschen]')), `${name}: Elternschloss vor dem Löschen`);
  await p.fill('#elternzahl', '1'); await click('[data-antwort]');
  ok(!(await p.$('[data-loeschen]')), `${name}: falsche Zahl öffnet das Schloss nicht`);
  const [ea, eb] = await p.$eval('label[for="elternzahl"]', (e) => e.textContent.match(/(\d+) · (\d+)/).slice(1).map(Number));
  await p.fill('#elternzahl', String(ea * eb)); await click('[data-antwort]');
  ok(!!(await p.$('[data-loeschen]')), `${name}: richtige Zahl → Bestätigung`);
  if (full) await shot('elternschloss');
  await click('[data-abbrechen]');
  await click('[data-close]'); await sleep(300);
  await click('#aa'); await p.evaluate(() => window.__lesefall.zurueck()); await sleep(200);
  ok(!(await p.$('.pop-bg')), `${name}: Zurück schließt die Einstellungen`);
  await shot('silben_gross');
  ok(await silbenAn(), `${name}: Silben farbig sichtbar`);
  // Garderobe (D-08): 12 Perlen; kaufen, anziehen, ausziehen, zu teuer, nach Neustart gespeichert
  if (full || fs) {
    await click('#pearls'); await sleep(300);
    ok(!!(await p.$('.garderobe')), `${name}: Perlen antippen öffnet die Garderobe`);
    if (full) await shot('garderobe');
    await click('[data-g="hut"]'); await sleep(200);
    ok((await p.$eval('.pop.kauf', (e) => e.textContent)).includes('6'), `${name}: Kaufen fragt „Für 6 Perlen kaufen?“`);
    if (full) await shot('garderobe_kaufen');
    await click('[data-k="ja"]'); await sleep(250);
    ok(await p.$eval('#pc', (e) => e.textContent) === '6', `${name}: nach dem Kauf 6 Perlen übrig`);
    ok(await p.$eval('[data-g="hut"]', (e) => e.getAttribute('aria-pressed')) === 'true', `${name}: Hut wird getragen`);
    ok(await p.$eval('[data-g="tasche"]', (e) => e.disabled && /Noch 1 Perle(?!n)/.test(e.textContent)), `${name}: zu teuer: „Noch 1 Perle“, nicht kaufbar`);
    await click('[data-g="ohne"]'); await sleep(150);
    ok(await p.$eval('[data-g="hut"]', (e) => e.getAttribute('aria-pressed')) === 'false', `${name}: ausziehen`);
    await click('[data-g="hut"]'); await sleep(150);
    ok(await p.$eval('[data-g="hut"]', (e) => e.getAttribute('aria-pressed')) === 'true' && !(await p.$('.pop.kauf')), `${name}: Gekauftes wieder anziehen ohne zu bezahlen`);
    if (full) await shot('garderobe_hut');
    await btn('gardZu'); await sleep(300);
    ok(!!(await p.$('#content [data-b]')), `${name}: Fertig führt zurück zum Lesen`);
  }
  // Neu laden mitten in der Spur: gleiche Lesestelle, Fortschritt bleibt
  const anker = await p.$eval('#content [data-b]', (e) => e.dataset.b);
  await p.reload(); await sleep(900);
  await btn('los'); await sleep(400);
  ok(!!(await p.$(`#content [data-b="${anker}"]`)), `${name}: nach Neustart wieder auf demselben Blatt (${anker})`);
  const pc = await p.$eval('#pc', (e) => e.textContent);
  ok(pc === (full || fs ? '6' : '12'), `${name}: nach Neustart ${full || fs ? '6 übrige' : '12'} Perlen`);
  if (full || fs) ok(await p.evaluate(() => JSON.stringify(window.__lesefall.stand.garderobe)) === JSON.stringify({ gekauft: ['hut'], traegt: 'hut' }), `${name}: Garderobe nach Neustart gespeichert`);
  ok(errors.length === 0, `${name}: keine Fehler in der Konsole ${errors.join(' | ')}`);
  await b.close();
}

await run('telefon', { width: 390, height: 844 }, true);
await run('tablet', { width: 820, height: 1180 }, false);
await run('telefon_gross', { width: 390, height: 844 }, false, 26);
await run('telefon_stil2', { width: 390, height: 844 }, false, 0, true);
console.log(fails ? `\n✗ ${fails} Prüfungen fehlgeschlagen` : '\n✓ Alles gut');
process.exit(fails ? 1 : 0);
