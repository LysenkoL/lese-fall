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

/** Buchstabe, der sich in Linien (oder Laub) versteckt: außen liegen die Muster gerade, im Buchstaben um `winkel` Grad gedreht; `stoerer` Flecken lenken ab. */
export function versteckterBuchstabe(buchstabe: string, winkel: number, farbe: string, id: string, gefunden = false, stoerer = 0, muster = 'linien'): string {
  const linien = (pid: string, dreh: number) => `<pattern id="${pid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="9" height="9" fill="#EAF3FB"/><rect width="3.4" height="9" fill="${farbe}"/></pattern>`;
  const laub = (pid: string, dreh: number) => `<pattern id="${pid}" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="26" height="26" fill="#E3F0C8"/><g fill="${farbe}"><ellipse cx="7" cy="7" rx="7.500" ry="3" transform="rotate(-18 7 7)"/><ellipse cx="20" cy="20" rx="7.500" ry="3" transform="rotate(-18 20 20)"/></g><g fill="#8CC24E"><ellipse cx="20" cy="6" rx="4.500" ry="1.800" transform="rotate(-18 20 6)"/><ellipse cx="6" cy="20" rx="4.500" ry="1.800" transform="rotate(-18 6 20)"/></g></pattern>`;
  const m = muster === 'laub' ? laub : linien;
  const F = [[52, 62, 36, 24], [240, 86, 30, 42], [66, 238, 42, 26], [232, 236, 36, 24], [150, 36, 28, 16]];
  const flecken = F.slice(0, stoerer).map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-${i % 2 ? 'c' : 'd'})"/>`).join('');
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${muster === 'laub' ? 'Laubbild' : 'Linienbild'}"><defs>${m(id + '-a', 0)}${m(id + '-b', winkel)}${m(id + '-c', -winkel)}${m(id + '-d', winkel * 1.7)}</defs>
    <rect width="300" height="300" rx="18" fill="url(#${id}-a)"/>${flecken}
    <text x="150" y="238" text-anchor="middle" font-family="'Inter Schule', system-ui, sans-serif" font-weight="800" font-size="250" fill="${gefunden ? '#F4C243' : `url(#${id}-b)`}">${buchstabe}</text></svg>`;
}

/** Der Tresor der Lese-Raupe: neutral (kein Mond), mit so vielen Code-Fenstern, wie das Code-Wort Buchstaben hat. */
export function tresorSvg(felder = 4): string {
  const w = 22, gap = 6, x0 = 100 - (felder * w + (felder - 1) * gap) / 2;
  const fenster = [...Array(felder)].map((_, i) => `<rect x="${x0 + i * (w + gap)}" y="134" width="${w}" height="26" rx="5" fill="#0E1733" stroke="#F4C243" stroke-width="2.5"/>`).join('');
  const speichen = [0, 60, 120].map((a) => `<rect x="97" y="50" width="6" height="68" rx="3" fill="#F4C243" transform="rotate(${a} 100 84)"/>`).join('');
  const nieten = [[44, 40], [156, 40], [44, 156], [156, 156]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#5567A6"/>`).join('');
  return `<svg class="tresor-svg" viewBox="0 0 200 200" aria-hidden="true">
    <rect x="36" y="176" width="28" height="14" rx="4" fill="#0B1228"/><rect x="136" y="176" width="28" height="14" rx="4" fill="#0B1228"/>
    <rect x="16" y="12" width="168" height="170" rx="24" fill="#33447C" stroke="#0B1228" stroke-width="4"/>
    <rect x="32" y="28" width="136" height="140" rx="14" fill="#1E2B57" stroke="#4C5E9C" stroke-width="3"/>
    <rect x="23" y="48" width="12" height="24" rx="4" fill="#C99A2E"/><rect x="23" y="124" width="12" height="24" rx="4" fill="#C99A2E"/>
    ${nieten}
    <circle cx="100" cy="84" r="33" fill="#16214A" stroke="#F4C243" stroke-width="7"/>${speichen}
    <circle cx="100" cy="84" r="12" fill="#C99A2E" stroke="#F4C243" stroke-width="3"/>
    ${fenster}
  </svg>`;
}
