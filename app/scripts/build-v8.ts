/**
 * Baut 04_data/buch1_v8.json (Vorschau „v8“, Kapitel 1) aus
 *   01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL1.md   (Text mit <!-- Blatt -->)
 *   04_data/kapitel1_v8_raetsel.json               (Rätsel, Brett, Fallkarte, Oberflächentexte)
 *   04_data/silben_kapitel1.txt                    (Silben)
 * Aufruf: node scripts/build-v8.ts [--neue-woerter]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAusnahmen, silbiereBuch } from '../src/core/silben.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const P = (p: string) => resolve(ROOT, p);
const WRITE_NEW = process.argv.includes('--neue-woerter');
const dictPath = P('04_data/silben_kapitel1.txt');
const dictText = readFileSync(dictPath, 'utf8');
const dict = parseAusnahmen(dictText);
const neu = new Map<string, string>();
let fehler = 0;

const WORD = /[A-Za-zÄÖÜäöüß]+/g;
function silben(word: string): string {
  const k = dict.get(word.toLowerCase());
  if (k) { let i = 0; return k.map((s) => word.slice(i, (i += s.length))).join('|'); }
  const s = silbiereBuch(word, new Map(), new Set<string>()).join('|');
  neu.set(word.toLowerCase(), s.toLowerCase());
  return s;
}
const mark = (t: string) => t.replace(WORD, (w) => silben(w));
const plain = (t: string) => t.replace(/\|/g, '').replace(/\*\*|\*/g, '');

function saetze(line: string): string[] {
  const out = line.split(/(?<=[.!?…](?:“|\*\*|\*)?)\s(?=[„A-ZÄÖÜ*])/);
  if (out.join(' ') !== line) throw new Error('Satzteilung kaputt: ' + line);
  return out;
}
const isThought = (line: string) => /„[^“]*“,? (denkt|schimpft)|(denkt|schimpft) (sie|die (Lese-)?[Rr]aupe)[^„]*„/.test(line);

/* ---------- Text ---------- */
interface Block { id: string; typ: 'p' | 'th'; s: string[]; umbruch?: boolean }
const md = readFileSync(P('01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL1.md'), 'utf8').replace(/\r\n?/g, '\n');
const all = md.split('\n');
const kopfZeile = all.find((l) => /^## Kapitel 1 — /.test(l));
if (!kopfZeile) throw new Error('Überschrift „## Kapitel 1 — …“ fehlt');
const start = all.indexOf(kopfZeile);
const texte: { spur: number; titel: string; blocks: Block[] }[] = [];
for (let i = start; i < all.length; i++) {
  const m = all[i].match(/^### Spur (\d+) — (.+)$/);
  if (!m) continue;
  const blocks: Block[] = [];
  let n = 0, umbruch = false;
  for (let j = i + 1; j < all.length && !/^---$/.test(all[j]) && !/^###/.test(all[j]); j++) {
    const l = all[j].trim();
    if (!l) continue;
    if (l === '<!-- Blatt -->') { umbruch = true; continue; }
    const b: Block = { id: `s${m[1]}-p${++n}`, typ: isThought(l) ? 'th' : 'p', s: saetze(l).map(mark) };
    if (umbruch && blocks.length) b.umbruch = true;
    umbruch = false;
    blocks.push(b);
  }
  texte.push({ spur: +m[1], titel: m[2], blocks });
}
if (texte.length !== 6) throw new Error(`6 Spuren erwartet, gefunden: ${texte.length}`);

/* ---------- Rätsel und Oberfläche ---------- */
const rz = JSON.parse(readFileSync(P('04_data/kapitel1_v8_raetsel.json'), 'utf8'));
const TEXT = new Set(['text', 'titel', 'haken', 'frage', 'aufloesung', 'warum', 'tipp', 'erfolg', 'unklarTipp', 'vorspann', 'ausblick', 'name', 'saetze']);
function tree(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT.has(key) ? mark(v) : v;
  if (Array.isArray(v)) return v.map((x) => tree(x, key));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tree(x, k)]));
  return v;
}
const spuren = texte.map((t) => {
  const z = rz.spuren.find((s: any) => s.spur === t.spur);
  if (!z) throw new Error('Rätseldaten fehlen für Spur ' + t.spur);
  const { spur, bild, haken, karte, fragenNeu, fragenWeg, tipp, raetsel, schluessel } = z;
  return { nr: spur, kap: 1, spur, titel: mark(t.titel), bild, haken: mark(haken), blocks: t.blocks, karte: tree(karte), fragenNeu: tree(fragenNeu ?? []), fragenWeg: fragenWeg ?? [], tipp: tree(tipp ?? null), raetsel: tree(raetsel), ...(schluessel ? { schluessel } : {}) };
});
const kapitel = [{ nr: 1, titel: mark(kopfZeile.replace(/^## Kapitel 1 — /, '')), bild: rz.bild, vorspann: mark(rz.vorspann), code: rz.code, fallkarte: tree(rz.fallkarte), ausblick: mark(rz.ausblick) }];
const out = {
  _info: 'Generiert von app/scripts/build-v8.ts – nicht von Hand ändern.',
  fall: { titel: mark('Der verschwundene Mond') },
  kapitel,
  intro: tree(rz.intro),
  ui: Object.fromEntries(Object.entries(rz.ui).map(([k, v]) => [k, mark(v as string)])),
  spuren,
};

if (neu.size) {
  console.warn(`! ${neu.size} Wörter nicht in silben_kapitel1.txt: ${[...neu.values()].join(' ')}`);
  if (WRITE_NEW) { writeFileSync(dictPath, dictText.trimEnd() + '\n# neu für v8 (ungeprüft)\n' + [...neu.values()].join('\n') + '\n'); console.warn('  → angehängt'); }
  else fehler++;
}
if (fehler) { console.error(`✗ ${fehler} Fehler – buch1_v8.json nicht geschrieben`); process.exit(1); }
writeFileSync(P('04_data/buch1_v8.json'), JSON.stringify(out, null, 1) + '\n');
const w = spuren.map((s) => s.blocks.flatMap((b) => plain(b.s.join(' ')).match(WORD) ?? []).length);
console.log(`✓ buch1_v8.json: ${spuren.length} Spuren, Wörter ${w.join(' / ')}`);
