/**
 * Lese-Fall · Vorschau „v7“: Kapitel 1 mit neuem Text, Notizbuch, Zügen im Text und Fallakte.
 * Eigener Einstieg (v7.html), eigener Speicherstand. Die bisherige App (index.html) bleibt unverändert.
 */
import './v7.css';
import DATA_ from '../../../04_data/buch1_v7.json';
import { T, plain } from '../text';
import { img } from '../data';

const D: any = structuredClone(DATA_);
/** Texte der Züge und der Oberfläche einmal in HTML mit Silben verwandeln */
const TEXT = new Set(['titel', 'text', 'tipp', 'erfolg', 'schluss', 'warum', 'haken', 'name', 'frage', 'passt', 'fehlt', 'unklar']);
function html(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT.has(key) ? T(v) : v;
  if (Array.isArray(v)) return v.map((x) => html(x, key));
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = html(v[k], k); }
  return v;
}
for (const sp of D.spuren) { sp.titelH = T(sp.titel); sp.haken = T(sp.haken); html(sp.mitte); html(sp.ende); html(sp.akte); }
html(D.verdaechtige); html(D.intro);
for (const k of D.kapitel) { k.titelH = T(k.titel); k.vorspann = T(k.vorspann); k.schluss = T(k.schluss); k.geheimwort.frage = T(k.geheimwort.frage); }
const UI: Record<string, string> = Object.fromEntries(Object.entries(D.ui).map(([k, v]) => [k, T(v as string)]));
/** freigestellte Figur: "raupe/denkt" → gen/frei/raupe_denkt */
const fig = (n: string) => (/^(raupe|mila|ben|oskar)\//.test(n) ? img('frei/' + n.replace('/', '_')) : img(n));
const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as E;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ---------- Speicherstand (nur auf dem Gerät) ---------- */
interface Stand {
  view: 'titel' | 'intro' | 'kapitel' | 'spur' | 'tresor' | 'finale';
  spur: number; i: number; blatt: number; // spur = Nummer der Szene im Buch (1–24)
  fertig: number[]; marks: string[]; verdacht: Record<string, string>;
  tresor: number[]; tipp: boolean; intro: boolean; zuege: number; name: string; ziel: boolean; fs: number; silben: boolean;
}
const KEY = 'lesefall.v7b';
const START: Stand = { view: 'titel', spur: 1, i: 0, blatt: 0, fertig: [], marks: [], verdacht: {}, tresor: [], tipp: false, intro: false, zuege: 0, name: '', ziel: false, fs: 20, silben: true };
const stand: Stand = (() => { try { const r = localStorage.getItem(KEY); if (r) return { ...structuredClone(START), ...JSON.parse(r) }; } catch { /* ohne Speichern weiter */ } return structuredClone(START); })();
const speichern = () => { try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch { /* egal */ } };

/* ---------- Daten-Helfer ---------- */
type Satz = { id: string; spur: number; teil: number; text: string };
const SAETZE = new Map<string, Satz>();
for (const sp of D.spuren) sp.teile.forEach((t: any, ti: number) => t.blocks.forEach((b: any) => b.s.forEach((s: string, k: number) => SAETZE.set(`${b.id}-${k}`, { id: `${b.id}-${k}`, spur: sp.nr, teil: ti, text: s }))));
const SP = (n: number) => D.spuren[n - 1];
const KAP = (n: number) => D.kapitel[SP(n).kap - 1];
/** „Spur 2“ oder, sobald es mehrere Kapitel gibt, „Kapitel 1 · Spur 2“ */
const nenn = (n: number) => (D.kapitel.length > 1 ? `Kapitel ${SP(n).kap} · Spur ${SP(n).spur}` : `Spur ${SP(n).spur}`);
const summ = (ms: number | number[]) => { try { navigator.vibrate?.(ms); } catch { /* egal */ } };
type Step = { t: 'lesen'; teil: number } | { t: 'zug'; z: any; nr: number; von: number } | { t: 'akte' } | { t: 'haken' };
function steps(n: number): Step[] {
  const sp = SP(n), out: Step[] = [{ t: 'lesen', teil: 0 }], von = sp.mitte.length + sp.ende.length;
  let k = 0;
  sp.mitte.forEach((z: any) => out.push({ t: 'zug', z, nr: ++k, von }));
  if (sp.teile[1]) out.push({ t: 'lesen', teil: 1 });
  sp.ende.forEach((z: any) => out.push({ t: 'zug', z, nr: ++k, von }));
  out.push({ t: 'akte' }, { t: 'haken' });
  return out;
}
const perlen = () => stand.fertig.length * 2;
const hatMark = (id: string) => stand.marks.includes(id);
function merke(id: string) { if (!hatMark(id)) { stand.marks.push(id); speichern(); kopf(); huepf(); } }
const huepf = () => { const b = document.getElementById('bNotiz'); if (b) { b.classList.remove('huepf'); void b.offsetWidth; b.classList.add('huepf'); } };

/* ---------- Icons ---------- */
const IC = {
  buch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 3v18M3.5 7h4M3.5 12h4M3.5 17h4M10.5 8.5h5M10.5 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  akte: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 13h8M8 16.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lupe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M15 15l5.5 5.500" stroke="currentColor" stroke-width="2.800" stroke-linecap="round"/></svg>',
  vor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zur: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg>',
};

/* ---------- Gerüst ---------- */
const app = $('#app');
app.innerHTML = `<header class="kopf"><button class="kb" id="bAkte" aria-label="Fallakte">${IC.akte}</button><div class="kt"><b id="kT1"></b><span id="kT2"></span></div><span class="perl" id="kPerl"></span><button class="kb" id="bNotiz" aria-label="Notizbuch">${IC.buch}<i id="kZahl"></i></button><button class="kb aa" id="bAa" aria-label="Schrift">Aa</button></header><main id="buehne"></main><footer id="fuss"></footer><div id="ueber"></div>`;
const buehne = $('#buehne'), fuss = $('#fuss'), ueber = $('#ueber');
const modus = (m: string) => { app.dataset.m = m; };
function kopf() {
  const im = stand.view === 'spur' || stand.view === 'tresor';
  $('.kopf').hidden = !im;
  $('#kT1').innerHTML = stand.view === 'tresor' ? 'Mondtresor' : `Spur ${SP(stand.spur).spur}`;
  $('#kT2').innerHTML = `Kapitel ${SP(stand.spur).kap} · ${KAP(stand.spur).titelH}`;
  $('#kPerl').textContent = String(perlen());
  $('#kZahl').textContent = stand.marks.length ? String(stand.marks.length) : '';
  document.documentElement.style.setProperty('--fs', stand.fs + 'px');
  document.documentElement.classList.toggle('ohne-silben', !stand.silben);
}
const raupe = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
const knopf = (a: string, t: string, kl = 'haupt', dis = false) => `<button class="kn ${kl}" data-a="${a}" ${dis ? 'disabled' : ''}>${t.startsWith('<svg') ? t : `<span>${t}</span>`}</button>`;
const zitat = (id: string) => `<q class="zt">${T(SAETZE.get(id)!.text)}</q>`;

/* ---------- Ablauf ---------- */
let zs: any = {}; // flüchtiger Zustand des aktuellen Zugs
function zeige() {
  ueber.innerHTML = ''; kopf(); speichern();
  if (stand.view === 'titel') return titel();
  if (stand.view === 'intro') return intro();
  if (stand.view === 'kapitel') return kapitelKarte();
  if (stand.view === 'tresor') return tresor();
  if (stand.view === 'finale') return finale();
  const st = steps(stand.spur)[stand.i];
  if (st.t === 'lesen') return lesen(st.teil);
  if (st.t === 'zug') { zs = { fehl: 0 }; return zug(st); }
  if (st.t === 'akte') return akteBlatt();
  return haken();
}
function weiter() {
  const n = steps(stand.spur).length;
  stand.blatt = 0;
  if (stand.i + 1 < n) stand.i++;
  else if (SP(stand.spur).spur === 6) stand.view = 'tresor';
  else { stand.spur++; stand.i = 0; }
  zeige();
}

/* ---------- Titel, Vorgeschichte, Kapitelkarte ---------- */
function titel() {
  modus('titel');
  const angefangen = stand.fertig.length > 0 || stand.i > 0 || stand.marks.length > 0;
  buehne.innerHTML = `<section class="titel"><div class="lampe"></div><p class="tl">LESE-FALL · FALL 1</p><h1>${T(D.fall.titel)}</h1><figure class="foto gross"><img src="${img('cover')}" alt=""></figure><p class="tu">Ein Krimi zum Selberlesen</p></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('start', angefangen ? UI.weiterFall : UI.start)}${angefangen ? knopf('neu', UI.neuStart, 'still') : ''}</div>`;
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'start') { stand.view = stand.intro ? (angefangen ? 'spur' : 'kapitel') : 'intro'; stand.blatt = angefangen ? stand.blatt : 0; if (stand.tresor.includes(SP(stand.spur).kap) && SP(stand.spur).spur === 6) stand.view = 'tresor'; if (stand.ziel) stand.view = 'finale'; zeige(); }
    else if (a === 'neu') neuStart();
  };
}
function intro() {
  modus('titel');
  let k = 0;
  const mal = () => {
    const s = D.intro[k], letzt = k === D.intro.length - 1;
    buehne.innerHTML = `<section class="intro"><div class="lampe"></div><div class="ib ${s.bild.includes('/') ? 'frei' : 'foto'}"><img src="${fig(s.bild)}" alt=""></div><p>${s.text}</p>${letzt ? `<p class="frage">${UI.bereit}</p>` : ''}<div class="pkt hell">${D.intro.map((_: any, i: number) => `<i class="${i === k ? 'an' : ''}"></i>`).join('')}</div></section>`;
    fuss.innerHTML = `<div class="fz">${knopf('w', letzt ? UI.los : UI.weiter)}</div>`;
  };
  mal();
  fuss.onclick = (e) => {
    if (!(e.target as HTMLElement).closest('[data-a="w"]')) return;
    if (++k < D.intro.length) return mal();
    stand.intro = true; stand.view = 'kapitel'; zeige();
  };
}
function kapitelKarte() {
  modus('titel');
  const k = KAP(stand.spur);
  buehne.innerHTML = `<section class="kapk"><div class="lampe"></div><span class="tab hell">${UI.kapitel} ${k.nr}</span><h1>${k.titelH}</h1><img class="vig" src="${img(k.bild)}" alt=""><p>${k.vorspann}</p></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('w', UI.los)}</div>`;
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="w"]')) { stand.view = 'spur'; zeige(); } };
}

