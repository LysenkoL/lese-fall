/**
 * Baut 04_data/kapitel1_v7.json (Vorschau „v7“) aus
 *   01_text/LESE-FALL_BUCH_1_TEXT_v7_KAPITEL1.md   (Text mit <!-- Blatt --> und <!-- Ermittlung -->)
 *   04_data/kapitel1_v7_zuege.json                 (Züge, Fallakte, Texte der Oberfläche)
 *   04_data/silben_kapitel1.txt                    (Silben)
 * Aufruf: node scripts/build-v7.ts [--neue-woerter]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAusnahmen, silbiereBuch } from '../src/core/silben.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const P = (p: string) => resolve(ROOT, p);
const WRITE_NEW = process.argv.includes('--neue-woerter');
const md = readFileSync(P('01_text/LESE-FALL_BUCH_1_TEXT_v7_KAPITEL1.md'), 'utf8').replace(/\r\n?/g, '\n');
const zuege = JSON.parse(readFileSync(P('04_data/kapitel1_v7_zuege.json'), 'utf8'));
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
const all = md.split('\n');
const kTitel = all.find((l) => /^## Kapitel 1 — /.test(l))!.replace(/^## Kapitel 1 — /, '');
const ende = all.findIndex((l) => /^## Что посеяно/.test(l));
const spurenText: { spur: number; titel: string; teile: { blocks: Block[] }[] }[] = [];
for (let i = 0; i < ende; i++) {
  const m = all[i].match(/^### Spur (\d+) — (.+)$/);
  if (!m) continue;
  const teile: { blocks: Block[] }[] = [{ blocks: [] }];
  let n = 0, umbruch = false;
  for (let j = i + 1; j < ende && !/^---$/.test(all[j]) && !/^###/.test(all[j]); j++) {
    const l = all[j].trim();
    if (!l) continue;
    if (l === '<!-- Ermittlung -->') { teile.push({ blocks: [] }); umbruch = false; continue; }
    if (l === '<!-- Blatt -->') { umbruch = true; continue; }
    const b: Block = { id: `s${m[1]}-p${++n}`, typ: isThought(l) ? 'th' : 'p', s: saetze(l).map(mark) };
    if (umbruch && teile[teile.length - 1].blocks.length) b.umbruch = true;
    umbruch = false;
    teile[teile.length - 1].blocks.push(b);
  }
  spurenText.push({ spur: +m[1], titel: m[2], teile: teile.filter((t) => t.blocks.length) });
}
if (spurenText.length !== 6) throw new Error('6 Spuren erwartet, gefunden: ' + spurenText.length);

/** {spur, satz} → Satz-ID; genau ein Treffer */
function ref(r: { spur: number; satz: string }, wo: string): string {
  const sp = spurenText.find((s) => s.spur === r.spur);
  const hits: string[] = [];
  sp?.teile.forEach((t) => t.blocks.forEach((b) => b.s.forEach((s, i) => { if (plain(s).includes(r.satz)) hits.push(`${b.id}-${i}`); })));
  if (hits.length !== 1) { console.error(`✗ ${wo}: „${r.satz}“ in Spur ${r.spur} ${hits.length}-mal gefunden`); fehler++; }
  return hits[0] ?? '';
}

/* ---------- Züge ---------- */
const TEXT = new Set(['titel', 'text', 'tipp', 'erfolg', 'schluss', 'warum', 'haken', 'name', 'frage']);
function tree(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT.has(key) ? mark(v) : v;
  if (Array.isArray(v)) return v.map((x) => tree(x, key));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tree(x, k)]));
  return v;
}
function zug(z: any, wo: string): any {
  const o = tree(z);
  if (z.beweis) o.beweis = z.beweis.map((r: any) => ref(r, wo));
  if (z.art === 'markieren') { o.muss = z.muss.map((s: string) => ref({ spur: z.spur, satz: s }, wo)); o.darf = (z.darf ?? []).map((s: string) => ref({ spur: z.spur, satz: s }, wo)); }
  if (z.art === 'zwei') { o.gegeben = ref(z.gegeben, wo); o.suche = { id: ref(z.suche, wo), spur: z.suche.spur, tipp: mark(z.suche.tipp) }; }
  if (z.werte) o.werte = Object.fromEntries(Object.entries(z.werte).map(([k, x]) => [k, mark(x as string)]));
  return o;
}
const spuren = spurenText.map((st) => {
  const z = zuege.spuren.find((s: any) => s.spur === st.spur);
  if (!z) throw new Error('Züge fehlen für Spur ' + st.spur);
  if (z.mitte.length && st.teile.length < 2) { console.error(`✗ Spur ${st.spur}: Züge für die Mitte, aber kein <!-- Ermittlung --> im Text`); fehler++; }
  return {
    spur: st.spur, titel: mark(st.titel), bild: z.bild, haken: mark(z.haken), teile: st.teile,
    mitte: z.mitte.map((x: any, i: number) => zug(x, `Spur ${st.spur} Mitte ${i + 1}`)),
    ende: z.ende.map((x: any, i: number) => zug(x, `Spur ${st.spur} Ende ${i + 1}`)),
    akte: tree(z.akte),
  };
});

const out = {
  _info: 'Generiert von app/scripts/build-v7.ts – nicht von Hand ändern.',
  fall: { titel: mark('Der verschwundene Mond') },
  kapitel: { nr: 1, titel: mark(kTitel) },
  geheimwort: { ...zuege.geheimwort, frage: mark(zuege.geheimwort.frage) },
  verdaechtige: tree(zuege.verdaechtige),
  ui: Object.fromEntries(Object.entries(zuege.ui).map(([k, v]) => [k, mark(v as string)])),
  spuren,
};

if (neu.size) {
  console.warn(`! ${neu.size} Wörter nicht in silben_kapitel1.txt: ${[...neu.values()].join(' ')}`);
  if (WRITE_NEW) { writeFileSync(dictPath, dictText.trimEnd() + '\n# neu für v7 (ungeprüft)\n' + [...neu.values()].join('\n') + '\n'); console.warn('  → angehängt'); }
  else fehler++;
}
if (fehler) { console.error(`✗ ${fehler} Fehler – kapitel1_v7.json nicht geschrieben`); process.exit(1); }
writeFileSync(P('04_data/kapitel1_v7.json'), JSON.stringify(out, null, 1) + '\n');
const w = spuren.map((s) => s.teile.flatMap((t) => t.blocks.flatMap((b) => plain(b.s.join(' ')).match(WORD) ?? [])).length);
console.log(`✓ kapitel1_v7.json: ${spuren.length} Spuren, Wörter ${w.join(' / ')}, Züge ${spuren.reduce((a, s) => a + s.mitte.length + s.ende.length, 0)}`);
