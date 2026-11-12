/**
 * Die Rätsel der Kapitel 1 und 2. Jede Funktion bekommt (rahmen, daten, fertig):
 *   rahmen = der dunkle Rahmen (.zug) mit .zi (Spielfläche) und .zr (Sprechblase der Lese-Raupe),
 *   daten  = das Rätsel aus den Daten (Texte schon als HTML mit Silben),
 *   fertig = wird aufgerufen, wenn das Rätsel gelöst ist (die Raupe hat dann schon `erfolg` gesagt).
 * Regel überall: nach dem 1. Fehler Wackeln + `ui.nochmal`; nach dem 2. Fehler zeigt die Raupe die Lösung (`ui.hilfe`).
 */
import { pulliSvg, versteckterBuchstabe } from './zeichnen.ts';
import { staub as _staub, laub as _laub } from './staub.ts';
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
  /** Eigenschaften einer Sache je Seite: `vorhin`/`jetzt` darf ein Objekt sein ({x, y, rot, bild}) */
  const pos = (x: any, art: 'vorhin' | 'jetzt') => (x[art] && typeof x[art] === 'object' ? { ...x, ...x[art] } : x);
  const ding = (x: any, art: 'vorhin' | 'jetzt') => { const q = pos(x, art); return q.bild ? `<img class="ding" data-d="${x.id}" src="${K.img(q.bild)}" alt="" style="left:${q.x}%;top:${q.y}%;width:${q.w}%${q.rot ? `;transform:translate(-50%,-50%) rotate(${q.rot}deg)` : ''}">` : ''; };
  const pane = (art: 'vorhin' | 'jetzt') => `<figure class="ub" data-p="${art}"><span class="tab hell">${K.UI[art]}</span><div class="ub-bild" style="background-image:url(${K.img(d.basis)})">${(d.deko ?? []).filter((x: any) => x[art]).map((x: any) => `<img class="ding" src="${K.img(x.bild)}" alt="" style="left:${x.x}%;top:${x.y}%;width:${x.w}%${x.clip ? `;clip-path:${x.clip}` : ''}">`).join('')}${dinge.filter((x) => x[art]).map((x) => ding(x, art)).join('')}</div></figure>`;
  zi.innerHTML = `<p class="ub-zaehl"></p><div class="ub-paar">${pane('vorhin')}${pane('jetzt')}</div>`;
  const zaehl = () => { $('.ub-zaehl', zi).innerHTML = `<b>${gef.size} / ${dinge.length}</b> ${K.UI.gefunden}`; };
  zaehl();
  const seite = (x: any) => { const e = zi.querySelector<HTMLImageElement>(`img[data-d="${x.id}"]`); return e && e.naturalWidth ? e.naturalHeight / e.naturalWidth : 1; };
  const finde = (x: any, blink = false) => {
    gef.add(x.id);
    zi.querySelectorAll<HTMLElement>('.ub-bild').forEach((b) => { const q = pos(x, (b.closest('.ub') as HTMLElement).dataset.p as 'vorhin' | 'jetzt'); b.insertAdjacentHTML('beforeend', `<i class="ring da${blink ? ' blink' : ''}" style="left:${q.x}%;top:${q.y}%"></i>`); });
    zaehl();
    K.summ(20);
    if (gef.size === dinge.length && !fertigig) { fertigig = true; setTimeout(() => (d.sortieren ? zuordnen() : ende(r, d, fertig)), 450); }
  };
  /** Zweiter Schritt: die gefundenen Unterschiede nach Verursacher sortieren */
  const zuordnen = () => {
    hook.loese = null;
    $('.zt1', r).innerHTML = d.sortieren.text;
    sag(r, 'tipp', d.sortieren.start);
    sortieren(r, { ...d.sortieren, erfolg: d.erfolg }, fertig);
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.ub-bild');
    if (!b || fertigig) return;
    const rc = b.getBoundingClientRect(), tx = (e.clientX - rc.left) / rc.width, ty = (e.clientY - rc.top) / rc.width; // beides in Bildbreiten
    const treffer = dinge.find((x) => {
      if (gef.has(x.id)) return false;
      const flaechen: any[] = x.zonen ?? [x];
      return flaechen.some((z) => {
        const hw = z.w / 200 + 0.04, hh = !z.zonen && !x.zonen && x.bild ? (z.w / 100) * seite(x) / 2 + 0.04 : (z.h ?? z.w) / 200 + 0.04;
        return Math.abs(tx - z.x / 100) <= hw && Math.abs(ty - (z.y / 100) * (2 / 3)) <= hh;
      });
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
export function stempeln(zi: HTMLElement, ziel: HTMLElement, text: string, fertig: () => void, pos?: { x: number; y: number }): () => void {
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
    if (pos) { const st = ziel.lastElementChild as HTMLElement; st.style.left = `${Math.min(78, Math.max(22, pos.x))}%`; st.style.top = `${Math.min(88, Math.max(12, pos.y))}%`; }
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
  const karteHtml = (c: any) => `<button class="as-k${gestr.has(c.id) ? ' weg' : ''}${neuGestr.has(c.id) ? ' neu' : ''}${sel.has(c.id) ? ' an' : ''}" data-id="${c.id}" ${gestr.has(c.id) ? 'disabled' : ''}>${c.pulli ? pulliSvg(c.pulli, 'pl-' + c.id) : c.crop ? `<span class="as-crop"><span class="sc-v" style="background-image:url(${K.img(c.crop.bild)});background-size:${c.crop.n * 100}% 100%;background-position:${(c.crop.i / (c.crop.n - 1)) * 100}% 0"></span></span>` : `<img src="${K.img(c.bild)}" alt="" draggable="false">`}<span class="as-n">${c.name}</span>${gestr.has(c.id) ? kreuz : ''}</button>`;
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
    zi.innerHTML = `<div class="so-ziele${ziele.length === 3 ? ' drei' : ''}">${ziele.map((z) => `<div class="so-ziel" data-z="${z.id}"><div class="so-kopf"><img src="${K.img(z.bild)}" alt=""><b>${z.name}</b><small>${z.unter}</small></div><div class="so-drin">${dinge.filter((x) => drin.get(x.id) === z.id).map((x) => kachel(x, true)).join('')}</div></div>`).join('')}</div><div class="so-pool">${ordnung.filter((id) => !drin.has(id)).map((id) => kachel(dinge.find((x) => x.id === id))).join('')}</div>`;
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

/* ============================ Schluss „Was wissen wir jetzt sicher?“ (geteilt) ============================ */
function schlussFrage(r: HTMLElement, zi: HTMLElement, d: Daten, fertig: () => void) {
  const s = d.schluss;
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
}

/* ============================ 6.2 Der Käse unter der Lupe (lupe) ============================ */
export function lupe(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const url = K.img(d.bild);
  zi.innerHTML = `<div class="lp-box" style="aspect-ratio:${d.ratio}"><img class="lp-bild" src="${url}" alt="" draggable="false"><div class="lp-glas" style="background-image:url(${url})"></div></div>`;
  unten('');
  const box = $('.lp-box', zi), glas = $('.lp-glas', zi);
  const zoom = d.zoom ?? 2.8;
  let aus = false, fehl = 0, px = 0.3, py = 0.3, x0 = 0, y0 = 0, weit = false, unten0 = false;
  const gezeigt = new Set<number>();
  /** Ablenker (rosa Schleife …): die Raupe sagt einmal, dass es nicht der gesuchte Fund ist */
  const ablenker = () => {
    const rc = box.getBoundingClientRect();
    (d.fehlFunde ?? []).forEach((f: any, i: number) => { if (!gezeigt.has(i) && Math.hypot(((px * 100 - f.x) / 100) * rc.width, ((py * 100 - f.y) / 100) * rc.height) <= (f.r / 100) * rc.width) { gezeigt.add(i); sag(r, 'tipp', f.text); } });
  };
  const setze = (fx: number, fy: number) => {
    px = Math.min(1, Math.max(0, fx)); py = Math.min(1, Math.max(0, fy));
    const rc = box.getBoundingClientRect(), gl = glas.offsetWidth;
    glas.style.left = px * rc.width + 'px'; glas.style.top = py * rc.height + 'px';
    glas.style.backgroundSize = `${rc.width * zoom}px ${rc.height * zoom}px`;
    glas.style.backgroundPosition = `${gl / 2 - px * rc.width * zoom}px ${gl / 2 - py * rc.height * zoom}px`;
  };
  const trifft = () => { const rc = box.getBoundingClientRect(); return Math.hypot(((px * 100 - d.ziel.x) / 100) * rc.width, ((py * 100 - d.ziel.y) / 100) * rc.height) <= (d.ziel.r / 100) * rc.width; };
  const finde = (mitHilfe: boolean) => {
    if (aus) return;
    aus = true; hook.loese = null;
    setze(d.ziel.x / 100, d.ziel.y / 100);
    glas.classList.add('treffer');
    K.summ(30);
    if (d.schluss) { // danach: was ist sicher, was nur ein Verdacht?
      sag(r, 'lob', (mitHilfe ? K.UI.hilfe + ' ' : '') + (d.fund ?? ''), 'gut');
      setTimeout(() => zi.isConnected && schlussFrage(r, zi, d, fertig), 900);
      return;
    }
    ende(r, d, fertig, mitHilfe ? K.UI.hilfe : '');
  };
  const pos = (e: PointerEvent) => {
    const rc = box.getBoundingClientRect();
    const hoch = e.pointerType === 'mouse' ? 0 : 62; // am Finger: Lupe über dem Finger, damit man sie sieht
    setze((e.clientX - rc.left) / rc.width, (e.clientY - hoch - rc.top) / rc.height);
  };
  box.addEventListener('pointerdown', (e) => { if (aus) return; unten0 = true; weit = false; x0 = e.clientX; y0 = e.clientY; box.setPointerCapture(e.pointerId); pos(e); ablenker(); glas.classList.add('an'); });
  box.addEventListener('pointermove', (e) => {
    if (aus || (!unten0 && e.pointerType !== 'mouse')) return;
    if (Math.hypot(e.clientX - x0, e.clientY - y0) > 10) weit = true;
    pos(e);
    ablenker();
    if (trifft()) finde(false);
  });
  const los = (e: PointerEvent) => {
    if (!unten0) return;
    unten0 = false; glas.classList.remove('an');
    if (aus || e.type !== 'pointerup' || weit) return;
    if (trifft()) return finde(false);
    // Nur Tippen ohne Wischen zählt als Fehlversuch
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp);
    sag(r, 'tipp', K.UI.hilfe);
    setTimeout(() => zi.isConnected && finde(true), 500);
  };
  box.addEventListener('pointerup', los); box.addEventListener('pointercancel', los);
  hook.loese = () => finde(false);
  requestAnimationFrame(() => { setze(0.3, 0.32); sag(r, 'tipp', d.start); });
}

/* ============================ 6.3 Wessen Schatten? (schatten) ============================ */
export function schatten(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const n: number = d.anzahl;
  const crop = (i: number) => `<span class="sc-v" style="background-image:url(${K.img(d.bild)});background-size:${n * 100}% 100%;background-position:${(i / (n - 1)) * 100}% 0"></span>`;
  const reihe = K.mischen(Array.from({ length: n }, (_, i) => String(i)));
  let fehl = 0, zu = false;
  zi.innerHTML = `<div class="sc-licht"><div class="sc-schatten">${crop(d.richtig)}</div></div><div class="sc-grid">${reihe.map((i) => `<button class="sc-k" data-i="${i}" aria-label="Vogel ${+i + 1}">${crop(+i)}</button>`).join('')}</div>`;
  unten('');
  const loesen = (hilfe: boolean) => {
    zu = true; hook.loese = null;
    $('.sc-schatten', zi).classList.add('klar');
    zi.querySelector(`.sc-k[data-i="${d.richtig}"]`)?.classList.add('ja');
    ende(r, d, fertig, hilfe ? [K.UI.hilfe, d.warum].join(' ') : '');
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.sc-k');
    if (!b || zu) return;
    if (+b.dataset.i! === d.richtig) return loesen(false);
    wackel(b); b.classList.add('falsch');
    if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp);
    zu = true;
    sag(r, 'tipp', [K.UI.hilfe, d.warum].join(' '));
    setTimeout(() => zi.isConnected && loesen(true), 900);
  };
  hook.loese = () => loesen(false);
}

/* ============================ 6.4 Welcher Kreis ist Milas Mond? (kreise, Schlüsselmoment 2) ============================ */
/**
 * Drei Schritte: a) Erinnern: aus sechs Merkmal-Karten die drei richtigen wählen,
 * b) Vergleichen: fünf Kreise, immer nur EIN Kreis ist umgedreht; das Kind streicht selbst aus (Kreuz-Knopf oder langes Drücken),
 * c) Stempel auf dem letzten Kreis.
 */
export function kreise(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const kar: any[] = d.erinnern.karten, kr: any[] = d.kreise;
  const sel = new Set<string>(), gestr = new Set<string>();
  const richtigK = kar.filter((k) => k.richtig).map((k) => k.id);
  let fehl = 0, gesperrt = false, offen: string | null = null, phase: 'a' | 'b' | 'c' = 'a', geflippt = false;
  const kreuz = '<svg class="kreuz" viewBox="0 0 100 100" aria-hidden="true"><path d="M14 14L86 86M86 14L14 86" stroke="#26221C" stroke-width="8" stroke-linecap="round" fill="none"/></svg>';
  const ordnung = K.mischen(kar.map((k) => k.id));

  /* ---- a) Erinnern ---- */
  const malA = () => {
    zi.innerHTML = `<div class="kr-merk">${ordnung.map((id) => { const k = kar.find((q) => q.id === id)!; return `<button class="kr-mk${sel.has(id) ? ' an' : ''}" data-m="${id}"><span>${k.text}</span></button>`; }).join('')}</div>`;
    unten(knopf('pruefen', K.UI.pruefen, sel.size === 0 || gesperrt), () => pruefenA());
  };
  const weiterB = () => { phase = 'b'; fehl = 0; gesperrt = false; $('.zt1', r).innerHTML = d.vergleichen.text; malB(); sag(r, 'tipp', d.vergleichen.start); requestAnimationFrame(() => zi.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); };
  const pruefenA = () => {
    if (gesperrt || !sel.size) return;
    if (sel.size === richtigK.length && richtigK.every((x) => sel.has(x))) { gesperrt = true; sag(r, 'lob', d.erinnern.erfolg, 'gut'); K.summ(20); malA(); return void setTimeout(() => zi.isConnected && weiterB(), 1500); }
    fehl++;
    const falsch = [...sel].filter((x) => !richtigK.includes(x));
    zi.querySelectorAll<HTMLElement>('.kr-mk.an').forEach((e) => { if (falsch.includes(e.dataset.m!)) wackel(e); });
    if (fehl === 1) {
      sag(r, 'tipp', (falsch.length ? K.UI.nochmal : K.UI.nochEiner) + ' ' + d.erinnern.tipp);
      gesperrt = true;
      setTimeout(() => { falsch.forEach((x) => sel.delete(x)); gesperrt = false; if (zi.isConnected) malA(); }, 700);
      return;
    }
    gesperrt = true; sel.clear(); richtigK.forEach((x) => sel.add(x));
    sag(r, 'tipp', K.UI.hilfe + ' ' + d.erinnern.warum);
    malA();
    setTimeout(() => zi.isConnected && weiterB(), 2200);
  };

  /* ---- b) Vergleichen ---- */
  const klar = (c: any) => c.r * 2;
  /** Der umgedrehte Kreis zeigt seine Rückseite: Ausschnitt aus dem Rückseiten-Bild an gleicher Stelle */
  const rueck = (c: any) => `<div class="kr-um" style="left:${c.x}%;top:${c.y}%;width:${klar(c)}%"><img src="${K.img(d.hinten)}" alt="" draggable="false" style="width:${10000 / klar(c)}%;left:${-((c.x - c.r) / klar(c)) * 100}%;top:${-((c.y / d.ratio - c.r) / klar(c)) * 100}%"></div>`;
  const kHtml = (c: any) => {
    const weg = gestr.has(c.id);
    const bhoehe = c.y + c.r * d.ratio + 8; // Mitte des Kreuz-Knopfs unter dem Kreis (in % der Höhe)
    return `<button class="kr-k${weg ? ' weg' : ''}${offen === c.id ? ' um' : ''}${fertigRest(c) ? ' rest' : ''}" data-id="${c.id}" aria-label="Kreis ${kr.indexOf(c) + 1}" style="left:${c.x}%;top:${c.y}%;width:${klar(c)}%">${weg ? kreuz : ''}</button>${phase === 'b' ? `<button class="kr-x${weg ? ' an' : ''}" data-x="${c.id}" style="left:${c.x}%;top:${bhoehe}%" aria-label="Kreis ${kr.indexOf(c) + 1} ${weg ? 'zurücknehmen' : 'durchstreichen'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.400" stroke-linecap="round"/></svg></button>` : ''}`;
  };
  const fertigRest = (c: any) => phase === 'c' && !gestr.has(c.id);
  const malB = () => {
    const merk = kar.filter((k) => k.richtig).map((k) => `<li>${k.text}</li>`).join('');
    const kopf = phase === 'c' ? '' : `<div class="as-hin kr-liste"><span class="as-z">${d.vergleichen.liste}</span><ul>${merk}</ul></div>`;
    const bild = (offen ? '' : '') + `<img class="kr-vorn" src="${K.img(d.vorne)}" alt="" draggable="false">`;
    zi.innerHTML = `${kopf}<div class="kr-bild" style="aspect-ratio:${d.ratio}">${bild}${offen ? rueck(kr.find((c) => c.id === offen)!) : ''}${kr.map(kHtml).join('')}</div>${phase === 'c' ? '' : `<p class="as-raus">${d.vergleichen.frage}</p>`}`;
    if (phase === 'b') unten(knopf('fertig', K.UI.fertig, gestr.size === 0 || gesperrt), () => pruefenB());
  };
  const flip = (id: string) => {
    if (phase !== 'b' || gesperrt) return;
    offen = offen === id ? null : id;
    if (!geflippt) { geflippt = true; sag(r, 'tipp', ''); }
    K.summ(10);
    malB();
    const um = zi.querySelector('.kr-um'); um?.classList.add('klapp');
  };
  const streichT = (id: string) => {
    if (phase !== 'b' || gesperrt) return;
    if (gestr.has(id)) gestr.delete(id); else gestr.add(id);
    K.summ(15);
    malB();
  };
  const weiterC = () => {
    phase = 'c'; offen = null; hook.loese = null; malB();
    sag(r, 'tipp', '');
    const ziel = zi.querySelector<HTMLElement>('.kr-k.rest')!;
    hook.loese = stempeln(zi, ziel, d.stempel, () => { hook.loese = null; ende(r, d, fertig); });
    requestAnimationFrame(() => zi.scrollIntoView({ block: 'end', behavior: 'smooth' }));
  };
  const pruefenB = () => {
    if (gesperrt || !gestr.size || phase !== 'b') return;
    const rest = kr.filter((c) => !gestr.has(c.id));
    if (rest.length === 1 && rest[0].id === d.loesung) { gesperrt = true; return weiterC(); }
    fehl++;
    if (fehl === 1) {
      const zuViel = gestr.has(d.loesung);
      sag(r, 'tipp', zuViel ? d.vergleichen.zuViel : rest.length > 1 ? d.vergleichen.nochMehr : d.vergleichen.falsch);
      if (zuViel) { gesperrt = true; wackel(zi.querySelector(`.kr-k[data-id="${d.loesung}"]`)); setTimeout(() => { gestr.delete(d.loesung); gesperrt = false; if (zi.isConnected) malB(); }, 700); }
      return;
    }
    // zweiter Fehler: die Raupe streicht aus und zeigt, warum
    gesperrt = true;
    kr.forEach((c) => { if (c.id !== d.loesung) gestr.add(c.id); else gestr.delete(c.id); });
    malB();
    sag(r, 'tipp', K.UI.hilfe + ' ' + d.vergleichen.warum);
    setTimeout(() => zi.isConnected && weiterC(), 2200);
  };

  /* ---- Eingaben ---- */
  let druck: { id: string; t: number; lang: boolean } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('.kr-k');
    if (!k || phase !== 'b' || gesperrt) return;
    const dr = { id: k.dataset.id!, t: window.setTimeout(() => { if (druck === dr) { dr.lang = true; streichT(dr.id); } }, 650), lang: false } as any;
    druck = dr;
  });
  const loslassen = () => { if (druck) clearTimeout(druck.t as any); };
  zi.addEventListener('pointerup', loslassen); zi.addEventListener('pointercancel', loslassen);
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (phase === 'a') {
      const m = t.closest<HTMLElement>('.kr-mk');
      if (!m || gesperrt) return;
      const id = m.dataset.m!;
      if (sel.has(id)) sel.delete(id); else sel.add(id);
      m.classList.toggle('an', sel.has(id));
      unten(knopf('pruefen', K.UI.pruefen, sel.size === 0), () => pruefenA());
      return;
    }
    const x = t.closest<HTMLElement>('.kr-x');
    if (x) return streichT(x.dataset.x!);
    const k = t.closest<HTMLElement>('.kr-k');
    if (!k) return;
    if (druck?.lang) { druck = null; return; } // langes Drücken hat schon durchgestrichen
    flip(k.dataset.id!);
  };
  hook.loese = () => {
    if (gesperrt) return;
    if (phase === 'a') { sel.clear(); richtigK.forEach((x) => sel.add(x)); return pruefenA(); }
    if (phase === 'b') { offen = d.loesung; geflippt = true; gestr.clear(); kr.forEach((c) => { if (c.id !== d.loesung) gestr.add(c.id); }); malB(); pruefenB(); }
  };
  $('.zt1', r).innerHTML = d.erinnern.text;
  malA();
  sag(r, 'tipp', d.erinnern.start);
}

