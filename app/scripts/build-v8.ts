/**
 * Baut 04_data/buch1_v8.json (Vorschau „v8“, alle Kapitel) aus
 *   01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITELn.md   (Text mit <!-- Blatt -->), n = 1, 2, …
 *   04_data/kapitelN_v8_raetsel.json               (Rätsel, Brett, Fallkarte; Kapitel 1 auch Vorgeschichte und Oberflächentexte)
 *   04_data/silben_kapitel1.txt                    (Silben)
 * Aufruf: node scripts/build-v8.ts [--neue-woerter]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
/** Gedanke der Raupe → Denkblase: „…“, denkt sie / „…“, schmunzelt die Raupe / Die Lese-Raupe staunt: „…“ (im selben Satz) */
const isThought = (line: string) =>
  /„[^“]*“,? (denkt|schimpft)|(denkt|schimpft) (sie|die (Lese-)?[Rr]aupe)[^„]*„/.test(line) ||
  /“,? (überlegt|schmunzelt|kombiniert|kichert) die (Lese-)?Raupe/.test(line) ||
  /Raupe\b[^.!?„“]*: „/.test(line) ||
  /Raupe\b[^„]*„[^“]*“,? (wundert|schnauft) sie/.test(line);

/* ---------- Marker im Text (HTML-Kommentare, je eine eigene Zeile) ----------
 *   <!-- Blatt -->          hier lieber ein neues Blatt beginnen
 *   <!-- Raupe: brrr -->    Pose der Raupe für den Gedanken im nächsten Absatz (sonst rät main.ts nach ! und ?)
 *   <!-- Bild -->           das Bild der Spur (oder des Ausklangs) steht hier statt am Anfang – vor dem nächsten Absatz
 *   <!-- Bild: objekte/x --> ein anderes Bild (Name wie in bilder.ts) vor dem nächsten Absatz
 */
/** erlaubte Posen: Bild in assets/illustrationen/raupe/ UND freigestellt in app/src/gen/frei/ (das zeigt die Denkblase) */
const POSEN_ALLE = readdirSync(P('assets/illustrationen/raupe')).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)).sort();
const POSEN = POSEN_ALLE.filter((p) => existsSync(P(`app/src/gen/frei/raupe_${p}.webp`)));
/** Bildnamen, die bilder.ts kennt: echte Datei oder Eintrag in ERSATZ */
const ERSATZ_TEXT = readFileSync(P('app/src/v8/bilder.ts'), 'utf8');
const bildBekannt = (n: string) => ['assets/illustrationen', 'app/src/gen'].some((d) => existsSync(P(`${d}/${n}.webp`))) || ERSATZ_TEXT.includes(`'${n}':`);
interface Block { id: string; typ: 'p' | 'th'; s: string[]; umbruch?: boolean; pose?: string; bild?: string }
/**
 * Liest die Absätze eines Abschnitts (### Spur … oder ### Ausklang …) ab Zeile `ab` bis zum nächsten ### oder ---.
 * `bildName` = Bild des Abschnitts (für <!-- Bild -->). `bildImText`: das Bild steht im Text, nicht am Anfang.
 */
