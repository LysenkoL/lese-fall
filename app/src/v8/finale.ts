/**
 * Finale nach Spur 24: Szene am Nest, dann der Tresor (das Kind legt N-E-S-T selbst in die Felder),
 * Tresor öffnet sich (Tür schwingt auf, goldenes Licht, Konfetti, das Bild wird groß), die Raupe schenkt die goldene Lupe,
 * Urkunde „Meister-Detektiv“, das letzte Wort der Raupe, ein stiller Abend (Epilog) und zwei Wege weiter.
 * Schritte in stand.fin: 0 Szene · 1 Code legen · 2 Tresor offen · 3 Lupe · 4 Urkunde · 5 Raupe · 6 Epilog.
 */
import { werkzeugIcon, WERKZEUGE } from './zeichnen.ts';
import { LUPE_SVG, konfetti, feuerwerk, raupeMitSache } from './haus.ts';

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

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const wackel = (el: Element | null) => { if (!el) return; el.classList.remove('nein'); void (el as HTMLElement).offsetWidth; el.classList.add('nein'); setTimeout(() => el.classList.remove('nein'), 520); };

export function zeigeFinale(c: FinCtx): void {
  c.hook.loese = null;
  c.fuss.onclick = null; c.buehne.onclick = null;
  const st = c.stand;
  c.modus('zug');
  const gehe = (n: number) => { st.fin = n; c.speichern(); zeigeFinale(c); };
  const nurKnopf = (a: string, html: string, f: () => void) => { c.fuss.innerHTML = `<div class="fz">${html}</div>`; c.fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };
  const raupe = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${c.fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
  const F = c.fin;

  /* ---------- 0: alle schauen ins Nest ---------- */
  if (st.fin === 0) {
    c.buehne.innerHTML = `<section class="zug fin"><div class="lampe"></div><div class="zk"><span class="tab hell">${F.szene.titel}</span></div><figure class="foto fin-bild"><img src="${c.img(F.szene.bild)}" alt=""></figure><ul class="fin-liste">${F.szene.saetze.map((s: string) => `<li>${s}</li>`).join('')}</ul></section>`;
    nurKnopf('weiter', c.knopf('weiter', c.UI.weiter), () => gehe(1));
    return;
  }

  /* ---------- 1: Code in die Felder legen ---------- */
  if (st.fin === 1) {
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
      setTimeout(() => sec.isConnected && gehe(2), mitHilfe ? 1600 : 1900);
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
    c.fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button></div>';
    mal();
    sag('tipp', F.code.start);
    return;
  }

  /* ---------- 2: der Tresor öffnet sich – mit Konfetti, dann wird das Bild groß ---------- */
  if (st.fin === 2) {
    c.buehne.innerHTML = `<section class="zug fin"><div class="lampe"></div><div class="zk"><span class="tab hell">${c.UI.tresor}</span><h2>${F.auf.titel}</h2></div><div class="tv"><div class="tv-licht"></div><img class="tv-zu" src="${c.img('tresor_zu')}" alt="" draggable="false"><img class="tv-auf" src="${c.img('tresor_auf')}" alt="" draggable="false"><div class="tv-innen"><img src="${c.img('finale_bild')}" alt="" draggable="false"></div></div><p class="zt1 gross">${F.auf.text}</p></section>`;
    const tv = c.buehne.querySelector<HTMLElement>('.tv')!;
    c.fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button></div>';
    let gross = false;
    const bildGross = () => {
      if (gross || !tv.isConnected) return; gross = true;
      c.buehne.innerHTML = `<section class="fin fest"><div class="lampe"></div><figure class="fest-bild"><img src="${c.img('finale_bild')}" alt=""></figure><div class="fest-raupe">${raupeMitSache('', c.fig, 'klatscht')}</div><h2 class="fest-t">${F.auf.titel}</h2></section>`;
      konfetti(c.buehne.querySelector('.fest')!);
      feuerwerk(c.buehne.querySelector('.fest')!, 7);
      c.summ([30, 50, 80, 120]);
      nurKnopf('weiter', c.knopf('weiter', c.UI.weiter), () => gehe(3));
    };
    setTimeout(() => { if (!tv.isConnected) return; tv.classList.add('auf'); c.summ([30, 50, 80]); konfetti(c.buehne.querySelector('.fin')!); feuerwerk(c.buehne.querySelector('.fin')!, 4, 0.3); }, 900);
    setTimeout(bildGross, 2900);
    c.hook.loese = () => { tv.classList.add('auf'); bildGross(); };
    return;
  }

  /* ---------- 3: die Raupe schenkt dem Kind die goldene Lupe ---------- */
  if (st.fin === 3) {
    c.modus('haken');
    const L = F.lupe;
    c.buehne.innerHTML = `<section class="fin raupe-wort lupe-gabe"><div class="lampe"></div><span class="tab hell">${L.titel}</span><div class="lg-buehne"><div class="lg-licht"></div><div class="lg-lupe">${LUPE_SVG}</div><img class="lg-raupe" src="${c.fig('raupe/lob')}" alt=""></div><p class="lg-text">${L.text}</p><p class="rw-blase">${L.sagt}</p></section>`;
    konfetti(c.buehne.querySelector('.lupe-gabe')!);
    c.summ([20, 40]);
    nurKnopf('weiter', c.knopf('weiter', c.UI.danke), () => gehe(4));
    return;
  }

  /* ---------- 5: die Raupe hat das letzte Wort ---------- */
  if (st.fin === 5) {
    c.modus('haken');
    c.buehne.innerHTML = `<section class="fin raupe-wort"><div class="lampe"></div><img class="rw-bild" src="${c.fig('raupe/klatscht')}" alt=""><p class="rw-blase">${F.raupeSagt}</p><div class="rw-icons">${WERKZEUGE.map((w) => `<span class="rw-i" data-w="${w}">${werkzeugIcon(w)}</span>`).join('')}</div></section>`;
    nurKnopf('weiter', c.knopf('weiter', c.UI.weiter), () => gehe(6));
    return;
  }

  /* ---------- 6: Epilog – ein stiller Abend, dann zwei Wege weiter ---------- */
  if (st.fin >= 6) {
    c.modus('haken');
    c.geloest();
    const E = F.epilog;
    c.buehne.innerHTML = `<section class="fin raupe-wort epilog"><div class="lampe"></div><div class="ep-mond" aria-hidden="true"></div><span class="tab hell">${E.titel}</span><img class="ep-raupe" src="${c.fig('raupe/muede')}" alt=""><div class="ep-text">${E.saetze.map((s: string) => `<p>${s}</p>`).join('')}</div></section>`;
    setTimeout(() => { const ep = c.buehne.querySelector<HTMLElement>('.epilog'); if (ep) feuerwerk(ep, 5, 0.25); }, 2200);
    c.fuss.innerHTML = `<div class="fz">${c.knopf('album', c.UI.album)}${c.knopf('haus', c.UI.zurRaupe, 'still')}</div>`;
    c.fuss.onclick = (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
      if (a === 'album') c.album(); else if (a === 'haus') c.haus();
    };
    return;
  }

  /* ---------- 4: Urkunde „Meister-Detektiv“ ---------- */
  c.modus('haken');
  const p = c.perlen();
  c.buehne.innerHTML = urkundeHtml(c.UI, st.name, p, c.fig, true);
  konfetti(c.buehne.querySelector('.urk')!);
  const inp = c.buehne.querySelector<HTMLInputElement>('#dname')!;
  inp.addEventListener('input', () => { st.name = inp.value; c.speichern(); });
  nurKnopf('weiter', c.knopf('weiter', c.UI.weiter), () => gehe(5));
}

/** Urkunde noch einmal ansehen (aus dem Fall-Album): gleiche Gestaltung, Name änderbar */
export function urkundeHtml(UI: Record<string, string>, name: string, perlen: number, fig: (n: string) => string, imFinale = false): string {
  return `<section class="fin urk">${imFinale ? '<div class="lampe"></div>' : ''}<div class="dipl"><div class="dipl-in"><p class="dt">${UI.meister}</p><input id="dname" type="text" maxlength="18" placeholder="${esc(UI.nameFrage.replace(/<[^>]*>/g, ''))}" value="${esc(name)}" autocomplete="off" autocapitalize="words" aria-label="${esc(UI.nameFrage.replace(/<[^>]*>/g, ''))}"><p class="dh">${UI.hatGeloest}</p><p class="df">${UI.fallName}</p><p class="dl">${UI.urkLob}</p><p class="dp"><span class="perle"></span><b>${perlen}</b><span class="dpt">${UI.perlenSumme}</span></p></div></div><p class="team"><img src="${fig('raupe/lob')}" alt=""><span>${UI.teamZeile}</span></p>${imFinale ? `<p class="forts">${UI.fortsetzung}</p>` : ''}</section>`;
}
