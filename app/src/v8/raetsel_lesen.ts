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
/** Stempel-Werkzeug ins Bild rollen (liegt auf dem Telefon sonst unter dem Rand) */
const stempelZeigen = (zi: HTMLElement) => requestAnimationFrame(() => zi.querySelector('.stp-tool')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));

/* ============================ Vogel-Lexikon (Spur 23) ============================
 * Links der Steckbrief (vier Punkte aus dem Text), rechts das Vogelbuch: je Seite ein Vogel als Schattenbild,
 * der Name mit Klebeband verdeckt, darunter drei, vier kurze Sätze. Das Kind blättert (Reiter 1…n, Pfeile, Wischen),
 * liest und vergleicht. „Das ist unser Vogel!“ wählt die offene Seite.
 *  - falsch: der Satz auf der Seite, der nicht passt, wird markiert, der Punkt im Steckbrief bekommt ✗, die Raupe sagt warum (`nicht`);
 *  - richtig: die Punkte im Steckbrief bekommen nacheinander ✓ (dazu leuchtet der passende Satz), das Klebeband fliegt weg,
 *    der Name erscheint als Stempel, das Schattenbild wird bunt, die Raupe freut sich (`erfolg`).
 * Das Bild verrät die Antwort nicht (Schattenbild): Farbe, Größe und „mag, was glänzt“ stehen nur im Text.
 * Die Raupe nennt keine Nummer. 2. Fehler: die Raupe blättert zur richtigen Seite und zeigt die Punkte (ui.hilfe + `warum`).
 * Daten: steckbrief {titel, saetze[]}, buch {titel}, ok (Knopf), voegel[] {id, titel, name, crop|bild, saetze[] {text, m?, ja?}, nicht, merkmal},
 *        loesung, start, warum, erfolg. `m` = Punkt im Steckbrief, den der Satz bestätigt (ja: true) oder widerlegt (ja: false).
 */
