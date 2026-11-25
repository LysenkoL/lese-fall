/**
 * Neue Lese-Rätsel (D-19): Vogel-Lexikon (Spur 23), Wunsch-Waage (Spur 18), Flunker-Finder (Fallkarte Kapitel 4).
 * Vertrag wie in raetsel.ts: (rahmen, daten, fertig). Hilfen: import { kontext, sag, unten, … } from './raetsel.ts'.
 * Alle drei: das Kind liest und entscheidet, die Lese-Raupe spielt mit (irrt sich, flunkert, freut sich).
 * Fehlerregel wie überall: 1. Fehler Wackeln + Hinweis, 2. Fehler zeigt die Raupe die Lösung (ui.hilfe). Kein Verlieren, keine Uhr.
 * Texte kommen als HTML mit Silben; aria-label nur über klar() (Tags entfernt).
 */
import { kontext, sag, unten, knopf, wackel, ende, stempeln, hook } from './raetsel.ts';
import './raetsel_lesen.css';

type Spiel = (r: HTMLElement, d: any, fertig: () => void) => void;
export const SPIELE_LESEN: Record<string, Spiel> = {};

const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode) => r.querySelector(s) as E;
/** HTML mit Silben → schlichter Text (für aria-label und title) */
const klar = (h: unknown) => { const t = document.createElement('template'); t.innerHTML = String(h ?? ''); return (t.content.textContent ?? '').replace(/\s+/g, ' ').trim(); };
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** nach `ms`, aber nur solange die Spielfläche noch steht (Kind hat nicht weitergeblättert) */
const spaeter = (el: HTMLElement, ms: number, f: () => void) => setTimeout(() => { if (el.isConnected) f(); }, ms);
const PFEIL = (rechts: boolean) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${rechts ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/** Bilder vorab laden, damit Gesichter beim Umschalten nicht flackern */
const vorladen = (urls: string[]) => urls.forEach((u) => { if (u) { const i = new Image(); i.src = u; } });

/* ============================ Vogel-Lexikon (Spur 23) ============================
 * Oben der Steckbrief (was wir aus dem Text wissen), darunter das Vogelbuch der Raupe: eine Seite je Vogel,
 * Bild + zwei Sätze, der Name ist mit Klebeband verdeckt. Blättern: Reiter 1…n, Pfeile, Wischen.
 * „Das ist unser Vogel!“ (unten) wählt die offene Seite. Richtig → Klebeband fliegt weg, Name erscheint, Stempel.
 * Die Raupe darf sich anfangs irren: `irrtum` = Seite, auf der ihr Lesezeichen steckt (dort schlägt sie das Buch auf).
 */
SPIELE_LESEN.lexikon = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const V: any[] = d.voegel ?? [];
  const merk: string[] = d.steckbrief?.saetze ?? [];
  const li = Math.max(0, V.findIndex((v) => v.id === d.loesung));
  let s = Math.max(0, V.findIndex((v) => v.id === d.irrtum));
  let fehl = 0, zu = false, geloest = false;
  const nein = new Set<string>();

  const bild = (v: any) => {
    const c = v.crop;
    const inhalt = c
      ? `<span class="lx-crop" style="background-image:url(${K.img(c.bild)});background-size:${c.n * 100}% 100%;background-position:${c.n > 1 ? (c.i / (c.n - 1)) * 100 : 0}% 0"></span>`
      : v.bild ? `<img src="${K.img(v.bild)}" alt="" draggable="false">` : '';
    return `<figure class="lx-bild${d.schatten ? ' schatten' : ''}">${inhalt}</figure>`;
  };
  const seiteHtml = (v: any, auf: boolean) => `<article class="lx-seite${auf ? ' auf' : ''}" data-s="${V.indexOf(v)}">
      ${d.buch?.titel ? `<span class="lx-kt">${d.buch.titel}</span>` : ''}
      <div class="lx-kopf">${bild(v)}<div class="lx-nb"><h3 class="lx-t">${v.titel ?? ''}</h3><span class="lx-name">${auf ? `<b>${v.name ?? ''}</b>` : ''}<i class="lx-band${auf ? ' ab' : ''}" aria-hidden="true">?</i></span></div></div>
      <div class="lx-text">${(v.saetze ?? []).map((t: string) => `<p>${t}</p>`).join('')}</div>
    </article>`;
  const reiter = () => V.map((v, i) => `<button class="lx-tab${i === s ? ' an' : ''}${nein.has(v.id) ? ' nein-weg' : ''}" data-s="${i}" aria-label="${attr(klar(v.titel) || String(i + 1))}" aria-current="${i === s ? 'page' : 'false'}"><span>${i + 1}</span>${v.id === d.irrtum ? `<img class="lx-zeichen" src="${K.fig('raupe/tipp')}" alt="">` : ''}</button>`).join('');

  zi.innerHTML = `<div class="lx">
    ${merk.length ? `<section class="lx-steck">${d.steckbrief?.titel ? `<span class="lx-st">${d.steckbrief.titel}</span>` : ''}<ul>${merk.map((m, i) => `<li data-m="${i}">${m}</li>`).join('')}</ul></section>` : ''}
    <div class="lx-buch">
      <div class="lx-reiter"><button class="lx-pf" data-pf="-1">${PFEIL(false)}</button><div class="lx-tabs">${reiter()}</div><button class="lx-pf" data-pf="1">${PFEIL(true)}</button></div>
      <div class="lx-blatt">${seiteHtml(V[s], false)}</div>
    </div>
  </div>`;
  const blatt = $('.lx-blatt', zi);

  const knoepfe = () => {
    $('.lx-tabs', zi).innerHTML = reiter();
    zi.querySelectorAll<HTMLButtonElement>('.lx-pf').forEach((b) => {
      const n = s + +b.dataset.pf!;
      b.disabled = n < 0 || n >= V.length;
      b.setAttribute('aria-label', n >= 0 && n < V.length ? klar(V[n].titel) || String(n + 1) : '');
    });
  };
  const fuss = () => { if (!geloest) unten(knopf('waehle', d.ok ?? K.UI.fertig, zu), (a) => { if (a === 'waehle') waehle(); }); };
  const blaettern = (n: number) => {
    if (n < 0 || n >= V.length || n === s) return;
    const vor = n > s;
    s = n;
    blatt.innerHTML = seiteHtml(V[s], geloest && V[s].id === d.loesung);
    $('.lx-seite', blatt).classList.add(vor ? 'vor' : 'zur');
    knoepfe();
    K.summ(8);
  };

  const treffer = (mitHilfe: boolean) => {
    zu = true; geloest = true; hook.loese = null;
    s = li;
    blatt.innerHTML = seiteHtml(V[li], true);
    const seite = $('.lx-seite', blatt);
    seite.classList.add('treffer');
    knoepfe();
    K.summ(30);
    if (!mitHilfe && d.fund) sag(r, 'staunt', d.fund);
    // Stempel auf Bild und Namen (obere Hälfte), nicht auf die Sätze
    const kopf = $('.lx-kopf', seite), sr = seite.getBoundingClientRect(), kr = kopf.getBoundingClientRect();
    const y = sr.height ? ((kr.top + kr.height / 2 - sr.top) / sr.height) * 100 : 30;
    hook.loese = stempeln(zi, seite, d.stempel ?? '', () => ende(r, d, fertig), { x: 50, y });
  };
  const waehle = () => {
    if (zu || geloest) return;
    const v = V[s];
    if (v.id === d.loesung) return treffer(false);
    const seite = $('.lx-seite', blatt);
    wackel(seite);
    nein.add(v.id);
    fehl++;
    if (fehl === 1) {
      sag(r, 'tipp', v.nicht ?? K.UI.nochmal);
      knoepfe();
      const m = zi.querySelector<HTMLElement>(`.lx-steck li[data-m="${v.merkmal}"]`);
      if (m) { m.classList.remove('zeig'); void m.offsetWidth; m.classList.add('zeig'); }
      return;
    }
    // 2. Fehler: die Raupe blättert zur richtigen Seite und zeigt, warum
    zu = true; fuss();
    sag(r, 'tipp', [K.UI.hilfe, d.warum ?? ''].join(' '));
    spaeter(zi, 700, () => { blaettern(li); $('.lx-seite', blatt).classList.add('zeig'); spaeter(zi, 1100, () => treffer(true)); });
  };

  // Eingaben: Reiter, Pfeile, Wischen auf der Seite
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (zu) return; // während die Raupe hilft und nach dem Treffer bleibt das Buch auf der Seite (Stempelziel)
    const tab = t.closest<HTMLElement>('.lx-tab');
    if (tab) return blaettern(+tab.dataset.s!);
    const pf = t.closest<HTMLButtonElement>('.lx-pf');
    if (pf && !pf.disabled) blaettern(s + +pf.dataset.pf!);
  };
  let wisch: { x: number; y: number; id: number } | null = null;
  blatt.addEventListener('pointerdown', (e) => { wisch = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
  blatt.addEventListener('pointerup', (e) => {
    if (!wisch || wisch.id !== e.pointerId || zu) { wisch = null; return; }
    const dx = e.clientX - wisch.x, dy = e.clientY - wisch.y;
    wisch = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) blaettern(s + (dx < 0 ? 1 : -1));
  });
  blatt.addEventListener('pointercancel', () => { wisch = null; });

  knoepfe();
  fuss();
  sag(r, d.irrtum ? 'tipp' : 'denkt', d.start ?? '');
  hook.loese = () => { if (!zu) treffer(false); };
};

