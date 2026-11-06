/**
 * Automatischer Durchlauf von Kapitel 1 (Telefon 390×844 und Tablet 820×1180).
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e.mjs [url]   → Screenshots in 03_screens/kapitel1/
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.argv[2] ?? 'http://localhost:4173/';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/kapitel1');
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error('✗ ' + msg); } else console.log('✓ ' + msg); };

async function run(name, viewport, full) {
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
    ok(!s.scroll && !s.over, `${name}: ${where} ohne Rollen`);
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
    const box = await (await p.$('#dust')).boundingBox();
    await p.mouse.move(box.x + 5, box.y + 5); await p.mouse.down();
    for (let y = 8; y < box.height; y += 18) {
      await p.mouse.move(box.x + box.width - 5, box.y + y, { steps: 6 });
      await p.mouse.move(box.x + 5, box.y + y + 9, { steps: 6 });
    }
    await p.mouse.up(); await sleep(300);
  };
  const afterWin = async (spur, shots) => {
    if (shots) await shot(`spur${spur}_sieg`);
    await btn('pinsel'); await sleep(300);
    if (shots && spur === 1) await shot('spur1_pinsel');
    await brush();
    ok(await p.$eval('[data-a="pinselWeiter"]', (e) => !e.disabled), `${name}: Spur ${spur} Buchstabe abgepinselt`);
    if (shots && spur === 1) await shot('spur1_buchstabe');
    await btn('pinselWeiter'); await sleep(300);
    if (shots) await shot(`spur${spur}_spurenwand`);
    await btn('go'); await sleep(400);
  };

  await p.goto(URL); await sleep(900);
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
    const st = sp.schritte;
    if (spur === 1) {
      // absichtlich falsch → Zeig den Beweis! → richtiger Satz → zweiter Versuch
      await click('[data-drag="mond"]'); await click('[data-zone="rechts"]');
      await btn('pruefen'); await sleep(250);
      ok(!!(await p.$('[data-a="beweis"]')), `${name}: nach Fehler erscheint „Zeig den Beweis!“`);
      if (full) await shot('spur1_falsch');
      await btn('beweis'); await sleep(350);
      ok(await p.$eval('.dots', () => false).catch(() => true), `${name}: Beweis-Modus ohne Blattpunkte`);
      if (full) await shot('spur1_beweis_suchen');
      await findEvidence(st[0].beweis);
      ok(!!(await p.$('.sent.found')), `${name}: Beweis gefunden`);
      if (full) await shot('spur1_beweis_gefunden');
      await btn('evback'); await sleep(300);
      if (full) await shot('spur1_zweiter_versuch');
      await click('[data-drag="mond"]'); await click('[data-zone="links"]');
      if (full) await shot('spur1_gelegt');
      await btn('pruefen'); await sleep(300);
      ok(await p.$eval('.gain', (e) => e.textContent.includes('+2')), `${name}: Fund mit Beweis = 2 Perlen`);
    }
    if (spur === 2) {
      await click('[data-drag="vorhang"]'); await click('[data-drag="wolke"]');
      if (full) await shot('spur2_gelegt');
      await btn('pruefen'); await sleep(250);
      if (full) await shot('spur2_schritt_fertig');
      await btn('weiter'); await sleep(250);
      // zweiter Teil: absichtlich zweimal falsch → Weitere Hilfe, dann richtig = 1 Perle
      await click('[data-o="ben"]'); await btn('pruefen');
      await btn('beweis'); await sleep(300);
      await findEvidence(st[1].beweis);
      await btn('evback'); await sleep(250);
      await click('[data-o="schrank"]'); await btn('pruefen'); await sleep(250);
      ok(!!(await p.$('.fb.help')), `${name}: nach 2. Fehler „Weitere Hilfe“`);
      if (full) await shot('spur2_weitere_hilfe');
      await click('[data-o="blatt"]'); await btn('pruefen'); await sleep(300);
      ok(await p.$eval('.gain', (e) => e.textContent.includes('+1')), `${name}: mit Hilfe = 1 Perle`);
    }
    if (spur === 3) {
      await click('[data-kid="mila"]'); await click('[data-place="vorhang"]');
      await click('[data-kid="ben"]'); await click('[data-place="waschbecken"]');
      if (full) await shot('spur3_faeden');
      await btn('pruefen'); await sleep(300);
    }
    if (spur === 4) {
      for (const m of ['gelb', 'rund', 'faden', 'stern']) await click(`[data-m="${m}"]`);
      if (full) await shot('spur4_steckbrief');
      await btn('pruefen'); await btn('weiter'); await sleep(250);
      await click('[data-flip]'); await sleep(700);
      for (const z of st[1].zeilen) await click(`[data-r="${z.id}"][data-v="${z.loesung}"]`);
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
  // Mondtresor
  await shot('mondtresor');
  for (const c of 'KLEBER') {
    const tiles = await p.$$('.tile:not([disabled])');
    for (const t of tiles) if ((await t.textContent()) === c) { await t.click(); await sleep(120); break; }
  }
  await sleep(1800);
  ok(!!(await p.$('.tresor.open')), `${name}: Mondtresor offen`);
  await shot('mondtresor_offen');
  const st = await p.evaluate(() => window.__lesefall.stand);
  ok(Object.keys(st.geloest).length === 6 && st.buchstaben.length === 6, `${name}: alle 6 Spuren und Buchstaben gespeichert`);
  ok(Object.values(st.geloest).reduce((a, b) => a + b, 0) === 11, `${name}: Perlen 2+1+2+2+2+2 = 11`);
  // Wand + Wiederholung ohne neue Perlen
  await btn('wand'); await sleep(400);
  await shot('spurenwand_voll');
  await click('[data-fund="3"]'); await click('[data-m="spiel"]'); await sleep(300);
  await click('[data-kid="mila"]'); await click('[data-place="vorhang"]'); await click('[data-kid="ben"]'); await click('[data-place="waschbecken"]');
  await btn('pruefen'); await sleep(300);
  ok(!(await p.$('.gain')), `${name}: Wiederholung gibt keine Perlen`);
  // Silben + große Schrift, Lesestelle bleibt
  await btn('wand'); await sleep(200);
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
  ok(!!(await p.$('[data-antwort]')) && !(await p.$('[data-loeschen]')), `${name}: Elternschloss vor dem Löschen`);
  if (full) await shot('elternschloss');
  await click('[data-abbrechen]');
  await click('[data-close]'); await sleep(300);
  await shot('silben_gross');
  ok(await silbenAn(), `${name}: Silben farbig sichtbar`);
  // Neu laden: Fortschritt bleibt
  await p.reload(); await sleep(900);
  ok(await p.$eval('#pc', (e) => e.textContent) === '11', `${name}: nach Neustart 11 Perlen`);
  ok(errors.length === 0, `${name}: keine Fehler in der Konsole ${errors.join(' | ')}`);
  await b.close();
}

await run('telefon', { width: 390, height: 844 }, true);
await run('tablet', { width: 820, height: 1180 }, false);
console.log(fails ? `\n✗ ${fails} Prüfungen fehlgeschlagen` : '\n✓ Alles gut');
process.exit(fails ? 1 : 0);