/* ============================ 6.5 Geheimagenten-Code (agentencode) ============================ */
export function agentencode(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const W: { echt: string; code: string }[] = d.woerter;
  const strk = new Set<string>();
  let fehl = 0, zu = false;
  const demoHtml = () => `<div class="ag-demo"><div class="ag-dz">${[...d.demo.code].map((c: string, i: number) => `<i class="ag-t${i % 2 ? ' weg' : ''}">${c}</i>`).join('')}</div><span class="ag-pfeil">→</span><div class="ag-dz">${[...d.demo.wort].map((c: string) => `<i class="ag-t ok">${c}</i>`).join('')}</div></div>`;
  const reste = (wi: number) => [...W[wi].code].filter((_, i) => !strk.has(`${wi}:${i}`)).join('');
  const mal = (klar = false) => {
    zi.innerHTML = `<div class="ag-zettel"><p class="ag-regel"><b>Regel:</b> ${d.regel}</p>${demoHtml()}</div><div class="ag-feld${klar ? ' klar' : ''}">${W.map((w, wi) => `<div class="ag-w">${[...w.code].map((c, i) => `<button class="ag-t${strk.has(`${wi}:${i}`) ? ' weg' : ''}" data-w="${wi}" data-i="${i}" ${zu ? 'disabled' : ''}>${c}</button>`).join('')}</div>`).join('')}</div>${klar ? `<p class="ag-botschaft">${W.map((w) => w.echt).join(' ')}</p>` : ''}`;
    unten(klar ? '' : knopf('pruefen', K.UI.pruefen, strk.size === 0), () => pruefen());
  };
  const loesen = (hilfe: boolean) => {
    zu = true; hook.loese = null;
    strk.clear();
    // die Raupe streicht die zweiten Buchstaben
    const alle: string[] = [];
    W.forEach((w, wi) => [...w.code].forEach((_, i) => { if (i % 2) alle.push(`${wi}:${i}`); }));
    const los = (k: number) => {
      if (!zi.isConnected) return;
      if (k < alle.length) { strk.add(alle[k]); mal(); return void setTimeout(() => los(k + 1), hilfe ? 90 : 0); }
      mal(true);
      ende(r, d, fertig, hilfe ? K.UI.hilfe : '');
    };
    los(0);
  };
  const pruefen = () => {
    if (zu || !strk.size) return;
    const falsch = W.map((w, wi) => (reste(wi) === w.echt ? -1 : wi)).filter((i) => i >= 0);
    if (!falsch.length) { zu = true; hook.loese = null; mal(true); return ende(r, d, fertig); }
    fehl++;
    falsch.forEach((wi) => zi.querySelectorAll(`.ag-t[data-w="${wi}"].weg, .ag-t[data-w="${wi}"]`).forEach((e) => wackel(e)));
    if (fehl === 1) return sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp);
    sag(r, 'tipp', K.UI.hilfe);
    zu = true;
    setTimeout(() => zi.isConnected && loesen(true), 800);
  };
  zi.onclick = (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('.ag-feld .ag-t');
    if (!t || zu) return;
    const k = `${t.dataset.w}:${t.dataset.i}`;
    if (strk.has(k)) strk.delete(k); else strk.add(k);
    t.classList.toggle('weg', strk.has(k));
    unten(knopf('pruefen', K.UI.pruefen, strk.size === 0), () => pruefen());
  };
  hook.loese = () => loesen(false);
  mal();
  sag(r, 'tipp', d.start);
}

