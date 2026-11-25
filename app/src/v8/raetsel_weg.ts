/**
 * Neue Rätsel mit Weg und Formen (D-19): Raupenweg (Spur 21), Passt genau (Spur 15).
 * Vertrag wie in raetsel.ts: (rahmen, daten, fertig). Hilfen: import { kontext, sag, unten, … } from './raetsel.ts'.
 */
type Spiel = (r: HTMLElement, d: any, fertig: () => void) => void;
export const SPIELE_WEG: Record<string, Spiel> = {};