/* ---------- Lesen ---------- */
const blockHtml = (b: any, wahl = false) => {
  const s = b.s.map((x: string, k: number) => `<span class="satz${hatMark(`${b.id}-${k}`) ? ' mk' : ''}${wahl ? ' wahl' : ''}" data-s="${b.id}-${k}">${T(x)}</span>`).join(' ');
  return b.typ === 'th' ? `<div class="ged"><img src="${fig('raupe/denkt')}" alt=""><p>${s}</p></div>` : `<p>${s}</p>`;
};
/**
 * Verteilt Blöcke auf Blätter ohne Rollen: so wenige Blätter wie möglich, dann möglichst gleich voll
 * (kleinste Summe der Quadrate des Leerraums). Ein <!-- Blatt --> im Text zieht den Umbruch an.
 */
function blaetter(blocks: any[], kopfHtml: string, wahl = false): { html: string; voll: number }[] {
  const probe = document.createElement('div');
  probe.className = 'blatt probe';
  buehne.appendChild(probe);
  const innen = document.createElement('div');
  probe.appendChild(innen);
  const cs = getComputedStyle(probe);
  const H = probe.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const hs = blocks.map((b) => blockHtml(b, wahl)), n = hs.length;
  const memo = new Map<string, number>();
  const hoehe = (i: number, j: number) => { // Blöcke i..j-1 auf einem Blatt
    const k = `${i}-${j}`;
    if (!memo.has(k)) { innen.innerHTML = (i === 0 ? kopfHtml : '') + hs.slice(i, j).join(''); memo.set(k, innen.offsetHeight); }
    return memo.get(k)!;
  };
  const passt = (i: number, j: number) => j - i === 1 || hoehe(i, j) <= H;
  // kleinste Blattzahl (gierig)
  let K = 0;
  for (let i = 0; i < n; K++) { let j = i + 1; while (j < n && passt(i, j + 1)) j++; i = j; }
  // beste Verteilung auf genau K Blätter
  const INF = 1e18, kost: number[][] = [...Array(K + 1)].map(() => Array(n + 1).fill(INF)), von: number[][] = [...Array(K + 1)].map(() => Array(n + 1).fill(-1));
  kost[0][0] = 0;
  for (let k = 1; k <= K; k++) for (let j = 1; j <= n; j++) for (let i = j - 1; i >= 0 && passt(i, j); i--) {
    if (kost[k - 1][i] >= INF) continue;
    const leer = Math.max(0, H - hoehe(i, j)) / H;
    const c = kost[k - 1][i] + leer * leer * (k === 1 ? 2.5 : 1) - (i > 0 && blocks[i].umbruch ? 0.05 : 0); // das erste Blatt soll gut gefüllt sein
    if (c < kost[k][j]) { kost[k][j] = c; von[k][j] = i; }
  }
  const out: { html: string; voll: number }[] = [];
  for (let k = K, j = n; k > 0; k--) { const i = von[k][j]; out.unshift({ html: (i === 0 ? kopfHtml : '') + hs.slice(i, j).join(''), voll: hoehe(i, j) / H }); j = i; }
  probe.remove();
  return out;
}
/** Markierungen aus dem Stand auf das gezeigte Blatt übertragen */
const marksZeigen = () => document.querySelectorAll<HTMLElement>('.blatt .satz').forEach((s) => s.classList.toggle('mk', hatMark(s.dataset.s!)));
function fussLesen(n: number, letzt: string, zurueckFrei = true) {
  const b = stand.blatt;
  fuss.innerHTML = `<div class="fl"><button class="rund" data-a="prev" ${b === 0 || !zurueckFrei ? 'disabled' : ''} aria-label="Zurück">${IC.zur}</button><div class="pkt">${[...Array(n)].map((_, k) => `<i class="${k === b ? 'an' : k < b ? 'war' : ''}"></i>`).join('')}</div>${b < n - 1 ? `<button class="rund gold" data-a="next" aria-label="Weiter">${IC.vor}</button>` : letzt}</div>`;
}
function lesen(teil: number) {
  modus('lesen');
  const sp = SP(stand.spur);
  const foto = (b: string | null) => (b ? `<figure class="foto"><img src="${img(b)}" alt=""></figure>` : '');
  const kopfH = teil === 0 ? `<div class="skopf"><span class="tab">SPUR ${sp.spur}</span><h2>${sp.titelH}</h2></div>${foto(sp.bild)}` : foto(sp.bildB);
  buehne.innerHTML = '';
  const seiten = blaetter(sp.teile[teil].blocks, kopfH);
  stand.blatt = Math.min(stand.blatt, seiten.length - 1);
  const next = steps(stand.spur)[stand.i + 1];
  const zeig = () => {
    const s = seiten[stand.blatt];
    buehne.innerHTML = `<div class="blatt${s.voll < 0.5 && !(teil === 0 && stand.blatt === 0) ? ' kurz' : ''}" data-art="lesen">${s.html}</div>${!stand.tipp && stand.spur === 1 && teil === 0 && stand.blatt === 0 ? `<div class="coach">${raupe('tipp', UI.markTipp)}</div>` : ''}`;
    marksZeigen();
    fussLesen(seiten.length, next.t === 'zug' ? `<button class="kn haupt zugk" data-a="weiter">${IC.lupe}<span>${UI.zug}</span></button>` : knopf('weiter', UI.weiter));
  };
  zeig();
  buehne.onclick = (e) => {
    if ($('.coach')) { stand.tipp = true; $('.coach').remove(); speichern(); return; } // erstes Tippen schließt nur den Hinweis
    const s = (e.target as HTMLElement).closest<HTMLElement>('.satz');
    if (!s) return;
    const id = s.dataset.s!;
    if (hatMark(id)) stand.marks = stand.marks.filter((x) => x !== id); else { stand.marks.push(id); huepf(); summ(12); }
    s.classList.toggle('mk');
    speichern(); kopf();
  };
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    stand.tipp = true;
    if (a === 'prev') { stand.blatt--; zeig(); } else if (a === 'next') { stand.blatt++; zeig(); } else if (a === 'weiter') weiter();
    speichern();
  };
  wisch(buehne, () => stand.blatt < seiten.length - 1 && (stand.blatt++, zeig()), () => stand.blatt > 0 && (stand.blatt--, zeig()));
}
function wisch(el: HTMLElement, links: () => void, rechts: () => void) {
  let x0 = 0, y0 = 0;
  el.ontouchstart = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
  el.ontouchend = (e) => { const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) (dx < 0 ? links : rechts)(); };
}

