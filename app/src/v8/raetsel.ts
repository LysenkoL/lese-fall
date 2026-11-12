/**
 * Die Rätsel der Kapitel 1 und 2. Jede Funktion bekommt (rahmen, daten, fertig):
 *   rahmen = der dunkle Rahmen (.zug) mit .zi (Spielfläche) und .zr (Sprechblase der Lese-Raupe),
 *   daten  = das Rätsel aus den Daten (Texte schon als HTML mit Silben),
 *   fertig = wird aufgerufen, wenn das Rätsel gelöst ist (die Raupe hat dann schon `erfolg` gesagt).
 * Regel überall: nach dem 1. Fehler Wackeln + `ui.nochmal`; nach dem 2. Fehler zeigt die Raupe die Lösung (`ui.hilfe`).
 */
import { pulliSvg, versteckterBuchstabe } from './zeichnen.ts';
import { staub as _staub } from './staub.ts';
void _staub;

export interface Kontext {
  UI: Record<string, string>;
  img: (n: string) => string;
  fig: (n: string) => string;
  fuss: HTMLElement;
  summ: (ms: number | number[]) => void;
  mischen: (ids: string[]) => string[];
  /** Name eines eigenen Staubs auf einer Fläche (siehe staub.ts) */
  staub: (box: HTMLElement, fertig: () => void) => () => void;
}
let K: Kontext;
export const init = (k: Kontext) => { K = k; };
/** Für Tests: löst das aktuelle Rätsel (oder die aktuelle Wisch-Fläche) sofort */
export const hook: { loese: (() => void) | null } = { loese: null };

type Daten = any;
const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode) => r.querySelector(s) as E;
const warte = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const wackel = (el: Element | null) => { if (!el) return; el.classList.remove('nein'); void (el as HTMLElement).offsetWidth; el.classList.add('nein'); setTimeout(() => el.classList.remove('nein'), 520); };