/* ============================ Wunsch-Waage (Spur 18) ============================
 * Drei Kinder mit je einem Wunsch (Bild + eine Zeile). Darunter Ideen-Karten. Antippen = „anprobieren“:
 * jedes Kind schaut froh oder traurig (vorhandene Gesichter mila/ben/oskar) und sagt kurz, warum.
 * Die Idee, bei der alle froh sind, bekommt den Stempel. Probieren ist kein Fehler; nach zwei unpassenden
 * Ideen gibt die Raupe einen Tipp, nach der dritten zeigt sie die Lösung.
 */
SPIELE_LESEN.waage = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const kinder: any[] = d.kinder ?? [], ideen: any[] = d.ideen ?? [];
  const froh = (idee: any, k: any) => !!idee?.[k.id]?.froh;
  const passt = (idee: any) => (d.loesung ? idee.id === d.loesung : kinder.every((k) => froh(idee, k)));
  const richtige = ideen.find(passt);
  const ordnung = K.mischen(ideen.map((i) => i.id));
  const probiert = new Set<string>();
  let aktiv: string | null = null, fehl = 0, zu = false;
  /** Gesicht: vor dem Probieren `start` (nachdenklich), sonst froh/traurig oder das Bild aus der Reaktion */
  const gesicht = (k: any, idee: any, jubel = false) => {
    const basis = k.bild ?? k.id, re = idee?.[k.id] ?? {};
    const art = jubel ? (k.jubel ?? 'lacht') : !idee ? (k.start ?? 'denkt') : (re.bild ?? (re.froh ? 'froh' : 'traurig'));
    return K.fig(`${basis}/${art}`);
  };
  vorladen(kinder.flatMap((k) => [gesicht(k, null, true), ...ideen.map((i) => gesicht(k, i))]));

  zi.innerHTML = `<div class="ww">
    <div class="ww-kinder" aria-live="polite">${kinder.map((k) => `<div class="ww-kind" data-k="${k.id}">
      <figure class="ww-bild"><span class="ww-rahmen"><img src="${gesicht(k, null)}" alt=""></span><figcaption>${k.name ?? ''}</figcaption></figure>
      <div class="ww-txt"><p class="ww-wunsch">${k.text ?? ''}</p><p class="ww-re" hidden></p></div>
    </div>`).join('')}</div>
    <div class="ww-ideen">${ordnung.map((id) => { const i = ideen.find((x) => x.id === id)!; return `<button class="ww-idee" data-i="${id}">${i.bild ? `<img src="${K.img(i.bild)}" alt="" draggable="false">` : ''}<span>${i.text ?? ''}</span></button>`; }).join('')}</div>
  </div>`;

  const zeigen = (idee: any) => {
    aktiv = idee.id;
    zi.querySelectorAll<HTMLElement>('.ww-idee').forEach((b) => { b.classList.toggle('an', b.dataset.i === aktiv); b.setAttribute('aria-pressed', String(b.dataset.i === aktiv)); });
    kinder.forEach((k) => {
      const el = $(`.ww-kind[data-k="${k.id}"]`, zi), re = idee[k.id] ?? {};
      el.dataset.st = re.froh ? 'froh' : 'traurig';
      $<HTMLImageElement>('img', el).src = gesicht(k, idee);
      const p = $('.ww-re', el);
      p.innerHTML = re.unter ?? '';
      p.hidden = !re.unter;
      el.classList.remove('neu'); void el.offsetWidth; el.classList.add('neu');
    });
    K.summ(12);
  };
  const geschafft = (mitHilfe: boolean) => {
    zu = true; hook.loese = null;
    const karte = $(`.ww-idee[data-i="${richtige.id}"]`, zi);
    if (!mitHilfe) sag(r, 'klatscht', d.fund ?? '');
    spaeter(zi, 700, () => {
      kinder.forEach((k) => { $<HTMLImageElement>(`.ww-kind[data-k="${k.id}"] img`, zi).src = gesicht(k, richtige, true); });
      $('.ww', zi).classList.add('fertig');
      karte.classList.add('sieger');
      (karte as HTMLButtonElement).disabled = true;
      hook.loese = stempeln(zi, karte, d.stempel ?? '', () => ende(r, d, fertig));
    });
  };
  const probe = (id: string) => {
    if (zu) return;
    const idee = ideen.find((x) => x.id === id);
    if (!idee) return;
    zeigen(idee);
    if (passt(idee)) return geschafft(false);
    if (!probiert.has(id)) { probiert.add(id); fehl++; } else return sag(r, 'denkt', idee.sagt ?? K.UI.nochmal);
    $(`.ww-idee[data-i="${id}"]`, zi).classList.add('probiert');
    if (fehl === 1) return sag(r, 'staunt', idee.sagt ?? K.UI.nochmal);
    if (fehl === 2) return sag(r, 'tipp', d.tipp ?? idee.sagt ?? K.UI.nochmal);
    // dritte unpassende Idee: die Raupe probiert die richtige selbst
    zu = true;
    sag(r, 'tipp', [K.UI.hilfe, d.warum ?? ''].join(' '));
    spaeter(zi, 1300, () => { zeigen(richtige); geschafft(true); });
  };
  zi.onclick = (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.ww-idee'); if (b) probe(b.dataset.i!); };
  unten('');
  sag(r, 'denkt', d.start ?? '');
  hook.loese = () => { if (!zu && richtige) { zeigen(richtige); geschafft(false); } };
};