function abschnitt(all: string[], ab: number, wo: string, idVor: string, bildName: string | null): { blocks: Block[]; bildImText: boolean } {
  const blocks: Block[] = [];
  let n = 0, umbruch = false, pose: { name: string; z: number } | null = null, bild: { name: string; z: number } | null = null, bildImText = false;
  const halt = (z: number, t: string) => { throw new Error(`${wo}, Zeile ${z + 1}: ${t}`); };
  let j = ab + 1;
  for (; j < all.length && !/^---$/.test(all[j]) && !/^###/.test(all[j]); j++) {
    const l = all[j].trim();
    if (!l) continue;
    if (l === '<!-- Blatt -->') { umbruch = true; continue; }
    const mp = l.match(/^<!--\s*Raupe\s*:\s*([^\s>]*)\s*-->$/);
    if (mp) {
      if (!POSEN.includes(mp[1])) halt(j, `unbekannte Pose „${mp[1]}“ in <!-- Raupe: … -->. ${POSEN_ALLE.includes(mp[1]) ? `Für „${mp[1]}“ fehlt noch das freigestellte Bild app/src/gen/frei/raupe_${mp[1]}.webp (scripts/freistellen.py). ` : ''}Erlaubt: ${POSEN.join(', ')}`);
      if (pose) halt(j, `zwei <!-- Raupe: … --> hintereinander (Zeile ${pose.z + 1} und ${j + 1})`);
      pose = { name: mp[1], z: j }; continue;
    }
    const mb = l.match(/^<!--\s*Bild\s*(?::\s*([^\s>]+)\s*)?-->$/);
    if (mb) {
      if (bild) halt(j, `zwei <!-- Bild --> hintereinander ohne Absatz dazwischen`);
      if (mb[1]) { if (!bildBekannt(mb[1])) halt(j, `Bild „${mb[1]}“ gibt es nicht (weder assets/illustrationen/${mb[1]}.webp noch app/src/gen/${mb[1]}.webp noch ERSATZ in bilder.ts)`); bild = { name: mb[1], z: j }; }
      else {
        if (!bildName) halt(j, `<!-- Bild --> ohne Bild: dieser Abschnitt hat kein Bild (für ein anderes Bild: <!-- Bild: name -->)`);
        if (bildImText) halt(j, `<!-- Bild --> steht zweimal in diesem Abschnitt`);
        bild = { name: bildName!, z: j }; bildImText = true;
      }
      continue;
    }
    if (l.startsWith('<!--')) continue;
    const b: Block = { id: `${idVor}-p${++n}`, typ: isThought(l) ? 'th' : 'p', s: saetze(l).map(mark) };
    if (umbruch && blocks.length) b.umbruch = true;
    if (pose) { if (b.typ !== 'th') halt(pose.z, `<!-- Raupe: ${pose.name} --> steht nicht vor einem Gedanken der Raupe (der nächste Absatz ist normaler Text)`); b.pose = pose.name; }
    if (bild) b.bild = bild.name;
    umbruch = false; pose = null; bild = null;
    blocks.push(b);
  }
  if (pose) halt(pose.z, `<!-- Raupe: ${pose.name} --> am Ende des Abschnitts: danach kommt kein Absatz`);
  if (bild) halt(bild.z, `<!-- Bild --> am Ende des Abschnitts: danach kommt kein Absatz`);
  return { blocks, bildImText };
}