/* ---------- Text öffnen: Sätze markieren oder Beweis suchen ---------- */
/** Blöcke einer Spur, soweit schon gelesen */
function gelesen(spur: number): any[] {
  const sp = SP(spur);
  let bis = sp.teile.length;
  if (spur === stand.spur) { const st = steps(spur).slice(0, stand.i + 1).filter((s) => s.t === 'lesen'); bis = st.length; }
  return sp.teile.slice(0, bis).flatMap((t: any) => t.blocks);
}
function textOffen(o: { spur: number; banner: string; ziel?: string[]; tipp?: string; hinweis?: string; fertig?: boolean; gefunden?: (id: string) => void; zu: () => void }) {
  modus('text');
  const blocks = gelesen(o.spur);
  buehne.innerHTML = '';
  let b = 0, fehl = 0, hinweis = o.hinweis ?? '';
  const kopfH = () => `<div class="auftrag"><span class="tab">${nenn(o.spur).toUpperCase()}</span><p>${o.banner}</p>${hinweis ? `<div class="hin"><img src="${fig('raupe/tipp')}" alt=""><p>${hinweis}</p></div>` : ''}</div>`;
  let seiten = blaetter(blocks, kopfH(), true);
  const seiteVon = (id: string) => seiten.findIndex((h) => h.html.includes(`data-s="${id}"`));
  const zeig = () => {
    buehne.innerHTML = `<div class="blatt suche">${seiten[b].html}</div>`;
    marksZeigen();
    fuss.innerHTML = `<div class="fl"><button class="rund" data-a="prev" ${b === 0 ? 'disabled' : ''} aria-label="Zurück">${IC.zur}</button><div class="pkt">${seiten.map((_, k) => `<i class="${k === b ? 'an' : ''}"></i>`).join('')}</div><button class="rund" data-a="next" ${b === seiten.length - 1 ? 'disabled' : ''} aria-label="Weiter">${IC.vor}</button>${o.fertig ? knopf('fertig', UI.fertig) : knopf('zu', IC.zu, 'still eng')}</div>`;
  };
  zeig();
  buehne.onclick = (e) => {
    const s = (e.target as HTMLElement).closest<HTMLElement>('.satz');
    if (!s) return;
    const id = s.dataset.s!;
    if (o.fertig) { // frei markieren
      if (hatMark(id)) stand.marks = stand.marks.filter((x) => x !== id); else stand.marks.push(id);
      s.classList.toggle('mk'); speichern(); kopf(); return;
    }
    if (o.ziel!.includes(id)) { merke(id); s.classList.add('mk', 'treffer'); setTimeout(() => o.gefunden!(id), 650); return; }
    s.classList.add('nein'); setTimeout(() => s.classList.remove('nein'), 500);
    if (++fehl >= 2 && !hinweis) { hinweis = o.tipp ?? ''; buehne.innerHTML = ''; seiten = blaetter(blocks, kopfH(), true); const k = seiteVon(o.ziel![0]); if (k >= 0) b = k; zeig(); }
  };
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'prev') { b--; zeig(); } else if (a === 'next') { b++; zeig(); } else if (a === 'zu' || a === 'fertig') o.zu();
  };
  wisch(buehne, () => b < seiten.length - 1 && (b++, zeig()), () => b > 0 && (b--, zeig()));
}