const rp = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${K.fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
function sag(r: HTMLElement, b: string, t: string, kl = '') {
  const z = $('.zr', r);
  z.innerHTML = t ? rp(b, t, kl) : '';
  if (t) requestAnimationFrame(() => z.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
}
const knopf = (a: string, t: string, dis = false) => `<button class="kn haupt" data-a="${a}" ${dis ? 'disabled' : ''}><span>${t}</span></button>`;
/** Knopf unten; ohne Inhalt bleibt ein unsichtbarer Platzhalter, damit nichts springt */
function unten(html: string, onA?: (a: string) => void) {
  K.fuss.innerHTML = `<div class="fz">${html || '<button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button>'}</div>`;
  K.fuss.onclick = (e) => { const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]'); if (a && !(a as HTMLButtonElement).disabled) onA?.(a.dataset.a!); };
}
function ende(r: HTMLElement, d: Daten, fertig: () => void, vor = '') {
  hook.loese = null;
  sag(r, 'lob', (vor ? vor + ' ' : '') + (d.erfolg ?? ''), 'gut');
  K.summ([20, 40, 60]);
  fertig();
}

/* ============================ 4.1 Buchstaben-Salat ============================ */
export function buchstaben(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  let k = 0, fertigRunde = false, versuche = 0, doch = 0;
  let felder: (number | null)[] = [];
  const DREH = [-7, 5, -3, 8, -6, 4, -9];
  const punkte = () => `<div class="pkt hell">${d.runden.map((_: any, i: number) => `<i class="${i === k ? 'an' : ''}"></i>`).join('')}</div>`;
  let ok = false, puls = false, hell: { leer: number[]; uebrig: number[] } = { leer: [], uebrig: [] };
  /** Die Raupe zeigt auf den Knopf „Die Buchstaben passen nicht“ */
  const zeigKnopf = () => { puls = true; zi.querySelector('.bsk')?.classList.add('puls'); sag(r, 'tipp', K.UI.passtFrage); };
  const tile = (rd: any, i: number, drin: boolean) => `<span class="bk${ok ? ' ok' : ''}${hell.uebrig.includes(i) ? ' uebrig' : ''}" style="--r:${drin ? 0 : DREH[i % 7]}deg" data-i="${i}">${rd.buchstaben[i]}</span>`;
  const mal = () => {
    const rd = d.runden[k];
    const lose = [...rd.buchstaben].map((_: string, i: number) => i).filter((i) => !felder.includes(i));
    zi.innerHTML = `${punkte()}<img class="bs-bild" src="${K.img(rd.bild)}" alt=""><div class="bs-felder">${felder.map((t, fi) => `<i class="feld${hell.leer.includes(fi) ? ' leer' : ''}" data-f="${fi}">${t === null ? '' : tile(rd, t, true)}</i>`).join('')}</div><div class="bs-lose">${lose.map((i) => tile(rd, i, false)).join('')}</div><div class="bs-knoepfe"><button class="bsk${puls && !fertigRunde ? ' puls' : ''}" data-a="gehtnicht" ${fertigRunde ? 'disabled' : ''}><img src="${K.fig('raupe/traurig')}" alt=""><span>${K.UI.gehtNicht}</span></button></div>`;
  };
  const runde = () => {
    const rd = d.runden[k];
    felder = [...rd.wort].map(() => null);
    fertigRunde = false; versuche = 0; doch = 0; ok = false; puls = false; hell = { leer: [], uebrig: [] };
    mal(); sag(r, 'tipp', ''); unten('');
    hook.loese = () => { if (!fertigRunde) rd.passt ? lege(false) : gehtNichtRichtig(); };
  };
  const abschluss = (text: string) => {
    fertigRunde = true; hook.loese = null; mal();
    if (k === d.runden.length - 1) return ende(r, d, fertig, text);
    sag(r, 'tipp', text);
    unten(knopf('weiter', K.UI.weiter), () => { k++; runde(); });
  };
  /** Zuordnung Buchstabe → Feld (der Reihe nach); ohne passendes Kärtchen bleibt das Feld leer */
  const zuordnung = (rd: any) => {
    const frei = new Set<number>([...rd.buchstaben].map((_: string, i: number) => i));
    const f = [...rd.wort].map((c: string) => { const i = [...frei].find((j) => rd.buchstaben[j] === c); if (i === undefined) return null; frei.delete(i); return i; });
    return { f, uebrig: [...frei] };
  };
  const lege = (mitHilfe: boolean) => {
    const rd = d.runden[k];
    felder = zuordnung(rd).f; ok = true; mal();
    abschluss([mitHilfe ? K.UI.hilfe : K.UI.stimmt, K.UI.wortPasst].join(' '));
  };
  const gehtNichtRichtig = () => {
    const rd = d.runden[k], z = zuordnung(rd);
    felder = z.f; hell = { leer: z.f.map((t, i) => (t === null ? i : -1)).filter((i) => i >= 0), uebrig: z.uebrig };
    abschluss([K.UI.stimmt, rd.warum ?? ''].join(' '));
  };
  const pruefe = () => {
    const rd = d.runden[k];
    if (fertigRunde || felder.some((t) => t === null)) return;
    if (felder.map((t) => rd.buchstaben[t!]).join('') === rd.wort) { ok = true; return abschluss([K.UI.stimmt, K.UI.wortPasst].join(' ')); }
    wackelFelder();
    const k0 = k;
    if (++versuche < 2) return rd.passt ? sag(r, 'tipp', K.UI.nochmal) : zeigKnopf();
    if (rd.passt) return setTimeout(() => k0 === k && zi.isConnected && lege(true), 600);
    sag(r, 'tipp', [K.UI.hilfe, rd.warum ?? ''].join(' '));
    setTimeout(() => k0 === k && zi.isConnected && gehtNichtRichtig2(), 600);
  };
  const gehtNichtRichtig2 = () => { const rd = d.runden[k], z = zuordnung(rd); felder = z.f; hell = { leer: z.f.map((t, i) => (t === null ? i : -1)).filter((i) => i >= 0), uebrig: z.uebrig }; abschluss([K.UI.hilfe, rd.warum ?? ''].join(' ')); };
  let pt = 0;
  const wackelFelder = () => zi.querySelectorAll('.feld').forEach((e) => wackel(e));
  const setze = (i: number, f: number) => {
    const von = felder.indexOf(i), alt = felder[f];
    felder[f] = i;
    if (von >= 0) felder[von] = alt;
    mal(); clearTimeout(pt); pt = window.setTimeout(pruefe, 250);
    // Alle Kärtchen liegen, aber ein Feld bleibt leer: Dann fehlt ein Buchstabe.
    if (felder.some((t) => t === null) && felder.filter((t) => t !== null).length === d.runden[k].buchstaben.length) zeigKnopf();
  };
  // Ziehen (Zeiger) oder Antippen
  let drag: { el: HTMLElement; i: number; x: number; y: number; bewegt: boolean } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    if (fertigRunde) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.bk');
    if (!el) return;
    drag = { el, i: +el.dataset.i!, x: e.clientX, y: e.clientY, bewegt: false };
    el.setPointerCapture(e.pointerId);
  });
  zi.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.bewegt && Math.hypot(dx, dy) > 8) { drag.bewegt = true; drag.el.classList.add('zieht'); }
    if (drag.bewegt) drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(4deg)`;
  });
  const ab = (e: PointerEvent) => {
    if (!drag) return;
    const { el, i, bewegt } = drag; drag = null;
    if (!bewegt) {
      if (e.type !== 'pointerup') return;
      const pos = felder.indexOf(i);
      if (pos >= 0) { felder[pos] = null; mal(); return; }
      const frei = felder.indexOf(null);
      if (frei >= 0) setze(i, frei);
      return;
    }
    el.classList.remove('zieht');
    const f = e.type === 'pointerup' ? (document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('feld')) as HTMLElement | undefined) : undefined;
    if (f) setze(i, +f.dataset.f!); else { el.style.transform = ''; mal(); }
  };
  zi.addEventListener('pointerup', ab); zi.addEventListener('pointercancel', ab);
  zi.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a="gehtnicht"]');
    if (!b || fertigRunde) return;
    const rd = d.runden[k];
    if (!rd.passt) return gehtNichtRichtig();
    wackel(b);
    if (++doch === 1) return sag(r, 'tipp', K.UI.dochGeht);
    lege(true);
  });
  runde();
}

/* ============================ 4.2 Was ist anders? ============================ */
export function unterschiede(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const dinge: any[] = d.dinge, gef = new Set<string>();
  let fehl = 0, fertigig = false;
  const pane = (art: 'vorhin' | 'jetzt') => `<figure class="ub" data-p="${art}"><span class="tab hell">${K.UI[art]}</span><div class="ub-bild" style="background-image:url(${K.img(d.basis)})">${dinge.filter((x) => x[art]).map((x) => `<img class="ding" data-d="${x.id}" src="${K.img(x.bild)}" alt="" style="left:${x.x}%;top:${x.y}%;width:${x.w}%">`).join('')}</div></figure>`;
  zi.innerHTML = `<p class="ub-zaehl"></p><div class="ub-paar">${pane('vorhin')}${pane('jetzt')}</div>`;
  const zaehl = () => { $('.ub-zaehl', zi).innerHTML = `<b>${gef.size} / ${dinge.length}</b> ${K.UI.gefunden}`; };
  zaehl();
  const seite = (x: any) => { const e = zi.querySelector<HTMLImageElement>(`img[data-d="${x.id}"]`); return e && e.naturalWidth ? e.naturalHeight / e.naturalWidth : 1; };
  const finde = (x: any, blink = false) => {
    gef.add(x.id);
    zi.querySelectorAll('.ub-bild').forEach((b) => b.insertAdjacentHTML('beforeend', `<i class="ring da${blink ? ' blink' : ''}" style="left:${x.x}%;top:${x.y}%"></i>`));
    zaehl();
    K.summ(20);
    if (gef.size === dinge.length && !fertigig) { fertigig = true; setTimeout(() => ende(r, d, fertig), 450); }
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.ub-bild');
    if (!b || fertigig) return;
    const rc = b.getBoundingClientRect(), tx = (e.clientX - rc.left) / rc.width, ty = (e.clientY - rc.top) / rc.width; // beides in Bildbreiten
    const treffer = dinge.find((x) => {
      if (gef.has(x.id)) return false;
      const hw = x.w / 200 + 0.04, hh = (x.w / 100) * seite(x) / 2 + 0.04;
      return Math.abs(tx - x.x / 100) <= hw && Math.abs(ty - (x.y / 100) * (2 / 3)) <= hh;
    });
    if (treffer) { fehl = 0; finde(treffer); sag(r, 'tipp', ''); return; }
    b.insertAdjacentHTML('beforeend', `<i class="ring miss" style="left:${((e.clientX - rc.left) / rc.width) * 100}%;top:${((e.clientY - rc.top) / rc.height) * 100}%"></i>`);
    setTimeout(() => b.querySelector('.ring.miss')?.remove(), 800);
    fehl++;
    const offen = dinge.filter((x) => !gef.has(x.id));
    if (fehl === 3) sag(r, 'tipp', offen[0].tipp);
    else if (fehl >= 6) { fehl = 0; sag(r, 'tipp', K.UI.hilfe); finde(offen[0], true); }
  };
  hook.loese = () => { dinge.filter((x) => !gef.has(x.id)).forEach((x) => finde(x)); };
  unten('');
}

/* ============================ 4.3 Im Wasser versteckt ============================ */
export function versteckt(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const id = 'vb' + Math.floor(Math.random() * 1e6);
  zi.innerHTML = `<div class="vb"><div class="vb-svg">${versteckterBuchstabe(d.buchstabe, d.winkel, d.farbe, id, false, d.stoerer ?? 0, d.muster)}</div><canvas class="vb-cv"></canvas></div><div class="vb-opts">${d.optionen.map((o: string) => `<button class="vb-o" data-o="${o}">${o}</button>`).join('')}</div>`;
  unten('');
  // Zusatz für die Hand: mit dem Finger über das Bild fahren zeichnet eine helle Spur (wird nicht geprüft)
  const cv = $<HTMLCanvasElement>('.vb-cv', zi), box = $('.vb', zi);
  const rc = box.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = Math.max(1, rc.width * dpr); cv.height = Math.max(1, rc.height * dpr);
  const g = cv.getContext('2d')!;
  g.scale(dpr, dpr);
  const striche: [number, number][][] = [];
  let aktiv = false;
  const mal = () => {
    g.clearRect(0, 0, rc.width, rc.height);
    g.globalAlpha = 0.5; g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    for (const s of striche) { g.moveTo(s[0][0], s[0][1]); for (const p of s.slice(1)) g.lineTo(p[0], p[1]); if (s.length === 1) g.lineTo(s[0][0] + 0.1, s[0][1]); }
    g.stroke();
  };
  const pt = (e: PointerEvent): [number, number] => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.addEventListener('pointerdown', (e) => { aktiv = true; cv.setPointerCapture(e.pointerId); striche.push([pt(e)]); mal(); });
  cv.addEventListener('pointermove', (e) => { if (aktiv) { striche[striche.length - 1].push(pt(e)); mal(); } });
  const los = () => { aktiv = false; };
  cv.addEventListener('pointerup', los); cv.addEventListener('pointercancel', los);
  let fehl = 0, aus = false;
  const zeigen = () => { $('.vb-svg', zi).innerHTML = versteckterBuchstabe(d.buchstabe, d.winkel, d.farbe, id, true, d.stoerer ?? 0, d.muster); cv.style.pointerEvents = 'none'; };
  const wahl = (o: string, btn: HTMLElement | null) => {
    if (aus) return;
    if (o === d.buchstabe) { aus = true; btn?.classList.add('an'); zeigen(); return ende(r, d, fertig); }
    wackel(btn);
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal);
    aus = true;
    zeigen();
    zi.querySelector(`[data-o="${d.buchstabe}"]`)?.classList.add('an');
    ende(r, d, fertig, K.UI.hilfe);
  };
  zi.onclick = (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.vb-o'); if (b) wahl(b.dataset.o!, b); };
  hook.loese = () => wahl(d.buchstabe, zi.querySelector(`[data-o="${d.buchstabe}"]`));
}

/* ============================ Stempel (Merkmale, Ausschluss, Fallkarte) ============================ */
/** Stempel zum Ziehen auf `ziel` oder per Knopf „Stempeln“. Gibt eine Funktion zurück, die sofort stempelt. */
export function stempeln(zi: HTMLElement, ziel: HTMLElement, text: string, fertig: () => void): () => void {
  const tool = document.createElement('div');
  tool.className = 'stp-tool';
  tool.setAttribute('aria-label', K.UI.stempeln.replace(/<[^>]*>/g, ''));
  tool.innerHTML = `<span class="griff"></span><span class="basis">${text}</span>`;
  zi.appendChild(tool);
  let gemacht = false;
  const stemple = () => {
    if (gemacht) return;
    gemacht = true;
    tool.remove();
    ziel.classList.add('stempelziel');
    ziel.insertAdjacentHTML('beforeend', `<b class="stempel abdruck">${text}</b>`);
    try { navigator.vibrate?.(40); } catch { /* egal */ }
    fertig();
  };
  let x0 = 0, y0 = 0, zieht = false;
  tool.addEventListener('pointerdown', (e) => { zieht = true; x0 = e.clientX; y0 = e.clientY; tool.setPointerCapture(e.pointerId); tool.classList.add('zieht'); });
  tool.addEventListener('pointermove', (e) => { if (zieht) tool.style.transform = `translate(${e.clientX - x0}px, ${e.clientY - y0}px)`; });
  const los = (e: PointerEvent) => {
    if (!zieht) return;
    zieht = false; tool.classList.remove('zieht');
    const t = tool.getBoundingClientRect(), z = ziel.getBoundingClientRect();
    const mx = t.left + t.width / 2, my = t.top + t.height / 2;
    if (e.type === 'pointerup' && mx > z.left && mx < z.right && my > z.top && my < z.bottom) stemple();
    else tool.style.transform = '';
  };
  tool.addEventListener('pointerup', los); tool.addEventListener('pointercancel', los);
  unten(knopf('stempeln', K.UI.stempeln), () => { stemple(); });
  return stemple;
}

/* ============================ 4.4 Ist das Milas Mond? ============================ */
export function merkmale(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  let seite: 'vorne' | 'hinten' = 'vorne', dreht = false, m = 0, fehl = 0, zu = false;
  const erl: { text: string; wert: string }[] = [];
  const wertText = (w: string) => (w === 'passt' ? K.UI.mPasst : K.UI.mFehlt);

  const pruefen = () => {
    zi.innerHTML = `<div class="mm-kopf"><div class="mm-box"><img class="mm-ding" src="${K.img(d[seite])}" alt=""></div><button class="kn zwei mm-dreh" data-a="dreh"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.300M20 12a8 8 0 0 1-14 5.300" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><path d="M18.500 3v4.500H14M5.500 21v-4.500H10" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${K.UI.umdrehen}</span></button></div><div class="mm-slot"></div><ul class="mm-erl"></ul>`;
    unten('');
    karte();
    const box = $('.mm-box', zi);
    let sx = 0, st = false;
    box.addEventListener('pointerdown', (e) => { sx = e.clientX; st = true; });
    box.addEventListener('pointerup', (e) => { if (st && Math.abs(e.clientX - sx) > 40) drehen(); st = false; });
    box.addEventListener('pointercancel', () => { st = false; });
    hook.loese = () => { m = d.merkmale.length; zu = true; stempelPhase(); };
  };
  const karte = () => {
    const mk = d.merkmale[m];
    $('.mm-erl', zi).innerHTML = erl.map((x) => `<li><span>${x.text}</span><b>${wertText(x.wert)}</b></li>`).join('');
    $('.mm-slot', zi).innerHTML = mk ? `<div class="mm-m"><p>${mk.text}</p><div class="mm-wahl"><button data-w="passt"><span>${K.UI.mPasst}</span></button><button data-w="fehlt"><span>${K.UI.mFehlt}</span></button><button data-w="unklar"><span>${K.UI.mUnklar}</span></button></div></div>` : '';
  };
  const drehen = (zurueck?: () => void) => {
    if (dreht) return;
    dreht = true;
    const box = $('.mm-box', zi);
    box.classList.add('dreh1');
    setTimeout(() => {
      seite = seite === 'vorne' ? 'hinten' : 'vorne';
      $<HTMLImageElement>('.mm-ding', zi).src = K.img(d[seite]);
      box.classList.remove('dreh1'); box.classList.add('dreh2');
      setTimeout(() => { box.classList.remove('dreh2'); dreht = false; zurueck?.(); }, 200);
    }, 200);
  };
  const erledigt = () => {
    const mk = d.merkmale[m];
    erl.push({ text: mk.text, wert: mk.wert });
    m++; fehl = 0;
    sag(r, 'tipp', '');
    if (m < d.merkmale.length) return karte();
    karte();
    stempelPhase();
  };
  const wahl = (w: string, btn: HTMLElement | null) => {
    if (zu || dreht) return;
    const mk = d.merkmale[m], sichtbar = seite === mk.seite;
    if (w === 'unklar' && !sichtbar) { // richtig gedacht: diese Seite sieht man noch nicht
      sag(r, 'tipp', mk.unklarTipp ?? '');
      const b = $('.mm-dreh', zi); b.classList.remove('puls'); void b.offsetWidth; b.classList.add('puls');
      return;
    }
    if (sichtbar && w === mk.wert) { btn?.classList.add('an'); zu = true; setTimeout(() => { zu = false; erledigt(); }, 350); return; }
    wackel(btn);
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal);
    sag(r, 'tipp', K.UI.hilfe);
    zu = true;
    const zeigen = () => { zi.querySelector(`.mm-wahl [data-w="${mk.wert}"]`)?.classList.add('an'); setTimeout(() => { zu = false; erledigt(); }, 1100); };
    if (seite !== mk.seite) { zu = false; drehen(() => { zu = true; zeigen(); }); } else zeigen();
  };
  const stempelPhase = () => {
    zu = true;
    $('.mm-slot', zi).innerHTML = '';
    const force = stempeln(zi, $('.mm-box', zi), d.stempel, () => ende(r, d, fertig));
    hook.loese = force;
  };
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    const w = t.closest<HTMLElement>('.mm-wahl button');
    if (w) return wahl(w.dataset.w!, w);
    if (t.closest('[data-a="dreh"]')) drehen();
  };
  // Phase 1: Staub
  if (d.staub) {
    zi.innerHTML = `<div class="mm-box gross"><img class="mm-ding" src="${K.img(d.vorne)}" alt=""></div>`;
    unten('');
    const box = $('.mm-box', zi);
    const force = K.staub(box, () => setTimeout(pruefen, 750));
    hook.loese = force;
  } else pruefen();
}