SPIELE_LESEN.lexikon = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const V: any[] = d.voegel ?? [];
  const merk: string[] = d.steckbrief?.saetze ?? [];
  const li = Math.max(0, V.findIndex((v) => v.id === d.loesung));
  let s = 0, fehl = 0, zu = false, geloest = false;
  const nein = new Set<string>();
  const HAKEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const KREUZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>';
  const satz = (x: any) => (typeof x === 'string' ? { text: x } : x ?? {});

  const bild = (v: any, bunt: boolean) => {
    const c = v.crop;
    const inhalt = c
      ? `<span class="lx-crop" style="background-image:url(${K.img(c.bild)});background-size:${c.n * 100}% 100%;background-position:${c.n > 1 ? (c.i / (c.n - 1)) * 100 : 0}% 0"></span>`
      : v.bild ? `<img src="${K.img(v.bild)}" alt="" draggable="false">` : '';
    return `<figure class="lx-bild${bunt ? ' bunt' : ' schatten'}">${inhalt}</figure>`;
  };
  const seiteHtml = (v: any, auf: boolean) => `<article class="lx-seite${auf ? ' auf' : ''}" data-s="${V.indexOf(v)}">
      ${d.buch?.titel ? `<span class="lx-kt">${d.buch.titel}</span>` : ''}
      <div class="lx-kopf">${bild(v, auf)}<div class="lx-nb"><h3 class="lx-t">${v.titel ?? ''}</h3><span class="lx-name">${auf ? `<b class="lx-stempelname">${v.name ?? ''}</b>` : ''}<i class="lx-band${auf ? ' ab' : ''}" aria-hidden="true">?</i></span></div></div>
      <ul class="lx-text">${(v.saetze ?? []).map((t: any, j: number) => `<li data-j="${j}">${satz(t).text ?? ''}</li>`).join('')}</ul>
    </article>`;
  const reiter = () => V.map((v, i) => `<button class="lx-tab${i === s ? ' an' : ''}${nein.has(v.id) ? ' nein-weg' : ''}" data-s="${i}" aria-label="${attr(klar(v.titel) || String(i + 1))}" aria-current="${i === s ? 'page' : 'false'}"><span>${i + 1}</span>${nein.has(v.id) ? `<i class="lx-tx">${KREUZ}</i>` : ''}</button>`).join('');

  zi.innerHTML = `<div class="lx">
    ${merk.length ? `<section class="lx-steck">${d.steckbrief?.titel ? `<span class="lx-st">${d.steckbrief.titel}</span>` : ''}<ul>${merk.map((m, i) => `<li data-m="${i}"><i class="lx-ck" aria-hidden="true"></i><span>${m}</span></li>`).join('')}</ul></section>` : ''}
    <div class="lx-buch">
      <div class="lx-reiter"><button class="lx-pf" data-pf="-1">${PFEIL(false)}</button><div class="lx-tabs">${reiter()}</div><button class="lx-pf" data-pf="1">${PFEIL(true)}</button></div>
      <div class="lx-blatt">${seiteHtml(V[s], false)}</div>
    </div>
  </div>`;
  const blatt = $('.lx-blatt', zi);
  const punkt = (i: number) => zi.querySelector<HTMLElement>(`.lx-steck li[data-m="${i}"]`);
  const steckZurueck = () => zi.querySelectorAll<HTMLElement>('.lx-steck li').forEach((x) => { x.classList.remove('nein', 'zeig'); const c = x.querySelector('.lx-ck'); if (c && !x.classList.contains('ja')) c.innerHTML = ''; });

  const knoepfe = () => {
    $('.lx-tabs', zi).innerHTML = reiter();
    zi.querySelectorAll<HTMLButtonElement>('.lx-pf').forEach((b) => {
      const n = s + +b.dataset.pf!;
      b.disabled = n < 0 || n >= V.length || zu;
      b.setAttribute('aria-label', n >= 0 && n < V.length ? klar(V[n].titel) || String(n + 1) : '');
    });
  };
  const fuss = () => { if (!geloest) unten(knopf('waehle', d.ok ?? K.UI.fertig, zu), (a) => { if (a === 'waehle') waehle(); }); else unten(''); };
  const blaettern = (n: number) => {
    if (n < 0 || n >= V.length || n === s) return;
    const vor = n > s;
    s = n;
    blatt.innerHTML = seiteHtml(V[s], geloest && V[s].id === d.loesung);
    $('.lx-seite', blatt).classList.add(vor ? 'vor' : 'zur');
    steckZurueck();
    knoepfe();
    K.summ(8);
  };

  /** Richtig: Punkt für Punkt ✓, dazu leuchtet der Satz auf der Seite; dann Name als Stempel und Farbe */
  const treffer = (mitHilfe: boolean) => {
    zu = true; geloest = true; hook.loese = null;
    s = li;
    const v = V[li];
    blatt.innerHTML = seiteHtml(v, false);
    steckZurueck();
    knoepfe();
    unten('');
    const seite = $('.lx-seite', blatt);
    seite.classList.add('treffer');
    if (!mitHilfe) sag(r, 'staunt', d.fund ?? '');
    const S: any[] = (v.saetze ?? []).map(satz);
    const schritt = (i: number) => {
      if (!zi.isConnected) return;
      if (i < merk.length) {
        const p = punkt(i);
        p?.classList.add('ja');
        const c = p?.querySelector('.lx-ck'); if (c) c.innerHTML = HAKEN;
        const j = S.findIndex((x) => x.m === i && x.ja !== false);
        seite.querySelectorAll('.lx-text li.leuchtet').forEach((x) => x.classList.remove('leuchtet'));
        if (j >= 0) seite.querySelector(`.lx-text li[data-j="${j}"]`)?.classList.add('leuchtet', 'ja');
        K.summ(12);
        return void spaeter(zi, 520, () => schritt(i + 1));
      }
      seite.querySelectorAll('.lx-text li.leuchtet').forEach((x) => x.classList.remove('leuchtet'));
      // Name als Stempel, Klebeband weg, Bild wird bunt
      $('.lx-name', seite).insertAdjacentHTML('afterbegin', `<b class="lx-stempelname">${v.name ?? ''}</b>`);
      $('.lx-band', seite).classList.add('ab');
      $('.lx-bild', seite).classList.replace('schatten', 'bunt');
      K.summ([20, 40, 60]);
      spaeter(zi, 900, () => ende(r, d, fertig, mitHilfe ? K.UI.hilfe : ''));
    };
    spaeter(zi, 350, () => schritt(0));
  };
  const waehle = () => {
    if (zu || geloest) return;
    const v = V[s];
    if (v.id === d.loesung) return treffer(false);
    const seite = $('.lx-seite', blatt);
    wackel(seite);
    nein.add(v.id);
    fehl++;
    // der Satz, der nicht passt, und der Punkt im Steckbrief
    const S: any[] = (v.saetze ?? []).map(satz);
    const m = v.merkmal ?? S.find((x) => x.ja === false)?.m;
    const j = S.findIndex((x) => x.m === m && x.ja === false);
    steckZurueck();
    seite.querySelectorAll('.lx-text li.gegen').forEach((x) => x.classList.remove('gegen'));
    if (j >= 0) seite.querySelector(`.lx-text li[data-j="${j}"]`)?.classList.add('gegen');
    const p = m === undefined ? null : punkt(m);
    if (p) { p.classList.add('nein'); const c = p.querySelector('.lx-ck'); if (c) c.innerHTML = KREUZ; }
    knoepfe();
    if (fehl === 1) return sag(r, 'tipp', v.nicht ?? K.UI.nochmal);
    // 2. Fehler: die Raupe blättert zur richtigen Seite und zeigt, warum
    zu = true; fuss(); knoepfe();
    sag(r, 'tipp', [v.nicht ?? '', K.UI.hilfe, d.warum ?? ''].join(' ').trim());
    spaeter(zi, 1800, () => { zu = false; blaettern(li); zu = true; $('.lx-seite', blatt).classList.add('zeig'); spaeter(zi, 900, () => treffer(true)); });
  };

  // Eingaben: Reiter, Pfeile, Wischen auf der Seite
  zi.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (zu) return;
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
  sag(r, 'denkt', d.start ?? '');
  hook.loese = () => { if (!zu) treffer(false); };
};

