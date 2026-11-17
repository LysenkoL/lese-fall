/** Fortschritt nur auf dem Gerät (localStorage). Keine Daten verlassen das Gerät. */
export interface Stand {
  geloest: Record<number, number>; // Spur → Perlen (einmal vergeben, A-05)
  buchstaben: number[]; // Spuren, deren Buchstabe abgepinselt ist
  tresorOffen: boolean;
  vorgeschichte: boolean;
  ort: { view: string; teil: number; anker: string };
  fs: number;
  silben: boolean;
  ruhig: boolean; // Bewegung reduzieren
  stil2: boolean; // „Neuer Stil (Test)“ zum Vergleichen
  garderobe: { gekauft: string[]; traegt: string | null }; // D-08: Sachen für die Lese-Raupe
}
const KEY = 'lesefall.v1';
const START: Stand = { geloest: {}, buchstaben: [], tresorOffen: false, vorgeschichte: false, ort: { view: 'cover', teil: 0, anker: '' }, fs: 20, silben: true, ruhig: false, stil2: false, garderobe: { gekauft: [], traegt: null } };

function laden(): Stand {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); return { ...structuredClone(START), ...d, garderobe: { gekauft: [], traegt: null, ...(d.garderobe ?? {}) } }; }
  } catch { /* privat / blockiert: ohne Speichern weiter */ }
  return structuredClone(START);
}
export const stand: Stand = laden();
export function speichern() {
  try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch { /* egal */ }
}
export function zuruecksetzen() {
  const keep = { fs: stand.fs, silben: stand.silben, ruhig: stand.ruhig, stil2: stand.stil2 };
  Object.assign(stand, structuredClone(START), keep);
  speichern();
}
/** alle gesammelten Perlen (je Spur einmal, A-05) */
export const perlen = () => Object.values(stand.geloest).reduce((a, b) => a + b, 0);
/** Perlen, die noch ausgegeben werden können (Garderobe, D-08) */
export const verfuegbar = (preise: Record<string, number>) => perlen() - stand.garderobe.gekauft.reduce((a, id) => a + (preise[id] ?? 0), 0);
export const geloestAnzahl = () => Object.keys(stand.geloest).length;