/* ============================ 6.6 Das Plakat (plakat) ============================ */
export function plakat(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const cols: number = d.spalten, rows: number = d.zeilen, N = cols * rows;
  const url = K.img(d.bild);
  const plaetze: (number | null)[] = Array.from({ length: N }, () => null);
  const ordnung = K.mischen(Array.from({ length: N }, (_, i) => String(i))).map(Number);
  let sel: number | null = null, fehl = 0, sperre = false;
  const stueck = (i: number, kl = '') => `<div class="pk-st${kl}${sel === i ? ' sel' : ''}" data-s="${i}" style="background-image:url(${url});background-size:${cols * 100}% ${rows * 100}%;background-position:${cols > 1 ? ((i % cols) / (cols - 1)) * 100 : 0}% ${rows > 1 ? (Math.floor(i / cols) / (rows - 1)) * 100 : 0}%"></div>`;
  const mal = (fest = false) => {
    zi.innerHTML = `<div class="pk-brett${fest ? ' fest' : ''}" style="--sp:${cols};aspect-ratio:${d.ratio}">${plaetze.map((s, p) => `<div class="pk-platz${s !== null ? ' voll' : ''}" data-p="${p}">${s !== null ? stueck(s) : ''}</div>`).join('')}</div>${fest ? '' : `<div class="pk-pool" style="--sp:${cols}">${ordnung.map((s, k) => `<div class="pk-zelle" style="--w:${[-3, 2, -2, 3, -3, 2][k % 6]}deg">${plaetze.includes(s) ? '' : stueck(s)}</div>`).join('')}</div>`}`;
    if (!fest) unten(knopf('fertig', K.UI.fertig, plaetze.some((p) => p === null) || sperre), () => pruefe());
  };
  const setze = (s: number, p: number) => {
    const von = plaetze.indexOf(s), alt = plaetze[p];
    plaetze[p] = s;
    if (von >= 0) plaetze[von] = alt;
    sel = null; mal();
  };
  let drag: { el: HTMLElement; s: number; x: number; y: number; bewegt: boolean } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    if (sperre) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.pk-st');
    if (!el) return;
    drag = { el, s: +el.dataset.s!, x: e.clientX, y: e.clientY, bewegt: false };
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
    const { el, s, bewegt } = drag; drag = null;
    if (!bewegt) {
      if (plaetze.includes(s)) { plaetze[plaetze.indexOf(s)] = null; sel = null; } else sel = sel === s ? null : s;
      return mal();
    }
    el.classList.remove('zieht');
    const platz = e.type === 'pointerup' ? (document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('pk-platz')) as HTMLElement | undefined) : undefined;
    if (platz) setze(s, +platz.dataset.p!); else { el.style.transform = ''; mal(); }
  };
  zi.addEventListener('pointerup', ablegen); zi.addEventListener('pointercancel', ablegen);
  zi.addEventListener('click', (e) => {
    const p = (e.target as HTMLElement).closest<HTMLElement>('.pk-platz');
    if (p && !(e.target as HTMLElement).closest('.pk-st') && sel !== null && !sperre && plaetze[+p.dataset.p!] === null) setze(sel, +p.dataset.p!);
  });
  const geschafft = () => {
    unten(''); hook.loese = null;
    mal(true);
    sag(r, 'lob', d.plakatFertig);
    K.summ([20, 40, 60]);
    if (d.schluss) setTimeout(() => zi.isConnected && schlussFrage(r, zi, d, fertig), 700); else ende(r, d, fertig);
  };
  const loesen = async (mitRaupe: boolean) => {
    sperre = true; hook.loese = null; mal();
    for (let p = 0; p < N; p++) {
      if (plaetze[p] === p) continue;
      const alt = plaetze.indexOf(p);
      if (alt >= 0) plaetze[alt] = null;
      plaetze[p] = p;
      mal();
      if (mitRaupe) await warte(450);
    }
    if (zi.isConnected) geschafft();
  };
  const pruefe = async () => {
    if (sperre || plaetze.some((p) => p === null)) return;
    const falsch = plaetze.map((s, p) => (s === p ? -1 : p)).filter((p) => p >= 0);
    if (!falsch.length) return loesen(false);
    fehl++;
    sperre = true; mal();
    falsch.forEach((p) => zi.querySelector(`.pk-platz[data-p="${p}"] .pk-st`)?.classList.add('nein'));
    await warte(650);
    falsch.forEach((p) => { plaetze[p] = null; });
    if (fehl === 1) { sperre = false; sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp); return mal(); }
    sag(r, 'tipp', K.UI.hilfe);
    loesen(true);
  };
  hook.loese = () => loesen(false);
  mal();
}


