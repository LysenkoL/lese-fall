/**
 * Bildnamen mit Platzhaltern. Die Daten nennen schon die künftigen Namen (objekte/…, kinder/…).
 * Gibt es die echte Datei (assets/illustrationen/<name>.webp, für objekte/ über scripts/freistellen.py
 * nach app/src/gen/objekte, für kinder/ nach app/src/gen/kinder oder direkt unter assets), nimmt `bildUrl` sie.
 * Sonst gilt die Zuordnung ERSATZ unten: ein vorhandenes Bild oder eine gezeichnete SVG aus ./ersatz/.
 * Neues Bild von der Besitzerin → Datei ablegen, Eintrag hier nicht mehr nötig (darf aber stehen bleiben).
 */
import { img } from '../data';
import { pulliSvg, type Pulli } from './zeichnen.ts';

const ECHT = {
  ...import.meta.glob('../gen/{objekte,kinder}/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/kinder/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/objekte/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../../assets/illustrationen/{baum,baum_nest,nest_finale,nest_nah,tresor_zu,tresor_auf,k3_elster,k4_s19_elster,k4_s24_fenster}.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;
const SVGS = import.meta.glob('./ersatz/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** künftiger Name → Ersatz ("ersatz/x" = gezeichnete SVG, sonst vorhandenes Bild) */
export const ERSATZ: Record<string, string> = {
  'objekte/fuchs_puppe': 'ersatz/fuchs_puppe',
  'objekte/koenig_puppe': 'ersatz/koenig_puppe',
  'objekte/pappbaum': 'ersatz/pappbaum',
  'objekte/papierstapel': 'ersatz/papierstapel',
  'objekte/mond_hinten_feucht': 'objekte/mond_hinten', // + gezeichneter Kleber (Daten: kleber.zeichnen)
  'objekte/raetsel_kaese': 'ersatz/raetsel_kaese',
  'objekte/raetsel_keks': 'ersatz/raetsel_keks',
  'objekte/raetsel_sonne': 'ersatz/raetsel_sonne',
  'objekte/raetsel_ball': 'ersatz/raetsel_ball',
  'objekte/raetsel_zitrone': 'ersatz/raetsel_zitrone',
  'objekte/raetsel_schwamm': 'ersatz/raetsel_schwamm',
  // Kapitel 3: Fünf Vögel nebeneinander (gleich breite Spalten, Nr. 3 = langer Schwanz), fünf gelbe Kreise vorn/hinten (3:2), Plakat (3:2), Tisch (3:2)
  'objekte/voegel': 'ersatz/voegel',
  'objekte/vogelschatten': 'ersatz/vogelschatten',
  'objekte/gelbe_kreise_vorne': 'ersatz/gelbe_kreise_vorne',
  'objekte/gelbe_kreise_hinten': 'ersatz/gelbe_kreise_hinten',
  'objekte/plakat': 'ersatz/plakat',
  'objekte/tisch_leer': 'ersatz/tisch_leer',
  // Kapitel 3 (Spur 15): kleine Zeichnungen für „Was ist anders?“ und das Sortieren
  'objekte/u_fadenende': 'ersatz/u_fadenende',
  'objekte/u_riss': 'ersatz/u_riss',
  'objekte/u_riss_icon': 'ersatz/u_riss_icon',
  'objekte/u_klebefleck': 'ersatz/u_klebefleck',
  'objekte/u_zufall': 'ersatz/u_zufall',
  // Kapitel 4: Baum mit fünf Astgabeln (Gabel 3 unter dem Fenster, dünn wie ein V), Baum mit Nest, Kinder von hinten (Lupe), Raum (Unterschiede), Finale
  'baum': 'ersatz/baum',
  'baum_nest': 'ersatz/baum_nest',
  'nest_finale': 'k4_s24',
  'objekte/kinder_hinten': 'ersatz/kinder_hinten',
  'objekte/raum_leer': 'ersatz/raum_leer',
  'kinder/lina': 'kind/lina', 'kinder/tom': 'kind/tom', 'kinder/ida': 'kind/ida', 'kinder/emil': 'kind/emil', 'kinder/nele': 'kind/nele',
};
/** Pullis der Kinder (wie in Kapitel 1) für die gezeichneten Platzhalter */
const PULLI: Record<string, Pulli> = {
  lina: { muster: 'quer', farbe: '#2F5FB3', farbe2: '#FFFFFF', kapuze: true, knoepfe: false },
  tom: { muster: 'einfarbig', farbe: '#D8432F', kapuze: true, knoepfe: false },
  ida: { muster: 'quer', farbe: '#D8432F', farbe2: '#FFFFFF', kapuze: false, knoepfe: true },
  emil: { muster: 'punkte', farbe: '#D8432F', farbe2: '#FFFFFF', kapuze: true, knoepfe: false },
  nele: { muster: 'laengs', farbe: '#D8432F', farbe2: '#FFFFFF', kapuze: true, knoepfe: false },
};
const HAARE: Record<string, string> = { lina: '#5A3A22', tom: '#2A1A10', ida: '#E8B04A', emil: '#C9792A', nele: '#2A1A10' };
function kindSvg(n: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 270"><circle cx="100" cy="62" r="46" fill="${HAARE[n]}"/><circle cx="100" cy="72" r="38" fill="#F6CFA8" stroke="#8A5A33" stroke-width="3"/><circle cx="87" cy="72" r="4.500" fill="#2A1A10"/><circle cx="113" cy="72" r="4.500" fill="#2A1A10"/><path d="M88 88 Q100 98 112 88" stroke="#2A1A10" stroke-width="3.500" fill="none" stroke-linecap="round"/><svg x="0" y="96" width="200" height="190" viewBox="0 0 200 190">${pulliSvg(PULLI[n], 'k-' + n).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const echt = (n: string) => ECHT[`../gen/${n}.webp`] ?? ECHT[`../../../assets/illustrationen/${n}.webp`];
/** URL für einen Bildnamen: echte Datei, sonst Platzhalter, sonst wie die alte Bildverwaltung */
export function bildUrl(n: string): string {
  const e = echt(n);
  if (e) return e;
  const z = ERSATZ[n];
  if (z) {
    if (z.startsWith('kind/')) return kindSvg(z.slice(5));
    if (z.startsWith('ersatz/')) return SVGS[`./${z}.svg`] ?? '';
    return img(z);
  }
  return img(n);
}
/** true, wenn für diesen Namen (noch) ein Platzhalter gilt */
export const istErsatz = (n: string) => !echt(n) && n in ERSATZ;