/* ============================ 4.5 Was war zuerst? ============================ */
export function reihe(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const karten: any[] = d.karten, soll: string[] = d.reihenfolge;
  const plaetze: (string | null)[] = soll.map(() => null);
  let sel: string | null = null, fehl = 0, sperre = false;
  const kHtml = (k: any) => `<div class="rh-karte${sel === k.id ? ' sel' : ''}" data-k="${k.id}"><img src="${K.img(k.bild)}" alt="" draggable="false"><span>${k.text}</span></div>`;
  const mal = () => {
    zi.innerHTML = `<div class="rh-plaetze">${plaetze.map((id, i) => `<div class="rh-platz${id ? ' voll' : ''}" data-p="${i}"><i>${i + 1}</i>${id ? kHtml(karten.find((k) => k.id === id)) : ''}</div>`).join('')}</div><div class="rh-pool">${karten.map((k) => `<div class="rh-zelle">${plaetze.includes(k.id) ? '' : kHtml(k)}</div>`).join('')}</div>`;
    unten(knopf('fertig', K.UI.fertig, plaetze.some((p) => !p) || sperre), () => pruefe());
  };
  const setze = (id: string, idx: number) => {
    const von = plaetze.indexOf(id), alt = plaetze[idx];
    plaetze[idx] = id;
    if (von >= 0) plaetze[von] = alt;
    sel = null; mal();
  };
  // Ziehen (Zeiger) oder Antippen (erst Karte, dann Platz)
  let drag: { el: HTMLElement; id: string; x: number; y: number; bewegt: boolean } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    if (sperre) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.rh-karte');
    if (!el) return;
    drag = { el, id: el.dataset.k!, x: e.clientX, y: e.clientY, bewegt: false };
    el.setPointerCapture(e.pointerId);
  });
  zi.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.bewegt && Math.hypot(dx, dy) > 8) { drag.bewegt = true; drag.el.classList.add('zieht'); }
    if (drag.bewegt) drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(3deg)`;
  });
  const ablegen = (e: PointerEvent) => {
    if (!drag) return;
    const { el, id, bewegt } = drag; drag = null;
    if (!bewegt) { // Tippen
      if (plaetze.includes(id)) { plaetze[plaetze.indexOf(id)] = null; sel = null; } else sel = sel === id ? null : id;
      return mal();
    }
    el.classList.remove('zieht');
    const platz = e.type === 'pointerup' ? document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('rh-platz')) as HTMLElement | undefined : undefined;
    if (platz) setze(id, +platz.dataset.p!); else { el.style.transform = ''; mal(); }
  };
  zi.addEventListener('pointerup', ablegen); zi.addEventListener('pointercancel', ablegen);
  zi.addEventListener('click', (e) => {
    const p = (e.target as HTMLElement).closest<HTMLElement>('.rh-platz');
    if (p && !(e.target as HTMLElement).closest('.rh-karte') && sel && !sperre && !plaetze[+p.dataset.p!]) setze(sel, +p.dataset.p!);
  });
  const fertigLegen = () => { sperre = true; hook.loese = null; mal(); };
  const loesen = async (mitRaupe: boolean) => {
    fertigLegen();
    for (let i = 0; i < soll.length; i++) {
      if (plaetze[i] === soll[i]) continue;
      const alt = plaetze.indexOf(soll[i]);
      if (alt >= 0) plaetze[alt] = null;
      plaetze[i] = soll[i];
      mal();
      if (mitRaupe) await warte(550);
    }
    unten('');
    ende(r, d, fertig, mitRaupe ? K.UI.hilfe : '');
  };
  const pruefe = async () => {
    if (sperre || plaetze.some((p) => !p)) return;
    const falsch = plaetze.map((id, i) => (id === soll[i] ? -1 : i)).filter((i) => i >= 0);
    if (!falsch.length) return loesen(false);
    fehl++;
    sperre = true; mal();
    falsch.forEach((i) => zi.querySelector(`.rh-platz[data-p="${i}"] .rh-karte`)?.classList.add('nein'));
    await warte(650);
    falsch.forEach((i) => { plaetze[i] = null; });
    if (fehl === 1) { sperre = false; sag(r, 'tipp', K.UI.nochmal); return mal(); }
    sag(r, 'tipp', K.UI.hilfe);
    loesen(true);
  };
  hook.loese = () => loesen(false);
  mal();
}

/* ============================ 4.6 Wessen Ärmel war es? ============================ */
export function ausschluss(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const kand: any[] = d.kandidaten, hin: any[] = d.hinweise, N = hin.length;
  const ordnung = K.mischen(kand.map((c) => c.id));
  const gestr = new Set<string>(), neuGestr = new Set<string>(), sel = new Set<string>();
  let hi = 0, fehl = 0, gesperrt = false;
  const kreuz = '<svg class="kreuz" viewBox="0 0 100 100" aria-hidden="true"><path d="M12 12L88 88M88 12L12 88" stroke="#26221C" stroke-width="7" stroke-linecap="round" fill="none"/></svg>';
  const karteHtml = (c: any) => `<button class="as-k${gestr.has(c.id) ? ' weg' : ''}${neuGestr.has(c.id) ? ' neu' : ''}${sel.has(c.id) ? ' an' : ''}" data-id="${c.id}" ${gestr.has(c.id) ? 'disabled' : ''}>${c.pulli ? pulliSvg(c.pulli, 'pl-' + c.id) : `<img src="${K.img(c.bild)}" alt="" draggable="false">`}<span class="as-n">${c.name}</span>${gestr.has(c.id) ? kreuz : ''}</button>`;
  const mal = () => {
    zi.innerHTML = `<div class="as-hin"><span class="as-z">Hinweis ${hi + 1} von ${N}</span><p>${hin[hi].text}</p></div><p class="as-raus">${K.UI[d.rausText ?? 'raus']}</p><div class="as-grid">${ordnung.map((id) => karteHtml(kand.find((c) => c.id === id))).join('')}</div>`;
    neuGestr.clear();
    unten(knopf('fertig', K.UI.fertig, sel.size === 0 || gesperrt), () => pruefen());
  };
  const weiter = async () => {
    hi++; fehl = 0; sel.clear();
    if (hi < N) { gesperrt = false; return mal(); }
    // Übrig bleibt eine Karte: sie wächst in die Mitte
    const rest = kand.find((c) => !gestr.has(c.id));
    zi.innerHTML = `<div class="as-eine"><div class="as-gross">${karteHtml(rest).replace('class="as-k', 'class="as-k gross')}</div><p class="as-bleibt">${K.UI.bleibt} <b>${rest.name}</b></p></div>`;
    sag(r, 'tipp', '');
    hook.loese = stempeln(zi, $('.as-gross', zi), d.stempel, schluss);
  };
  /** Nach dem Stempel zieht das Kind selbst den Schluss: Was ist sicher, was nur ein Verdacht? */
  const schluss = () => {
    const s = d.schluss;
    if (!s) return ende(r, d, fertig);
    let zu = false;
    const reihe = K.mischen(s.optionen.map((_: any, i: number) => String(i)));
    zi.insertAdjacentHTML('beforeend', `<div class="as-schluss"><p class="as-sf">${s.frage}</p>${reihe.map((i) => `<button class="as-so" data-o="${i}"><span>${s.optionen[+i].text}</span></button>`).join('')}</div>`);
    requestAnimationFrame(() => $('.as-schluss', zi).scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    unten('');
    const zeig = (b: HTMLElement) => { b.classList.add('offen'); (b as HTMLButtonElement).disabled = true; if (!b.querySelector('em')) b.insertAdjacentHTML('beforeend', `<em>${K.UI.verdacht}</em>`); };
    const loesen = () => {
      if (zu) return; zu = true;
      zi.querySelectorAll<HTMLElement>('.as-so').forEach((b) => { if (s.optionen[+b.dataset.o!].sicher) { b.classList.add('ja'); (b as HTMLButtonElement).disabled = true; } else zeig(b); });
      ende(r, d, fertig);
    };
    hook.loese = loesen;
    zi.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('.as-so');
      if (!b || zu || (b as HTMLButtonElement).disabled) return;
      const o = s.optionen[+b.dataset.o!];
      if (o.sicher) return loesen();
      wackel(b); zeig(b); sag(r, 'tipp', o.tipp ?? K.UI.nochmal);
    };
  };
  const streichen = async (ids: string[], mitRaupe: boolean) => {
    gesperrt = true; sel.clear();
    ids.forEach((id) => { gestr.add(id); neuGestr.add(id); });
    mal();
    if (mitRaupe) await warte(900); else await warte(700);
    sag(r, 'tipp', '');
    weiter();
  };
  const pruefen = () => {
    if (gesperrt || !sel.size) return;
    const raus: string[] = hin[hi].raus;
    if (sel.size === raus.length && raus.every((x) => sel.has(x))) return streichen(raus, false);
    fehl++;
    const daneben = [...sel].filter((x) => !raus.includes(x));
    zi.querySelectorAll<HTMLElement>('.as-k.an').forEach((e) => { if (daneben.includes(e.dataset.id!)) wackel(e); });
    if (fehl === 1) { sag(r, 'tipp', daneben.length ? K.UI.nochmal : K.UI[d.nochText ?? 'nochEiner']); gesperrt = true; setTimeout(() => { daneben.forEach((x) => sel.delete(x)); gesperrt = false; mal(); }, 600); return; }
    sag(r, 'tipp', K.UI.hilfe);
    setTimeout(() => streichen(raus, true), 500);
  };
  zi.onclick = (e) => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('.as-k');
    if (!k || gesperrt || gestr.has(k.dataset.id!)) return;
    const id = k.dataset.id!;
    if (sel.has(id)) sel.delete(id); else sel.add(id);
    k.classList.toggle('an', sel.has(id));
    unten(knopf('fertig', K.UI.fertig, sel.size === 0), () => pruefen());
  };
  hook.loese = () => { if (!gesperrt && hi < N) { sel.clear(); hin[hi].raus.forEach((x: string) => sel.add(x)); pruefen(); } };
  mal();
}

/* ============================ 5.1 Zwei Kisten (sortieren) ============================ */
export function sortieren(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const dinge: any[] = d.dinge, ziele: any[] = d.ziele;
  const ordnung = K.mischen(dinge.map((x) => x.id));
  const drin = new Map<string, string>(), fehl = new Map<string, number>();
  let sel: string | null = null, sperre = false;
  const kachel = (x: any, klein = false) => `<div class="so-ding${klein ? ' klein' : ''}${sel === x.id ? ' sel' : ''}" data-d="${x.id}"><img src="${K.img(x.bild)}" alt="" draggable="false"><span>${x.name}</span></div>`;
  const mal = () => {
    zi.innerHTML = `<div class="so-ziele">${ziele.map((z) => `<div class="so-ziel" data-z="${z.id}"><div class="so-kopf"><img src="${K.img(z.bild)}" alt=""><b>${z.name}</b><small>${z.unter}</small></div><div class="so-drin">${dinge.filter((x) => drin.get(x.id) === z.id).map((x) => kachel(x, true)).join('')}</div></div>`).join('')}</div><div class="so-pool">${ordnung.filter((id) => !drin.has(id)).map((id) => kachel(dinge.find((x) => x.id === id))).join('')}</div>`;
    unten('');
  };
  const fertigPruefen = () => { if (drin.size === dinge.length) { sperre = true; hook.loese = null; ende(r, d, fertig); } };
  const lege = (x: any, hilfe = false) => {
    drin.set(x.id, x.ziel); sel = null; K.summ(15); mal();
    if (hilfe) sag(r, 'tipp', K.UI.hilfe + ' ' + (x.warum ?? ''));
    fertigPruefen();
  };
  const versuch = (id: string, ziel: string) => {
    const x = dinge.find((q) => q.id === id);
    if (!x || sperre || drin.has(id)) return;
    if (x.ziel === ziel) { sag(r, 'tipp', ''); return lege(x); }
    const n = (fehl.get(id) ?? 0) + 1;
    fehl.set(id, n); sel = null;
    mal();
    wackel(zi.querySelector(`.so-pool [data-d="${id}"]`));
    zi.querySelector(`.so-ziel[data-z="${ziel}"]`)?.classList.add('nein');
    setTimeout(() => zi.querySelector('.so-ziel.nein')?.classList.remove('nein'), 450);
    if (n === 1) return sag(r, 'tipp', K.UI.nochmal);
    sperre = true; sag(r, 'tipp', K.UI.hilfe + ' ' + (x.warum ?? ''));
    setTimeout(() => { if (!zi.isConnected) return; sperre = false; lege(x); sag(r, 'tipp', K.UI.hilfe + ' ' + (x.warum ?? '')); }, 1300);
  };
  let drag: { el: HTMLElement; id: string; x: number; y: number; bewegt: boolean } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    if (sperre) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.so-pool .so-ding');
    if (!el) return;
    drag = { el, id: el.dataset.d!, x: e.clientX, y: e.clientY, bewegt: false };
    el.setPointerCapture(e.pointerId);
  });
  zi.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.bewegt && Math.hypot(dx, dy) > 8) { drag.bewegt = true; drag.el.classList.add('zieht'); }
    if (drag.bewegt) drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(3deg)`;
  });
  const ablegen = (e: PointerEvent) => {
    if (!drag) return;
    const { el, id, bewegt } = drag; drag = null;
    if (!bewegt) { // Tippen: Sache merken, dann Platz antippen
      if (e.type !== 'pointerup') return;
      sel = sel === id ? null : id;
      zi.querySelectorAll('.so-pool .so-ding').forEach((q) => q.classList.toggle('sel', (q as HTMLElement).dataset.d === sel));
      return;
    }
    el.classList.remove('zieht');
    const z = e.type === 'pointerup' ? (document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('so-ziel')) as HTMLElement | undefined) : undefined;
    if (z) versuch(id, z.dataset.z!); else { el.style.transform = ''; }
  };
  zi.addEventListener('pointerup', ablegen); zi.addEventListener('pointercancel', ablegen);
  zi.addEventListener('click', (e) => {
    const z = (e.target as HTMLElement).closest<HTMLElement>('.so-ziel');
    if (z && sel && !sperre) versuch(sel, z.dataset.z!);
  });
  hook.loese = () => { sperre = false; dinge.filter((x) => !drin.has(x.id)).forEach((x) => drin.set(x.id, x.ziel)); mal(); fertigPruefen(); };
  mal();
}

