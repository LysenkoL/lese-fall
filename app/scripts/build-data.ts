/**
 * Baut 04_data/kapitel1.json aus
 *   01_text/LESE-FALL_BUCH_1_TEXT_v6.md   (Buchtext, eingefroren)
 *   04_data/kapitel1_spiele.json          (Spiele, ohne Silben)
 *   04_data/silben_kapitel1.txt           (Silben jedes Wortes, von Hand geprüft)
 *
 * Prüft: Text ohne Silbenstriche = v6 Buchstabe für Buchstabe (Absätze und Zeilen).
 * Aufruf: node scripts/build-data.ts [--neue-woerter]
 *   --neue-woerter  fehlende Wörter mit dem Algorithmus ergänzen und in silben_kapitel1.txt schreiben
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAusnahmen, silbiereBuch } from '../src/core/silben.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const P = (p: string) => resolve(ROOT, p);
const WRITE_NEW = process.argv.includes('--neue-woerter');

const md = readFileSync(P('01_text/LESE-FALL_BUCH_1_TEXT_v6.md'), 'utf8').replace(/\r\n?/g, '\n');
const spiele = JSON.parse(readFileSync(P('04_data/kapitel1_spiele.json'), 'utf8'));
const dictPath = P('04_data/silben_kapitel1.txt');
const dictText = readFileSync(dictPath, 'utf8');
const dict = parseAusnahmen(dictText);
const VORSILBE_OK = new Set<string>(); // Wörterliste deckt alles ab; Regel nur für neue Wörter
const neu = new Map<string, string>();

const WORD = /[A-Za-zÄÖÜäöüß]+/g;
function silben(word: string): string {
  const k = dict.get(word.toLowerCase());
  if (k) {
    let i = 0;
    return k.map((s) => word.slice(i, (i += s.length))).join('|');
  }
  const s = silbiereBuch(word, new Map(), VORSILBE_OK).join('|');
  neu.set(word.toLowerCase(), s.toLowerCase() === s ? s : s);
  return s;
}
const mark = (t: string) => t.replace(WORD, (w) => silben(w));
const plain = (t: string) => t.replace(/\|/g, '');
const noMd = (t: string) => t.replace(/\*\*|\*/g, '');

/** Satzgrenzen: nach . ! ? … (evtl. mit “ oder *), vor Großbuchstabe, „ oder * */
function saetze(line: string): string[] {
  const out = line.split(/(?<=[.!?…](?:“|\*\*|\*)?)\s(?=[„A-ZÄÖÜ*])/);
  if (out.join(' ') !== line) throw new Error('Satzteilung kaputt: ' + line);
  return out;
}
const isThought = (line: string) => /„[^“]*“,? (denkt|schimpft)|(denkt|schimpft) (sie|die (Lese)?[Rr]aupe)[^„]*„/.test(line);

interface Block { id: string; typ: 'p' | 'th'; s: string[] }
function blocks(prefix: string, lines: string[]): Block[] {
  return lines.map((line, i) => ({
    id: `${prefix}-p${i + 1}`,
    typ: isThought(line) ? 'th' : 'p',
    s: saetze(line).map(mark),
  }));
}

