/** SVG-Zeichnungen für die Rätsel: Pullis (Ausschluss) und der versteckte Buchstabe. */
export type Pulli = { muster: 'einfarbig' | 'quer' | 'laengs' | 'punkte'; farbe: string; farbe2?: string; kapuze: boolean; knoepfe: boolean };

/** Pulli als Papier-Ausschnitt. id muss je Karte eindeutig sein (Muster-IDs). */
export function pulliSvg(p: Pulli, id: string): string {
  const f2 = p.farbe2 ?? '#FFFFFF';
  const streifen = (dreh: number) => `<pattern id="${id}-${dreh}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="18" height="18" fill="${f2}"/><rect width="18" height="9" fill="${p.farbe}"/></pattern>`;
  let defs = '', rumpf = p.farbe, links = p.farbe, rechts = p.farbe;
  if (p.muster === 'quer') { defs = streifen(0) + streifen(28) + streifen(-28); rumpf = `url(#${id}-0)`; links = `url(#${id}-28)`; rechts = `url(#${id}--28)`; }
  if (p.muster === 'laengs') { defs = streifen(90) + streifen(118) + streifen(62); rumpf = `url(#${id}-90)`; links = `url(#${id}-118)`; rechts = `url(#${id}-62)`; }
  if (p.muster === 'punkte') { defs = `<pattern id="${id}-p" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${p.farbe}"/><circle cx="9" cy="9" r="3.5" fill="${f2}"/></pattern>`; rumpf = links = rechts = `url(#${id}-p)`; }
  const rand = 'stroke="#3A2F25" stroke-width="3" stroke-linejoin="round"';
  const kapuze = p.kapuze ? `<path d="M66 44 Q100 -8 134 44 Q100 26 66 44 Z" fill="${rumpf}" ${rand}/>` : '';
  const knopf = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="4" fill="#FFF8E6" stroke="#3A2F25" stroke-width="2"/>`;
  const knoepfe = p.knoepfe ? knopf(30, 112) + knopf(38, 100) + knopf(46, 88) + knopf(170, 112) + knopf(162, 100) + knopf(154, 88) : '';
  return `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>
    ${kapuze}
    <path d="M60 42 L16 122 L44 136 L74 84 Z" fill="${links}" ${rand}/>
    <path d="M140 42 L184 122 L156 136 L126 84 Z" fill="${rechts}" ${rand}/>
    <path d="M60 42 L140 42 L150 176 L50 176 Z" fill="${rumpf}" ${rand}/>
    <path d="M80 42 Q100 62 120 42" fill="#FFF8E6" ${rand}/>
    <path d="M16 122 L44 136" stroke="#3A2F25" stroke-width="7" stroke-linecap="round"/>
    <path d="M184 122 L156 136" stroke="#3A2F25" stroke-width="7" stroke-linecap="round"/>
    ${knoepfe}</svg>`;
}

/** Buchstabe, der sich in Linien versteckt: außen laufen die Linien senkrecht, im Buchstaben um `winkel` Grad gedreht; `stoerer` Flecken lenken ab. */
export function versteckterBuchstabe(buchstabe: string, winkel: number, farbe: string, id: string, gefunden = false, stoerer = 0): string {
  const linien = (pid: string, dreh: number) => `<pattern id="${pid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="9" height="9" fill="#EAF3FB"/><rect width="3.4" height="9" fill="${farbe}"/></pattern>`;
  const F = [[52, 62, 36, 24], [240, 86, 30, 42], [66, 238, 42, 26], [232, 236, 36, 24], [150, 36, 28, 16]];
  const flecken = F.slice(0, stoerer).map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-${i % 2 ? 'c' : 'd'})"/>`).join('');
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Linienbild"><defs>${linien(id + '-a', 0)}${linien(id + '-b', winkel)}${linien(id + '-c', -winkel)}${linien(id + '-d', winkel * 1.7)}</defs>
    <rect width="300" height="300" rx="18" fill="url(#${id}-a)"/>${flecken}
    <text x="150" y="238" text-anchor="middle" font-family="'Inter Schule', system-ui, sans-serif" font-weight="800" font-size="250" fill="${gefunden ? '#F4C243' : `url(#${id}-b)`}">${buchstabe}</text></svg>`;
}