/* ---------- Notizbuch ---------- */
function notizHtml(wahl: boolean, ohne: string[] = []) {
  const ids = stand.marks.filter((id) => !ohne.includes(id));
  if (!ids.length) return `<p class="leer">${UI.notizLeer}</p>`;
  const nach: Record<number, string[]> = {};
  ids.forEach((id) => (nach[SAETZE.get(id)!.spur] ??= []).push(id));
  return Object.keys(nach).map(Number).sort((a, b) => b - a).map((n) => `<h4>${nenn(n)}</h4>${nach[n].map((id) => `<div class="nz${wahl ? ' wahl' : ''}" data-n="${id}"><span>${T(SAETZE.get(id)!.text)}</span>${wahl ? '' : `<button data-x="${id}" aria-label="Entfernen">${IC.zu}</button>`}</div>`).join('')}`).join('');
}
function notizbuch() {
  ueber.innerHTML = `<div class="schl"><section class="heft"><header><b>${UI.notizbuch}</b><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></header><div class="hs">${notizHtml(false)}</div></section></div>`;
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement;
    const x = t.closest<HTMLElement>('[data-x]');
    if (x) { stand.marks = stand.marks.filter((i) => i !== x.dataset.x); speichern(); kopf(); document.querySelectorAll(`.satz[data-s="${x.dataset.x}"]`).forEach((s) => s.classList.remove('mk')); notizbuch(); return; }
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) ueber.innerHTML = '';
  };
}

/* ---------- Züge ---------- */
function zugRahmen(st: any, innen: string, unten: string, sprech = '') {
  const z = st.z;
  modus('zug');
  buehne.innerHTML = `<section class="zug" data-art="${z.art}"><div class="lampe"></div><div class="zk"><span class="tab hell">${UI.zug} · ${st.nr} von ${st.von}</span><h2>${z.titel}</h2></div><p class="zt1">${z.text}</p><div class="zi">${innen}</div><div class="zr">${sprech}</div></section>`;
  fuss.innerHTML = `<div class="fz">${unten}</div>`;
}
const sag = (b: string, t: string, kl = '') => { const r = $('.zr'); if (r) { r.innerHTML = raupe(b, t, kl); const zg = $('.zug'); if (zg) zg.scrollTop = zg.scrollHeight; } };
function geschafft(st: any, extra = '') {
  if (!zs.ok) { stand.zuege++; summ(st.z.stempel ? [20, 40, 60] : 25); }
  zs.ok = true;
  sag('lob', (extra ? extra + ' ' : '') + (st.z.erfolg ?? ''), 'gut');
  fuss.innerHTML = `<div class="fz">${knopf('weiter', UI.weiter)}</div>`;
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="weiter"]')) weiter(); };
}
/** falsche Antwort: zuerst das eigene Notizbuch, dann der Text */
function beweisSuche(st: any, wieder: () => void) {
  const z = st.z, ziel: string[] = z.beweis ?? [];
  const imText = () => textOffen({ spur: SAETZE.get(ziel[0])!.spur, banner: UI.beweisText, ziel, tipp: z.tipp, gefunden: (id) => { zs.beweis = id; wieder(); }, zu: wieder });
  let fehl = 0;
  const offen = () => {
    const hat = stand.marks.some((id) => ziel.includes(id));
    ueber.innerHTML = `<div class="schl"><section class="heft"><header><b>${UI.notizbuch}</b><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></header><p class="hw">${stand.marks.length ? UI.notizWahl : ''}</p><div class="hs">${notizHtml(true)}</div><footer>${fehl >= 2 || !hat ? `<p class="hw">${UI.fehltNoch}</p>` : ''}${knopf('text', UI.imText, fehl >= 2 || !stand.marks.length ? 'haupt' : 'still')}</footer></section></div>`;
    ueber.onclick = (e) => {
      const t = e.target as HTMLElement, n = t.closest<HTMLElement>('[data-n]');
      if (n) {
        if (ziel.includes(n.dataset.n!)) { zs.beweis = n.dataset.n; ueber.innerHTML = ''; wieder(); }
        else { n.classList.add('nein'); fehl++; setTimeout(offen, 450); }
        return;
      }
      if (t.closest('[data-a="text"]')) { ueber.innerHTML = ''; imText(); }
      else if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) ueber.innerHTML = '';
    };
  };
  offen();
}
function falsch(st: any, wieder: () => void) {
  zs.fehl++;
  if (!st.z.beweis || zs.beweis) { sag('tipp', zs.fehl >= 2 && st.z.tipp ? st.z.tipp : UI.fast); return; }
  sag('staunt', UI.zeigBeweis);
  fuss.innerHTML = `<div class="fz">${knopf('beweis', `${IC.buch}<span>${UI.notizbuch}</span>`, 'haupt zugk')}</div>`;
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="beweis"]')) beweisSuche(st, wieder); };
}
const beweisZeile = () => (zs.beweis ? raupe('tipp', `${UI.beweisDa} ${zitat(zs.beweis)}`) : '');