/* ============================ Flunker-Finder (Fallkarte Kapitel 4) ============================
 * Die Raupe erzählt den Fall Satz für Satz („Und dann?“ unten holt den nächsten Satz). Zwei Sätze sind geflunkert
 * (`wahr: false`). Antippen → Stempel GEFLUNKERT! und darunter, wie es wirklich war (`aufloesung`).
 * Ein wahrer Satz → Wackeln + „Das stimmt doch!“ (`nein`). Läuft in jeder Rahmen-Fläche mit .zi und .zr.
 */
SPIELE_LESEN.flunker = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const S: any[] = d.saetze ?? [];
  const falsch = S.map((x, i) => (x.wahr === false ? i : -1)).filter((i) => i >= 0);
  const gef = new Set<number>();
  let sicht = d.alle ? S.length : Math.min(S.length, Math.max(1, d.zuerst ?? 1));
  let fehl = 0, zu = false;
  const wahrheit = (x: any) => x.aufloesung ?? (typeof x.richtig === 'string' ? x.richtig : '');
  const zeile = (x: any, i: number) => `<li class="fl-z" data-i="${i}"><button class="fl-s"><i class="fl-nr" aria-hidden="true">${i + 1}</i><span class="fl-t">${x.text ?? ''}</span></button></li>`;
  zi.innerHTML = `<div class="fl"><ol class="fl-heft">${S.slice(0, sicht).map(zeile).join('')}</ol></div>`;
  const heft = $('.fl-heft', zi);

  const fuss = () => unten(sicht < S.length && !zu ? knopf('mehr', d.frage ?? K.UI.weiter) : '', (a) => { if (a === 'mehr') mehr(); });
  const mehr = (bis = sicht + 1, still = false) => {
    while (sicht < Math.min(bis, S.length)) {
      heft.insertAdjacentHTML('beforeend', zeile(S[sicht], sicht));
      const neu = heft.lastElementChild as HTMLElement;
      if (!still) neu.classList.add('neu');
      sicht++;
    }
    fuss();
    if (!still) requestAnimationFrame(() => heft.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };
  const markiere = (i: number) => {
    const el = $(`.fl-z[data-i="${i}"]`, heft);
    if (!el || el.classList.contains('gef')) return;
    el.classList.add('gef');
    $('.fl-s', el).setAttribute('aria-disabled', 'true');
    el.insertAdjacentHTML('beforeend', `<b class="fl-stempel">${d.stempel ?? ''}</b>${wahrheit(S[i]) ? `<p class="fl-auf"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${wahrheit(S[i])}</span></p>` : ''}`);
  };
  const finde = (i: number, mitHilfe: boolean) => {
    gef.add(i); fehl = 0;
    markiere(i);
    K.summ(30);
    if (gef.size >= falsch.length) {
      zu = true; hook.loese = null;
      mehr(S.length, true);
      unten('');
      return spaeter(zi, mitHilfe ? 900 : 600, () => ende(r, d, fertig));
    }
    if (!mitHilfe) sag(r, 'lacht', S[i].sagt ?? d.fund ?? '');
    zu = false; fuss();
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.fl-s');
    if (!b || zu) return;
    const z = b.closest<HTMLElement>('.fl-z')!, i = +z.dataset.i!;
    if (gef.has(i)) return;
    if (S[i].wahr === false) return finde(i, false);
    wackel(z);
    if (++fehl === 1) return sag(r, 'tipp', S[i].nein ?? d.nein ?? K.UI.nochmal);
    // 2. Fehler: die Raupe gibt den nächsten Flunker zu
    const ziel = falsch.find((x) => !gef.has(x))!;
    zu = true;
    mehr(ziel + 1);
    unten('');
    sag(r, 'tipp', [K.UI.hilfe, S[ziel].warum ?? d.warum ?? ''].join(' '));
    $(`.fl-z[data-i="${ziel}"]`, heft)?.classList.add('zeig');
    spaeter(zi, 1100, () => finde(ziel, true));
  };
  fuss();
  sag(r, 'lacht', d.start ?? '');
  hook.loese = () => { if (zu) return; mehr(S.length, true); falsch.forEach((i) => { if (!gef.has(i)) { gef.add(i); markiere(i); } }); zu = true; unten(''); ende(r, d, fertig); };
};
