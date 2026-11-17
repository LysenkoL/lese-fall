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
  ...import.meta.glob('../gen/frei/raupe_{isst,goldlupe}.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;
const HAUS_BILD = KOMMT['../../../assets/illustrationen/raupenhaus.webp'];
const ISST = KOMMT['../gen/frei/raupe_isst.webp'];
const GOLDLUPE = KOMMT['../gen/frei/raupe_goldlupe.webp'];
/** Bild „Raupe hält die goldene Lupe“ (auch für das Geschenk im Finale) oder null */
export const goldlupeBild = (): string | null => GOLDLUPE ?? null;

export const DINGE: { id: string; ab: number }[] = [
  { id: 'fliege', ab: 6 }, { id: 'schal', ab: 12 }, { id: 'brille', ab: 18 }, { id: 'notizbuch', ab: 24 },
  { id: 'taschenlampe', ab: 30 }, { id: 'hut', ab: 36 }, { id: 'mondbrosche', ab: 42 }, { id: 'tasche', ab: 48 },
];
/** Sachen, die bei dieser Perlenzahl frei sind (die Lupe zählt extra, siehe `lupeFrei`) */
export const freiBei = (p: number) => DINGE.filter((d) => p >= d.ab).map((d) => d.id);

/** goldene Tautropfen-Lupe (Ring aus Grashalm, Glas wie ein Tropfen), gezeichnet */
export const LUPE_SVG = `<svg class="glupe" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="glg" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".45" stop-color="#FFF1B8" stop-opacity=".75"/><stop offset="1" stop-color="#F4C243" stop-opacity=".55"/></radialGradient><linearGradient id="glr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE082"/><stop offset=".5" stop-color="#F0B62E"/><stop offset="1" stop-color="#B8851A"/></linearGradient></defs><path d="M39 41 L56 58" stroke="#8A5A10" stroke-width="9" stroke-linecap="round"/><path d="M39 41 L56 58" stroke="url(#glr)" stroke-width="6" stroke-linecap="round"/><circle cx="26" cy="26" r="19" fill="url(#glg)" stroke="url(#glr)" stroke-width="6"/><path d="M15 20 Q19 12 27 11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/></svg>`;

const FUTTER: Record<string, string> = {
  blatt: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 40 C6 20 20 6 42 6 C42 28 28 42 8 40Z" fill="#7FC24E" stroke="#3F7A24" stroke-width="2.500" stroke-linejoin="round"/><path d="M8 40 C18 30 26 20 36 12" stroke="#3F7A24" stroke-width="2.500" fill="none" stroke-linecap="round"/></svg>',
  apfel: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 14 C16 8 6 12 7 24 C8 36 16 44 24 41 C32 44 40 36 41 24 C42 12 32 8 24 14Z" fill="#E8473A" stroke="#9E2A20" stroke-width="2.500" stroke-linejoin="round"/><path d="M24 14 C24 9 26 6 28 4" stroke="#6E4520" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 9 C32 4 38 6 38 8 C34 11 30 11 27 9Z" fill="#7FC24E" stroke="#3F7A24" stroke-width="1.500"/><ellipse cx="15" cy="21" rx="3" ry="5" fill="#fff" opacity=".45"/></svg>',
  erdbeere: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 16 C10 30 18 42 24 44 C30 42 38 30 38 16 C30 12 18 12 10 16Z" fill="#E8473A" stroke="#9E2A20" stroke-width="2.500" stroke-linejoin="round"/><path d="M12 15 L18 8 L22 13 L26 6 L30 13 L35 8 L36 15 C28 18 20 18 12 15Z" fill="#7FC24E" stroke="#3F7A24" stroke-width="2" stroke-linejoin="round"/><g fill="#FFE9A6"><circle cx="18" cy="23" r="1.300"/><circle cx="27" cy="22" r="1.300"/><circle cx="22" cy="30" r="1.300"/><circle cx="31" cy="29" r="1.300"/><circle cx="20" cy="37" r="1.300"/><circle cx="27" cy="36" r="1.300"/></g></svg>',
  eis: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 22 L24 46 L34 22Z" fill="#E0A458" stroke="#8A5A2B" stroke-width="2.500" stroke-linejoin="round"/><path d="M17 26 L31 26 M19 31 L29 31 M21 36 L27 36" stroke="#8A5A2B" stroke-width="1.500"/><circle cx="24" cy="15" r="11" fill="#FFC6D9" stroke="#C25B85" stroke-width="2.500"/><circle cx="20" cy="11" r="3" fill="#fff" opacity=".6"/></svg>',
};
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
  if (id === 'lupe') return GOLDLUPE ? `<span class="rms"><img src="${GOLDLUPE}" alt=""></span>` : `<span class="rms mitlupe"><img src="${fig('raupe/lob')}" alt="">${LUPE_SVG}</span>`;
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
