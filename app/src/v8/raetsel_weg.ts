/**
 * Neue Rätsel mit Weg und Formen (D-19): Raupenweg (Spur 21), Passt genau (Spur 15), Laub-Spur (Spur 11).
 * Vertrag wie in raetsel.ts: (rahmen, daten, fertig). Hilfen: import { kontext, sag, unten, … } from './raetsel.ts'.
 * Regel wie überall: 1. Fehler Wackeln + Hinweis der Raupe, 2. Fehler zeigt die Raupe die Lösung (ui.hilfe + Erklärung).
 * Kein Verlieren, keine Uhr. `hook.loese` löst sofort (für Tests). Deutsche Sätze kommen nur aus den Daten.
 */
import './raetsel_weg.css';
import { kontext, sag, unten, wackel, ende, stempeln, hook } from './raetsel.ts';
import { laub as _laub } from './staub.ts';
import { szeneHinten, szeneVorne } from './raetsel_weg_szene.ts';

type Spiel = (r: HTMLElement, d: any, fertig: () => void) => void;
export const SPIELE_WEG: Record<string, Spiel> = {};

type Pt = { x: number; y: number; unter?: boolean };
const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode) => r.querySelector(s) as E;
/** Klartext für aria-label: Daten sind HTML mit Silben-Spans */
const klar = (h: unknown) => String(h ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/"/g, '').replace(/\s+/g, ' ').trim();
/** „weniger Bewegung“: Web-Animationen springen sofort ans Ende (CSS-Animationen stellt effekte.css still) */
const ruhig = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const nach = (zi: HTMLElement, ms: number, f: () => void) => window.setTimeout(() => { if (zi.isConnected) f(); }, ms);
const PFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ============================ Raupenweg (Spur 21): die Raupe kriecht über die Äste zum Nest ============================ */
/**
 * Daten: szene ("baum" = gezeichnete Szene aus raetsel_weg_szene.ts, sonst Bild `bild`), ratio, anfang {x,y} (Prozent), punkte[3] = Gabeln:
 *   { text (Hinweis), ok (Raupe nach richtiger Wahl), warum (Erklärung bei Hilfe),
 *     wege[2–3]: { x, y (Tipp-Ziel auf dem Ast), richtig?, vor?/weg?: [{x,y,unter?}] (Punkte vor dem Ziel bzw. weiter bis zur nächsten Gabel), nicht (Raupe bei falscher Wahl),
 *                  zweig? (data-z des Zweigs in der Szene, der bei falscher Wahl wackelt), name? (nur für aria) } }
 * Der letzte Punkt des richtigen Weges der letzten Gabel ist der Nestrand. Die Leuchtspur ist eine goldene Linie, die mitwächst.
 */
SPIELE_WEG.raupenweg = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const P: any[] = d.punkte ?? [];
  const ratio: number = d.ratio ?? 1.5;
  const still = ruhig();
  let k = 0, fehl = 0, zu = true, fertigig = false, posT = 0;
  let pos: Pt = { x: d.anfang?.x ?? 15, y: d.anfang?.y ?? 66 };
  let lauf: Animation | null = null;
  const lagen = (x: number, y: number) => `left:${x}%;top:${y}%`;
  const gemalt = d.szene === 'baum';
  zi.innerHTML = `<div class="rw-hinweis" aria-live="polite"><b class="rw-nr"></b><p></p></div>`
    + `<div class="rw-bild${gemalt ? ' gemalt' : ''}" style="aspect-ratio:${ratio}">${gemalt ? szeneHinten() : `<img class="rw-hg" src="${K.img(d.bild)}" alt="" draggable="false">`}`
    + `<div class="rw-lage"><svg class="rw-spur" viewBox="0 0 ${100 * ratio} 100" preserveAspectRatio="none" aria-hidden="true"></svg>`
    + `<div class="rw-figur" style="${lagen(pos.x, pos.y)}"><img src="${K.fig('raupe/brrr')}" alt="" draggable="false"></div>`
    + `${gemalt ? szeneVorne() : ''}<div class="rw-wahlen"></div></div></div>`;
  unten('');
  const bild = $('.rw-bild', zi), lage = $('.rw-lage', zi), figur = $('.rw-figur', zi), fimg = figur.querySelector('img')!;
  const wahlen = $('.rw-wahlen', zi), spur = $('.rw-spur', zi), hinweis = $('.rw-hinweis', zi);
  const pose = (p: string) => { fimg.src = K.fig('raupe/' + p); };
  const setzeFigur = (p: Pt) => { figur.style.left = p.x + '%'; figur.style.top = p.y + '%'; figur.classList.toggle('unter', !!p.unter); };
  const richtigeWahl = () => P[k].wege.findIndex((w: any) => w.richtig);
  /** Weg einer Wahl: Tipp-Ziel, dann die Punkte bis zur nächsten Gabel */
  const wegVon = (w: any): Pt[] => [...(w.vor ?? []), { x: w.x, y: w.y, unter: w.unter }, ...(w.weg ?? [])];

  /** Leuchtspur der Fühler: eine goldene, weich leuchtende Linie wächst hinter der Raupe her (Bildmaß: x × ratio, y) */
  const leuchtspur = (von: Pt, pts: Pt[], dauer: number) => {
    const alle = [von, ...pts];
    const dd = alle.map((p, i) => `${i ? 'L' : 'M'}${(p.x * ratio).toFixed(2)} ${p.y.toFixed(2)}`).join('');
    const ns = 'http://www.w3.org/2000/svg';
    const glut = document.createElementNS(ns, 'path'), linie = document.createElementNS(ns, 'path');
    glut.setAttribute('d', dd); glut.setAttribute('class', 'rw-glut');
    linie.setAttribute('d', dd); linie.setAttribute('class', 'rw-linie');
    spur.append(glut, linie);
    const l = linie.getTotalLength();
    for (const el of [glut, linie]) {
      el.style.strokeDasharray = `${l} ${l}`;
      if (still || !dauer) continue;
      el.animate([{ strokeDashoffset: l }, { strokeDashoffset: 0 }], { duration: dauer, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'backwards' });
    }
  };

  /** Hinweis der aktuellen Gabel und ihre Wege (Pfeile auf den Ästen) */
  const zeigeGabel = () => {
    const g = P[k];
    fehl = 0; zu = false;
    hinweis.classList.remove('neu'); void hinweis.offsetWidth; hinweis.classList.add('neu');
    $('.rw-nr', hinweis).textContent = String(k + 1);
    $('p', hinweis).innerHTML = g.text ?? '';
    pose(k === 0 ? 'brrr' : 'denkt');
    wahlen.innerHTML = g.wege.map((w: any, i: number) => {
      const winkel = Math.atan2((w.y - pos.y) / ratio, w.x - pos.x) * 180 / Math.PI;
      const name = klar(w.name) || `Weg ${i + 1}`; // Ersatz-Beschriftung nur für Vorlese-Programme
      return `<button class="rw-wahl" data-i="${i}" style="${lagen(w.x, w.y)};--dreh:${winkel.toFixed(1)}deg;animation-delay:${i * 90}ms" aria-label="${name}">${PFEIL}</button>`;
    }).join('');
  };

  /** Falscher Ast: er schaukelt (gemalte Szene: der Zweig selbst um seinen Ansatz; Bild: ein Ausschnitt um die Gabel), die Raupe erschrickt kurz */
  const schaukeln = (w: any) => {
    if (gemalt) { // der dicke Ast (ohne `zweig`) wackelt nicht
      if (!w.zweig) return;
      bild.querySelectorAll<SVGElement>(`[data-z="${w.zweig}"]`).forEach((g) => { g.classList.remove('wackelt'); void (g as any).getBBox?.(); g.classList.add('wackelt'); });
      nach(zi, 1000, () => bild.querySelectorAll('.wackelt').forEach((g) => g.classList.remove('wackelt')));
      return;
    }
    const z = document.createElement('div');
    const rc = bild.getBoundingClientRect(), rad = Math.max(40, rc.width * 0.12);
    z.className = 'rw-zweig';
    z.style.backgroundImage = `url("${K.img(d.bild)}")`;
    const m = `radial-gradient(circle ${rad}px at ${w.x}% ${w.y}%, #000 ${Math.round(rad * 0.55)}px, transparent ${Math.round(rad)}px)`;
    z.style.setProperty('-webkit-mask-image', m); z.style.maskImage = m;
    z.style.transformOrigin = `${pos.x}% ${pos.y}%`;
    bild.insertBefore(z, lage);
    nach(zi, 1000, () => z.remove());
  };
  const falsch = (i: number, b: HTMLElement) => {
    const w = P[k].wege[i];
    wackel(b); b.classList.add('aus'); (b as HTMLButtonElement).disabled = true;
    schaukeln(w);
    K.summ(15);
    pose('brrr');
    const k0 = k;
    if (++fehl === 1) { sag(r, 'tipp', w.nicht ?? K.UI.nochmal); nach(zi, 1300, () => { if (k0 === k && !zu) pose('denkt'); }); return; }
    // 2. Fehler: die Raupe zeigt den richtigen Ast und kriecht nach einer Pause selbst los
    zu = true;
    const ri = richtigeWahl();
    wahlen.querySelectorAll<HTMLButtonElement>('.rw-wahl').forEach((x) => { x.disabled = true; if (+x.dataset.i! === ri) x.classList.add('zeig'); });
    sag(r, 'tipp', [K.UI.hilfe, P[k].warum ?? ''].join(' '));
    nach(zi, 1900, () => { if (k0 === k && !fertigig) kriechen(ri, true); });
  };

  /** Die Raupe kriecht den richtigen Weg entlang bis zur nächsten Gabel (oder zum Nest) */
  const kriechen = (i: number, mitHilfe: boolean) => {
    if (fertigig) return;
    zu = true;
    const g = P[k], w = g.wege[i], pts = wegVon(w);
    if (!mitHilfe && g.ok) sag(r, 'lob', g.ok, 'gut');
    K.summ(20);
    const alle = [pos, ...pts];
    const lens = alle.slice(1).map((p, j) => Math.hypot((p.x - alle[j].x) * ratio, p.y - alle[j].y));
    const ges = lens.reduce((a, b) => a + b, 0) || 1;
    const dauer = still ? 0 : Math.min(3200, Math.max(1100, ges * 30));
    leuchtspur(pos, pts, dauer);
    const ziel = pts[pts.length - 1];
    const k0 = k;
    const an = () => {
      if (k0 !== k || fertigig) return;
      lauf = null; figur.classList.remove('kriecht');
      pos = { x: ziel.x, y: ziel.y }; setzeFigur(pos);
      k++;
      if (k >= P.length) return amNest();
      zeigeGabel();
    };
    wahlen.innerHTML = '';
    if (still) { an(); return; }
    pose('lupe');
    figur.classList.add('kriecht');
    let weit = 0;
    const frames: Keyframe[] = alle.map((p, j) => { if (j) weit += lens[j - 1]; return { left: p.x + '%', top: p.y + '%', opacity: p.unter ? 0.45 : 1, offset: weit / ges }; });
    lauf = figur.animate(frames, { duration: dauer, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
    posT = window.setTimeout(() => { if (zi.isConnected) { lauf?.cancel(); an(); } }, dauer + 30);
  };

  /** Am Nestrand: die Fühler leuchten, die Raupe staunt, Schluss-Satz */
  const amNest = () => {
    if (fertigig) return;
    fertigig = true; zu = true; hook.loese = null;
    clearTimeout(posT); lauf?.cancel(); lauf = null;
    figur.classList.remove('kriecht', 'unter');
    wahlen.innerHTML = '';
    if (P.length) { $('.rw-nr', hinweis).textContent = String(P.length); $('p', hinweis).innerHTML = P[P.length - 1].text ?? ''; } // auch nach loese(): der letzte Hinweis
    hinweis.classList.add('fertig');
    pose('staunt');
    figur.classList.add('leuchtet');
    bild.classList.add('am-nest'); // das Laub vor dem Nest geht auf
    ende(r, d, fertig);
  };

  // Antippen eines Pfeils (Finger, Maus, Tastatur)
  wahlen.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.rw-wahl');
    if (!b || zu || (b as HTMLButtonElement).disabled) return;
    const i = +b.dataset.i!;
    if (P[k].wege[i].richtig) kriechen(i, false); else falsch(i, b);
  });

  // Oder: die Raupe mit dem Finger auf einen Pfeil ziehen
  let zug: { id: number; x0: number; y0: number; bewegt: boolean } | null = null;
  const naechste = (cx: number, cy: number) => {
    let best: HTMLElement | null = null, bd = 1e9;
    wahlen.querySelectorAll<HTMLButtonElement>('.rw-wahl:not(:disabled)').forEach((b) => {
      const q = b.getBoundingClientRect(), dd = Math.hypot(cx - (q.left + q.width / 2), cy - (q.top + q.height / 2));
      if (dd < Math.max(q.width, 52) && dd < bd) { bd = dd; best = b; }
    });
    return best as HTMLElement | null;
  };
  figur.addEventListener('pointerdown', (e) => {
    if (zu) return;
    zug = { id: e.pointerId, x0: e.clientX, y0: e.clientY, bewegt: false };
    figur.setPointerCapture(e.pointerId);
  });
  figur.addEventListener('pointermove', (e) => {
    if (!zug || zug.id !== e.pointerId) return;
    const dx = e.clientX - zug.x0, dy = e.clientY - zug.y0;
    if (!zug.bewegt && Math.hypot(dx, dy) > 8) { zug.bewegt = true; figur.classList.add('zieht'); }
    if (!zug.bewegt) return;
    figur.style.translate = `${dx}px ${dy}px`;
    const n = naechste(e.clientX, e.clientY);
    wahlen.querySelectorAll('.rw-wahl.nah').forEach((x) => x !== n && x.classList.remove('nah'));
    n?.classList.add('nah');
  });
  const los = (e: PointerEvent) => {
    if (!zug || zug.id !== e.pointerId) return;
    const bewegt = zug.bewegt; zug = null;
    figur.classList.remove('zieht'); figur.style.translate = '';
    wahlen.querySelectorAll('.rw-wahl.nah').forEach((x) => x.classList.remove('nah'));
    if (!bewegt || e.type !== 'pointerup' || zu) return;
    const b = naechste(e.clientX, e.clientY);
    if (b) b.click();
  };
  figur.addEventListener('pointerup', los); figur.addEventListener('pointercancel', los);

  hook.loese = () => {
    if (fertigig) return;
    clearTimeout(posT); lauf?.cancel(); lauf = null;
    // ganzen restlichen Weg auf einmal: Leuchtspur und Raupe am Nest
    for (; k < P.length; k++) { const w = P[k].wege[richtigeWahl()], pts = wegVon(w); leuchtspur(pos, pts, 0); pos = pts[pts.length - 1]; }
    setzeFigur({ x: pos.x, y: pos.y });
    amNest();
  };
  sag(r, 'tipp', d.start ?? '');
  if (!P.length) return amNest();
  zeigeGabel();
};