/* ============================ 7.1 Das Wort im Baum (astgabel, Schlüsselmoment 3) ============================ */
/** Drei versteckte Buchstaben (Laub, Rinde) ergeben AST; dann wählt das Kind unter fünf Astgabeln die, die zum Text passt. */
export function astgabel(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const runden: any[] = d.runden, gef: string[] = [];
  const reihe = document.createElement('div');
  reihe.className = 'ab-wort';
  const felder = () => (d.wort as string).split('').map((c, i) => `<i class="${gef[i] ? 'da' : ''}">${gef[i] ?? ''}</i>`).join('');
  reihe.innerHTML = felder();
  r.insertBefore(reihe, zi);
  let k = 0;
  const runde = () => {
    const q = runden[k];
    versteckt(r, q, () => {
      gef[k] = q.buchstabe; reihe.innerHTML = felder(); K.summ(20); k++;
      if (k < runden.length) setTimeout(() => zi.isConnected && runde(), 1500);
      else setTimeout(() => zi.isConnected && wort(), 1200);
    });
  };
  /** Das Wort steht da: die Raupe liest es vor, dann geht es zum Baum */
  const wort = () => {
    reihe.classList.add('fertig');
    sag(r, 'lob', d.wortText, 'gut');
    K.summ([20, 40, 60]);
    const los = () => { hook.loese = null; gabeln(); };
    unten(knopf('weiter', K.UI.weiter), los);
    hook.loese = los;
  };
  /** Erst erinnern (zwei von vier Karten), dann den Baum: das Kind tippt irgendwo hin, nur die fünf Gabel-Zonen (unsichtbar, in Prozent der Bildbreite) zählen */
  const gabeln = () => {
    const E = d.erinnern, ok = new Set<number>();
    let fehlK = 0, zuK = false;
    $('.zt1', r).innerHTML = E.frage;
    sag(r, 'tipp', E.start);
    const malK = () => {
      zi.innerHTML = `<div class="ab-ek">${E.karten.map((c: any, i: number) => `<button class="ab-e${ok.has(i) ? ' ja' : ''}" data-i="${i}">${c.text}</button>`).join('')}</div>`;
    };
    malK();
    unten('');
    const weiterBaum = () => { zuK = true; hook.loese = null; setTimeout(() => zi.isConnected && baum(), 1500); };
    const pruefK = () => { if (E.karten.every((c: any, i: number) => !c.ok || ok.has(i))) { sag(r, 'lob', E.ok, 'gut'); K.summ(20); weiterBaum(); } };
    zi.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('.ab-e');
      if (!b || zuK) return;
      const i = +b.dataset.i!, c = E.karten[i];
      if (c.ok) { ok.add(i); malK(); return pruefK(); }
      wackel(b); b.classList.add('falsch');
      if (++fehlK === 1) return sag(r, 'tipp', K.UI.nochmal + ' ' + E.nein);
      E.karten.forEach((q: any, j: number) => q.ok && ok.add(j)); malK();
      zuK = true; hook.loese = null; sag(r, 'tipp', K.UI.hilfe + ' ' + E.ok);
      setTimeout(() => zi.isConnected && baum(), 2200);
    };
    hook.loese = () => { if (!zuK) { E.karten.forEach((q: any, j: number) => q.ok && ok.add(j)); malK(); weiterBaum(); } };
  };
  const baum = () => {
    $('.zt1', r).innerHTML = d.frage;
    sag(r, 'tipp', d.start);
    zi.innerHTML = `<div class="ab-bild" style="aspect-ratio:${d.ratio}"><img src="${K.img(d.bild)}" alt="" draggable="false"></div>`;
    const box = $('.ab-bild', zi);
    let fehl = 0, zu = false, hinOffen = false;
    const ring = (g: any, kl: string) => box.insertAdjacentHTML('beforeend', `<i class="ring ${kl}" style="left:${g.x}%;top:${g.y}%;width:${g.r * 2}%;height:auto;aspect-ratio:1;margin:0;transform:translate(-50%,-50%)"></i>`);
    const richtigG = () => d.gabeln.find((g: any) => g.id === d.richtig);
    unten('');
    const loesen = (hilfe: boolean) => {
      zu = true; hook.loese = null; unten('');
      zi.querySelector('.ab-hin')?.remove();
      ring(richtigG(), hilfe ? 'da blink' : 'da');
      sag(r, hilfe ? 'tipp' : 'lob', hilfe ? K.UI.hilfe + ' ' + d.warum : d.warum, hilfe ? '' : 'gut');
      setTimeout(() => {
        if (!zi.isConnected) return;
        const g = richtigG();
        hook.loese = stempeln(zi, box, d.stempel, () => { hook.loese = null; ende(r, d, fertig); }, { x: g.x, y: g.y });
      }, hilfe ? 1800 : 900);
    };
    const nachsehen = () => {
      if (hinOffen) return;
      hinOffen = true;
      zi.insertAdjacentHTML('beforeend', `<div class="as-hin ab-hin"><span class="as-z">${d.erinnerung.text}</span><p>${d.erinnerung.absatz}</p></div>`);
      unten('');
    };
    box.onclick = (e) => {
      if (zu) return;
      const rc = box.getBoundingClientRect(), px = e.clientX - rc.left, py = e.clientY - rc.top;
      let beste: any = null, bd = 1e9;
      for (const g of d.gabeln) { const dd = Math.hypot(px - g.x / 100 * rc.width, py - g.y / 100 * rc.height); if (dd <= g.r / 100 * rc.width && dd < bd) { bd = dd; beste = g; } }
      if (!beste) return; // daneben: zählt nicht
      if (beste.id === d.richtig) return loesen(false);
      box.querySelectorAll('.ring.miss').forEach((q) => q.remove());
      box.insertAdjacentHTML('beforeend', `<i class="ring miss" style="left:${px / rc.width * 100}%;top:${py / rc.height * 100}%"></i>`);
      setTimeout(() => box.querySelector('.ring.miss')?.remove(), 900);
      if (++fehl === 1) {
        sag(r, 'tipp', K.UI.nochmal + ' ' + beste.nicht);
        unten(knopf('nachsehen', d.nachsehen), (a) => { if (a === 'nachsehen') nachsehen(); });
        return;
      }
      loesen(true);
    };
    hook.loese = () => { if (!zu) loesen(false); };
  };
  hook.loese = null;
  runde();
}