/* ============================ Die rettende Idee (Spur 18, art „waage“) ============================
 * Oben das Ziel („Finde die Idee, bei der alle drei lachen.“), darunter Mila, Ben und Oskar mit je einem Wunsch.
 * Unten vier Ideen-Karten. Antippen = Idee ausprobieren: unter jedem Kind erscheint ✓ (Gesicht lacht) oder ✗
 * (Gesicht traurig/besorgt) und ein kurzer Satz, warum. Die Karte merkt sich das Ergebnis (drei kleine Zeichen).
 * Nur eine Idee bekommt drei ✓: dann jubeln alle, die Karte wird „Die rettende Idee!“, Schluss-Satz der Raupe.
 * Probieren ist kein Fehler: 1. unpassende Idee → Satz der Raupe (`sagt`), 2. → Tipp, 3. → die Raupe zeigt auf die letzte Karte.
 * Daten: frage (Ziel), kinder[] {id, name, text (Wunsch)}, ideen[] {id, text, sagt, <kind-id>: {froh, unter, bild?}},
 *        ok (Band auf der Siegerkarte), tipp, hilfe, start, erfolg.
 */
const HAKEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const KREUZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>';
const LAMPE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.3 1.1 2.2h5c0-.9.3-1.6 1.1-2.2A6 6 0 0 0 12 3z" fill="#FFE07A" stroke="#C9951A" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.6 18.2h4.8M10.2 20.6h3.6" stroke="#8A6A3A" stroke-width="1.8" stroke-linecap="round"/><path d="M10.4 8.6c.5-1 1.4-1.6 2.4-1.7" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>';
SPIELE_LESEN.waage = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const kinder: any[] = d.kinder ?? [], ideen: any[] = d.ideen ?? [];
  const froh = (idee: any, k: any) => !!idee?.[k.id]?.froh;
  const passt = (idee: any) => (d.loesung ? idee.id === d.loesung : kinder.every((k) => froh(idee, k)));
  const richtige = ideen.find(passt);
  const ordnung = K.mischen(ideen.map((i) => i.id));
  const probiert = new Set<string>();
  let fehl = 0, zu = false;
  /** Gesicht: vorher nachdenklich, sonst lacht (✓) oder traurig/besorgt (✗, oder das Bild aus der Reaktion) */
  const gesicht = (k: any, idee: any) => {
    const basis = k.bild ?? k.id, re = idee?.[k.id] ?? {};
    const art = !idee ? (k.gesicht ?? 'denkt') : (re.bild ?? (re.froh ? 'lacht' : 'traurig'));
    return K.fig(`${basis}/${art}`);
  };
  vorladen(kinder.flatMap((k) => ideen.map((i) => gesicht(k, i))));
  const marken = (idee: any) => kinder.map((k) => `<i class="${froh(idee, k) ? 'ja' : 'nein'}">${froh(idee, k) ? HAKEN : KREUZ}</i>`).join('');

  zi.innerHTML = `<div class="ww">
    ${d.frage ? `<p class="ww-ziel"><span class="ww-drei" aria-hidden="true">${kinder.map(() => `<i>${HAKEN}</i>`).join('')}</span><span class="ww-zt">${d.frage}</span></p>` : ''}
    <div class="ww-kinder">${kinder.map((k) => `<div class="ww-kind" data-k="${k.id}">
      <span class="ww-rahmen"><img src="${gesicht(k, null)}" alt=""><i class="ww-mark" aria-hidden="true"></i></span>
      <div class="ww-txt"><b class="ww-name">${k.name ?? ''}</b><p class="ww-wunsch">${k.text ?? ''}</p><p class="ww-re leer" aria-live="polite">?</p></div>
    </div>`).join('')}</div>
    <div class="ww-ideen">${ordnung.map((id) => { const i = ideen.find((x) => x.id === id)!; return `<button class="ww-idee" data-i="${id}" aria-pressed="false"><span class="ww-lampe">${LAMPE}</span><span class="ww-it">${i.text ?? ''}</span><span class="ww-erg" aria-hidden="true"></span></button>`; }).join('')}</div>
  </div>`;
  const ww = $('.ww', zi);

  const zeigen = (idee: any) => {
    zi.querySelectorAll<HTMLElement>('.ww-idee').forEach((b) => { const an = b.dataset.i === idee.id; b.classList.toggle('an', an); b.setAttribute('aria-pressed', String(an)); });
    kinder.forEach((k, n) => {
      const el = $(`.ww-kind[data-k="${k.id}"]`, zi), re = idee[k.id] ?? {}, ja = !!re.froh;
      el.dataset.st = ja ? 'ja' : 'nein';
      $<HTMLImageElement>('img', el).src = gesicht(k, idee);
      $('.ww-mark', el).innerHTML = ja ? HAKEN : KREUZ;
      const p = $('.ww-re', el);
      p.innerHTML = re.unter ?? '';
      p.classList.remove('leer');
      el.style.setProperty('--n', String(n));
      el.classList.remove('neu'); void el.offsetWidth; el.classList.add('neu');
    });
    // die Karte merkt sich das Ergebnis
    const karte = $(`.ww-idee[data-i="${idee.id}"]`, zi);
    $('.ww-erg', karte).innerHTML = marken(idee);
    karte.classList.add('probiert');
    K.summ(12);
  };
  const geschafft = (mitHilfe: boolean) => {
    if (zu && ww.classList.contains('fertig')) return;
    zu = true; hook.loese = null;
    const karte = $(`.ww-idee[data-i="${richtige.id}"]`, zi);
    karte.classList.remove('zeig');
    karte.classList.add('sieger');
    karte.insertAdjacentHTML('afterbegin', `<b class="ww-band">${d.ok ?? ''}</b>`);
    zi.querySelectorAll<HTMLButtonElement>('.ww-idee').forEach((b) => { b.disabled = true; });
    ww.classList.add('fertig');
    K.summ([20, 40, 60]);
    spaeter(zi, mitHilfe ? 900 : 700, () => ende(r, d, fertig, mitHilfe ? K.UI.hilfe : ''));
  };
  const probe = (id: string) => {
    if (zu) return;
    const idee = ideen.find((x) => x.id === id);
    if (!idee) return;
    zeigen(idee);
    if (passt(idee)) return geschafft(false);
    if (probiert.has(id)) return sag(r, 'denkt', idee.sagt ?? K.UI.nochmal); // schon probiert: nur erinnern
    probiert.add(id); fehl++;
    if (fehl === 1) return sag(r, 'staunt', idee.sagt ?? K.UI.nochmal);
    if (fehl === 2) return sag(r, 'tipp', [idee.sagt ?? '', d.tipp ?? ''].join(' ').trim());
    // dritte unpassende Idee: die Raupe zeigt auf die Karte, die noch fehlt
    if (!richtige) return sag(r, 'tipp', d.tipp ?? K.UI.nochmal);
    sag(r, 'tipp', d.hilfe ?? d.tipp ?? K.UI.nochmal);
    const k = $(`.ww-idee[data-i="${richtige.id}"]`, zi);
    k.classList.remove('zeig'); void k.offsetWidth; k.classList.add('zeig');
    requestAnimationFrame(() => k.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };
  zi.onclick = (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.ww-idee'); if (b && !(b as HTMLButtonElement).disabled) probe(b.dataset.i!); };
  unten('');
  sag(r, 'denkt', d.start ?? '');
  hook.loese = () => { if (!zu && richtige) { zeigen(richtige); geschafft(false); } };
};

/* ============================ Flunker-Finder (Fallkarte Kapitel 4) ============================
 * Der Bericht der Lese-Raupe auf kariertem Papier: alle Sätze stehen gleich da. Oben das Ziel mit Zähler
 * („Zwei Sätze stimmen nicht. Finde die Flunker-Sätze!“ 0 / 2). Antippen:
 *  - Flunker → Satz wird durchgestrichen, Stempel GEFLUNKERT!, darunter, wie es wirklich war (`aufloesung`), die Raupe lacht (`sagt`);
 *  - wahrer Satz → kurzes „stimmt“-Häkchen, Wackeln, die Raupe: „Das stimmt! Lies noch mal genau.“ (`nein`).
 * Nach zwei Fehlgriffen zeigt die Raupe den nächsten Flunker (ui.hilfe + `warum`). Läuft in jeder Fläche mit .zi und .zr.
 * Daten: frage (Ziel), liste (Überschrift des Berichts), saetze[] {text, wahr, aufloesung?, sagt?, nein?, warum?}, start, nein, fund, warum, stempel, erfolg.
 */
SPIELE_LESEN.flunker = (r, d, fertig) => {
  const K = kontext();
  const zi = $('.zi', r);
  const S: any[] = d.saetze ?? [];
  const falsch = S.map((x, i) => (x.wahr === false ? i : -1)).filter((i) => i >= 0);
  const gef = new Set<number>();
  let fehl = 0, zu = false;
  const wahrheit = (x: any) => x.aufloesung ?? (typeof x.richtig === 'string' ? x.richtig : '');
  const PF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const zaehler = () => `<span class="flk-zahl" aria-live="polite">${falsch.map((_, i) => `<i class="${i < gef.size ? 'an' : ''}"></i>`).join('')}<b>${gef.size} / ${falsch.length}</b></span>`;
  zi.innerHTML = `<div class="flk">
    ${d.frage ? `<p class="flk-ziel"><span>${d.frage}</span>${zaehler()}</p>` : ''}
    <div class="flk-blatt"><i class="flk-band" aria-hidden="true"></i>${d.liste ? `<h3 class="flk-kopf">${d.liste}</h3>` : ''}
      <ol class="flk-heft">${S.map((x, i) => `<li class="flk-z" data-i="${i}"><button class="flk-s"><i class="flk-nr" aria-hidden="true">${i + 1}</i><span class="flk-t"><span class="flk-satz">${x.text ?? ''}</span></span></button></li>`).join('')}</ol>
    </div>
  </div>`;
  const heft = $('.flk-heft', zi);
  const zaehlen = () => { const z = zi.querySelector('.flk-zahl'); if (z) z.outerHTML = zaehler(); };

  const markiere = (i: number) => {
    const el = $(`.flk-z[data-i="${i}"]`, heft);
    if (!el || el.classList.contains('gef')) return;
    el.classList.remove('zeig', 'stimmt');
    el.classList.add('gef');
    $('.flk-s', el).setAttribute('aria-disabled', 'true');
    $('.flk-t', el).insertAdjacentHTML('beforeend', ` <b class="flk-stempel">${d.stempel ?? ''}</b>`);
    if (wahrheit(S[i])) el.insertAdjacentHTML('beforeend', `<p class="flk-auf">${PF}<span>${wahrheit(S[i])}</span></p>`);
  };
  const finde = (i: number, mitHilfe: boolean) => {
    gef.add(i); fehl = 0;
    markiere(i);
    zaehlen();
    K.summ(30);
    if (gef.size >= falsch.length) {
      zu = true; hook.loese = null;
      $('.flk', zi).classList.add('fertig');
      unten('');
      return spaeter(zi, mitHilfe ? 900 : 700, () => ende(r, d, fertig));
    }
    const t = S[i].sagt ?? d.fund;
    if (!mitHilfe && t) sag(r, 'lacht', [t, gef.size < falsch.length && S[i].sagt ? d.fund ?? '' : ''].join(' ').trim());
    zu = false;
  };
  zi.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.flk-s');
    if (!b || zu) return;
    const z = b.closest<HTMLElement>('.flk-z')!, i = +z.dataset.i!;
    if (gef.has(i)) return;
    if (S[i].wahr === false) return finde(i, false);
    // wahrer Satz: freundlich „stimmt“, kein Durchstreichen
    wackel(z);
    z.classList.remove('stimmt'); void z.offsetWidth; z.classList.add('stimmt');
    setTimeout(() => z.classList.remove('stimmt'), 1600);
    if (++fehl === 1) return sag(r, 'tipp', S[i].nein ?? d.nein ?? K.UI.nochmal);
    // 2. Fehlgriff: die Raupe zeigt den nächsten Flunker
    const ziel = falsch.find((x) => !gef.has(x));
    if (ziel === undefined) return sag(r, 'tipp', S[i].nein ?? d.nein ?? K.UI.nochmal);
    zu = true;
    sag(r, 'tipp', [K.UI.hilfe, S[ziel].warum ?? d.warum ?? ''].join(' '));
    const zz = $(`.flk-z[data-i="${ziel}"]`, heft);
    zz.classList.add('zeig');
    requestAnimationFrame(() => zz.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    spaeter(zi, 1400, () => finde(ziel, true));
  };
  unten('');
  sag(r, 'lacht', d.start ?? '');
  hook.loese = () => { if (zu) return; falsch.forEach((i) => { if (!gef.has(i)) { gef.add(i); markiere(i); } }); zaehlen(); zu = true; $('.flk', zi).classList.add('fertig'); unten(''); ende(r, d, fertig); };
};
