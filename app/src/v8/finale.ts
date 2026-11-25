/**
 * Finale nach Spur 24 (D-19: vier Bildschirme):
 * das Kind legt N-E-S-T selbst in die Felder → der Tresor öffnet sich (Tür, goldenes Licht, Konfetti),
 * drinnen liegt die goldene Lupe, die Raupe schenkt sie → Urkunde „Meister-Detektiv / Meister-Detektivin“
 * mit einem kurzen Satz der Raupe → ein stiller Abend (Epilog) und zwei Wege weiter.
 * Schritte in stand.fin: 0 Code legen · 1 Tresor offen mit Lupe · 2 Urkunde · 3 Epilog.
 * Bis 25.11.2026 hatte das Finale sieben Schritte; ein alter Spielstand wird einmal umgerechnet (finNormal).
 */
import { konfetti, feuerwerk, schlaeftBild } from './haus.ts';

export interface FinCtx {
  buehne: HTMLElement;
  fuss: HTMLElement;
  UI: Record<string, string>;
  img: (n: string) => string;
  fig: (n: string) => string;
  summ: (ms: number | number[]) => void;
  /** Daten `finale` des letzten Kapitels (Texte schon als HTML mit Silben) */
  fin: any;
  /** das Code-Wort, z. B. NEST */
  wort: string;
  stand: { fin: number; name: string };
  speichern: () => void;
  perlen: () => number;
  modus: (m: string) => void;
  neuStart: () => void;
  hook: { loese: (() => void) | null };
  /** gibt dem Rahmen (Lesen, Fußzeile) einen Knopf */
  knopf: (a: string, t: string, kl?: string) => string;
  /** Fall ist gelöst (beim Epilog): ab jetzt führt „Weiter“ ins Fall-Album */
  geloest: () => void;
  album: () => void;
  haus: () => void;
  traegt: () => string;
}

/** letzter Schritt (Epilog) */
export const FIN_LETZT = 3;
/** Fassung der Schrittfolge im Spielstand (`finV`); fehlt sie, stammt `fin` aus der alten Folge mit sieben Schritten */
const FIN_V = 2;
/** alt: 0 Szene · 1 Code · 2 Tresor · 3 Lupe · 4 Urkunde · 5 Raupe · 6 Epilog → neu: 0 Code · 1 Tresor+Lupe · 2 Urkunde · 3 Epilog */
const ALT_NEU = [0, 0, 1, 1, 2, 3, 3];

/**
 * Spielstand auf die vier Schritte bringen. Ein Stand von vor D-19 (ohne `finV`) wird einmal umgerechnet,
 * auch `weit` (pos() im Finale = 10000 + fin), damit kein Vor-Pfeil über den noch nicht gelösten Code führt.
 * Danach wird `fin` nur noch in die Grenzen 0…3 gelegt.
 */