/* ============================ 5.2 Wie lag der Mond? (umdrehen) ============================ */
export function umdrehen(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const kl = d.kleber;
  let seite: 'vorne' | 'hinten' = 'vorne', dreht = false, fehl = 0, phase: 'legen' | 'warum' | 'aus' = 'legen', liegt = false;
  const mal = () => {
    zi.innerHTML = `${phase === 'warum' ? `<p class="um-frage">${d.frage2}</p>` : ''}<div class="um-tisch${liegt ? ' liegt' : ''}"><img class="um-tablett" src="${K.img(d.tablett)}" alt=""><div class="um-mond" style="aspect-ratio:${d.ratio}"><img src="${K.img(d[seite])}" alt="">${seite === 'hinten' && kl.zeichnen ? `<i class="um-kleber" style="left:${kl.x}%;top:${kl.y}%;width:${kl.w * 0.72}%;height:${kl.h * 0.46}%"></i>` : ''}${phase === 'warum' ? `<b class="um-zone" data-z="1" style="left:${kl.x}%;top:${kl.y}%;width:${kl.w}%;height:${kl.h}%"></b>` : ''}</div>${fleck ? '<i class="um-fleck"></i>' : ''}</div>${phase === 'legen' ? `<button class="kn zwei um-dreh" data-a="dreh"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.300M20 12a8 8 0 0 1-14 5.300" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><path d="M18.500 3v4.500H14M5.500 21v-4.500H10" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${K.UI.umdrehen}</span></button>` : ''}`;
  };
  let fleck = false;
  const drehe = (danach?: () => void) => {
    if (dreht) return;
    dreht = true;
    if (phase === 'legen') sag(r, 'tipp', '');
    const m = $('.um-mond', zi);
    m.classList.add('dreh1');
    setTimeout(() => {
      seite = seite === 'vorne' ? 'hinten' : 'vorne';
      mal();
      const m2 = $('.um-mond', zi); m2.classList.add('dreh2');
      setTimeout(() => { m2.classList.remove('dreh2'); dreht = false; danach?.(); }, 200);
    }, 200);
  };
  const legen = () => {
    if (phase !== 'legen' || dreht) return;
    if (seite === 'hinten') return richtigGelegt();
    fehl++; fleck = true; liegt = true; mal();
    K.summ(30);
    sag(r, 'tipp', d.klebt + (fehl === 1 ? ' ' + K.UI.nochmal : ''));
    if (fehl === 1) return setTimeout(() => { if (!zi.isConnected) return; fleck = false; liegt = false; mal(); }, 1600);
    phase = 'aus';
    unten('');
    setTimeout(() => { if (!zi.isConnected) return; fleck = false; liegt = false; mal(); sag(r, 'tipp', K.UI.hilfe); drehe(() => setTimeout(() => { liegt = true; mal(); richtigGelegt(true); }, 500)); }, 1700);
  };
  const richtigGelegt = (mitHilfe = false) => {
    liegt = true; phase = 'warum'; fehl = 0; mal();
    sag(r, mitHilfe ? 'tipp' : 'lob', mitHilfe ? K.UI.hilfe : K.UI.stimmt);
    unten('');
    hook.loese = () => frei();
  };
  const frei = (mitHilfe = false, warum = '') => { phase = 'aus'; hook.loese = null; mal(); $('.um-mond', zi).insertAdjacentHTML('beforeend', '<i class="ring da" style="left:' + kl.x + '%;top:' + kl.y + '%"></i>'); ende(r, d, fertig, mitHilfe ? [K.UI.hilfe, warum].join(' ') : ''); };
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="dreh"]')) return drehe();
    if (phase !== 'warum') return;
    if (t.closest('.um-zone')) return frei();
    if (!t.closest('.um-tisch')) return;
    wackel($('.um-mond', zi));
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal);
    sag(r, 'tipp', K.UI.hilfe + ' ' + d.warum2);
    phase = 'aus';
    zi.querySelector('.um-zone')?.classList.add('puls');
    setTimeout(() => zi.isConnected && frei(true, d.warum2), 1300);
  };
  // Wischen über den Mond dreht ihn auch
  let sx = 0, st = false;
  zi.addEventListener('pointerdown', (e) => { st = phase === 'legen' && !!(e.target as HTMLElement).closest('.um-mond'); sx = e.clientX; });
  zi.addEventListener('pointerup', (e) => { if (st && Math.abs(e.clientX - sx) > 40) drehe(); st = false; });
  mal();
  unten(knopf('legen', K.UI.legen), (a) => { if (a === 'legen') legen(); });
  hook.loese = () => { if (phase === 'legen') { seite = 'hinten'; richtigGelegt(); } };
}