function zug(st: any) {
  const z = st.z;
  ({ wahl: zWahl, markieren: zMark, blick: zBlick, zwei: zZwei, sortieren: zSort, steckbrief: zSteck, weg: zWeg } as Record<string, (s: any) => void>)[z.art](st);
}

/* Wahl: eine oder mehrere Antworten; „offen“ = Verdacht ohne richtig/falsch */
function zWahl(st: any) {
  const z = st.z;
  zs.wahl ??= [];
  const mal = () => {
    const bilder = z.optionen.some((o: any) => o.bild);
    zugRahmen(st, `${z.bild ? `<img class="zbild" src="${img(z.bild)}" alt="">` : ''}<div class="opts${bilder ? ' mitbild' : ''}">${z.optionen.map((o: any) => `<button class="opt${zs.wahl.includes(o.id) ? ' an' : ''}${zs.raus?.includes(o.id) ? ' raus' : ''}" data-o="${o.id}">${o.bild ? `<img src="${fig(o.bild)}" alt="">` : ''}<span>${o.text}</span></button>`).join('')}</div><div class="stp"></div>`, z.mehrere ? knopf('pruefen', UI.pruefen, 'haupt', zs.wahl.length < 2) : '', beweisZeile());
    buehne.onclick = (e) => {
      const o = (e.target as HTMLElement).closest<HTMLElement>('[data-o]');
      if (!o || zs.ok) return;
      const id = o.dataset.o!;
      if (z.mehrere) { zs.wahl = zs.wahl.includes(id) ? zs.wahl.filter((x: string) => x !== id) : [...zs.wahl, id]; mal(); return; }
      zs.wahl = [id]; pruefe();
    };
    fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="pruefen"]')) pruefe(); };
  };
  const pruefe = () => {
    document.querySelectorAll('.opt').forEach((o) => o.classList.toggle('an', zs.wahl.includes((o as HTMLElement).dataset.o)));
    if (z.offen) { stand.verdacht[z.merken] = z.optionen.find((o: any) => o.id === zs.wahl[0]).text; speichern(); return geschafft(st, UI.gemerkt); }
    const ok = zs.wahl.length === z.richtig.length && zs.wahl.every((x: string) => z.richtig.includes(x));
    if (ok) { if (z.stempel) $('.stp').innerHTML = `<b class="stempel">${z.stempel}</b>`; return geschafft(st); }
    if (!z.mehrere) (zs.raus ??= []).push(zs.wahl[0]);
    const w = zs.wahl; zs.wahl = [];
    document.querySelectorAll<HTMLElement>('.opt').forEach((o) => { if (w.includes(o.dataset.o)) o.classList.add('nein'); });
    falsch(st, () => { zs.wahl = []; mal(); });
    if (zs.beweis || !z.beweis) setTimeout(mal, 700);
  };
  mal();
}

/* Markieren: Sätze im Text antippen */
function zMark(st: any) {
  const z = st.z;
  const eigene = () => stand.marks.filter((id) => SAETZE.get(id)!.spur === z.spur);
  const pruefe = () => {
    if (z.frei) return eigene().length ? fertig() : offen(z.tipp);
    const fehlt = z.muss.filter((id: string) => !hatMark(id));
    if (!fehlt.length) return fertig();
    zs.fehl++;
    if (zs.fehl >= 3) { fehlt.forEach((id: string) => merke(id)); return fertig(UI.hilfe); }
    offen(z.tipp);
  };
  const offen = (hinweis = '') => textOffen({ spur: z.spur, banner: z.text, hinweis, fertig: true, zu: pruefe });
  const fertig = (vor = '') => {
    const treffer = z.frei ? eigene().slice(-2) : [...z.muss, ...z.darf].filter((id: string) => hatMark(id));
    const karte = z.steckbrief ? steckbriefKarte() : `<div class="liste">${treffer.map((id: string) => `<div class="nz">${zitat(id)}</div>`).join('')}</div>`;
    zugRahmen(st, karte, '');
    geschafft(st, vor);
  };
  zugRahmen(st, `<div class="vorschau">${IC.lupe}</div>`, knopf('los', UI.imText));
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="los"]')) offen(); };
}
const steckbriefKarte = () => `<div class="steck"><h3>Steckbrief: Milas Mond</h3><div class="sb"><figure><img src="${img('objekte/mond_vorne')}" alt=""><figcaption>${T('vor|ne')}</figcaption></figure><figure><img src="${img('objekte/mond_hinten')}" alt=""><figcaption>${T('hin|ten')}</figcaption></figure></div><ul><li>${T('gelb und rund')}</li><li>${T('o|ben ein wei|ßer Fa|den')}</li><li>${T('hin|ten ein blau|er Stern')}</li></ul></div>`;