/* ---------- Text zerlegen ---------- */
const all = md.split('\n');
const idx = (re: RegExp, from = 0) => {
  const i = all.findIndex((l, k) => k >= from && re.test(l));
  if (i < 0) throw new Error('nicht gefunden: ' + re);
  return i;
};
const vStart = idx(/^## VORGESCHICHTE — /);
const vTitle = all[vStart].replace(/^## VORGESCHICHTE — /, '');
const vEnd = idx(/^> /, vStart);
const vLines = all.slice(vStart + 1, vEnd).filter((l) => l.trim() !== '');

const kStart = idx(/^## Kapitel 1 — /);
const kTitle = all[kStart].replace(/^## Kapitel 1 — /, '');
const kEnd = idx(/^## Kapitel 2 — /);
const szenen: { spur: number; titel: string; lines: string[] }[] = [];
for (let i = kStart; i < kEnd; i++) {
  const m = all[i].match(/^### Seite (\d+) \(Kapitel 1 · Spur (\d+)\) — (.+)$/);
  if (!m) continue;
  const lines: string[] = [];
  for (let j = i + 1; j < kEnd && !/^---$/.test(all[j]) && !/^###/.test(all[j]); j++) if (all[j].trim()) lines.push(all[j]);
  szenen.push({ spur: +m[2], titel: m[3], lines });
}
if (szenen.length !== 6) throw new Error('6 Spuren erwartet, gefunden: ' + szenen.length);

const vorgeschichte = { titel: mark(vTitle), blocks: blocks('v', vLines) };
const spuren = szenen.map((sz) => ({ spur: sz.spur, titel: mark(sz.titel), blocks: blocks(`s${sz.spur}`, sz.lines) }));

/* ---------- Automatische Prüfung: Text = v6 ---------- */
let fehler = 0;
function check(name: string, src: string[], bl: Block[]) {
  const back = bl.map((b) => plain(b.s.join(' ')));
  if (back.length !== src.length) { console.error(`✗ ${name}: ${back.length} statt ${src.length} Absätze`); fehler++; return; }
  back.forEach((b, i) => { if (b !== src[i]) { console.error(`✗ ${name} Absatz ${i + 1}:\n  v6:  ${src[i]}\n  app: ${b}`); fehler++; } });
}
check('Vorgeschichte', vLines, vorgeschichte.blocks);
if (plain(vorgeschichte.titel) !== vTitle) fehler++;
szenen.forEach((sz, i) => {
  check(`Spur ${sz.spur}`, sz.lines, spuren[i].blocks);
  if (plain(spuren[i].titel) !== sz.titel) { console.error('✗ Titel', sz.titel); fehler++; }
});
// Silben: jede Silbe hat einen Vokal (sonst Tippfehler in der Liste)
for (const [w, parts] of dict) for (const p of parts) if (!/[aeiouyäöü]/i.test(p) && parts.length > 1) { console.error(`✗ Silbe ohne Vokal: ${parts.join('|')}`); fehler++; }

/* ---------- Spiele: Kindertexte mit Silben, Beweise auf Satz-IDs ---------- */
const TEXT_KEYS = new Set(['intro', 'frage', 'label', 'ask', 'near', 'help', 'explain', 'sieg', 'text', 'ziel', 'ablage', 'ja', 'nein', 'stempelFrage', 'offen', 'haken', 'spiel', 'fazit']);
function markTree(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT_KEYS.has(key) ? mark(v) : v;
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' && (key === 'falsch') ? mark(x) : markTree(x, key)));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, markTree(x, k)]));
  return v;
}
function beweisIds(spur: number, list: string[], wo: string): string[] {
  const sp = spuren.find((s) => s.spur === spur)!;
  const ids: string[] = [];
  for (const b of list) {
    const hits: string[] = [];
    sp.blocks.forEach((bl) => bl.s.forEach((s, i) => { if (noMd(plain(s)).includes(b)) hits.push(`${bl.id}-${i}`); }));
    if (!hits.length) { console.error(`✗ Beweis nicht im Text von Spur ${spur} (${wo}): ${b}`); fehler++; }
    ids.push(...hits);
  }
  return ids;
}
function zitat(spur: number, ids: string[]): string[] {
  const sp = spuren.find((s) => s.spur === spur)!;
  return ids.map((id) => {
    const [, bid, n] = id.match(/^(.*)-(\d+)$/)!;
    return sp.blocks.find((b) => b.id === bid)!.s[+n];
  });
}

const spielDaten = spiele.spuren.map((sp: any) => {
  const schritte = sp.schritte.map((st: any, k: number) => {
    const out = markTree(st);
    out.motor = st.motor ?? sp.motor;
    if (st.beweis) out.beweis = beweisIds(sp.spur, st.beweis, `Schritt ${k + 1}`);
    if (st.proDing) for (const [id, pd] of Object.entries<any>(st.proDing)) out.proDing[id].beweis = beweisIds(sp.spur, pd.beweis, id);
    return out;
  });
  const fund = markTree(sp.fund);
  fund.beweis = beweisIds(sp.spur, sp.fund.beweis, 'Fund');
  return { ...markTree(sp), schritte, fund };
});
const gw = spiele.geheimwort;
const geheimwort = { ...markTree(gw), wort: gw.wort, beweis: beweisIds(gw.beweisSpur, gw.beweis, 'Mondtresor') };
geheimwort.zitat = zitat(gw.beweisSpur, geheimwort.beweis);
const ui = markTree(spiele.ui, 'ui');
for (const k of Object.keys(spiele.ui)) ui[k] = Array.isArray(spiele.ui[k]) ? spiele.ui[k].map(mark) : mark(spiele.ui[k]);

const out = {
  _info: 'Generiert von app/scripts/build-data.ts – nicht von Hand ändern. Silben mit |, Text ohne | = v6.',
  fall: { titel: mark('Der verschwundene Mond'), nr: 1 },
  kapitel: { nr: 1, titel: mark(kTitle) },
  vorgeschichte,
  spuren: spuren.map((s, i) => ({ ...s, spiel: spielDaten[i] })),
  geheimwort,
  ui,
};

if (neu.size) {
  console.warn(`! ${neu.size} Wörter nicht in silben_kapitel1.txt (Algorithmus benutzt): ${[...neu.values()].join(' ')}`);
  if (WRITE_NEW) {
    writeFileSync(dictPath, dictText.trimEnd() + '\n# neu (ungeprüft)\n' + [...neu.values()].join('\n') + '\n');
    console.warn('  → angehängt an silben_kapitel1.txt');
  } else fehler++;
}
if (fehler) { console.error(`✗ ${fehler} Fehler – kapitel1.json nicht geschrieben`); process.exit(1); }
writeFileSync(P('04_data/kapitel1.json'), JSON.stringify(out, null, 1) + '\n');
const words = [vorgeschichte, ...spuren].flatMap((s) => s.blocks.flatMap((b) => plain(b.s.join(" ")).match(WORD) ?? []));
console.log(`✓ Text = v6 (Vorgeschichte + ${spuren.length} Spuren, ${words.length} Wörter), kapitel1.json geschrieben`);