/* ---------- Text und Rätsel je Kapitel ---------- */
const TEXT = new Set(['raupeSagt', 'raupeKurz', 'nein', 'nachLaub', 'liste', 'zuViel', 'nochMehr', 'falsch', 'ok', 'fund', 'knapp', 'frueh', 'hilfe', 'wortText', 'plakatFertig', 'start', 'regel', 'frageRaus', 'unklar', 'suche', 'nass', 'frage1', 'tipp1', 'hinweisText', 'beispiel', 'regel', 'botschaft', 'nachricht', 'text', 'titel', 'haken', 'frage', 'aufloesung', 'warum', 'warum2', 'tipp', 'erfolg', 'unklarTipp', 'vorspann', 'ausblick', 'name', 'saetze', 'unter', 'sagt', 'klebt', 'frage2', 'nicht', 'nachsehen', 'absatz', 'demo', 'jetzt', 'bedeutung']);
function tree(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT.has(key) ? mark(v) : v;
  if (Array.isArray(v)) return v.map((x) => tree(x, key));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tree(x, k)]));
  return v;
}
/** alle kapitelN_v8_raetsel.json, nach N sortiert */
const nummern = readdirSync(P('04_data')).map((f) => f.match(/^kapitel(\d+)_v8_raetsel\.json$/)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b);
if (!nummern.length || nummern.some((n, i) => n !== i + 1)) throw new Error('Kapitel-Dateien müssen 1, 2, 3 … lauten: ' + nummern.join(','));
const kapitel: any[] = [], spuren: any[] = [];
let intro: any = [], ui: Record<string, string> = {}, fallTitel = '';
for (const kn of nummern) {
  const md = readFileSync(P(`01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL${kn}.md`), 'utf8').replace(/\r\n?/g, '\n');
  const all = md.split('\n');
  const kopfZeile = all.find((l) => l.startsWith(`## Kapitel ${kn} — `));
  if (!kopfZeile) throw new Error(`Überschrift „## Kapitel ${kn} — …“ fehlt`);
  const start = all.indexOf(kopfZeile);
  const rz = JSON.parse(readFileSync(P(`04_data/kapitel${kn}_v8_raetsel.json`), 'utf8'));
  const texte: { spur: number; titel: string; blocks: Block[]; bildImText: boolean }[] = [];
  /** Ausklang: kurze Schlussszene nach der letzten Spur (vor der Fallkarte), ohne Rätsel und Karte */
  let ausklang: { titel: string; bild?: string; bildImText?: boolean; blocks: Block[] } | null = null;
  for (let i = start; i < all.length; i++) {
    const m = all[i].match(/^### Spur (\d+) — (.+)$/);
    const ma = all[i].match(/^### Ausklang — (.+)$/);
    if (m) {
      const bildName = rz.spuren?.find((s: any) => s.spur === +m[1])?.bild ?? null;
      texte.push({ spur: +m[1], titel: m[2], ...abschnitt(all, i, `Kapitel ${kn}, Spur ${m[1]}`, `s${m[1]}`, bildName) });
    } else if (ma) {
      if (ausklang) throw new Error(`Kapitel ${kn}: zwei Abschnitte „### Ausklang — …“`);
      const a = abschnitt(all, i, `Kapitel ${kn}, Ausklang`, `a${kn}`, rz.ausklangBild ?? null);
      if (!a.blocks.length) throw new Error(`Kapitel ${kn}, Ausklang: kein Absatz`);
      if (rz.ausklangBild && !bildBekannt(rz.ausklangBild)) throw new Error(`kapitel${kn}_v8_raetsel.json: ausklangBild „${rz.ausklangBild}“ gibt es nicht`);
      ausklang = { titel: mark(ma[1]), ...(rz.ausklangBild ? { bild: rz.ausklangBild } : {}), ...(a.bildImText ? { bildImText: true } : {}), blocks: a.blocks };
    }
  }
  // D-19: Kapitel 3 hat 7 Spuren, Kapitel 4 hat 5 (zusammen weiter 24)
  if (!texte.length) throw new Error(`Kapitel ${kn}: keine Spur gefunden`);
  if (rz.spuren.length !== texte.length) throw new Error(`Kapitel ${kn}: ${texte.length} Spuren im Text, ${rz.spuren.length} in den Rätseldaten`);
  if (rz.kapitel !== kn) throw new Error(`kapitel${kn}_v8_raetsel.json: Feld "kapitel" ist ${rz.kapitel}`);
  for (const t of texte) {
    const z = rz.spuren.find((s: any) => s.spur === t.spur);
    if (!z) throw new Error('Rätseldaten fehlen für Spur ' + t.spur);
    const { spur, bild, haken, karte, fragenNeu, fragenWeg, tipp, raetsel, schluessel } = z;
    spuren.push({ nr: spur, kap: kn, spur, titel: mark(t.titel), bild, ...(t.bildImText ? { bildImText: true } : {}), haken: mark(haken), blocks: t.blocks, karte: tree(karte), fragenNeu: tree(fragenNeu ?? []), fragenWeg: fragenWeg ?? [], tipp: tree(tipp ?? null), raetsel: tree(raetsel), ...(schluessel ? { schluessel } : {}) });
  }
  kapitel.push({ nr: kn, titel: mark(kopfZeile.replace(`## Kapitel ${kn} — `, '')), bild: rz.bild, vorspann: mark(rz.vorspann), code: rz.code, fallkarte: tree(rz.fallkarte), ausblick: mark(rz.ausblick), ...(rz.ausblickBild ? { ausblickBild: rz.ausblickBild } : {}), ...(ausklang ? { ausklang } : {}), ...(rz.finale ? { finale: tree(rz.finale) } : {}) });
  Object.assign(ui, rz.ui ?? {});
  if (kn === 1) { intro = tree(rz.intro); fallTitel = 'Der verschwundene Mond'; }
}
spuren.sort((a, b) => a.nr - b.nr);
if (spuren.some((s, i) => s.nr !== i + 1)) throw new Error('Spurnummern müssen fortlaufend 1…N sein');
const out = {
  _info: 'Generiert von app/scripts/build-v8.ts – nicht von Hand ändern.',
  fall: { titel: mark(fallTitel) },
  kapitel,
  intro,
  ui: Object.fromEntries(Object.entries(ui).map(([k, v]) => [k, mark(v as string)])),
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
