/**
 * Gezeichnete Szene für den Raupenweg (Spur 21): Schulwand mit Fenster links, Baum rechts.
 * Alle Äste wachsen aus dem Stamm (rechts). Der lange Ast endet mit einer dünnen, belaubten Spitze auf dem Fensterbrett –
 * dort sitzt die Lese-Raupe am Anfang. Die Seitenzweige (oben, unten, Vogelhaus, gerade, V) zweigen sichtbar von diesem Ast ab,
 * keiner kommt aus der Wand. Das Nest sitzt in der V-Gabel und ist erst halb im Laub versteckt.
 * Koordinaten: viewBox 900 × 600 (= Prozent × 9 bzw. × 6 der Daten). Zwei Ebenen: hinten (alles) und vorne
 * (großes Blatt über dem Ast, Laub vor dem Nest), dazwischen liegen Leuchtspur, Pfeile und Raupe.
 * Seitenzweige tragen data-z (wackeln bei falscher Wahl, siehe raetsel_weg.ts).
 */

type P = [number, number, number]; // x, y, Breite

/** kleiner Zufall mit festem Startwert: die Szene sieht jedes Mal gleich aus */
function zufall(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f = (n: number) => n.toFixed(1);

/** Catmull-Rom durch die Punkte: Lage und Richtung bei t */
function spline(pts: P[]) {
  const out: { x: number; y: number; w: number; nx: number; ny: number }[] = [];
  const g = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const schritte = Math.max(6, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 8));
    for (let s = 0; s < schritte; s++) {
      const t = s / schritte, t2 = t * t, t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      const dx = 0.5 * ((-p0[0] + p2[0]) + 2 * (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t + 3 * (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t2);
      const dy = 0.5 * ((-p0[1] + p2[1]) + 2 * (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t + 3 * (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t2);
      const l = Math.hypot(dx, dy) || 1;
      out.push({ x, y, w: p1[2] + (p2[2] - p1[2]) * t, nx: -dy / l, ny: dx / l });
    }
  }
  const e = pts[pts.length - 1], v = out[out.length - 1];
  out.push({ x: e[0], y: e[1], w: e[2], nx: v?.nx ?? 0, ny: v?.ny ?? 1 });
  return out;
}
/** Ast mit Volumen: Körper (Verlauf), Schattenkante unten, Lichtkante oben, ein paar Rindenstriche */
function ast(pts: P[], id = ''): string {
  const s = spline(pts);
  const l = s.map((q) => `${f(q.x + q.nx * q.w / 2)} ${f(q.y + q.ny * q.w / 2)}`);
  const r = s.map((q) => `${f(q.x - q.nx * q.w / 2)} ${f(q.y - q.ny * q.w / 2)}`).reverse();
  const spitze = s[s.length - 1];
  const koerper = `M${l.join('L')}A${f(spitze.w / 2)} ${f(spitze.w / 2)} 0 0 1 ${r[0]}L${r.join('L')}Z`;
  // Licht oben (Normale zeigt je nach Richtung; nimm die Seite, die weiter oben liegt)
  const oben = (q: typeof s[0]) => (q.ny < 0 ? 1 : -1);
  const licht = s.filter((_, i) => i % 1 === 0).map((q) => `${f(q.x + q.nx * q.w * 0.24 * oben(q))} ${f(q.y + q.ny * q.w * 0.24 * oben(q))}`).join('L');
  const schatten = s.map((q) => `${f(q.x - q.nx * q.w * 0.3 * oben(q))} ${f(q.y - q.ny * q.w * 0.3 * oben(q))}`).join('L');
  const rnd = zufall(Math.round(pts[0][0] * 7 + pts[0][1] * 13));
  let rinde = '';
  for (let i = 3; i < s.length - 3; i += 3) {
    const q = s[i];
    if (q.w < 7 || rnd() < 0.35) continue;
    const a = (rnd() - 0.5) * q.w * 0.5, len = 4 + rnd() * 8;
    const tx = q.ny, ty = -q.nx; // Richtung längs des Astes
    rinde += `M${f(q.x + q.nx * a - tx * len / 2)} ${f(q.y + q.ny * a - ty * len / 2)}l${f(tx * len)} ${f(ty * len)}`;
  }
  const breite = Math.max(...pts.map((p) => p[2]));
  return `<g${id ? ` id="${id}"` : ''}>`
    + `<path d="${koerper}" fill="url(#rwRinde)" stroke="#5A3816" stroke-width="${breite > 10 ? 1.6 : 1}" stroke-linejoin="round"/>`
    + `<path d="M${schatten}" fill="none" stroke="#5A3816" stroke-opacity=".35" stroke-width="${f(Math.max(1, breite * 0.18))}" stroke-linecap="round"/>`
    + `<path d="M${licht}" fill="none" stroke="#E7B97C" stroke-opacity=".7" stroke-width="${f(Math.max(.8, breite * 0.12))}" stroke-linecap="round"/>`
    + (rinde ? `<path d="${rinde}" fill="none" stroke="#5A3816" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>` : '')
    + `</g>`;
}
/** einzelnes Blatt (zeigt nach rechts, Länge 34) an x/y, gedreht, skaliert, gefärbt */
const blatt = (x: number, y: number, dreh: number, s: number, farbe: string, ader = true) =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(dreh)}) scale(${s.toFixed(2)})"><path d="M0 0C7-10 23-11 34 0C23 11 7 10 0 0Z" fill="${farbe}"/>${ader ? '<path d="M1 0H30" stroke="#2F5E22" stroke-opacity=".35" stroke-width="1.1"/>' : ''}</g>`;
/** Laubwolke: weiche Grundform + viele Blätter (dunkel hinten, hell vorne) */
function laub(cx: number, cy: number, rx: number, ry: number, n: number, seed: number, farben = ['#3F7F33', '#4E9139', '#5FA444', '#73B652', '#8CC65E'], grund = '#4A8A37'): string {
  const rnd = zufall(seed);
  const b: { x: number; y: number; d: number; s: number; c: string }[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    const hell = Math.min(farben.length - 1, Math.max(0, Math.floor(((cy + ry - y) / (2 * ry)) * farben.length * 0.7 + rnd() * farben.length * 0.5)));
    b.push({ x, y, d: rnd() * 360, s: 0.7 + rnd() * 0.7, c: farben[hell] });
  }
  b.sort((p, q) => p.y - q.y);
  const blobs = [0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + rnd(); return `<ellipse cx="${f(cx + Math.cos(a) * rx * 0.45)}" cy="${f(cy + Math.sin(a) * ry * 0.4)}" rx="${f(rx * (0.55 + rnd() * 0.2))}" ry="${f(ry * (0.55 + rnd() * 0.2))}"/>`; }).join('');
  return `<g><g fill="${grund}">${blobs}</g>${b.map((q) => blatt(q.x, q.y, q.d, q.s, q.c)).join('')}</g>`;
}
/** ein paar Blätter an einem Zweig (Punkte entlang, abwechselnd links/rechts) */
function zweigBlaetter(pts: [number, number, number][], seed: number, farben = ['#5FA444', '#73B652', '#8CC65E']): string {
  const rnd = zufall(seed);
  return pts.map(([x, y, d], i) => blatt(x, y, d + (rnd() - 0.5) * 20, 0.55 + rnd() * 0.3, farben[i % farben.length])).join('');
}