export function finNormal(st: { fin: number }): void {
  const s = st as any;
  const n = (x: unknown) => (Number.isFinite(+(x as number)) ? Math.trunc(+(x as number)) : 0);
  if (s.finV !== FIN_V) {
    st.fin = ALT_NEU[Math.min(Math.max(n(st.fin), 0), ALT_NEU.length - 1)];
    const w = n(s.weit);
    if (w >= 10000 && w < 20000) s.weit = 10000 + ALT_NEU[Math.min(w - 10000, ALT_NEU.length - 1)];
    s.finV = FIN_V;
  }
  st.fin = Math.min(Math.max(n(st.fin), 0), FIN_LETZT);
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const ohneTags = (t: string | undefined) => (t ?? '').replace(/<[^>]*>/g, '');
const wackel = (el: Element | null) => { if (!el) return; el.classList.remove('nein'); void (el as HTMLElement).offsetWidth; el.classList.add('nein'); setTimeout(() => el.classList.remove('nein'), 520); };

export function zeigeFinale(c: FinCtx): void {
  c.hook.loese = null;
  c.fuss.onclick = null; c.buehne.onclick = null;
  const st = c.stand;
  finNormal(st);
  standRef = { st, speichern: c.speichern };
  c.modus('zug');
  const gehe = (n: number) => { st.fin = n; c.speichern(); zeigeFinale(c); };
  const nurKnopf = (a: string, html: string, f: () => void) => { c.fuss.innerHTML = `<div class="fz">${html}</div>`; c.fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };
  /** Fuß ohne sichtbaren Knopf (gleiche Höhe); der Rahmen zeigt dann den Vor-Pfeil, falls das Kind schon weiter war */
  const leererFuss = () => { c.fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button></div>'; };
  const raupe = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${c.fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
  const F = c.fin;

  /* ---------- 0: Code in die Felder legen ---------- */
  if (st.fin === 0) {
    const wort = c.wort.split('');
    const ordnung = [3, 1, 0, 2].filter((i) => i < wort.length);
    wort.forEach((_, i) => { if (!ordnung.includes(i)) ordnung.push(i); }); // nie in der richtigen Reihenfolge
    const felder: (number | null)[] = wort.map(() => null); // Feld → Kärtchen-Nr
    let fehl = 0, gesperrt = false;
    c.buehne.innerHTML = `<section class="zug fin" data-art="tresorcode"><div class="lampe"></div><div class="zk"><span class="tab hell">${c.UI.tresor}</span><h2>${F.code.titel}</h2></div><p class="zt1">${F.code.text}</p><div class="fin-tresor"><img src="${c.img('tresor_zu')}" alt="" draggable="false"><div class="fin-felder"></div></div><div class="fin-karten"></div><div class="zr"></div></section>`;
    const sec = c.buehne.querySelector<HTMLElement>('.fin')!;
    const sag = (b: string, t: string, kl = '') => { const z = sec.querySelector<HTMLElement>('.zr')!; z.innerHTML = t ? raupe(b, t, kl) : ''; if (t) requestAnimationFrame(() => z.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); };
    const mal = () => {
      sec.querySelector('.fin-felder')!.innerHTML = felder.map((k, i) => `<button class="fin-f${k !== null ? ' voll' : ''}" data-f="${i}" aria-label="Feld ${i + 1}">${k !== null ? wort[k] : ''}</button>`).join('');
      sec.querySelector('.fin-karten')!.innerHTML = ordnung.map((k) => `<button class="fin-k${felder.includes(k) ? ' weg' : ''}" data-k="${k}" aria-label="Buchstabe ${wort[k]}" ${felder.includes(k) ? 'disabled' : ''}>${wort[k]}</button>`).join('');
    };
    const pruefen = () => {
      if (felder.some((k) => k === null) || gesperrt) return;
      const ist = felder.map((k) => wort[k!]).join('');
      if (ist === c.wort) return gut();
      fehl++;
      sec.querySelectorAll('.fin-f').forEach((f, i) => { if (wort[felder[i]!] !== wort[i]) wackel(f); });
      c.summ(40);
      gesperrt = true;
      if (fehl === 1) {
        sag('tipp', c.UI.nochmal + ' ' + F.code.tipp);
        setTimeout(() => { felder.forEach((k, i) => { if (wort[k!] !== wort[i]) felder[i] = null; }); gesperrt = false; if (sec.isConnected) mal(); }, 800);
      } else {
        sag('tipp', F.code.hilfe);
        setTimeout(() => { if (!sec.isConnected) return; wort.forEach((ch, i) => { felder[i] = ordnung.find((k) => wort[k] === ch && !felder.slice(0, i).includes(k))!; }); mal(); gut(true); }, 1500);
      }
    };
    const gut = (mitHilfe = false) => {
      gesperrt = true; c.hook.loese = null;
      sec.querySelectorAll('.fin-f').forEach((f) => f.classList.add('ok'));
      if (!mitHilfe) sag('lob', F.code.erfolg, 'gut');
      c.summ([20, 40, 60]);
      setTimeout(() => sec.isConnected && gehe(1), mitHilfe ? 1600 : 1900);
    };
    const lege = (k: number, ziel?: number) => {
      if (gesperrt || felder.includes(k)) return;
      const f = ziel !== undefined ? ziel : felder.indexOf(null);
      if (f < 0) return;
      felder[f] = k; mal(); pruefen();
    };
    // Tippen: Kärtchen springt ins nächste freie Feld · Ziehen: auf ein Feld fallen lassen · Feld antippen: Kärtchen geht zurück
    let drag: { el: HTMLElement; k: number; x: number; y: number; bewegt: boolean } | null = null;
    sec.addEventListener('pointerdown', (e) => {
      if (gesperrt) return;
      const el = (e.target as HTMLElement).closest<HTMLElement>('.fin-k:not(.weg)');
      if (!el) return;
      drag = { el, k: +el.dataset.k!, x: e.clientX, y: e.clientY, bewegt: false };
      el.setPointerCapture(e.pointerId);
    });
    sec.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.bewegt && Math.hypot(dx, dy) > 8) { drag.bewegt = true; drag.el.classList.add('zieht'); }
      if (drag.bewegt) drag.el.style.transform = `translate(${dx}px, ${dy}px) rotate(4deg)`;
    });
    const los = (e: PointerEvent) => {
      if (!drag) return;
      const { el, k, bewegt } = drag; drag = null;
      el.classList.remove('zieht'); el.style.transform = '';
      if (!bewegt) { if (e.type === 'pointerup') lege(k); return; }
      const f = e.type === 'pointerup' ? (document.elementsFromPoint(e.clientX, e.clientY).find((x) => x.classList.contains('fin-f')) as HTMLElement | undefined) : undefined;
      if (f) { const fi = +f.dataset.f!; if (felder[fi] === null) lege(k, fi); }
    };
    sec.addEventListener('pointerup', los); sec.addEventListener('pointercancel', los);
    sec.addEventListener('click', (e) => {
      const f = (e.target as HTMLElement).closest<HTMLElement>('.fin-f.voll');
      if (f && !gesperrt) { felder[+f.dataset.f!] = null; mal(); }
    });
    c.hook.loese = () => { if (gesperrt) return; felder.fill(null); wort.forEach((ch, i) => { felder[i] = ordnung.find((k) => wort[k] === ch)!; }); mal(); pruefen(); };
    leererFuss();
    mal();
    sag('tipp', F.code.start);
    return;
  }

  /* ---------- 1: der Tresor öffnet sich (Tür, goldenes Licht, Konfetti) – drinnen die goldene Lupe, die Raupe schenkt sie ---------- */
  if (st.fin === 1) {
    const L = F.lupe ?? {};
    c.buehne.innerHTML = `<section class="zug fin tresor-auf"><div class="lampe"></div><div class="zk"><span class="tab hell">${c.UI.tresor}</span><h2>${F.auf.titel}</h2></div><div class="tv"><div class="tv-licht"></div><img class="tv-zu" src="${c.img('tresor_zu')}" alt="" draggable="false"><img class="tv-auf" src="${c.img('tresor_auf')}" alt="" draggable="false"><div class="tv-innen tv-lupe"><img src="${c.img('objekte/goldene_lupe')}" alt="" draggable="false"></div></div><p class="zt1">${F.auf.text}</p><div class="zr"></div></section>`;
    const sec = c.buehne.querySelector<HTMLElement>('.tresor-auf')!, tv = sec.querySelector<HTMLElement>('.tv')!;
    leererFuss();
    let offen = false, geschenkt = false;
    const auf = () => {
      if (offen || !sec.isConnected) return; offen = true;
      tv.classList.add('auf'); c.summ([30, 50, 80]);
      konfetti(sec); feuerwerk(sec, 4, 0.3);
    };
    const geschenk = () => {
      if (geschenkt || !sec.isConnected) return; geschenkt = true;
      auf();
      tv.classList.add('lupe-da');
      if (L.titel) { const tab = sec.querySelector<HTMLElement>('.zk .tab')!; tab.innerHTML = L.titel; tab.classList.add('neu'); }
      if (L.sagt) sec.querySelector('.zr')!.innerHTML = raupe('lob', L.sagt, 'gut');
      c.summ([20, 40]);
      nurKnopf('weiter', c.knopf('weiter', c.UI.danke), () => gehe(2));
    };
    setTimeout(auf, 900);
    setTimeout(geschenk, 2700);
    c.hook.loese = geschenk;
    return;
  }

  /* ---------- 3: Epilog – ein stiller Abend, dann zwei Wege weiter ---------- */
  if (st.fin >= FIN_LETZT) {
    c.modus('haken');
    c.geloest();
    const E = F.epilog;
    c.buehne.innerHTML = `<section class="fin raupe-wort epilog"><div class="lampe"></div><div class="ep-mond" aria-hidden="true"></div><span class="tab hell">${E.titel}</span><img class="ep-raupe${schlaeftBild() ? ' schlaeft' : ''}" src="${schlaeftBild() ?? c.fig('raupe/muede')}" alt=""><div class="ep-text">${E.saetze.map((s: string) => `<p>${s}</p>`).join('')}</div></section>`;
    setTimeout(() => { const ep = c.buehne.querySelector<HTMLElement>('.epilog'); if (ep) feuerwerk(ep, 5, 0.25); }, 2200);
    c.fuss.innerHTML = `<div class="fz">${c.knopf('album', c.UI.album)}${c.knopf('haus', c.UI.zurRaupe, 'still')}</div>`;
    c.fuss.onclick = (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
      if (a === 'album') c.album(); else if (a === 'haus') c.haus();
    };
    return;
  }

  /* ---------- 2: Urkunde „Meister-Detektiv / Meister-Detektivin“ und ein Satz der Raupe ---------- */
  c.modus('haken');
  c.buehne.innerHTML = urkundeHtml(c.UI, st.name, c.perlen(), c.fig, true, F.raupeKurz);
  konfetti(c.buehne.querySelector('.urk')!);
  const inp = c.buehne.querySelector<HTMLInputElement>('#dname')!;
  inp.addEventListener('input', () => { st.name = inp.value; c.speichern(); });
  nurKnopf('weiter', c.knopf('weiter', c.UI.weiter), () => gehe(3));
}