/* Blick: Stelle im Bild finden */
function zBlick(st: any) {
  const z = st.z, a = z.ausschnitt ?? { x: 0, y: 0, w: 100, h: 100 };
  zugRahmen(st, `<div class="tatort" style="aspect-ratio:${(a.w * 3) / (a.h * 2)}"><img src="${img(z.bild)}" alt="" style="width:${10000 / a.w}%;left:${(-a.x / a.w) * 100}%;top:${(-a.y / a.h) * 100}%"></div>`, '');
  const feld = $('.tatort');
  feld.onclick = (e) => {
    if (zs.ok) return;
    const r = feld.getBoundingClientRect();
    const x = a.x + ((e.clientX - r.left) / r.width) * a.w, y = a.y + ((e.clientY - r.top) / r.height) * a.h;
    const treffer = Math.hypot(x - z.zone.x, (y - z.zone.y) * (2 / 3)) <= z.zone.r;
    const ring = document.createElement('i');
    ring.className = 'ring' + (treffer ? ' da' : '');
    ring.style.left = `${((e.clientX - r.left) / r.width) * 100}%`; ring.style.top = `${((e.clientY - r.top) / r.height) * 100}%`;
    feld.appendChild(ring);
    if (treffer) return geschafft(st);
    setTimeout(() => ring.remove(), 700);
    sag('tipp', ++zs.fehl >= 2 ? z.tipp : UI.nichtHier);
  };
}

/* Zwei Spuren, ein Schluss: zur gegebenen Spur die passende aus dem Notizbuch */
function zZwei(st: any) {
  const z = st.z;
  merke(z.gegeben);
  const imText = () => textOffen({ spur: z.suche.spur, banner: UI.beweisText, ziel: [z.suche.id], tipp: z.suche.tipp, gefunden: () => { mal(); loese(); }, zu: mal });
  const loese = () => {
    $('.zi').innerHTML = `<div class="paar"><div class="nz fest">${zitat(z.gegeben)}</div><i class="faden"></i><div class="nz fest">${zitat(z.suche.id)}</div><i class="faden"></i><div class="schluss">${z.schluss}</div>${z.stempel ? `<div class="stp mitbild"><img src="${fig(z.stempelBild)}" alt=""><b class="stempel">${z.stempel}</b></div>` : ''}</div>`;
    geschafft(st);
  };
  const mal = (hinweis = '') => {
    zugRahmen(st, `<div class="nz fest">${zitat(z.gegeben)}</div><i class="faden offen"></i><h4 class="nh">${IC.buch}<span>${UI.notizbuch}</span></h4><div class="hs frei">${notizHtml(true, [z.gegeben])}</div>`, knopf('text', UI.imText, 'still'), hinweis ? raupe('tipp', hinweis) : '');
    buehne.onclick = (e) => {
      const n = (e.target as HTMLElement).closest<HTMLElement>('[data-n]');
      if (!n || zs.ok) return;
      if (n.dataset.n === z.suche.id) return loese();
      n.classList.add('nein'); zs.fehl++;
      setTimeout(() => n.classList.remove('nein'), 500);
      sag('tipp', hatMark(z.suche.id) ? (zs.fehl >= 2 ? z.suche.tipp : UI.passtNicht) : UI.fehltNoch);
    };
    fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="text"]')) imText(); };
  };
  mal(stand.marks.length <= 1 ? UI.fehltNoch : '');
}

/* Sortieren: sicher oder nur ein Verdacht */
function zSort(st: any) {
  const z = st.z;
  zs.k ??= 0; zs.lage ??= { sicher: [], verdacht: [] };
  const mal = (meld = '') => {
    const k = z.karten[zs.k];
    const stapel = (id: string) => `<div class="stapel" data-st="${id}"><b>${id === 'sicher' ? UI.sicher : UI.verdacht}</b>${zs.lage[id].map((t: string) => `<span>${t}</span>`).join('')}</div>`;
    zugRahmen(st, `${k ? `<div class="karte">${k.text}</div><div class="wohin"><button class="kn zwei" data-w="sicher"><span>${UI.sicher}</span></button><button class="kn zwei" data-w="verdacht"><span>${UI.verdacht}</span></button></div>` : ''}<div class="stapelreihe">${stapel('sicher')}${stapel('verdacht')}</div>`, '', meld);
    if (!k) return geschafft(st);
    buehne.onclick = (e) => {
      const w = (e.target as HTMLElement).closest<HTMLElement>('[data-w]')?.dataset.w;
      if (!w) return;
      const ok = w === k.stapel;
      zs.lage[k.stapel].push(k.text); zs.k++;
      mal(raupe(ok ? 'lob' : 'tipp', `${ok ? UI.stimmt : UI.fast} ${k.warum}`));
    };
  };
  mal();
}

/* Steckbrief: Merkmal für Merkmal vergleichen */
function zSteck(st: any) {
  const z = st.z;
  zs.w ??= {};
  const mal = () => {
    zugRahmen(st, `<img class="zbild" src="${img(z.bild)}" alt=""><div class="zeilen">${z.zeilen.map((r: any, i: number) => `<div class="zeile"><b>${r.text}</b><div class="seg">${Object.keys(z.werte).map((w) => `<button class="${zs.w[i] === w ? 'an' : ''}" data-z="${i}" data-w="${w}">${z.werte[w]}</button>`).join('')}</div></div>`).join('')}</div>`, knopf('pruefen', UI.pruefen, 'haupt', Object.keys(zs.w).length < z.zeilen.length), beweisZeile());
    buehne.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-z]');
      if (!b || zs.ok) return;
      zs.w[+b.dataset.z!] = b.dataset.w; mal();
    };
    fuss.onclick = (e) => {
      if (!(e.target as HTMLElement).closest('[data-a="pruefen"]')) return;
      const fehler = z.zeilen.map((r: any, i: number) => (zs.w[i] === r.wert ? -1 : i)).filter((i: number) => i >= 0);
      if (!fehler.length) return geschafft(st);
      fehler.forEach((i: number) => { delete zs.w[i]; });
      mal();
      document.querySelectorAll('.zeile').forEach((el, i) => el.classList.toggle('offen', fehler.includes(i)));
      falsch(st, mal);
    };
  };
  mal();
}