/* ============================ 7.2 Ben zieht den Käse (faden, Spiel ohne Verlieren) ============================ */
export function faden(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  const N: number = d.runden ?? 3;
  let ok = 0, miss = 0, held = false, assist = false, m = 0.12, zustand: 'warte' | 'achtung' | 'sprung' | 'pause' = 'pause', t0 = 0, geprueft = false, fertigig = false, fruehGesagt = 0;
  zi.innerHTML = `<div class="fd-zaehl"></div><div class="fd-buehne"><div class="fd-vorhang l"></div><div class="fd-vorhang rr"></div><div class="fd-faden"></div><img class="fd-mond" src="${K.img(d.bild)}" alt="" draggable="false"><img class="fd-maus" src="${K.img(d.maus)}" alt="" draggable="false"><i class="fd-achtung" aria-hidden="true">!</i></div><button class="kn haupt fd-knopf" data-a="ziehen"><span>${K.UI.faden}</span></button>`;
  unten('');
  const bu = $('.fd-buehne', zi), mond = $('.fd-mond', zi), maus = $('.fd-maus', zi), fa = $('.fd-faden', zi), kn = $('.fd-knopf', zi);
  const punkte = () => { $('.fd-zaehl', zi).innerHTML = `<span class="pkt hell">${[...Array(N)].map((_, i) => `<i class="${i < ok ? 'an' : ''}"></i>`).join('')}</span>`; };
  punkte();
  const setze = (neu: typeof zustand) => { zustand = neu; t0 = performance.now(); maus.classList.toggle('achtung', neu === 'achtung'); maus.classList.toggle('sprung', neu === 'sprung'); bu.classList.toggle('alarm', neu === 'achtung'); };
  const hoch = (e: Event, v: boolean) => { e.preventDefault(); held = v; kn.classList.toggle('an', v); };
  kn.addEventListener('pointerdown', (e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); hoch(e, true); });
  kn.addEventListener('pointerup', (e) => hoch(e, false)); kn.addEventListener('pointercancel', (e) => hoch(e, false)); kn.addEventListener('contextmenu', (e) => e.preventDefault());
  kn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') hoch(e, true); }); kn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') hoch(e, false); });
  const fertigSpiel = () => {
    if (fertigig) return;
    fertigig = true; hook.loese = null; held = false; ok = N; punkte(); setze('pause'); mond.classList.add('tanzt');
    ende(r, d, fertig);
  };
  const runde = (ms = 0) => { /* nächste Runde: warten, dann springt die Maus */ setze('pause'); setTimeout(() => { if (zi.isConnected && !fertigig) setze('warte'); }, ms); };
  let letzt = performance.now();
  const takt = (jetzt: number) => {
    if (!zi.isConnected || fertigig) return;
    const dt = Math.min(0.05, (jetzt - letzt) / 1000); letzt = jetzt;
    const zieht = held || (assist && (zustand === 'sprung' || zustand === 'achtung'));
    m = zieht ? Math.min(1, m + dt * 2.4) : Math.max(0.12, m - dt * 0.9);
    mond.style.top = `${24 - 34 * m}%`;
    fa.style.height = `${Math.max(0, 24 - 34 * m) + 6}%`;
    const t = jetzt - t0;
    if (zustand === 'warte') {
      if (m > 0.3) { if (zieht && jetzt - fruehGesagt > 3500) { fruehGesagt = jetzt; sag(r, 'tipp', d.frueh); } t0 = jetzt; } // Käse oben: Die Maus wartet
      else if (t > 1400) { sag(r, 'tipp', ''); setze('achtung'); }
    } else if (zustand === 'achtung') {
      if (t > 700) { geprueft = false; setze('sprung'); }
    } else if (zustand === 'sprung') {
      if (!geprueft && t > 1000) { // höchster Punkt: ist der Käse schon hoch genug?
        geprueft = true;
        if (m > 0.85) { ok++; miss = 0; assist = false; punkte(); K.summ(25); mond.classList.add('wipp'); setTimeout(() => mond.classList.remove('wipp'), 700); sag(r, 'lob', ok >= N ? '' : 'Hopp! Der Käse ist weg, bevor die Maus ihn fasst.', 'gut'); if (ok >= N) return void fertigSpiel(); }
        else { miss++; maus.classList.add('schnapp'); setTimeout(() => maus.classList.remove('schnapp'), 500); assist = miss >= 2; sag(r, 'tipp', miss >= 2 ? d.hilfe : d.knapp); }
      }
      if (t > 2000) { runde(900); }
    }
    requestAnimationFrame(takt);
  };
  hook.loese = fertigSpiel;
  sag(r, 'tipp', d.start);
  runde(900);
  requestAnimationFrame(takt);
}