/* ---------- Urkunde: Wahl „Detektiv / Detektivin“ ---------- */
type Wahl = 'detektiv' | 'detektivin';
/**
 * Spielstand für die Wahl auf der Urkunde (Feld `titel`, nicht im Typ Stand von main.ts).
 * Im Finale setzt zeigeFinale ihn; die Urkunde aus „Fall gelöst“ → „Meine Urkunde“ ruft main.ts ohne Stand auf,
 * dort gilt main.ts' Stand über window.__v8 (oder urkundeMitStand, falls main.ts es aufruft).
 */
let standRef: { st: any; speichern: (() => void) | null } | null = null;
/** Optional für main.ts: Stand und Speichern einmal übergeben, dann braucht die Urkunde window.__v8 nicht */
export function urkundeMitStand(st: any, speichern: () => void): void { standRef = { st, speichern }; }
const standJetzt = (): any => standRef?.st ?? (globalThis as any).__v8?.stand ?? null;
const wahlVon = (st: any): Wahl => (st?.titel === 'detektivin' ? 'detektivin' : 'detektiv');
const HAKEN = '<svg class="dw-h" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function zeigeWahl(urk: HTMLElement, w: Wahl): void {
  urk.dataset.wahl = w;
  urk.querySelectorAll<HTMLElement>('.dw-b').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wahl === w)));
}
/** ein Klick-Lauscher für alle Urkunden (Finale und „Meine Urkunde“), einmal beim Laden */
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.urk .dw-b[data-wahl]');
  if (!b) return;
  const urk = b.closest<HTMLElement>('.urk')!, w = b.dataset.wahl as Wahl;
  if (urk.dataset.wahl === w) return;
  zeigeWahl(urk, w);
  const st = standJetzt();
  if (!st) return;
  st.titel = w;
  // Speichern: im Finale direkt; bei „Meine Urkunde“ über den Lauscher, den main.ts an das Namensfeld hängt (speichert den ganzen Stand)
  if (standRef?.speichern) standRef.speichern();
  else urk.querySelector('#dname')?.dispatchEvent(new Event('input', { bubbles: true }));
});