/** Seitenzweig als eine Gruppe (Ast + Blätter), die bei falscher Wahl um ihren Ansatz schaukelt */
const zweig = (z: string, o: [number, number], innen: string) => `<g class="rw-z" data-z="${z}" style="transform-origin:${o[0]}px ${o[1]}px">${innen}</g>`;

/** Hintere Ebene: Himmel, Wand mit Fenster, Stamm, Äste, Zweige, Vogelhaus, Nest */
export function szeneHinten(): string {
  const defs = `<defs>
    <linearGradient id="rwHimmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3EC"/><stop offset=".65" stop-color="#CFEAF4"/><stop offset="1" stop-color="#EAF6F7"/></linearGradient>
    <linearGradient id="rwRinde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07A44"/><stop offset=".55" stop-color="#8A5A2E"/><stop offset="1" stop-color="#6A4220"/></linearGradient>
    <linearGradient id="rwStamm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6A4220"/><stop offset=".3" stop-color="#9C6A3A"/><stop offset=".55" stop-color="#8A5A2E"/><stop offset="1" stop-color="#5A3716"/></linearGradient>
    <linearGradient id="rwWand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2E2C2"/><stop offset=".85" stop-color="#E9D5AE"/><stop offset="1" stop-color="#CDB58C"/></linearGradient>
    <linearGradient id="rwGlas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9F6FB"/><stop offset=".5" stop-color="#C6E4F1"/><stop offset="1" stop-color="#A9D3E6"/></linearGradient>
    <linearGradient id="rwBrett" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B57A"/><stop offset="1" stop-color="#C08A4C"/></linearGradient>
    <linearGradient id="rwHolz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C58E52"/><stop offset="1" stop-color="#A46E38"/></linearGradient>
    <radialGradient id="rwNest" cx="50%" cy="25%" r="80%"><stop offset="0" stop-color="#B98448"/><stop offset=".65" stop-color="#7E5127"/><stop offset="1" stop-color="#583514"/></radialGradient>
  </defs>`;
  const himmel = `<rect width="900" height="600" fill="url(#rwHimmel)"/><g fill="#fff" opacity=".8"><ellipse cx="420" cy="232" rx="56" ry="13"/><ellipse cx="452" cy="222" rx="30" ry="12"/><ellipse cx="610" cy="470" rx="62" ry="12"/><ellipse cx="640" cy="462" rx="28" ry="10"/></g>`;
  // ferne Baumkronen unten (blass) – wir sind im ersten Stock
  const fern = laub(430, 600, 260, 70, 70, 11, ['#A9CF8E', '#B7D79A', '#C4DFA8'], '#A3CA88') + laub(700, 590, 200, 60, 50, 12, ['#A9CF8E', '#B7D79A', '#C4DFA8'], '#A3CA88');
  // Laub hinten (kühler, heller) für Tiefe
  const hinten = laub(520, 70, 300, 110, 120, 21, ['#6FAE57', '#7DB862', '#8DC36F', '#9ECD7E'], '#6CA853') + laub(860, 250, 120, 150, 70, 22, ['#6FAE57', '#7DB862', '#8DC36F'], '#6CA853');
  // Stamm rechts, mit Rinde und Astloch
  const stamm = `<path d="M786 600C792 520 800 440 796 380C792 330 800 260 796 190C792 120 808 60 800 0H900V600Z" fill="url(#rwStamm)"/>`
    + `<g fill="none" stroke="#4A2C10" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"><path d="M818 40C814 90 822 130 816 180"/><path d="M842 120C838 170 846 210 840 260"/><path d="M826 300C822 350 830 390 824 440"/><path d="M856 380C852 430 860 470 854 530"/><path d="M812 470C808 510 816 550 812 600"/><path d="M870 30C866 70 874 110 868 150"/></g>`
    + `<g fill="none" stroke="#C99A62" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"><path d="M808 210C805 240 810 270 806 300"/><path d="M832 520C829 545 834 570 830 595"/></g>`
    + `<ellipse cx="850" cy="470" rx="13" ry="22" fill="#3A2210"/><ellipse cx="850" cy="470" rx="13" ry="22" fill="none" stroke="#8A5A2E" stroke-width="5"/>`;
  // oberer Ast aus dem Stamm in die Krone (zeigt: alles hängt am Baum)
  const obenAst = ast([[800, 150, 34], [720, 120, 22], [620, 100, 14], [520, 95, 9]]);
  // Wand mit Fenster und Fensterbrett (links)
  const wand = `<path d="M0 0H214V600H0Z" fill="url(#rwWand)"/><path d="M206 0H216V600H206Z" fill="#B99D72" opacity=".55"/>`
    + `<g fill="#D9C39A" opacity=".55"><rect x="0" y="470" width="214" height="3"/><rect x="0" y="530" width="214" height="3"/><rect x="0" y="40" width="214" height="2"/></g>`
    + `<rect x="26" y="66" width="164" height="322" rx="4" fill="url(#rwHolz)" stroke="#7E5128" stroke-width="2"/>`
    + `<rect x="42" y="82" width="132" height="292" fill="url(#rwGlas)" stroke="#7E5128" stroke-width="1.5"/>`
    + `<path d="M60 82L42 112V150L92 82ZM120 82L42 210V236L138 82Z" fill="#fff" opacity=".45"/>`
    + `<path d="M42 300C70 280 110 290 150 270L174 262V374H42Z" fill="#F3C98A" opacity=".35"/>`
    + `<rect x="105" y="82" width="7" height="292" fill="url(#rwHolz)" stroke="#7E5128" stroke-width="1"/><rect x="42" y="218" width="132" height="7" fill="url(#rwHolz)" stroke="#7E5128" stroke-width="1"/>`
    + `<path d="M8 386H226L234 402H2Z" fill="url(#rwBrett)" stroke="#8A5A2B" stroke-width="1.5" stroke-linejoin="round"/><rect x="2" y="402" width="232" height="15" fill="#A8783F" stroke="#7E5128" stroke-width="1.5"/>`
    + `<path d="M0 417H214V436C150 430 60 432 0 438Z" fill="#B49770" opacity=".55"/>`;
  // Seitenzweige am Anfang (oben/unten): zweigen sichtbar vom langen Ast ab
  const zOben = zweig('oben', [302, 403], ast([[302, 403, 8], [298, 365, 5.5], [288, 326, 3.8], [292, 290, 2.4], [304, 262, 1.4]])
    + zweigBlaetter([[292, 342, 200], [286, 306, -20], [296, 276, 210], [304, 262, -60]], 31));
  const zUnten = zweig('unten', [320, 404], ast([[320, 404, 8], [318, 446, 5.5], [310, 490, 3.8], [300, 528, 2.4], [292, 556, 1.4]])
    + zweigBlaetter([[316, 492, 20], [304, 516, 170], [294, 550, 30]], 32));
  // Zweig zum Vogelhaus (unten), Vogelhaus hängt an einer Schnur
  const zHaus = zweig('haus', [520, 380], ast([[520, 380, 10], [540, 412, 7], [568, 442, 5], [600, 460, 3.2]])
    + `<path d="M600 460V488" stroke="#7A5A3A" stroke-width="2"/>`
    + `<g transform="translate(600 488)"><path d="M-34 8L0 -14L34 8Z" fill="#D2503E" stroke="#8E2A1E" stroke-width="2" stroke-linejoin="round"/><rect x="-26" y="8" width="52" height="50" rx="3" fill="#DDA45F" stroke="#8A5A2B" stroke-width="2"/><circle cx="0" cy="30" r="9" fill="#3A2210"/><rect x="-2" y="44" width="4" height="12" fill="#8A5A2B"/><path d="M-26 20H26" stroke="#B9824A" stroke-width="1.2"/></g>`
    + zweigBlaetter([[528, 400, 120], [582, 452, -30]], 33));
  // gerader dünner Zweig (links oben) – kein V
  const zGerade = zweig('gerade', [598, 358], ast([[598, 358, 8], [572, 320, 5.2], [546, 280, 3.6], [522, 240, 2.4], [506, 212, 1.4]])
    + zweigBlaetter([[566, 308, 150], [536, 262, -40], [514, 226, 220], [506, 212, -60]], 34));
  // V-Zweig mit dem Nest
  // V: kurzer Stiel, Gabel gut sichtbar unter dem Nest, die Arme halten das Nest links und rechts
  const vStiel = ast([[700, 349, 10], [716, 322, 8], [733, 300, 7]]);
  const vArme = ast([[733, 300, 6.5], [716, 262, 4.6], [702, 222, 3], [694, 186, 1.6]]) + ast([[733, 300, 6.5], [756, 262, 4.6], [782, 224, 3], [800, 190, 1.6]])
    + zweigBlaetter([[694, 190, 230], [800, 194, -50], [708, 206, 160], [790, 210, 20]], 36);
  const nest = `<g id="rw-nest" transform="translate(744 238) scale(.88) translate(-742 -228)"><ellipse cx="742" cy="240" rx="56" ry="10" fill="#2A1A08" opacity=".2"/>`
    + `<path d="M688 210C690 236 712 252 742 252S794 236 796 210Z" fill="url(#rwNest)"/>`
    + `<g fill="none" stroke-linecap="round" stroke-width="2"><path d="M692 218C712 230 772 232 792 218" stroke="#C99A5E"/><path d="M698 230C716 242 768 242 786 230" stroke="#9A6A36"/><path d="M694 214C716 232 748 246 776 242" stroke="#6B4320"/><path d="M790 214C768 230 736 244 708 242" stroke="#6B4320"/></g>`
    + `<ellipse cx="742" cy="209" rx="55" ry="11" fill="#7A4E26"/><ellipse cx="742" cy="209" rx="55" ry="11" fill="none" stroke="#C99A5E" stroke-width="2" stroke-dasharray="7 5"/><ellipse cx="742" cy="210" rx="43" ry="6.5" fill="#3B230E"/>`
    + `<g class="rw-glanz" transform="translate(726 205)"><path d="M0-8L1.6-1.6L8 0L1.6 1.6L0 8L-1.6 1.6L-8 0L-1.6-1.6Z" fill="#fff"/></g></g>`;
  // langer Ast: vom Stamm bis zur dünnen Spitze auf dem Fensterbrett
  const langerAst = ast([[812, 352, 36], [740, 349, 27], [660, 351, 20], [580, 362, 15], [505, 382, 11.5], [440, 395, 9], [370, 402, 7], [300, 404, 5], [240, 401, 3], [206, 398, 1.6]], 'rw-ast');
  const spitzeBlaetter = zweigBlaetter([[230, 398, 150], [214, 396, 200], [250, 404, 40], [268, 400, 140], [676, 360, 95], [724, 345, -85], [764, 364, 110], [470, 396, 120]], 35, ['#73B652', '#8CC65E', '#5FA444']);
  // Laub um den Stamm und oben (vor dem oberen Ast), unten rechts ein Busch
  const krone = laub(690, 60, 190, 90, 110, 41) + laub(400, 40, 170, 70, 80, 42) + laub(870, 120, 90, 120, 60, 43) + laub(880, 560, 120, 70, 50, 44) + laub(640, 160, 70, 40, 30, 45);
  // Laub hinter dem Nest (die Arme verschwinden darin)
  const nestLaub = laub(748, 150, 76, 30, 34, 46);
  return `<svg class="rw-szene" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}${himmel}${fern}${hinten}${obenAst}${stamm}${krone}${nestLaub}${wand}${vArme}${nest}${zOben}${zUnten}${zHaus}${zGerade}${vStiel}${langerAst}${spitzeBlaetter}</svg>`;
}
/** Vordere Ebene: das große Blatt über dem langen Ast und Laub vor dem Nest (geht am Ende auf) */
export function szeneVorne(): string {
  const grossesBlatt = `<g id="rw-blatt" transform="translate(66 -4)"><path d="M428 390C410 368 372 362 338 372C312 380 298 396 294 412C318 422 352 426 382 418C408 411 424 402 428 390Z" fill="#7BBE4E" stroke="#3F7A2A" stroke-width="2"/>`
    + `<path d="M426 391C392 396 340 404 298 411" fill="none" stroke="#3F7A2A" stroke-width="2"/><g fill="none" stroke="#3F7A2A" stroke-width="1.3" opacity=".8"><path d="M400 394L392 376M374 398L362 378M348 402L336 384M400 394L392 410M374 398L364 416M348 402L338 418"/></g>`
    + `<path d="M330 380C350 372 380 372 402 380" fill="none" stroke="#C3E88E" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M428 390L440 382" stroke="#3F7A2A" stroke-width="3" stroke-linecap="round"/></g>`;
  const vorNest = `<g class="rw-vornest">${laub(712, 236, 26, 16, 16, 51, ['#5FA444', '#73B652', '#8CC65E'], '#56983E')}${laub(786, 232, 22, 14, 14, 52, ['#5FA444', '#73B652', '#8CC65E'], '#56983E')}</g>`;
  const rand = laub(900, 600, 110, 70, 30, 53) + laub(0, 600, 40, 30, 8, 54);
  return `<svg class="rw-vorne" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grossesBlatt}${vorNest}${rand}</svg>`;
}
