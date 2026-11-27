/** Silben-Text → HTML. Jedes Wort beginnt blau, dann rot, blau … (A-03). Ohne Silbenmodus erben die Spans die Textfarbe. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Wörter mit Bindestrich zählen als ein Wort: Le|se-|Rau|pe (D-13), Farben laufen weiter */
const WORD = /[A-Za-zÄÖÜäöüß|]+(?:-[A-Za-zÄÖÜäöüß|]+)*/g;

/** weich: zwischen zwei Silben ein weicher Trennstrich (&shy;) – so darf ein langes Wort in schmalen Feldern nur an Silbengrenzen
 *  umbrechen (nicht nach einem Bindestrich). Ob umgebrochen wird, entscheidet CSS `hyphens` (v8: aus, nur in schmalen Beschriftungen an). */
function words(t: string, weich = false): string {
  let out = '';
  let last = 0;
  for (const m of t.matchAll(WORD)) {
    out += esc(t.slice(last, m.index));
    const teile = m[0].replace(/-/g, '-|').split('|');
    const lang = m[0].replace(/[|-]/g, '').length >= 8; // kurze Wörter (Tablett) wandern lieber ganz in die nächste Zeile
    out += teile.map((p, i) => `${weich && lang && i && !teile[i - 1].endsWith('-') ? '&shy;' : ''}<span class="${i % 2 ? 's-r' : 's-b'}">${esc(p)}</span>`).join('');
    last = m.index! + m[0].length;
  }
  return out + esc(t.slice(last));
}

/** **fett** und *kursiv* aus dem Buchtext */
export function T(t: string, weich = false): string {
  let bold = false, ital = false, out = '';
  for (const part of t.split(/(\*\*|\*)/)) {
    if (part === '**') { out += bold ? '</b>' : '<b>'; bold = !bold; continue; }
    if (part === '*') { out += ital ? '</i>' : '<i>'; ital = !ital; continue; }
    out += words(part, weich);
  }
  if (bold) out += '</b>';
  if (ital) out += '</i>';
  return out;
}
/** Klartext ohne Silbenstriche */
export const plain = (t: string) => t.replace(/\|/g, '').replace(/\*\*|\*/g, '');