/* ============================ 7.3 Was blitzt da? (nest) ============================ */
export function nest(r: HTMLElement, d: Daten, fertig: () => void) {
  const zi = $('.zi', r);
  zi.innerHTML = `<p class="nt-frage"></p><div class="nt-bild" style="aspect-ratio:${d.ratio}"><img src="${K.img(d.bild)}" alt="" draggable="false"></div>`;
  unten('');
  const box = $('.nt-bild', zi);
  sag(r, 'tipp', d.start);
  const Z: any[] = d.ziele;
  let i = 0, fehl = 0, zu = false;
  const frage = () => { $('.nt-frage', zi).innerHTML = i < Z.length ? Z[i].frage : ''; };
  const ring = (z: any, kl: string) => box.insertAdjacentHTML('beforeend', `<i class="ring ${kl}" style="left:${z.x}%;top:${z.y}%;width:${z.r * 2}%;height:auto;aspect-ratio:1;margin:0;transform:translate(-50%,-50%)"></i>`);
  const weiter = (hilfe: boolean) => {
    const z = Z[i];
    ring(z, hilfe ? 'da blink' : 'da');
    K.summ(25);
    sag(r, 'lob', (hilfe ? K.UI.hilfe + ' ' : '') + z.ok, 'gut');
    i++; fehl = 0;
    if (i >= Z.length) { zu = true; hook.loese = null; $('.nt-frage', zi).innerHTML = ''; return void setTimeout(() => zi.isConnected && ende(r, d, fertig), 1300); }
    frage();
  };
  const suche = () => {
    hook.loese = () => { while (i < Z.length && !zu) weiter(false); };
    frage();
    box.onclick = (e) => {
      if (zu) return;
      const rc = box.getBoundingClientRect(), z = Z[i];
      const dx = ((e.clientX - rc.left) / rc.width * 100 - z.x) / 100 * rc.width, dy = ((e.clientY - rc.top) / rc.height * 100 - z.y) / 100 * rc.height;
      if (Math.hypot(dx, dy) <= (z.r / 100) * rc.width * 1.25) return weiter(false);
      box.insertAdjacentHTML('beforeend', `<i class="ring miss" style="left:${((e.clientX - rc.left) / rc.width) * 100}%;top:${((e.clientY - rc.top) / rc.height) * 100}%"></i>`);
      setTimeout(() => box.querySelector('.ring.miss')?.remove(), 800);
      if (++fehl === 1) return sag(r, 'tipp', K.UI.nochmal + ' ' + d.tipp);
      weiter(true);
    };
  };
  hook.loese = _laub(box, () => { sag(r, 'tipp', ''); suche(); }, d.zone);
}