/**
 * Urkunde (im Finale und aus dem Fall-Album): gleiche Gestaltung, Name und „Detektiv / Detektivin“ änderbar.
 * `raupeKurz` (nur im Finale): ein Satz der Raupe als Sprechblase über der Zeile „Detektiv-Team“.
 */
export function urkundeHtml(UI: Record<string, string>, name: string, perlen: number, fig: (n: string) => string, imFinale = false, raupeKurz?: string): string {
  const w = wahlVon(standJetzt());
  const meisterin = UI.meisterin ?? UI.meister + 'in';
  const knopf = (x: Wahl, t: string) => `<button type="button" class="dw-b" data-wahl="${x}" aria-pressed="${w === x}">${HAKEN}<span>${t}</span></button>`;
  const team = `<p class="team"><img src="${fig('raupe/lob')}" alt=""><span>${UI.teamZeile}</span></p>`;
  return `<section class="fin urk${raupeKurz ? ' mit-rk' : ''}" data-wahl="${w}">${imFinale ? '<div class="lampe"></div>' : ''}`
    + `<div class="dipl"><div class="dipl-in"><p class="dt"><span class="dt-m">${UI.meister}</span><span class="dt-w">${meisterin}</span></p>`
    + `<input id="dname" type="text" maxlength="18" placeholder="${esc(ohneTags(UI.nameFrage))}" value="${esc(name)}" autocomplete="off" autocapitalize="words" aria-label="${esc(ohneTags(UI.nameFrage))}">`
    + `<div class="dw" role="group" aria-label="${esc(ohneTags(UI.meister))} / ${esc(ohneTags(meisterin))}">${knopf('detektiv', UI.wahlDetektiv ?? 'Detektiv')}${knopf('detektivin', UI.wahlDetektivin ?? 'Detektivin')}</div>`
    + `<p class="dh">${UI.hatGeloest}</p><p class="df">${UI.fallName}</p><p class="dl">${UI.urkLob}</p><p class="dp"><span class="perle"></span><b>${perlen}</b><span class="dpt">${UI.perlenSumme}</span></p></div></div>`
    + (raupeKurz ? `<div class="urk-team"><p class="rk-blase">${raupeKurz}</p>${team}</div>` : team)
    + `</section>`;
}
