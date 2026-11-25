/**
 * Neue Rätsel mit Weg und Formen (D-19): Raupenweg (Spur 21), Passt genau (Spur 15).
 * Vertrag wie in raetsel.ts: (rahmen, daten, fertig). Hilfen: import { kontext, sag, unten, … } from './raetsel.ts'.
 * Regel wie überall: 1. Fehler Wackeln + Hinweis der Raupe, 2. Fehler zeigt die Raupe die Lösung (ui.hilfe + Erklärung).
 * Kein Verlieren, keine Uhr. `hook.loese` löst sofort (für Tests). Deutsche Sätze kommen nur aus den Daten.
 */
import './raetsel_weg.css';
import { kontext, sag, unten, wackel, ende, stempeln, hook } from './raetsel.ts';

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
 * Daten: bild, ratio, anfang {x,y} (Prozent des Bildes), punkte[3] = Gabeln:
 *   { text (Hinweis), ok (Raupe nach richtiger Wahl), warum (Erklärung bei Hilfe),
 *     wege[2–3]: { x, y (Tipp-Ziel auf dem Ast), richtig?, weg?: [{x,y,unter?}] (weiter bis zur nächsten Gabel), nicht (Raupe bei falscher Wahl), name? (nur für aria) } }
 * Der letzte Punkt des richtigen Weges der letzten Gabel ist der Nestrand.
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
  zi.innerHTML = `<div class="rw-hinweis" aria-live="polite"><b class="rw-nr"></b><p></p></div>`
    + `<div class="rw-bild" style="aspect-ratio:${ratio}"><img class="rw-hg" src="${K.img(d.bild)}" alt="" draggable="false">`
    + `<div class="rw-lage"><div class="rw-spur" aria-hidden="true"></div><div class="rw-wahlen"></div>`
    + `<div class="rw-figur" style="${lagen(pos.x, pos.y)}"><img src="${K.fig('raupe/brrr')}" alt="" draggable="false"></div></div></div>`;
  unten('');
  const bild = $('.rw-bild', zi), lage = $('.rw-lage', zi), figur = $('.rw-figur', zi), fimg = figur.querySelector('img')!;
  const wahlen = $('.rw-wahlen', zi), spur = $('.rw-spur', zi), hinweis = $('.rw-hinweis', zi);
  const pose = (p: string) => { fimg.src = K.fig('raupe/' + p); };
  const setzeFigur = (p: Pt) => { figur.style.left = p.x + '%'; figur.style.top = p.y + '%'; figur.classList.toggle('unter', !!p.unter); };
  const richtigeWahl = () => P[k].wege.findIndex((w: any) => w.richtig);
  /** Weg einer Wahl: Tipp-Ziel, dann die Punkte bis zur nächsten Gabel */
  const wegVon = (w: any): Pt[] => [{ x: w.x, y: w.y, unter: w.unter }, ...(w.weg ?? [])];

  /** Leuchtspur der Fühler: goldene Pünktchen entlang des gekrochenen Weges (erscheinen, während die Raupe vorbeikommt) */
  const leuchtspur = (von: Pt, pts: Pt[], dauer: number) => {
    const alle = [von, ...pts];
    const len = (a: Pt, b: Pt) => Math.hypot((b.x - a.x) * ratio, b.y - a.y);
    const ges = alle.slice(1).reduce((s, p, i) => s + len(alle[i], p), 0) || 1;
    let html = '', weit = 0;
    for (let i = 1; i < alle.length; i++) {
      const a = alle[i - 1], b = alle[i], l = len(a, b), n = Math.max(1, Math.round(l / 4.5));
      for (let j = 1; j <= n; j++) {
        const t = j / n, ab = weit + l * t;
        html += `<i style="${lagen(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)};animation-delay:${still ? 0 : Math.round((ab / ges) * dauer)}ms"></i>`;
      }
      weit += l;
    }
    spur.insertAdjacentHTML('beforeend', html);
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

  /** Falscher Ast: er schaukelt (Ausschnitt des Bildes dreht sich um die Gabel), die Raupe erschrickt kurz */
  const schaukeln = (w: any) => {
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
    hinweis.classList.add('fertig');
    pose('staunt');
    figur.classList.add('leuchtet');
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