/* ============================ Passt genau (Spur 15): drei braune Flecken in die Löcher des Bogens ============================ */
/**
 * Daten: flecken[3] { id, groesse (Prozent des Käse-Durchmessers), x, y (Prozent des Käses), name? },
 *   loecher[3] { fleck (id des passenden Flecks), x, y (Prozent des Bogens; Bogen = 1,6 × 0,8 Käse-Durchmesser, also 2:1), name? },
 *   demo (Raupe probiert vor), start, nicht (Fleck zu klein: wackelt), nein (Fleck zu groß), ok (passt), warum (Hilfe), stempel, erfolg.
 */
SPIELE_WEG.passtgenau = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const F: any[] = d.flecken ?? [], L: any[] = d.loecher ?? [];
  const still = ruhig();
  const imLoch: Record<string, number> = {}; // Fleck-id → Loch-Index
  let sel: string | null = null, fehl = 0, sperre = true, demo = true, fertigig = false, nachZug = 0;
  const laeuft: Animation[] = [];
  const g = (id: string) => +(F.find((f) => f.id === id)?.groesse ?? 25);
  const fleckName = (f: any, i: number) => klar(f.name) || `Fleck ${i + 1}`; // Ersatz-Beschriftung nur für Vorlese-Programme
  const lochName = (l: any, i: number) => klar(l.name) || `Loch ${i + 1}`;
  const fleckHtml = (f: any, i: number, drin: boolean) => `<button class="pg-fleck${drin ? ' drin' : ''}${sel === f.id ? ' sel' : ''}" data-f="${f.id}" style="${drin ? '' : `left:${f.x}%;top:${f.y}%;`}--g:${f.groesse}" aria-label="${fleckName(f, i)}"${drin ? ' tabindex="-1" aria-disabled="true"' : ` aria-pressed="${sel === f.id}"`}></button>`;
  const mal = () => {
    zi.querySelector('.pg')?.remove();
    const voll = F.every((f) => imLoch[f.id] !== undefined);
    zi.insertAdjacentHTML('afterbegin', `<div class="pg${voll ? ' voll' : ''}"><div class="pg-in">`
      + `<div class="pg-kaese">${F.map((f) => `<i class="pg-spur" style="left:${f.x}%;top:${f.y}%;--g:${f.groesse}"></i>`).join('')}${F.map((f, i) => (imLoch[f.id] === undefined ? fleckHtml(f, i, false) : '')).join('')}</div>`
      + `<div class="pg-bogen">${L.map((l, j) => { const f = F.find((x) => imLoch[x.id] === j); return `<button class="pg-loch${f ? ' zu' : ''}" data-l="${j}" style="left:${l.x}%;top:${l.y}%;--g:${g(l.fleck)}" aria-label="${lochName(l, j)}"${f ? ' tabindex="-1" aria-disabled="true"' : ''}>${f ? fleckHtml(f, F.indexOf(f), true) : ''}</button>`; }).join('')}</div>`
      + `</div></div>`);
  };
  const pg = () => $('.pg', zi);
  const mitte = (el: Element) => { const q = el.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; };
  const halt = () => { laeuft.splice(0).forEach((a) => a.cancel()); };

  /** Raupe macht es vor: der kleinste Fleck (als Schatten-Kopie) wackelt im größten Loch */
  const vormachen = () => {
    if (!demo) return; // den Satz `demo` hat die Raupe schon beim Start gesagt
    const klein = [...F].sort((a, b) => a.groesse - b.groesse)[0];
    const gross = L.reduce((b, l, j) => (g(l.fleck) > g(L[b].fleck) ? j : b), 0);
    const quelle = pg().querySelector<HTMLElement>(`.pg-fleck[data-f="${klein?.id}"]`), loch = pg().querySelector<HTMLElement>(`.pg-loch[data-l="${gross}"]`);
    if (!klein || !quelle || !loch || g(klein.id) >= g(L[gross].fleck)) return spielen();
    const geist = quelle.cloneNode() as HTMLElement;
    geist.className = 'pg-fleck geist'; geist.removeAttribute('aria-label'); geist.setAttribute('aria-hidden', 'true'); geist.tabIndex = -1;
    quelle.parentElement!.appendChild(geist);
    quelle.classList.add('probe');
    const a = mitte(quelle), b = mitte(loch);
    const dx = b.x - a.x, dy = b.y - a.y, spiel = (loch.offsetWidth - quelle.offsetWidth) / 2 * 0.8;
    loch.classList.add('probe');
    const weg = () => { geist.remove(); quelle.classList.remove('probe'); loch.classList.remove('probe'); };
    if (still) { geist.style.translate = `${dx}px ${dy}px`; nach(zi, 2600, () => { if (demo) { weg(); spielen(); } }); return; }
    const t = (x: number, y: number) => `translate(${dx + x}px, ${dy + y}px)`;
    const an = geist.animate([
      { transform: 'translate(0,0)', offset: 0 }, { transform: 'translate(0,-6px) scale(1.06)', offset: 0.08 },
      { transform: t(0, 0), offset: 0.34 }, { transform: t(-spiel, 0), offset: 0.42 }, { transform: t(spiel, spiel * 0.4), offset: 0.5 },
      { transform: t(-spiel * 0.6, -spiel * 0.6), offset: 0.58 }, { transform: t(spiel * 0.7, -spiel * 0.3), offset: 0.66 }, { transform: t(0, 0), offset: 0.74 },
      { transform: t(0, 0), offset: 0.8 }, { transform: 'translate(0,0)', offset: 1 },
    ], { duration: 3600, easing: 'ease-in-out', fill: 'forwards' });
    laeuft.push(an);
    nach(zi, 3650, () => { if (demo) { weg(); spielen(); } });
  };
  const spielen = () => {
    if (!demo) return;
    demo = false; sperre = false; halt();
    pg().querySelectorAll('.geist').forEach((x) => x.remove());
    pg().querySelectorAll('.probe').forEach((x) => x.classList.remove('probe'));
    sag(r, 'tipp', d.start ?? '');
  };

  /** Fleck sitzt im Loch: mit einer kleinen Bewegung vom alten Platz hinein (FLIP) */
  const passt = (id: string, j: number, von: { x: number; y: number } | null, mitHilfe: boolean) => {
    imLoch[id] = j; sel = null;
    mal();
    const neu = pg().querySelector<HTMLElement>(`.pg-loch[data-l="${j}"] .pg-fleck`);
    if (neu && von && !still) { const z = mitte(neu); laeuft.push(neu.animate([{ transform: `translate(${von.x - z.x}px, ${von.y - z.y}px) scale(1.05)` }, { transform: 'translate(0,0) scale(1.08)', offset: 0.75 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' })); }
    neu?.closest('.pg-loch')?.classList.add('klick');
    K.summ(30);
    const alle = F.every((f) => imLoch[f.id] !== undefined);
    if (!alle) { if (!mitHilfe) sag(r, 'lob', d.ok ?? K.UI.stimmt, 'gut'); return; }
    fertigSpiel(mitHilfe);
  };
  const fertigSpiel = (mitHilfe: boolean) => {
    if (fertigig) return;
    fertigig = true; sperre = true;
    if (!mitHilfe) sag(r, 'lob', d.ok ?? K.UI.stimmt, 'gut');
    const bogen = $('.pg-bogen', zi);
    nach(zi, still ? 0 : 700, () => { hook.loese = stempeln(zi, bogen, d.stempel ?? '', () => { hook.loese = null; ende(r, d, fertig); }); });
  };

  /** Fleck passt nicht: er fährt zum Loch, wackelt (zu klein) oder stößt an (zu groß) und kommt zurück */
  const passtNicht = (id: string, j: number, el: HTMLElement) => {
    sperre = true; sel = null;
    el.classList.remove('sel'); el.setAttribute('aria-pressed', 'false');
    const loch = pg().querySelector<HTMLElement>(`.pg-loch[data-l="${j}"]`)!;
    const zuKlein = g(id) < g(L[j].fleck);
    const start = el.style.translate || '0px 0px';
    el.style.translate = '';
    const a = mitte(el), b = mitte(loch), dx = b.x - a.x, dy = b.y - a.y;
    const spiel = zuKlein ? (loch.offsetWidth - el.offsetWidth) / 2 * 0.8 : 0;
    const t = (x: number, y: number, s = 1) => `translate(${dx + x}px, ${dy + y}px) scale(${s})`;
    const [sx, sy] = start.split(' ').map((v) => parseFloat(v) || 0);
    wackel(loch);
    K.summ(15);
    const zurueck = () => {
      sperre = false;
      if (++fehl === 1) return sag(r, 'tipp', zuKlein ? (d.nicht ?? K.UI.nochmal) : (d.nein ?? K.UI.nochmal));
      // 2. Fehler: die Raupe legt diesen Fleck ins richtige Loch
      fehl = 0; sperre = true;
      sag(r, 'tipp', [K.UI.hilfe, d.warum ?? ''].join(' '));
      const rj = L.findIndex((l) => l.fleck === id);
      const ziel = pg().querySelector<HTMLElement>(`.pg-loch[data-l="${rj}"]`);
      ziel?.classList.add('zeig');
      nach(zi, still ? 900 : 1300, () => { sperre = false; const q = pg().querySelector<HTMLElement>(`.pg-fleck[data-f="${id}"]`); passt(id, rj, q ? mitte(q) : null, true); });
    };
    if (still) { zurueck(); return; }
    const kf: Keyframe[] = zuKlein
      ? [{ transform: `translate(${sx}px, ${sy}px)` }, { transform: t(0, 0), offset: 0.28 }, { transform: t(-spiel, 0), offset: 0.38 }, { transform: t(spiel, spiel * 0.4), offset: 0.48 }, { transform: t(-spiel * 0.5, -spiel * 0.6), offset: 0.58 }, { transform: t(0, 0), offset: 0.68 }, { transform: 'translate(0,0)' }]
      : [{ transform: `translate(${sx}px, ${sy}px)` }, { transform: t(0, 0), offset: 0.3 }, { transform: t(0, 0, 0.94), offset: 0.4 }, { transform: t(0, 0, 1.04), offset: 0.5 }, { transform: t(0, 0, 0.96), offset: 0.6 }, { transform: t(0, 0), offset: 0.68 }, { transform: 'translate(0,0)' }];
    el.classList.add('faehrt');
    const an = el.animate(kf, { duration: 1500, easing: 'ease-in-out' });
    laeuft.push(an);
    nach(zi, 1520, () => { el.classList.remove('faehrt'); zurueck(); });
  };

  const versuch = (id: string, j: number, el: HTMLElement) => {
    if (sperre || fertigig || imLoch[id] !== undefined) return;
    if (L[j].fleck === id) return passt(id, j, mitte(el), false);
    passtNicht(id, j, el);
  };

  mal();
  unten('');

  // Ziehen (Finger/Maus) – wie beim Plakat; Antippen: erst Fleck, dann Loch
  let drag: { el: HTMLElement; id: string; x: number; y: number; bewegt: boolean; pid: number } | null = null;
  zi.addEventListener('pointerdown', (e) => {
    if (demo && (e.target as HTMLElement).closest('.pg')) { spielen(); }
    if (sperre || fertigig) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.pg-fleck:not(.drin):not(.geist)');
    if (!el) return;
    drag = { el, id: el.dataset.f!, x: e.clientX, y: e.clientY, bewegt: false, pid: e.pointerId };
    el.setPointerCapture(e.pointerId);
  });
  zi.addEventListener('pointermove', (e) => {
    if (!drag || drag.pid !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.bewegt && Math.hypot(dx, dy) > 8) { drag.bewegt = true; drag.el.classList.add('zieht'); }
    if (!drag.bewegt) return;
    drag.el.style.translate = `${dx}px ${dy}px`;
    const ziel = document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('pg-loch') && !x.classList.contains('zu'));
    zi.querySelectorAll('.pg-loch.ueber').forEach((x) => x !== ziel && x.classList.remove('ueber'));
    ziel?.classList.add('ueber');
  });
  const ablegen = (e: PointerEvent) => {
    if (!drag || drag.pid !== e.pointerId) return;
    const { el, id, bewegt } = drag; drag = null;
    zi.querySelectorAll('.pg-loch.ueber').forEach((x) => x.classList.remove('ueber'));
    if (!bewegt) return; // Antippen: das erledigt 'click'
    nachZug = performance.now();
    el.classList.remove('zieht');
    const ziel = e.type === 'pointerup' ? (document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('pg-loch') && !x.classList.contains('zu')) as HTMLElement | undefined) : undefined;
    if (ziel) return versuch(id, +ziel.dataset.l!, el);
    // daneben: zurück an den Platz
    if (!still) { const [sx, sy] = (el.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0); laeuft.push(el.animate([{ transform: `translate(${sx}px, ${sy}px)` }, { transform: 'none' }], { duration: 260, easing: 'ease-out' })); }
    el.style.translate = '';
  };
  zi.addEventListener('pointerup', ablegen); zi.addEventListener('pointercancel', ablegen);
  zi.addEventListener('click', (e) => {
    if (performance.now() - nachZug < 400) return; // Klick nach dem Ziehen nicht noch einmal zählen
    if (demo && (e.target as HTMLElement).closest('.pg')) spielen(); // Tastatur: Enter beendet die Vorführung
    if (sperre || fertigig) return;
    const f = (e.target as HTMLElement).closest<HTMLElement>('.pg-fleck:not(.drin):not(.geist)');
    if (f) {
      sel = sel === f.dataset.f ? null : f.dataset.f!;
      zi.querySelectorAll<HTMLElement>('.pg-kaese .pg-fleck').forEach((x) => { const an = x.dataset.f === sel; x.classList.toggle('sel', an); x.setAttribute('aria-pressed', String(an)); });
      zi.querySelector('.pg-bogen')?.classList.toggle('wahl', !!sel);
      return;
    }
    const l = (e.target as HTMLElement).closest<HTMLElement>('.pg-loch:not(.zu)');
    if (!l) return;
    if (!sel) { zi.querySelectorAll('.pg-kaese .pg-fleck').forEach((x) => wackel(x)); return; } // erst einen Fleck wählen
    const el = zi.querySelector<HTMLElement>(`.pg-kaese .pg-fleck[data-f="${sel}"]`);
    zi.querySelector('.pg-bogen')?.classList.remove('wahl');
    if (el) versuch(sel, +l.dataset.l!, el);
  });

  hook.loese = () => {
    if (fertigig) return;
    demo = false; halt();
    F.forEach((f) => { if (imLoch[f.id] === undefined) imLoch[f.id] = L.findIndex((l) => l.fleck === f.id); });
    sel = null; mal(); sperre = true; fertigig = true;
    const stemple = stempeln(zi, $('.pg-bogen', zi), d.stempel ?? '', () => { hook.loese = null; ende(r, d, fertig); });
    stemple();
  };
  // erst schaut das Kind zu (die Raupe macht es vor), ein Tipp auf die Fläche überspringt das.
  // Die Vorführung beginnt erst, wenn die Werkzeug-Einblendung weg ist – sonst sieht das Kind sie nicht.
  sag(r, 'tipp', d.demo ?? '');
  let geduld = 30;
  const warteAufBuehne = () => { if (!demo) return; if (document.querySelector('#buehne .wzm') && geduld-- > 0) return void nach(zi, 120, warteAufBuehne); nach(zi, 350, vormachen); };
  requestAnimationFrame(warteAufBuehne);
};

/* ============================ Laub-Spur (Spur 11): vier Laubhaufen, vier Buchstaben, ein Wort ============================ */
/**
 * Die Leucht-Fühler zeigen den Weg: oben vier Laubhaufen (= vier Felder des Wortes), der aktuelle glimmt.
 * Je Runde: 1) Blätter mit dem Finger wegwischen (Laub aus staub.ts), darunter leuchtet ein Buchstabe auf dem Weg,
 * 2) unter ähnlichen Buchstaben den richtigen antippen, 3) er fliegt in sein Feld. Nach vier Runden steht das Wort da.
 * Anders als Spur 20 (AST im Tarnmuster + Astgabel wählen): hier wird gewischt, und das Wort ist das Ziel der Spur.
 * Daten: wort, start (1. Haufen), jetzt (weitere Haufen), nachLaub, frage (über den Knöpfen), runden[] {buchstabe, optionen[], ok?, tipp?}, erfolg.
 * Fehler je Runde: 1. → Wackeln + `tipp` (wie sieht der Buchstabe aus?), 2. → die Raupe zeigt ihn (ui.hilfe).
 */
SPIELE_WEG.laubspur = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const R: any[] = d.runden ?? [];
  const wort: string = d.wort ?? R.map((q) => q.buchstabe).join('');
  const gef: string[] = [];
  let k = 0, fehl = 0, zu = true;
  const feldHtml = () => [...wort].map((c, i) => `<i class="ls-f${i < gef.length ? ' da' : i === k ? ' jetzt' : ''}">${i < gef.length ? gef[i] : HAUFEN}</i>`).join('');
  zi.innerHTML = `<div class="ls"><div class="ls-wort" aria-live="polite">${feldHtml()}<span class="ls-ziel" aria-hidden="true">${BANK_SVG}</span></div><div class="ls-buehne"></div><p class="ls-frage"></p><div class="ls-opts"></div></div>`;
  const ls = $('.ls', zi), buehne = $('.ls-buehne', zi), opts = $('.ls-opts', zi), frage = $('.ls-frage', zi), felder = $('.ls-wort', zi);
  unten('');
  const malFelder = () => { felder.querySelectorAll('.ls-f').forEach((x) => x.remove()); felder.insertAdjacentHTML('afterbegin', feldHtml()); };

  /** Eine Runde: Laubhaufen über dem leuchtenden Buchstaben */
  const runde = () => {
    const q = R[k];
    fehl = 0; zu = true;
    malFelder();
    opts.innerHTML = ''; frage.innerHTML = '';
    const dreh = [-8, 6, -4, 9][k % 4];
    buehne.innerHTML = `<div class="ls-feld"><div class="ls-boden" aria-hidden="true">${KIESEL}</div><b class="ls-b" style="--dreh:${dreh}deg">${q.buchstabe}</b></div>`;
    const feld = $('.ls-feld', buehne);
    feld.classList.add('neu');
    sag(r, 'tipp', k === 0 ? d.start ?? '' : d.jetzt ?? d.start ?? '');
    // erst wischen: der Buchstabe in der Mitte muss frei sein
    hook.loese = _laub(feld, () => { feld.classList.add('frei'); waehlen(); }, { x: 50, y: 50, r: 22 });
  };
  /** Buchstabe frei: ähnliche Buchstaben zur Wahl */
  const waehlen = () => {
    const q = R[k];
    zu = false;
    frage.innerHTML = d.frage ?? '';
    opts.innerHTML = K.mischen([...q.optionen]).map((o: string) => `<button class="ls-o" data-o="${o}">${o}</button>`).join('');
    if (d.nachLaub && k === 0) sag(r, 'staunt', d.nachLaub); else sag(r, 'tipp', '');
    hook.loese = () => wahl(q.buchstabe, opts.querySelector(`[data-o="${q.buchstabe}"]`));
    requestAnimationFrame(() => opts.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  };
  const richtig = (mitHilfe: boolean) => {
    const q = R[k];
    zu = true; hook.loese = null;
    opts.querySelector(`[data-o="${q.buchstabe}"]`)?.classList.add('an');
    opts.querySelectorAll<HTMLButtonElement>('.ls-o').forEach((b) => { b.disabled = true; });
    // der Buchstabe fliegt vom Weg in sein Feld
    const von = $('.ls-b', buehne), ziel = felder.querySelectorAll<HTMLElement>('.ls-f')[k];
    const a = von.getBoundingClientRect(), b = ziel.getBoundingClientRect();
    const flug = document.createElement('b');
    flug.className = 'ls-flug'; flug.textContent = q.buchstabe;
    Object.assign(flug.style, { left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px' });
    document.body.appendChild(flug);
    von.classList.add('weg');
    K.summ(20);
    if (!mitHilfe) sag(r, 'lob', q.ok ?? K.UI.stimmt, 'gut'); // mit Hilfe bleibt die Erklärung der Raupe stehen
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const dauer = ruhig() ? 0 : 650;
    flug.animate([{ transform: 'translate(-50%, -50%) scale(1)' }, { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 40}px)) scale(1.15)`, offset: 0.5 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.7)` }], { duration: dauer, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(() => {
      flug.remove();
      if (!zi.isConnected) return;
      gef.push(q.buchstabe); k++;
      malFelder();
      felder.querySelectorAll('.ls-f')[k - 1]?.classList.add('rein');
      if (k < R.length) return void nach(zi, mitHilfe ? 1400 : 900, runde);
      wortFertig();
    }, dauer + 20);
  };
  const wahl = (o: string, btn: Element | null) => {
    if (zu) return;
    const q = R[k];
    if (o === q.buchstabe) return richtig(false);
    wackel(btn); btn?.classList.add('aus'); (btn as HTMLButtonElement | null)?.setAttribute('disabled', '');
    K.summ(15);
    if (++fehl === 1) return sag(r, 'tipp', [K.UI.nochmal, q.tipp ?? ''].join(' '));
    zu = true;
    sag(r, 'tipp', [K.UI.hilfe, q.tipp ?? '', q.ok ?? ''].join(' '));
    opts.querySelector(`[data-o="${q.buchstabe}"]`)?.classList.add('zeig');
    nach(zi, 1100, () => richtig(true));
  };
  const wortFertig = () => {
    zu = true; hook.loese = null;
    opts.innerHTML = ''; frage.innerHTML = '';
    buehne.innerHTML = '';
    ls.classList.add('fertig');
    K.summ([20, 40, 60]);
    nach(zi, 500, () => ende(r, d, fertig));
  };
  opts.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.ls-o'); if (b && !b.disabled) wahl(b.dataset.o!, b); });
  if (!R.length) return ende(r, d, fertig);
  runde();
};
/** kleiner Laubhaufen als Platzhalter im Wort-Feld */
const HAUFEN = '<svg class="ls-haufen" viewBox="2 10 44 28" aria-hidden="true"><path d="M4 34c4-14 36-14 40 0z" fill="#6E4A24" opacity=".35"/><path d="M6 30c2-9 12-14 18-8-4 7-11 10-18 8z" fill="#D9822B"/><path d="M42 30c-2-9-12-14-18-8 4 7 11 10 18 8z" fill="#E8B23A"/><path d="M14 22c3-10 14-13 18-5-5 6-12 8-18 5z" fill="#C2542A"/><path d="M18 33c4-7 13-8 16-2-5 4-11 5-16 2z" fill="#8DB13E"/><path d="M8 29c6-2 11-5 15-7M40 29c-6-2-11-5-15-7M15 21c6-1 11-3 16-4" stroke="#7A3E16" stroke-width="1" fill="none" opacity=".6"/></svg>';
/** Steinchen und Erdkrümel auf dem Weg unter dem Laub */
const KIESEL = '<svg viewBox="0 0 140 100" preserveAspectRatio="none" aria-hidden="true"><g fill="#B99870"><ellipse cx="14" cy="18" rx="5" ry="3.4"/><ellipse cx="122" cy="14" rx="4" ry="3"/><ellipse cx="128" cy="80" rx="6" ry="4"/><ellipse cx="20" cy="84" rx="4.5" ry="3"/><ellipse cx="70" cy="92" rx="3.5" ry="2.4"/></g><g fill="#7A5A38" opacity=".55"><circle cx="34" cy="10" r="1.6"/><circle cx="104" cy="30" r="1.4"/><circle cx="110" cy="64" r="1.8"/><circle cx="30" cy="62" r="1.4"/><circle cx="52" cy="78" r="1.2"/><circle cx="92" cy="88" r="1.5"/></g><g fill="#C76A2A" opacity=".85"><path d="M8 46c6-6 14-4 16 2-6 6-12 4-16-2z"/><path d="M118 46c4-7 12-7 15-1-5 6-12 6-15 1z"/></g><g fill="#E0A33A" opacity=".9"><path d="M100 6c5-3 11-1 12 4-5 3-10 2-12-4z"/><path d="M36 92c4-5 11-5 13 0-5 4-10 4-13 0z"/></g></svg>';
/** kleine Holzbank: erscheint am Ende neben dem Wort (Ziel der Spur) */
const BANK_SVG = '<svg viewBox="0 0 64 44" aria-hidden="true"><rect x="6" y="8" width="52" height="7" rx="2.5" fill="#B9773A" stroke="#7A4A1E" stroke-width="1.5"/><rect x="6" y="18" width="52" height="7" rx="2.5" fill="#C98544" stroke="#7A4A1E" stroke-width="1.5"/><rect x="4" y="27" width="56" height="6" rx="2.5" fill="#A8692F" stroke="#7A4A1E" stroke-width="1.5"/><path d="M12 33v9M52 33v9M14 8v-4M50 8v-4" stroke="#5A3816" stroke-width="3.2" stroke-linecap="round"/></svg>';