/* ============================ 5.3 Was sieht die Raupe? (suchbild) ============================ */
export function suchbild(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const dinge: any[] = d.dinge, gef = new Set<string>();
  let fehl = 0, aus = false;
  const liste = () => `<ul class="sb-liste">${dinge.map((x) => `<li class="${gef.has(x.id) ? 'da' : ''}"><i></i><span>${x.name}</span></li>`).join('')}</ul>`;
  zi.innerHTML = `${liste()}<div class="sb-bild"><img src="${K.img(d.bild)}" alt="" draggable="false"></div>`;
  const finde = (x: any, blink = false) => {
    gef.add(x.id);
    $('.sb-liste', zi).outerHTML = liste();
    $('.sb-bild', zi).insertAdjacentHTML('beforeend', `<i class="sb-ring${blink ? ' blink' : ''}" style="left:${x.x}%;top:${x.y}%;width:${x.w + 3}%;height:${x.h + 4}%"></i>`);
    K.summ(20);
    if (gef.size === dinge.length) { aus = true; hook.loese = null; setTimeout(() => ende(r, d, fertig), 500); } else sag(r, 'tipp', x.sagt ?? '');
  };
  const trifft = (x: any, tx: number, ty: number) => Math.abs(tx - x.x) <= x.w / 2 + 2.5 && Math.abs(ty - x.y) <= x.h / 2 + 3.5;
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.sb-bild');
    if (!b || aus) return;
    const rc = b.getBoundingClientRect(), tx = ((e.clientX - rc.left) / rc.width) * 100, ty = ((e.clientY - rc.top) / rc.height) * 100;
    const treffer = dinge.filter((x) => !gef.has(x.id) && trifft(x, tx, ty)).sort((p, q) => Math.hypot(tx - p.x, ty - p.y) - Math.hypot(tx - q.x, ty - q.y))[0];
    if (treffer) { fehl = 0; return finde(treffer); }
    const bekannt = dinge.find((x) => gef.has(x.id) && trifft(x, tx, ty));
    if (bekannt) return sag(r, 'tipp', bekannt.sagt ?? '');
    b.insertAdjacentHTML('beforeend', `<i class="ring miss" style="left:${tx}%;top:${ty}%"></i>`);
    setTimeout(() => b.querySelector('.ring.miss')?.remove(), 800);
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal);
    fehl = 0;
    const offen = dinge.find((x) => !gef.has(x.id))!;
    sag(r, 'tipp', K.UI.hilfe + ' ' + offen.name);
    finde(offen, true);
  };
  hook.loese = () => { dinge.filter((x) => !gef.has(x.id)).forEach((x) => gef.add(x.id)); aus = true; $('.sb-liste', zi).outerHTML = liste(); ende(r, d, fertig); };
  unten('');
}

