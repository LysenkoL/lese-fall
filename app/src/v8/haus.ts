/**
 * Haus der Lese-Raupe (nach der Entscheidung der Besitzerin, 17.11.2026):
 * füttern und anziehen, alles ohne Bezahlen. Perlen werden nie ausgegeben — sie schalten Sachen frei
 * (alle 6 Perlen eine Sache, also etwa alle 3 Spuren). Die goldene Lupe gibt es nur für den gelösten Fall.
 * Die Raupe wird nie hungrig, krank oder traurig; nichts geht verloren, nichts drängt.
 */
import { img } from '../data';
import { weniger } from './effekte.ts';

/** Bilder, die die Besitzerin noch erzeugt (02_design/PROMPT_RAUPENHAUS.md). Fehlen sie, gilt der gezeichnete Ersatz. */
const KOMMT = {
  ...import.meta.glob('../../../assets/illustrationen/raupenhaus.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../gen/frei/raupe_{isst,schlaeft,lupe}.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;
const HAUS_BILD = KOMMT['../../../assets/illustrationen/raupenhaus.webp'];
const ISST = KOMMT['../gen/frei/raupe_isst.webp'];
const SCHLAEFT = KOMMT['../gen/frei/raupe_schlaeft.webp'];
const MIT_LUPE = KOMMT['../gen/frei/raupe_lupe.webp'];
/** Raupe schläft (Epilog) und Raupe hält die goldene Lupe – oder null, solange die Bilder fehlen */
export const schlaeftBild = (): string | null => SCHLAEFT ?? null;
export const mitLupeBild = (): string | null => MIT_LUPE ?? null;

export const DINGE: { id: string; ab: number }[] = [
  { id: 'fliege', ab: 6 }, { id: 'schal', ab: 12 }, { id: 'brille', ab: 18 }, { id: 'notizbuch', ab: 24 },
  { id: 'taschenlampe', ab: 30 }, { id: 'hut', ab: 36 }, { id: 'mondbrosche', ab: 42 }, { id: 'tasche', ab: 48 },
];
/** Sachen, die bei dieser Perlenzahl frei sind (die Lupe zählt extra, siehe `lupeFrei`) */
export const freiBei = (p: number) => DINGE.filter((d) => p >= d.ab).map((d) => d.id);

/** goldene Tautropfen-Lupe: das fertige Bild aus objekte/ (geflochtener Goldring, Glas wie ein Tropfen) */
export const LUPE_SVG = `<img class="glupe" src="${img('objekte/goldene_lupe')}" alt="" draggable="false">`;

/** Essen: fertige Bilder (essen/<id>.webp, sonst objekte/), sonst sorgfältig gezeichnet (Licht von links oben, weicher Schatten) */
const ESSEN_BILD = import.meta.glob('../../../assets/illustrationen/essen/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const schatten = '<ellipse cx="32" cy="58" rx="17" ry="3.2" fill="#3A2A10" opacity=".13"/>';
const GEZEICHNET: Record<string, string> = {
  blatt: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="eb1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4E9A2C"/><stop offset=".55" stop-color="#86C653"/><stop offset="1" stop-color="#B9E28A"/></linearGradient></defs>${schatten}<path d="M12 52 C6 30 20 10 52 8 C55 34 40 52 12 52Z" fill="url(#eb1)" stroke="#3D7A22" stroke-width="2" stroke-linejoin="round"/><path d="M12 52 C22 40 34 26 47 13" stroke="#3D7A22" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M22 41 L18 30 M28 34 L25 22 M34 27 L33 17 M27 37 L38 34 M33 30 L44 26 M39 22 L48 19" stroke="#3D7A22" stroke-width="1.300" fill="none" stroke-linecap="round" opacity=".7"/><path d="M8 56 C9 53 11 52 12 52" stroke="#3D7A22" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M20 20 C26 14 34 11 42 10" stroke="#fff" stroke-width="2.400" stroke-linecap="round" fill="none" opacity=".45"/><circle cx="40" cy="35" r="2.300" fill="#E9F6FF" stroke="#9CC6E6" stroke-width=".8" opacity=".9"/></svg>`,
  apfel: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="ea1" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".45" stop-color="#E8473A"/><stop offset="1" stop-color="#A9271D"/></radialGradient></defs>${schatten}<path d="M32 19 C22 11 8 16 9 32 C10 47 21 57 32 53 C43 57 54 47 55 32 C56 16 42 11 32 19Z" fill="url(#ea1)" stroke="#8E2018" stroke-width="2" stroke-linejoin="round"/><path d="M32 20 C31 14 33 9 36 6" stroke="#6E4520" stroke-width="3.200" fill="none" stroke-linecap="round"/><path d="M35 11 C40 4 50 5 51 8 C46 13 40 13 35 11Z" fill="#86C653" stroke="#3D7A22" stroke-width="1.600" stroke-linejoin="round"/><path d="M37 10 C42 8 46 8 49 8" stroke="#3D7A22" stroke-width="1" fill="none" opacity=".7"/><ellipse cx="19" cy="28" rx="4" ry="7" transform="rotate(20 19 28)" fill="#fff" opacity=".55"/><circle cx="23" cy="20" r="1.800" fill="#fff" opacity=".6"/></svg>`,
  erdbeere: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="ee1" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FF7A6A"/><stop offset=".5" stop-color="#E5352E"/><stop offset="1" stop-color="#A11E1A"/></radialGradient></defs>${schatten}<path d="M12 22 C10 38 22 54 32 57 C42 54 54 38 52 22 C42 16 22 16 12 22Z" fill="url(#ee1)" stroke="#8E1C17" stroke-width="2" stroke-linejoin="round"/><g fill="#FFE59A" stroke="#C9951A" stroke-width=".6"><ellipse cx="21" cy="29" rx="1.300" ry="2"/><ellipse cx="31" cy="27" rx="1.300" ry="2"/><ellipse cx="41" cy="29" rx="1.300" ry="2"/><ellipse cx="26" cy="37" rx="1.300" ry="2"/><ellipse cx="36" cy="37" rx="1.300" ry="2"/><ellipse cx="45" cy="36" rx="1.300" ry="2"/><ellipse cx="19" cy="38" rx="1.300" ry="2"/><ellipse cx="31" cy="45" rx="1.300" ry="2"/><ellipse cx="40" cy="45" rx="1.300" ry="2"/><ellipse cx="24" cy="46" rx="1.300" ry="2"/></g><path d="M14 21 L20 12 L25 19 L32 9 L39 19 L44 12 L50 21 C40 26 24 26 14 21Z" fill="#6DB33F" stroke="#3D7A22" stroke-width="1.800" stroke-linejoin="round"/><path d="M32 12 C32 8 33 5 35 3" stroke="#3D7A22" stroke-width="2.600" fill="none" stroke-linecap="round"/><ellipse cx="20" cy="30" rx="3" ry="6" transform="rotate(25 20 30)" fill="#fff" opacity=".4"/></svg>`,
  eis: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ei1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2C27A"/><stop offset="1" stop-color="#C98A3E"/></linearGradient><radialGradient id="ei2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFE6EF"/><stop offset=".55" stop-color="#FFB3CB"/><stop offset="1" stop-color="#E5779C"/></radialGradient><radialGradient id="ei3" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".6" stop-color="#FFE59A"/><stop offset="1" stop-color="#E7BE55"/></radialGradient></defs>${schatten}<path d="M19 33 L32 60 L45 33Z" fill="url(#ei1)" stroke="#8A5A2B" stroke-width="2" stroke-linejoin="round"/><path d="M22 39 L40 37 M25 45 L37 44 M28 51 L35 50 M24 35 L35 56 M33 35 L40 42 M28 35 L37 52" stroke="#8A5A2B" stroke-width="1.100" opacity=".55"/><circle cx="25" cy="26" r="10.500" fill="url(#ei3)" stroke="#C99A2E" stroke-width="1.800"/><circle cx="39" cy="26" r="10.500" fill="url(#ei2)" stroke="#C25B85" stroke-width="1.800"/><path d="M15 31 C18 36 24 35 27 33 C31 37 35 37 39 34 C43 36 47 35 49 31" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".6"/><circle cx="32" cy="13" r="4.200" fill="#D8352E" stroke="#8E1C17" stroke-width="1.400"/><path d="M32 9 C33 6 35 4 37 3" stroke="#3D7A22" stroke-width="1.600" fill="none" stroke-linecap="round"/><circle cx="31" cy="12" r="1.200" fill="#fff" opacity=".7"/><circle cx="21" cy="22" r="2.400" fill="#fff" opacity=".7"/><circle cx="35" cy="22" r="2.400" fill="#fff" opacity=".7"/></svg>`,
};
/** Reihenfolge im Haus; Keks und Käse gibt es schon als Bilder aus dem Buch */
const FUTTER: Record<string, string> = Object.fromEntries(['blatt', 'apfel', 'erdbeere', 'keks', 'kaese', 'eis'].map((id) => {
  const datei = ESSEN_BILD[`../../../assets/illustrationen/essen/${id}.webp`] ?? (id === 'keks' ? img('objekte/raetsel_keks') : id === 'kaese' ? img('objekte/raetsel_kaese') : '');
  return [id, datei ? `<img class="e-${id}" src="${datei}" alt="" draggable="false">` : GEZEICHNET[id]];
}));
const FUTTER_IDS = Object.keys(FUTTER);

export interface HausCtx {
  ueber: HTMLElement;
  UI: Record<string, string>;
  fig: (n: string) => string;
  perlen: () => number;
  /** Lupe frei (Fall gelöst)? */
  lupe: () => boolean;
  traegt: () => string;
  setzeTraegt: (id: string) => void;
  summ: (ms: number | number[]) => void;
  /** nach dem Schließen (z. B. neu zeichnen) */
  zu?: () => void;
}

/** Bild der Raupe mit der Sache, die sie gerade trägt (Lupe: Lob-Bild + gezeichnete Lupe) */
export function raupeMitSache(id: string, fig: (n: string) => string, pose = 'lacht'): string {
  if (id && id !== 'lupe' && DINGE.some((d) => d.id === id)) return `<span class="rms"><img src="${img('garderobe/raupe_' + id)}" alt=""></span>`;
  if (id === 'lupe') return MIT_LUPE ? `<span class="rms"><img src="${MIT_LUPE}" alt=""></span>` : `<span class="rms mitlupe"><img src="${fig('raupe/lob')}" alt="">${LUPE_SVG}</span>`;
  return `<span class="rms"><img src="${fig('raupe/' + pose)}" alt=""></span>`;
}

let sagtNr = 0;
export function zeigeHaus(c: HausCtx): void {
  const { ueber, UI } = c;
  const gegessen = new Set<string>();
  let ziehNr = 0;
  const label = (id: string) => UI['d_' + id] ?? id;
  const malen = (spruch: string) => {
    const p = c.perlen(), frei = freiBei(p), tr = c.traegt();
    const sachen = [
      `<button class="h-sache${!tr ? ' an' : ''}" data-s=""><span class="h-bild h-ohne" aria-hidden="true"></span><b>${UI.ohneSachen}</b></button>`,
      ...(c.lupe() ? [`<button class="h-sache gold${tr === 'lupe' ? ' an' : ''}" data-s="lupe"><span class="h-bild">${LUPE_SVG}</span><b>${label('lupe')}</b></button>`] : []),
      ...DINGE.map((d) => frei.includes(d.id)
        ? `<button class="h-sache${tr === d.id ? ' an' : ''}" data-s="${d.id}"><span class="h-bild"><img src="${img('garderobe/' + d.id)}" alt=""></span><b>${label(d.id)}</b></button>`
        : `<div class="h-sache zu" aria-label="${d.id}"><span class="h-bild"><img src="${img('garderobe/' + d.id)}" alt=""></span><b>${UI.abWort} ${d.ab} ${UI.perlenWort}</b></div>`),
    ].join('');
    ueber.innerHTML = `<div class="schl mitte"><section class="haus" role="dialog" aria-label="Haus"><header><b>${UI.haus}</b><button class="kb" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg></button></header>
<div class="h-buehne${HAUS_BILD ? ' mitbild' : ''}"${HAUS_BILD ? ` style="background-image:url(${HAUS_BILD})"` : ''}><div class="h-raupe">${raupeMitSache(tr, c.fig)}</div><p class="h-blase">${spruch}</p></div>
<p class="h-perl"><span class="perle" aria-hidden="true"></span><span>${UI.duHast} <b>${p}</b> ${UI.perlen}</span></p>
<h4>${UI.futter}</h4><div class="h-futter">${FUTTER_IDS.map((f) => `<button class="h-essen" data-f="${f}" aria-label="${f}">${FUTTER[f]}</button>`).join('')}</div>
<h4>${UI.anziehen}</h4><div class="h-sachen">${sachen}</div></section></div>`;
  };
  const sag = (t: string) => { const b = ueber.querySelector<HTMLElement>('.h-blase'); if (!b) return; b.innerHTML = t; b.classList.remove('neu'); void b.offsetWidth; b.classList.add('neu'); };
  const mampf = () => {
    const r = ueber.querySelector<HTMLElement>('.h-raupe');
    if (!r) return;
    const bild = r.querySelector<HTMLImageElement>('img');
    if (ISST && bild && !c.traegt()) { const alt = bild.src; bild.src = ISST; setTimeout(() => { if (bild.isConnected) bild.src = alt; }, 1400); }
    r.classList.remove('mampf'); void r.offsetWidth; r.classList.add('mampf');
  };
  malen(UI.hausHallo);
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) { ueber.innerHTML = ''; ueber.onclick = null; c.zu?.(); return; }
    const f = t.closest<HTMLElement>('.h-essen');
    if (f) {
      const id = f.dataset.f!;
      // Essen fliegt zur Raupe, sie kaut und freut sich
      const ziel = ueber.querySelector<HTMLElement>('.h-raupe');
      if (ziel && !weniger()) {
        const a = f.getBoundingClientRect(), z = ziel.getBoundingClientRect();
        const flug = f.firstElementChild!.cloneNode(true) as SVGElement;
        flug.classList.add('h-flug');
        flug.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
        document.body.appendChild(flug);
        const an = flug.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${z.left + z.width / 2 - a.left - a.width / 2}px, ${z.top + z.height * 0.45 - a.top - a.height / 2}px) scale(.35)`, opacity: .2 }], { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)' });
        an.onfinish = () => flug.remove();
        setTimeout(() => { mampf(); herzchen(ziel); }, 420);
      } else mampf();
      c.summ(20);
      const erst = !gegessen.has(id);
      gegessen.add(id);
      sag(erst ? UI['iss_' + id] : UI['sagt' + ((sagtNr++ % 8) + 1)]);
      return;
    }
    const s = t.closest<HTMLElement>('button.h-sache');
    if (s) {
      const id = s.dataset.s ?? '';
      c.setzeTraegt(id);
      c.summ(15);
      malen(!id ? UI.ziehOhne : id === 'lupe' ? UI.ziehLupe : UI['zieh' + ((ziehNr++ % 2) + 1)]);
      const r = ueber.querySelector<HTMLElement>('.h-raupe');
      r?.classList.add('zieht');
    }
  };
}

/** kleiner Hinweis „Neu im Haus der Lese-Raupe: …“ – blockiert nichts, verschwindet von selbst; Tippen öffnet das Haus */
export function neuHinweis(app: HTMLElement, UI: Record<string, string>, id: string, oeffne: () => void): void {
  app.querySelector('.neuhaus')?.remove();
  const el = document.createElement('button');
  el.className = 'neuhaus';
  el.innerHTML = `<img src="${img('garderobe/' + id)}" alt=""><span class="nh-t"><small>${UI.neuImHaus}</small><b>${UI['d_' + id] ?? id}</b></span>`;
  app.appendChild(el);
  const weg = () => { el.classList.add('weg'); setTimeout(() => el.remove(), 400); };
  el.onclick = () => { weg(); oeffne(); };
  setTimeout(weg, 4500);
}

/** Konfetti aus Perlen und Goldpapier (keine Sterne: Sterne sind im Buch Indizien) */
export function konfetti(host: HTMLElement): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'konfetti';
  fx.setAttribute('aria-hidden', 'true');
  const farben = ['#F4C243', '#FFE9A6', '#FFFFFF', '#7FC24E', '#E8473A', '#8FB4FF'];
  fx.innerHTML = [...Array(46)].map((_, i) => {
    const x = (i * 37) % 100, d = 1.6 + ((i * 13) % 10) / 10, v = (i % 7) * 0.09, rund = i % 3 === 0;
    return `<i style="left:${x}%;background:${rund ? 'var(--perle)' : farben[i % farben.length]};--d:${d}s;--v:${v}s;--r:${(i * 61) % 360}deg;--x:${((i * 29) % 60) - 30}px" class="${rund ? 'rund' : ''}"></i>`;
  }).join('');
  void host; document.body.appendChild(fx);
  setTimeout(() => fx.remove(), 3600);
}

/** Feuerwerk: Kreise aus Funken, die nacheinander aufgehen (Kreise, keine Sterne). `n` Raketen, `oben` = Anteil der Höhe */
export function feuerwerk(host: HTMLElement, n = 6, oben = 0.45): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'feuerwerk';
  fx.setAttribute('aria-hidden', 'true');
  const farben = [['#FFE082', '#F4C243'], ['#FFFFFF', '#C9D3F2'], ['#9FE07A', '#7FC24E'], ['#FF9A8C', '#E8473A'], ['#A9C4FF', '#5F86E8']];
  let html = '';
  for (let k = 0; k < n; k++) {
    const x = 12 + ((k * 41) % 76), y = 8 + ((k * 23) % Math.round(oben * 100)), v = k * 0.42, [c1, c2] = farben[k % farben.length];
    html += `<span class="fw" style="left:${x}%;top:${y}%;--v:${v}s">`;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, d = 46 + (k % 3) * 14;
      html += `<i style="--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;background:${i % 2 ? c1 : c2}"></i>`;
    }
    html += '</span>';
  }
  fx.innerHTML = html;
  void host; document.body.appendChild(fx);
  setTimeout(() => fx.remove(), (n * 0.42 + 2) * 1000);
}

/** kleine Herzchen über der Raupe, wenn sie gefüttert wird */
export function herzchen(host: HTMLElement): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'herzchen';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = [0, 1, 2].map((i) => `<i style="--v:${i * 0.15}s;--x:${(i - 1) * 22}px"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z" fill="#FF8FA8" stroke="#D2557A" stroke-width="1.500"/></svg></i>`).join('');
  host.appendChild(fx);
  setTimeout(() => fx.remove(), 1600);
}