/* Weg: Orte in der richtigen Reihenfolge antippen */
function zWeg(st: any) {
  const z = st.z;
  zs.r ??= [];
  const mal = () => {
    zugRahmen(st, `<div class="wegz">${[...z.stationen].sort((a: any, b: any) => (zs.fertig ? z.reihenfolge.indexOf(a.id) - z.reihenfolge.indexOf(b.id) : 0)).map((s: any) => { const n = zs.r.indexOf(s.id); return `<button class="station${n >= 0 ? ' an' : ''}" data-st="${s.id}"><i>${n >= 0 ? n + 1 : ''}</i><img src="${img(s.bild)}" alt=""><span>${s.text}</span></button>`; }).join('')}</div>`, '', beweisZeile());
    buehne.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-st]');
      if (!b || zs.ok) return;
      const id = b.dataset.st!;
      zs.r = zs.r.includes(id) ? zs.r.filter((x: string) => x !== id) : [...zs.r, id];
      mal();
      if (zs.r.length < z.stationen.length) return;
      if (zs.r.every((x: string, i: number) => x === z.reihenfolge[i])) { zs.fertig = true; mal(); return geschafft(st); }
      setTimeout(() => { zs.r = []; mal(); falsch(st, mal); }, 600);
    };
  };
  mal();
}

/* ---------- Fallakte ---------- */
function akteHtml(bis: number, neuIn: number) {
  const kap = SP(bis).kap, gw = KAP(bis).geheimwort;
  const wort = gw.wort.split('').map((ch: string, p: number) => { const s6 = +Object.keys(gw.pos).find((k) => gw.pos[k] === p)!, nr = (kap - 1) * 6 + s6; const da = stand.fertig.includes(nr) && nr <= bis; return `<i class="${da ? 'da' : ''}${nr === neuIn ? ' neu' : ''}">${da ? ch : ''}</i>`; }).join('');
  const sps = D.spuren.filter((s: any) => s.nr <= bis);
  const neu = (n: number) => (n === neuIn ? ` <em class="neu">${UI.neu}</em>` : '');
  const geklaert = sps.flatMap((s: any) => (s.akte.fragenWeg ?? []).map((id: string) => ({ id, n: s.nr })));
  const fragen = sps.flatMap((s: any) => (s.akte.fragenNeu ?? []).map((f: any) => ({ ...f, n: s.nr }))).map((f: any) => ({ ...f, weg: geklaert.find((g: any) => g.id === f.id)?.n })).filter((f: any) => !f.weg || f.weg === neuIn);
  const hinw = sps.flatMap((s: any) => (s.akte.hinweise ?? []).map((h: any) => ({ ...h, n: s.nr })));
  const entl = sps.flatMap((s: any) => (s.akte.entlastet ?? []).map((w: string) => ({ w, n: s.nr })));
  let weg = sps.flatMap((s: any) => (s.akte.wegNeu ?? []).map((w: any) => ({ ...w, n: s.nr })));
  weg = weg.filter((w: any, i: number) => w.id !== 'offen' || i === weg.length - 1);
  const steck = sps.some((s: any) => s.akte.steckbrief);
  const wer = [...new Set(hinw.map((h: any) => h.wer))] as string[];
  const verd = Object.keys(stand.verdacht).filter((k) => +k.slice(1) <= bis).sort((a, b) => +a.slice(1) - +b.slice(1)).pop();
  return `<div class="wortz"><b>${UI.wort}</b><div class="wort">${wort}</div></div>
  ${steck ? (bis === 1 || !neuIn ? `<div class="zettel steckz">${steckbriefKarte()}</div>` : `<div class="zettel klein"><img src="${img('objekte/mond_vorne')}" alt=""><img src="${img('objekte/mond_hinten')}" alt=""><span><b>Steckbrief: Milas Mond</b>${T('gelb und rund · wei|ßer Fa|den · blau|er Stern hin|ten')}</span></div>`) : ''}
  ${wer.length ? `<h3>${UI.verdaechtige}</h3><div class="verd">${wer.map((w) => { const e = entl.find((x: any) => x.w === w); return `<div class="pola${e ? ' frei' : ''}"><img src="${fig(D.verdaechtige[w].bild)}" alt=""><b>${D.verdaechtige[w].name}</b>${hinw.filter((h: any) => h.wer === w).map((h: any) => `<span>${h.text}${neu(h.n)}</span>`).join('')}${e ? `<b class="stempel klein${e.n === neuIn ? ' frisch' : ''}">WAR ES NICHT</b>` : ''}</div>`; }).join('')}</div>` : ''}
  ${weg.length ? `<h3>${UI.weg}</h3><div class="wegk">${weg.map((w: any) => `<span class="${w.id === 'offen' ? 'frage' : ''}${w.n === neuIn ? ' frisch' : ''}">${w.text}</span>`).join('<i></i>')}</div>` : ''}
  ${fragen.length ? `<h3>${UI.fragen}</h3><div class="fragen">${fragen.map((f: any) => `<div class="zettel fr${f.weg ? ' weg' : ''}">${f.text}${f.weg ? ` <em class="neu ok">${UI.geklaert}</em>` : neu(f.n)}</div>`).join('')}</div>` : ''}
  ${verd ? `<h3>${UI.deinVerdacht}</h3><div class="zettel mein">${stand.verdacht[verd]}</div>` : ''}`;
}
function akteBlatt() {
  modus('akte');
  if (!stand.fertig.includes(stand.spur)) { stand.fertig.push(stand.spur); speichern(); kopf(); }
  buehne.innerHTML = `<section class="akte"><div class="ak"><span class="tab hell">${UI.akte}</span><span class="plus"><span>+2 ${UI.perlen}</span></span></div>${akteHtml(stand.spur, stand.spur)}</section>`;
  fuss.innerHTML = `<div class="fz">${knopf('weiter', UI.weiter)}</div>`;
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="weiter"]')) weiter(); };
}
function akteOffen() {
  const bis = Math.max(0, ...stand.fertig);
  ueber.innerHTML = `<div class="schl"><section class="akte ueberl"><div class="ak"><span class="tab hell">${UI.akte}</span><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></div>${bis ? akteHtml(bis, 0) : `<p class="leer hell">${UI.akteLeer}</p>`}</section></div>`;
  ueber.onclick = (e) => { const t = e.target as HTMLElement; if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) ueber.innerHTML = ''; };
}

