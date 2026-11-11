/**
 * Die sechs Rätsel von Kapitel 1. Jede Funktion bekommt (rahmen, daten, fertig):
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
  let k = 0, gesperrt = false;
  const DREH = [-7, 5, -3, 8, -6, 4, -9];
  const punkte = () => `<div class="pkt hell">${d.runden.map((_: any, i: number) => `<i class="${i === k ? 'an' : ''}"></i>`).join('')}</div>`;
  const runde = () => {
    const rd = d.runden[k];
    gesperrt = false;
    zi.innerHTML = `${punkte()}<img class="bs-bild" src="${K.img(rd.bild)}" alt=""><div class="bs-lose">${[...rd.buchstaben].map((c: string, i: number) => `<span class="bk" style="--r:${DREH[i % 7]}deg" data-i="${i}">${c}</span>`).join('')}</div><div class="bs-felder">${[...rd.wort].map(() => '<i class="feld"></i>').join('')}</div><div class="bs-knoepfe"><button class="bsk" data-w="ja"><img src="${K.fig('raupe/lacht')}" alt=""><span>${K.UI.passt}</span></button><button class="bsk" data-w="nein"><img src="${K.fig('raupe/traurig')}" alt=""><span>${K.UI.passtNicht}</span></button></div>`;
    sag(r, 'tipp', '');
    unten('');
    hook.loese = () => antwort(rd.passt ? 'ja' : 'nein', null);
  };
  /** Kärtchen fliegen in die Felder; bei „passt nicht“ bleibt ein Feld leer oder ein Kärtchen übrig */
  const fliegen = async (rd: any) => {
    const kaertchen = [...zi.querySelectorAll<HTMLElement>('.bk')], felder = [...zi.querySelectorAll<HTMLElement>('.feld')];
    const frei = new Set(kaertchen.map((_, i) => i));
    const ziele: (number | null)[] = [...rd.wort].map((c: string) => { const i = [...frei].find((j) => rd.buchstaben[j] === c); if (i === undefined) return null; frei.delete(i); return i; });
    const rk = kaertchen.map((e) => e.getBoundingClientRect()), rf = felder.map((e) => e.getBoundingClientRect());
    ziele.forEach((ti, fi) => {
      if (ti === null) return;
      const dx = rf[fi].left + rf[fi].width / 2 - (rk[ti].left + rk[ti].width / 2), dy = rf[fi].top + rf[fi].height / 2 - (rk[ti].top + rk[ti].height / 2);
      const e = kaertchen[ti];
      e.style.transitionDelay = `${fi * 90}ms`;
      e.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg)`;
      e.classList.add('drin');
    });
    await warte(ziele.length * 90 + 700);
    ziele.forEach((ti, fi) => { if (ti === null) felder[fi].classList.add('leer'); });
    frei.forEach((ti) => kaertchen[ti].classList.add('uebrig'));
  };
  const antwort = async (w: string, btn: HTMLElement | null) => {
    if (gesperrt) return;
    gesperrt = true;
    hook.loese = null;
    const rd = d.runden[k], richtig = (w === 'ja') === rd.passt, letzte = k === d.runden.length - 1;
    if (!richtig) wackel(btn);
    zi.querySelectorAll('.bsk').forEach((b) => b.classList.toggle('wahl', b === btn));
    await fliegen(rd);
    const text = [!richtig ? K.UI.hilfe : '', rd.passt ? '' : rd.warum ?? ''].filter(Boolean).join(' ');
    if (letzte) return ende(r, d, fertig, text);
    sag(r, 'tipp', text);
    unten(knopf('weiter', K.UI.weiter), () => { k++; runde(); });
  };
  zi.onclick = (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.bsk'); if (b) antwort(b.dataset.w!, b); };
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
  zi.innerHTML = `<div class="vb"><div class="vb-svg">${versteckterBuchstabe(d.buchstabe, d.winkel, d.farbe, id)}</div><canvas class="vb-cv"></canvas></div><div class="vb-opts">${d.optionen.map((o: string) => `<button class="vb-o" data-o="${o}">${o}</button>`).join('')}</div>`;
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
  const zeigen = () => { $('.vb-svg', zi).innerHTML = versteckterBuchstabe(d.buchstabe, d.winkel, d.farbe, id, true); cv.style.pointerEvents = 'none'; };
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
  const karteHtml = (c: any) => `<button class="as-k${gestr.has(c.id) ? ' weg' : ''}${neuGestr.has(c.id) ? ' neu' : ''}${sel.has(c.id) ? ' an' : ''}" data-id="${c.id}" ${gestr.has(c.id) ? 'disabled' : ''}>${pulliSvg(c.pulli, 'pl-' + c.id)}<span class="as-n">${c.name}</span>${gestr.has(c.id) ? kreuz : ''}</button>`;
  const mal = () => {
    zi.innerHTML = `<div class="as-hin"><span class="as-z">Hinweis ${hi + 1} von ${N}</span><p>${hin[hi].text}</p></div><p class="as-raus">${K.UI.raus}</p><div class="as-grid">${ordnung.map((id) => karteHtml(kand.find((c) => c.id === id))).join('')}</div>`;
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
    hook.loese = stempeln(zi, $('.as-gross', zi), d.stempel, () => ende(r, d, fertig));
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
    zi.querySelectorAll('.as-k.an').forEach((e) => wackel(e));
    if (fehl === 1) { sag(r, 'tipp', K.UI.nochmal); gesperrt = true; setTimeout(() => { sel.clear(); gesperrt = false; mal(); }, 600); return; }
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
