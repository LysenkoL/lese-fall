/**
 * Bilder der v8 nach Kurzname (objekte/…, kinder/…, Szenenbilder). Reihenfolge der Suche:
 *   1. freigestellte Kopie in app/src/gen/{objekte,kinder}/ (scripts/freistellen.py),
 *   2. Original in assets/illustrationen/{kinder,objekte}/ oder ein Szenenbild aus der Liste unten,
 *   3. sonst die alte Bildverwaltung `img()` aus ../data (Szenen k1_s1 …, Figuren, gen/frei, gen/garderobe).
 * Neues Szenenbild nur für v8 → Datei nach assets/illustrationen/ legen und den Namen in die Liste unten eintragen.
 * Platzhalter (Tabelle ERSATZ, gezeichnete SVGs) gibt es seit 26.11.2026 nicht mehr: alle Bilder sind gemalt.
 */
import { img } from '../data';

const ECHT = {
  ...import.meta.glob('../gen/{objekte,kinder}/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/kinder/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/objekte/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/{baum,nest_finale,nest_nah,nest_sammlung,tresor_zu,tresor_auf,k4_s19_elster,k4_s24_fenster,k3_s19,k4_s21_raupe,raupenweg,k2_s10_fenster,k2_s11_hof,nest_spitze}.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;

const echt = (n: string) => ECHT[`../gen/${n}.webp`] ?? ECHT[`../../../assets/illustrationen/${n}.webp`];
/** URL für einen Bildnamen: eigene Datei der v8, sonst die alte Bildverwaltung */
export const bildUrl = (n: string): string => echt(n) ?? img(n);