/* ---------- Haken ---------- */
function haken() {
  modus('haken');
  const sp = SP(stand.spur), letzte = sp.spur === 6;
  buehne.innerHTML = `<section class="haken"><div class="lampe"></div><img class="hr" src="${fig('raupe/staunt')}" alt=""><p>${sp.haken}</p></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('weiter', letzte ? UI.tresor : `${UI.weiterlesen} ›`)}</div>`;
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="weiter"]')) weiter(); };
}

/* ---------- Mondtresor: Ende eines Kapitels ---------- */
function tresor() {
  modus('zug');
  const k = KAP(stand.spur), gw = k.geheimwort, auf = stand.tresor.includes(k.nr), mehr = stand.spur < D.spuren.length, ganz = D.kapitel.length >= 4;
  const von = (k.nr - 1) * 6, meine = Object.keys(stand.verdacht).filter((x) => +x.slice(1) > von && +x.slice(1) <= von + 6).sort((a, b) => +a.slice(1) - +b.slice(1));
  const rueck = meine.map((x) => `<div class="zettel mein"><small>${UI.nach} Spur ${SP(+x.slice(1)).spur}</small>${stand.verdacht[x]}</div>`).join('');
  const zahl = (n: number, t: string) => `<div class="zahl"><b>${n}</b><span>${t}</span></div>`;
  buehne.innerHTML = `<section class="zug tresor${auf ? ' auf' : ''}"><div class="lampe"></div><div class="zk"><span class="tab hell">${UI.kapitel} ${k.nr}</span><h2>Mondtresor</h2></div><div class="safew"><img class="safe" src="${img(auf ? 'mondtresor_auf' : 'mondtresor_zu')}" alt=""></div>${auf ? `<p class="zt1 gross">${UI.tresorAuf}</p>` : `<p class="zt1">${gw.frage}</p>`}<div class="wort gross">${gw.wort.split('').map((c: string, i: number) => `<i class="da" style="animation-delay:${i * 90}ms">${c}</i>`).join('')}</div>${auf ? `<p class="zt1">${k.schluss}</p><div class="zahlen">${zahl(stand.marks.length, UI.deineSpuren)}${zahl(stand.zuege, UI.deineZuege)}${zahl(perlen(), UI.perlen)}</div>${rueck ? `<h3 class="rb">${UI.rueckblick}</h3><div class="fragen">${rueck}</div>` : ''}` : ''}</section>`;
  fuss.innerHTML = `<div class="fz">${!auf ? knopf('auf', UI.tresorKnopf) : mehr ? knopf('kap', `${UI.naechstesKapitel} ${k.nr + 1} ›`) : ganz ? knopf('diplom', `${UI.diplom} ›`) : `<p class="forts">${UI.fortsetzung}</p>${knopf('neu', UI.neuStart, 'still')}`}</div>`;
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'auf') { stand.tresor.push(k.nr); summ([30, 50, 80]); zeige(); }
    else if (a === 'kap') { stand.spur++; stand.i = 0; stand.blatt = 0; stand.view = 'kapitel'; zeige(); }
    else if (a === 'diplom') { stand.ziel = true; stand.view = 'finale'; zeige(); }
    else if (a === 'neu') neuStart();
  };
}

/* ---------- Ende des Buches: Diplom ---------- */
function finale() {
  modus('titel');
  const zahl = (n: number, t: string) => `<div class="zahl"><b>${n}</b><span>${t}</span></div>`;
  buehne.innerHTML = `<section class="finale"><div class="lampe"></div><b class="stempel gross">FALL GELÖST</b><figure class="foto"><img src="${img('finale_bild')}" alt=""></figure><div class="dipl"><img class="orden" src="${img('objekte/raupe_mit_orden')}" alt=""><p class="dt">${UI.meister}</p><input id="dname" type="text" maxlength="18" placeholder="${plain(D.ui.nameFrage)}" value="${esc(stand.name)}" autocomplete="off" autocapitalize="words"><p>${UI.hatGeloest}</p><p class="df">${T(D.fall.titel)}</p><p class="dl">${UI.lob}</p></div><div class="zahlen">${zahl(stand.marks.length, UI.deineSpuren)}${zahl(stand.zuege, UI.deineZuege)}${zahl(perlen(), UI.perlen)}</div></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('neu', UI.neuStart, 'still')}</div>`;
  $<HTMLInputElement>('#dname').oninput = (e) => { stand.name = (e.target as HTMLInputElement).value; speichern(); };
  fuss.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-a="neu"]')) neuStart(); };
}
function neuStart() {
  Object.assign(stand, structuredClone(START), { fs: stand.fs, silben: stand.silben });
  zeige();
}

/* ---------- Kopf-Knöpfe, Einstellungen ---------- */
$('#bNotiz').onclick = notizbuch;
$('#bAkte').onclick = akteOffen;
$('#bAa').onclick = () => {
  ueber.innerHTML = `<div class="schl"><section class="einst"><header><b>${UI.schrift}</b><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></header><div class="er"><button class="kn zwei" data-f="-2">A−</button><button class="kn zwei" data-f="2">A+</button></div><div class="er"><button class="kn zwei${stand.silben ? ' an' : ''}" data-si="1"><span>${UI.silben}: ${stand.silben ? 'an' : 'aus'}</span></button></div><div class="er">${knopf('neu', UI.neuStart, 'still')}</div></section></div>`;
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement, f = t.closest<HTMLElement>('[data-f]');
    if (f) { stand.fs = Math.max(18, Math.min(26, stand.fs + +f.dataset.f!)); zeige(); $('#bAa').click(); return; }
    if (t.closest('[data-si]')) { stand.silben = !stand.silben; zeige(); $('#bAa').click(); return; }
    if (t.closest('[data-a="neu"]')) { ueber.innerHTML = ''; neuStart(); return; }
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) ueber.innerHTML = '';
  };
};
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(() => { if (stand.view === 'spur' && steps(stand.spur)[stand.i].t === 'lesen' && !ueber.innerHTML && app.dataset.m === 'lesen') zeige(); }, 200); });
(window as any).__v7 = { stand, D, zeige, steps, plain };
if (stand.view !== 'titel') stand.view = 'titel'; // beim Öffnen immer der Titel, dann „Weiter ermitteln“
document.fonts.ready.then(zeige);