/* ============================ 5.4 Geheimschrift (spiegel) ============================ */
export function spiegel(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const reihe = K.mischen(d.lesungen.map((_: any, i: number) => String(i)));
  let fehl = 0, zu = false;
  zi.innerHTML = `<div class="sp-zettel"><div class="sp-text">${(d.zettel as string).split(' ').map((w) => `<span>${w}</span>`).join('')}</div></div><div class="sp-opts">${reihe.map((i: string) => `<button class="sp-o" data-o="${i}"><span>${d.lesungen[+i]}</span></button>`).join('')}</div>`;
  unten('');
  const loesen = (btn: HTMLElement | null, hilfe: boolean) => {
    zu = true; hook.loese = null;
    btn?.classList.add('an');
    $('.sp-zettel', zi).classList.add('klar');
    ende(r, d, fertig, hilfe ? [K.UI.hilfe, d.warum].join(' ') : '');
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.sp-o');
    if (!b || zu) return;
    if (+b.dataset.o! === d.richtig) return loesen(b, false);
    wackel(b);
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal);
    zu = true;
    sag(r, 'tipp', [K.UI.hilfe, d.warum].join(' '));
    setTimeout(() => zi.isConnected && loesen(zi.querySelector(`.sp-o[data-o="${d.richtig}"]`), true), 900);
  };
  hook.loese = () => loesen(zi.querySelector(`.sp-o[data-o="${d.richtig}"]`), false);
}

/* ============================ 6.1 Wie lag der Mond? (klebstoff) ============================ */
const DREHPFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.300M20 12a8 8 0 0 1-14 5.300" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><path d="M18.500 3v4.500H14M5.500 21v-4.500H10" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/**
 * Drei Schritte auf einem Bildschirm: a) Mond untersuchen (umdrehen, nassen Kleber antippen),
 * b) wie lag er?  c) warum?  „Prüfen“ prüft b und c zusammen.
 */
export function klebstoff(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const kl = d.kleber;
  let seite: 'vorne' | 'hinten' = 'vorne', dreht = false, gesehen = new Set<string>(['vorne']), fehlTipp = 0;
  let phase: 'suchen' | 'waehlen' | 'aus' = 'suchen', fehl = 0, karte: string | null = null, grund: string | null = null, gesperrt = false, ja = false;
  const mondHtml = () => `<div class="kl-mond${phase !== 'suchen' ? '' : ' gross'}" style="aspect-ratio:${d.ratio}"><img src="${K.img(d[seite])}" alt="" draggable="false">${seite === 'hinten' && kl.zeichnen ? `<i class="kl-kleber${phase === 'suchen' ? ' glanz' : ''}" style="left:${kl.x}%;top:${kl.y}%;width:${kl.w}%;height:${kl.h}%"><s></s><u></u></i>` : ''}${seite === 'hinten' ? `<b class="kl-zone" data-z="1" style="left:${kl.x}%;top:${kl.y + 4}%;width:${kl.w + 12}%;height:${kl.h + 22}%"></b>` : ''}</div>`;
  const kartenHtml = () => d.karten.map((k: any) => `<button class="kl-k${karte === k.id ? ' an' : ''}${ja && k.id === d.richtigKarte ? ' ja' : ''}" data-k="${k.id}"><span class="kl-kb"><img class="kl-tab" src="${K.img(d.tablett)}" alt="" draggable="false"><img class="kl-km" src="${K.img(d[k.seite])}" alt="" draggable="false"></span><span class="kl-kt">${k.text}</span></button>`).join('');
  const gruendeHtml = () => d.gruende.map((g: any) => `<button class="kl-g${grund === g.id ? ' an' : ''}${ja && g.richtig ? ' ja' : ''}" data-g="${g.id}"><span>${g.text}</span></button>`).join('');
  const mal = () => {
    const weiter = phase !== 'suchen';
    zi.innerHTML = `<div class="kl-tisch${weiter ? ' klein' : ''}">${mondHtml()}<img class="kl-flasche" src="${K.img(d.flasche)}" alt="" draggable="false"></div><button class="kn zwei um-dreh kl-dreh" data-a="dreh">${DREHPFEIL}<span>${K.UI.umdrehen}</span></button>${weiter ? `<div class="kl-note">${rp('tipp', d.nass)}</div><div class="kl-teil"><p class="kl-f"><b>1</b><span>${d.frage1}</span></p><div class="kl-karten">${kartenHtml()}</div></div><div class="kl-teil"><p class="kl-f"><b>2</b><span>${d.frage2}</span></p><div class="kl-gruende">${gruendeHtml()}</div></div>` : ''}`;
    unten(weiter ? knopf('pruefen', K.UI.pruefen, !karte || !grund || gesperrt || phase === 'aus') : '', (a) => { if (a === 'pruefen') pruefen(); });
  };
  const drehe = () => {
    if (dreht || gesperrt) return;
    dreht = true;
    const m = $('.kl-mond', zi);
    m.classList.add('dreh1');
    setTimeout(() => {
      seite = seite === 'vorne' ? 'hinten' : 'vorne'; gesehen.add(seite);
      const g = r.scrollTop; mal(); r.scrollTop = g;
      const m2 = $('.kl-mond', zi); m2.classList.add('dreh2');
      if (phase === 'suchen' && seite === 'hinten') sag(r, 'tipp', d.suche);
      setTimeout(() => { m2.classList.remove('dreh2'); dreht = false; }, 200);
    }, 200);
  };
  const gefunden = () => {
    if (phase !== 'suchen') return;
    phase = 'waehlen';
    mal();
    $('.kl-mond', zi).insertAdjacentHTML('beforeend', `<i class="ring da" style="left:${kl.x}%;top:${kl.y}%"></i>`);
    K.summ(30);
    sag(r, 'tipp', '');
  };
  const loesen = (mitHilfe: boolean) => {
    phase = 'aus'; ja = true; gesperrt = true; hook.loese = null; karte = d.richtigKarte; grund = d.gruende.find((g: any) => g.richtig).id;
    mal();
    ende(r, d, fertig, mitHilfe ? [K.UI.hilfe, d.warum].join(' ') : '');
  };
  const pruefen = () => {
    if (phase !== 'waehlen' || !karte || !grund || gesperrt) return;
    const kOk = karte === d.richtigKarte, gOk = !!d.gruende.find((g: any) => g.id === grund)?.richtig;
    if (kOk && gOk) return loesen(false);
    fehl++;
    gesperrt = true; mal();
    if (!kOk) wackel(zi.querySelector(`.kl-k[data-k="${karte}"]`));
    if (!gOk) wackel(zi.querySelector(`.kl-g[data-g="${grund}"]`));
    if (fehl === 1) {
      sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp1);
      return setTimeout(() => { if (!zi.isConnected) return; if (!kOk) karte = null; if (!gOk) grund = null; gesperrt = false; const g = r.scrollTop; mal(); r.scrollTop = g; }, 700);
    }
    sag(r, 'tipp', K.UI.hilfe + ' ' + d.warum);
    setTimeout(() => zi.isConnected && loesen(true), 1100);
  };
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="dreh"]')) return drehe();
    if (phase === 'suchen') {
      if (t.closest('.kl-zone')) return gefunden();
      if (t.closest('.kl-mond')) { // woanders auf den Mond getippt: die weiße Seite wird gesucht
        if (seite === 'hinten' && ++fehlTipp >= 3) { sag(r, 'tipp', K.UI.hilfe + ' ' + d.suche); $('.kl-kleber', zi)?.classList.add('puls'); }
        else if (seite === 'hinten') sag(r, 'tipp', K.UI.nochmal);
        else drehe();
        return;
      }
    }
    if (phase !== 'waehlen' || gesperrt) return;
    const k = t.closest<HTMLElement>('.kl-k'), g = t.closest<HTMLElement>('.kl-g');
    if (k) { karte = k.dataset.k!; const s = r.scrollTop; mal(); r.scrollTop = s; }
    else if (g) { grund = g.dataset.g!; const s = r.scrollTop; mal(); r.scrollTop = s; }
  };
  // Wischen über den Mond dreht ihn auch
  let sx = 0, st = false;
  zi.addEventListener('pointerdown', (e) => { st = !!(e.target as HTMLElement).closest('.kl-mond'); sx = e.clientX; });
  zi.addEventListener('pointerup', (e) => { if (st && Math.abs(e.clientX - sx) > 40) { st = false; drehe(); sx = -9999; } });
  hook.loese = () => { if (phase === 'suchen') { seite = 'hinten'; gefunden(); } loesen(false); };
  mal();
  sag(r, 'tipp', '');
}
