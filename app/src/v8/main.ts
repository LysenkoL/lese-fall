/**
 * Lese-Fall · Vorschau „v8“: Kapitel 1–3 mit Rätseln nach dem Text, Ermittlungsbrett und Fallkarte.
 * Eigener Einstieg (v8.html), eigener Speicherstand (lesefall.v8). Alte App und v7 bleiben unverändert.
 */
import { tresorSvg } from './zeichnen.ts';
import './v8.css';
import './k3.css';
import './k4.css';
import DATA_ from '../../../04_data/buch1_v8.json';
import { T } from '../text';
import { bildUrl as img } from './bilder';
import { staub } from './staub';
import * as R from './raetsel';
import { zeigeFinale } from './finale.ts';

const D: any = structuredClone(DATA_);
/** Texte der Daten einmal in HTML mit Silben verwandeln (gleiche Schlüssel wie in build-v8.ts) */
const TEXT = new Set(['text', 'titel', 'haken', 'frage', 'aufloesung', 'warum', 'tipp', 'erfolg', 'unklarTipp', 'vorspann', 'ausblick', 'name', 'saetze', 'warum2', 'unter', 'sagt', 'klebt', 'frage2', 'suche', 'nass', 'frage1', 'tipp1', 'unklar', 'frageRaus', 'regel', 'plakatFertig', 'start', 'liste', 'zuViel', 'nochMehr', 'falsch', 'ok', 'fund', 'knapp', 'frueh', 'hilfe', 'wortText', 'nicht', 'nachsehen', 'absatz', 'demo', 'jetzt', 'bedeutung']);
function html(v: any, key = ''): any {
  if (typeof v === 'string') return TEXT.has(key) ? T(v) : v;
  if (Array.isArray(v)) return v.map((x) => html(x, key));
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = html(v[k], k); }
  return v;
}
for (const sp of D.spuren) { sp.titelH = T(sp.titel); sp.haken = T(sp.haken); sp.karte = html(sp.karte); sp.fragenNeu = html(sp.fragenNeu); sp.tipp = html(sp.tipp); sp.raetsel = html(sp.raetsel); }
for (const k of D.kapitel) { k.titelH = T(k.titel); k.vorspann = T(k.vorspann); k.ausblick = T(k.ausblick); k.fallkarte = html(k.fallkarte); if (k.finale) k.finale = html(k.finale); }
html(D.intro);
const UI: Record<string, string> = Object.fromEntries(Object.entries(D.ui).map(([k, v]) => [k, T(v as string)]));
/** freigestellte Figur: "raupe/denkt" → gen/frei/raupe_denkt */
const fig = (n: string) => (/^(raupe|mila|ben|oskar)\//.test(n) ? img('frei/' + n.replace('/', '_')) : img(n));
const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as E;
const summ = (ms: number | number[]) => { try { navigator.vibrate?.(ms); } catch { /* egal */ } };

/* ---------- Speicherstand (nur auf dem Gerät) ---------- */
interface Stand {
  view: 'titel' | 'intro' | 'kapitel' | 'spur' | 'fallkarte' | 'ausblick' | 'finale';
  weiter: 'intro' | 'kapitel' | 'spur' | 'fallkarte' | 'ausblick' | 'finale';
  spur: number; i: number; blatt: number;
  fertig: number[]; tipps: Record<number, string>; tippPerle: number; geklaert: string[]; mix: string[];
  intro: boolean; fs: number; silben: boolean;
  /** Finale: 0 Szene, 1 Code, 2 Tresor offen, 3 Urkunde; Name auf der Urkunde */
  fin: number; name: string;
}
const KEY = 'lesefall.v8';
const START: Stand = { view: 'titel', weiter: 'intro', spur: 1, i: 0, blatt: 0, fertig: [], tipps: {}, tippPerle: 0, geklaert: [], mix: [], intro: false, fs: 20, silben: true, fin: 0, name: '' };
const stand: Stand = (() => { try { const r = localStorage.getItem(KEY); if (r) return { ...structuredClone(START), ...JSON.parse(r) }; } catch { /* ohne Speichern weiter */ } return structuredClone(START); })();
const speichern = () => { try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch { /* egal */ } };

const SP = (n: number) => D.spuren[n - 1];
const kapOf = (n: number) => D.kapitel[SP(n).kap - 1];
const kap = () => kapOf(stand.spur);
/** letzte Spur ihres Kapitels? Dann folgt gleich die Fallkarte */
const letzteSpur = (n: number) => !D.spuren[n] || D.spuren[n].kap !== SP(n).kap;
const kapSpuren = (k: number): number[] => D.spuren.filter((s: any) => s.kap === k).map((s: any) => s.nr);
/** Buchstabe von Kapitel c ist verdient: Fallkarte gelöst (bei uns schon beim Ausblick) oder ein späteres Kapitel läuft */
const verdient = (c: number) => { const cur = SP(stand.spur).kap; return c < cur || (c === cur && (stand.weiter === 'ausblick' || stand.weiter === 'finale')); };
const perlen = () => stand.fertig.length * 2 + stand.tippPerle;
/** Schritte einer Spur: Lesen → [Tipp-Auflösung] → Rätsel → Brett → [Tipp-Frage] → Haken */
type Step = 'lesen' | 'tippAufl' | 'raetsel' | 'brett' | 'tippFrage' | 'haken';
function steps(n: number): Step[] {
  const out: Step[] = ['lesen'];
  if (n === 2 && SP(1).tipp) out.push('tippAufl');
  out.push('raetsel', 'brett');
  if (SP(n).tipp) out.push('tippFrage');
  if (!letzteSpur(n)) out.push('haken'); // nach der letzten Spur des Kapitels folgt gleich die Fallkarte
  return out;
}

/* ---------- Icons ---------- */
const IC = {
  akte: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 13h8M8 16.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lupe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M15 15l5.500 5.500" stroke="currentColor" stroke-width="2.800" stroke-linecap="round"/></svg>',
  vor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zur: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg>',
};

/* ---------- Gerüst ---------- */
const app = $('#app');
app.innerHTML = `<header class="kopf"><button class="kb brettb" id="bBrett" aria-label="Brett">${IC.akte}<span>Brett</span></button><div class="kt"><b id="kT1"></b><span id="kT2"></span></div><span class="mondp" id="kMond" aria-hidden="true"></span><span class="perl" id="kPerl"></span><button class="kb aa" id="bAa" aria-label="Schrift">Aa</button></header><main id="buehne"></main><footer id="fuss"></footer><div id="ueber"></div>`;
const buehne = $('#buehne'), fuss = $('#fuss'), ueber = $('#ueber');
const modus = (m: string) => { app.dataset.m = m; buehne.ontouchstart = buehne.ontouchend = null; /* Blättern per Wisch gilt nur beim Lesen */ };
/** Mond im Kopf: füllt sich mit jeder gelösten Spur, am Ende ist Vollmond */
function mondPhase(f: number): string {
  const R = 10, c = 12, rx = Math.abs(1 - 2 * f) * R;
  const licht = f >= 0.999 ? `<circle cx="${c}" cy="${c}" r="${R}" fill="#F6D35B"/>` : f <= 0.001 ? '' : `<path d="M${c} ${c - R}A${R} ${R} 0 0 1 ${c} ${c + R}A${rx.toFixed(2)} ${R} 0 0 ${f < 0.5 ? 0 : 1} ${c} ${c - R}Z" fill="#F6D35B"/>`;
  return `<svg viewBox="0 0 24 24" class="${f >= 0.999 ? 'voll' : ''}"><circle cx="${c}" cy="${c}" r="${R}" fill="#2A3157" stroke="#F6D35B" stroke-opacity=".45" stroke-width="1"/>${licht}</svg>`;
}
function kopf() {
  $('.kopf').hidden = stand.view !== 'spur';
  $('#kT1').textContent = `Spur ${SP(stand.spur).spur}`;
  $('#kT2').innerHTML = `${UI.kapitel} ${kap().nr} · ${kap().titelH}`;
  $('#kPerl').textContent = String(perlen());
  $('#kMond').innerHTML = mondPhase(Math.min(1, stand.fertig.length / D.spuren.length));
  document.documentElement.style.setProperty('--fs', stand.fs + 'px');
  document.documentElement.classList.toggle('ohne-silben', !stand.silben);
}
const raupe = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
const knopf = (a: string, t: string, kl = 'haupt', dis = false) => `<button class="kn ${kl}" data-a="${a}" ${dis ? 'disabled' : ''}>${t.startsWith('<svg') ? t : `<span>${t}</span>`}</button>`;
const nurKnopf = (a: string, html: string, f: () => void) => { fuss.innerHTML = `<div class="fz">${html}</div>`; fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };
const klick = (a: string, f: () => void) => { fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };

R.init({ UI, img, fig, fuss, summ, staub, mischen: (ids) => {
  if (stand.mix.length !== ids.length || !ids.every((x) => stand.mix.includes(x))) { stand.mix = [...ids].sort(() => Math.random() - 0.5); speichern(); }
  return stand.mix;
} });
let hookStaub: (() => void) | null = null;
/** Für Tests: löst das aktuelle Rätsel oder die aktuelle Wisch-Fläche sofort */
const loese = () => { (R.hook.loese ?? hookStaub)?.(); };

/* ---------- Ablauf ---------- */
function zeige() {
  ueber.innerHTML = ''; R.hook.loese = null; hookStaub = null; fuss.onclick = null; buehne.onclick = null;
  if (stand.view !== 'titel') stand.weiter = stand.view;
  kopf(); speichern();
  if (stand.view === 'titel') return titel();
  if (stand.view === 'intro') return intro();
  if (stand.view === 'kapitel') return kapitelKarte();
  if (stand.view === 'fallkarte') return fallkarte();
  if (stand.view === 'ausblick') return ausblick();
  if (stand.view === 'finale') return finale();
  const st = steps(stand.spur)[stand.i];
  if (st === 'lesen') return lesen();
  if (st === 'tippAufl') return tippAufl();
  if (st === 'raetsel') return raetsel();
  if (st === 'brett') return brett();
  if (st === 'tippFrage') return tippFrage();
  return haken();
}
function weiter() {
  const n = steps(stand.spur).length;
  stand.blatt = 0;
  if (stand.i + 1 < n) stand.i++;
  else if (letzteSpur(stand.spur)) stand.view = 'fallkarte';
  else { stand.spur++; stand.i = 0; }
  zeige();
}

/* ---------- Titel, Vorgeschichte, Kapitelkarte ---------- */
function titel() {
  modus('titel');
  const angefangen = stand.fertig.length > 0 || stand.i > 0 || stand.spur > 1 || stand.weiter === 'fallkarte' || stand.weiter === 'ausblick' || stand.weiter === 'finale';
  buehne.innerHTML = `<section class="titel"><div class="lampe"></div><p class="tl">LESE-FALL · FALL 1</p><h1>${T(D.fall.titel)}</h1><figure class="foto gross"><img src="${img('cover')}" alt=""></figure><p class="tu">Ein Krimi zum Selberlesen</p></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('start', angefangen ? UI.weiterFall : UI.start)}${angefangen ? knopf('neu', UI.neuStart, 'still') : ''}</div>`;
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'start') { stand.view = angefangen ? (['spur', 'kapitel', 'fallkarte', 'ausblick', 'finale'].includes(stand.weiter) ? stand.weiter : 'spur') : stand.intro ? 'kapitel' : 'intro'; zeige(); }
    else if (a === 'neu') neuStart();
  };
}
function intro() {
  modus('titel');
  let k = 0;
  const mal = () => {
    const s = D.intro[k], letzt = k === D.intro.length - 1;
    buehne.innerHTML = `<section class="intro"><div class="lampe"></div><div class="ib ${s.bild === 'tresor' ? 'tresor' : s.bild.includes('/') ? 'frei' : 'foto'}">${s.bild === 'tresor' ? `<img src="${img('tresor_zu')}" alt="">` : `<img src="${fig(s.bild)}" alt="">`}</div><p>${s.text}</p><div class="pkt hell">${D.intro.map((_: any, i: number) => `<i class="${i === k ? 'an' : ''}"></i>`).join('')}</div></section>`;
    fuss.innerHTML = `<div class="fz">${knopf('w', letzt ? UI.los : UI.weiter)}<button class="leise" data-a="skip" ${letzt ? 'style="visibility:hidden"' : ''}>${UI.ueberspringen}</button></div>`;
  };
  mal();
  fuss.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="skip"]')) k = D.intro.length;
    else if (!t.closest('[data-a="w"]')) return;
    if (++k < D.intro.length) return mal();
    stand.intro = true; stand.view = 'kapitel'; zeige();
  };
}
function kapitelKarte() {
  modus('titel');
  buehne.innerHTML = `<section class="kapk"><div class="lampe"></div><span class="tab hell">${UI.kapitel} ${kap().nr}</span><h1>${kap().titelH}</h1><img class="vig" src="${img(kap().bild)}" alt=""><p>${kap().vorspann}</p></section>`;
  nurKnopf('w', knopf('w', UI.los), () => { stand.view = 'spur'; zeige(); });
}

/* ---------- Lesen (ohne Markieren) ---------- */
const blockHtml = (b: any) => {
  if (b.roh) return b.roh;
  const s = b.s.map((x: string) => `<span class="satz">${T(x)}</span>`).join(' ');
  return b.typ === 'th' ? `<div class="ged"><img src="${fig('raupe/denkt')}" alt=""><p>${s}</p></div>` : `<p>${s}</p>`;
};
/**
 * Verteilt Blöcke auf Blätter ohne Rollen: so wenige Blätter wie möglich, dann möglichst gleich voll
 * (kleinste Summe der Quadrate des Leerraums). Ein <!-- Blatt --> im Text zieht den Umbruch an.
 */
function blaetter(blocks: any[], kopfHtml: string): { html: string; voll: number }[] {
  const probe = document.createElement('div');
  probe.className = 'blatt probe';
  buehne.appendChild(probe);
  const innen = document.createElement('div');
  probe.appendChild(innen);
  const cs = getComputedStyle(probe);
  const H = probe.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const messe = (h: string) => { innen.innerHTML = h; return innen.offsetHeight; };
  const teile: any[] = [];
  // Passt nicht einmal der erste Satz unter Titel und Bild (kleine Fläche, große Schrift), bekommt der Kopf ein eigenes Blatt.
  const b0 = blocks[0];
  if (b0 && messe(kopfHtml + blockHtml({ ...b0, s: b0.s.slice(0, 1) })) > H) { teile.push({ roh: kopfHtml, s: [] }); kopfHtml = ''; }
  blocks.forEach((b, bi) => {
    let kopf = bi === 0 ? kopfHtml : '';
    if (b.s.length < 2 || messe(kopf + blockHtml(b)) <= H) { teile.push(b); return; }
    let akt: string[] = [], erster = true;
    const ab = () => { teile.push({ ...b, s: akt, umbruch: erster && b.umbruch }); akt = []; erster = false; kopf = ''; };
    for (const x of b.s) { if (akt.length && messe(kopf + blockHtml({ ...b, s: [...akt, x] })) > H) ab(); akt.push(x); }
    ab();
  });
  blocks = teile;
  const hs = blocks.map((b) => blockHtml(b)), n = hs.length;
  const memo = new Map<string, number>();
  const hoehe = (i: number, j: number) => {
    const k = `${i}-${j}`;
    if (!memo.has(k)) { innen.innerHTML = (i === 0 ? kopfHtml : '') + hs.slice(i, j).join(''); memo.set(k, innen.offsetHeight); }
    return memo.get(k)!;
  };
  const passt = (i: number, j: number) => j - i === 1 || hoehe(i, j) <= H;
  let K = 0;
  for (let i = 0; i < n; K++) { let j = i + 1; while (j < n && passt(i, j + 1)) j++; i = j; }
  const INF = 1e18, kost: number[][] = [...Array(K + 1)].map(() => Array(n + 1).fill(INF)), von: number[][] = [...Array(K + 1)].map(() => Array(n + 1).fill(-1));
  kost[0][0] = 0;
  for (let k = 1; k <= K; k++) for (let j = 1; j <= n; j++) for (let i = j - 1; i >= 0 && passt(i, j); i--) {
    if (kost[k - 1][i] >= INF) continue;
    const leer = Math.max(0, H - hoehe(i, j)) / H;
    const c = kost[k - 1][i] + leer * leer * (k === 1 ? 2.5 : 1) - (i > 0 && blocks[i].umbruch ? 0.05 : 0);
    if (c < kost[k][j]) { kost[k][j] = c; von[k][j] = i; }
  }
  const out: { html: string; voll: number }[] = [];
  for (let k = K, j = n; k > 0; k--) { const i = von[k][j]; out.unshift({ html: (i === 0 ? kopfHtml : '') + hs.slice(i, j).join(''), voll: hoehe(i, j) / H }); j = i; }
  probe.remove();
  return out;
}
function lesen() {
  modus('lesen');
  const sp = SP(stand.spur);
  const kopfH = `<div class="skopf"><span class="tab">SPUR ${sp.spur}</span><h2>${sp.titelH}</h2></div><figure class="foto"><img src="${img(sp.bild)}" alt=""></figure>`;
  buehne.innerHTML = '';
  const seiten = blaetter(sp.blocks, kopfH);
  stand.blatt = Math.min(stand.blatt, seiten.length - 1);
  const zeig = () => {
    const s = seiten[stand.blatt], n = seiten.length, b = stand.blatt;
    buehne.innerHTML = `<div class="blatt${s.voll < 0.5 && b > 0 ? ' kurz' : ''}" data-art="lesen">${s.html}</div>`;
    fuss.innerHTML = `<div class="fl"><button class="rund" data-a="prev" ${b === 0 ? 'disabled' : ''} aria-label="Zurück">${IC.zur}</button><div class="pkt">${[...Array(n)].map((_, k) => `<i class="${k === b ? 'an' : k < b ? 'war' : ''}"></i>`).join('')}</div>${b < n - 1 ? `<button class="rund gold" data-a="next" aria-label="Weiter">${IC.vor}</button>` : `<button class="kn haupt zugk" data-a="weiter">${IC.lupe}<span>${UI.raetsel}</span></button>`}</div>`;
    speichern();
  };
  zeig();
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'prev') { stand.blatt--; zeig(); } else if (a === 'next') { stand.blatt++; zeig(); } else if (a === 'weiter') weiter();
  };
  wisch(buehne, () => stand.blatt < seiten.length - 1 && (stand.blatt++, zeig()), () => stand.blatt > 0 && (stand.blatt--, zeig()));
}
function wisch(el: HTMLElement, links: () => void, rechts: () => void) {
  let x0 = 0, y0 = 0;
  el.ontouchstart = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
  el.ontouchend = (e) => { const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) (dx < 0 ? links : rechts)(); };
}

/* ---------- Tipp-Frage (Spur 1) und Tipp-Auflösung (nach dem Lesen von Spur 2) ---------- */
function tippFrage() {
  modus('zug');
  const t = SP(stand.spur).tipp;
  buehne.innerHTML = `<section class="zug tipp"><div class="lampe"></div><img class="hr klein" src="${fig('raupe/denkt')}" alt=""><p class="zt1 gross">${t.frage}</p><div class="opts">${t.optionen.map((o: any) => `<button class="opt${stand.tipps[stand.spur] === o.id ? ' an' : ''}" data-o="${o.id}"><span>${o.text}</span></button>`).join('')}</div></section>`;
  const unten = () => nurKnopf('weiter', `<button class="kn haupt" data-a="weiter" ${stand.tipps[stand.spur] ? '' : 'disabled'}><span>${UI.weiter}</span></button>`, () => { if (stand.tipps[stand.spur]) weiter(); });
  unten();
  buehne.onclick = (e) => {
    const o = (e.target as HTMLElement).closest<HTMLElement>('.opt');
    if (!o) return;
    stand.tipps[stand.spur] = o.dataset.o!; speichern();
    buehne.querySelectorAll('.opt').forEach((x) => x.classList.toggle('an', x === o));
    unten();
  };
}
function tippAufl() {
  modus('haken');
  const t = SP(1).tipp, richtig = stand.tipps[1] === t.richtig;
  if (richtig && !stand.tippPerle) { stand.tippPerle = 1; speichern(); kopf(); }
  buehne.innerHTML = `<section class="haken aufl"><div class="lampe"></div><img class="hr" src="${fig('raupe/' + (richtig ? 'lob' : 'staunt'))}" alt=""><h2>${richtig ? UI.tippRichtig : UI.tippFalsch}</h2><p>${t.aufloesung}</p></section>`;
  nurKnopf('weiter', knopf('weiter', UI.weiter), weiter);
}

/* ---------- Rätsel ---------- */
const RAETSEL: Record<string, (r: HTMLElement, d: any, f: () => void) => void> = { buchstaben: R.buchstaben, unterschiede: R.unterschiede, versteckt: R.versteckt, merkmale: R.merkmale, reihe: R.reihe, ausschluss: R.ausschluss, sortieren: R.sortieren, umdrehen: R.umdrehen, klebstoff: R.klebstoff, lupe: R.lupe, schatten: R.schatten, kreise: R.kreise, agentencode: R.agentencode, plakat: R.plakat, suchbild: R.suchbild, spiegel: R.spiegel, astgabel: R.astgabel, faden: R.faden, nest: R.nest };
function raetsel() {
  modus('zug');
  const z = SP(stand.spur).raetsel;
  buehne.innerHTML = `<section class="zug" data-art="${z.art}"><div class="lampe"></div><div class="zk"><span class="tab hell">${UI.raetsel}</span><h2>${z.titel}</h2></div><p class="zt1">${z.text}</p><div class="zi"></div><div class="zr"></div></section>`;
  fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button></div>';
  const fertig = () => {
    if (!stand.fertig.includes(stand.spur)) { stand.fertig.push(stand.spur); kopf(); }
    speichern();
    nurKnopf('weiter', knopf('weiter', UI.weiter), weiter);
  };
  RAETSEL[z.art]($('.zug'), z, fertig);
}

/* ---------- Brett ---------- */
function bildKarte(k: any) {
  const a = k.ausschnitt;
  if (!a) return `<img src="${fig(k.bild)}" alt="">`;
  // Ausschnitt füllt den Rahmen (4:3) ganz: Breite des Ausschnitts = Breite des Rahmens, Mitte auf Mitte
  const S = 100 / a.w, Sy = (S * (4 / 3)) / 1.5;
  const lage = (c: number, sk: number) => (sk <= 1.001 ? 50 : Math.min(100, Math.max(0, (((c / 100) * sk - 0.5) / (sk - 1)) * 100)));
  return `<div class="ausschn voll" style="background-image:url(${fig(k.bild)});background-size:${S * 100}% auto;background-position:${lage(a.x + a.w / 2, S)}% ${lage(a.y + a.h / 2, Sy)}%"></div>`;
}
/** Spurenkarten (3×2), offene Fragen (2×2) und Code. `bis` = höchste gezeigte Spur; `neu` = Spur, deren Karte unter Staub liegt */
/** Code-Felder; Buchstaben erst, wenn die Fallkarte gelöst ist */
function codeFelder() {
  const felder: string[] = [...D.kapitel[0].code.wort].map(() => '');
  for (const k of D.kapitel) if (verdient(k.nr)) felder[k.code.pos] = k.code.buchstabe;
  return felder.map((c) => `<i>${c}</i>`).join('');
}
function tresorInfo(zurueck: () => void) {
  ueber.innerHTML = `<div class="schl mitte"><div class="kgross tresorinfo"><img class="tresor-bild" src="${img('tresor_zu')}" alt=""><h3>${UI.tresor}</h3><p>${UI.tresorInfo}</p><div class="wort">${codeFelder()}</div><button class="kn haupt" data-a="zu"><span>${UI.fertig}</span></button></div></div>`;
  ueber.onclick = (e) => { const t = e.target as HTMLElement; if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) zurueck(); };
}
function brettHtml(bis: number, neu = 0, staubig = false) {
  const liste = kapSpuren(SP(bis).kap);
  const slots = liste.map((n) => {
    if (n > bis || !stand.fertig.includes(n)) return `<div class="bkarte leer"></div>`;
    const k = SP(n).karte;
    return `<div class="bkarte${n === neu ? (staubig ? ' neu' : ' fall') : ''}" data-k="${n}"><div class="bk-bild">${bildKarte(k)}</div><p>${k.text}</p></div>`;
  }).join('');
  const fragen: { id: string; text: string; n: number }[] = [];
  for (const n of liste) if (n <= bis) SP(n).fragenNeu.forEach((f: any) => fragen.push({ ...f, n }));
  const weg = new Set<string>(SP(bis).fragenWeg);
  const zettel = fragen.filter((f) => !stand.geklaert.includes(f.id)).map((f) => `<div class="zettel fr${f.n === neu && staubig ? ' versteckt' : ''}${neu && weg.has(f.id) ? ' wackelt' : ''}" data-q="${f.id}"><span>${f.text}</span>${f.n === neu ? `<em class="neu">${UI.neu}</em>` : ''}${neu && weg.has(f.id) ? `<em class="klaer">${UI.klaerMich}</em>` : ''}</div>`).join('');
  const code = codeFelder();
  return `<div class="bgrid">${slots}</div><h3>${UI.fragen}</h3><div class="fragen">${zettel}</div><div class="codez" data-a="code" role="button" tabindex="0"><img class="tresor-mini" src="${img('tresor_zu')}" alt=""><span>${UI.code}</span><div class="wort">${code}</div></div>`;
}
function brett() {
  modus('brett');
  const nr = stand.spur, staubig = SP(nr).karte.staub === true;
  buehne.innerHTML = `<section class="brett"><div class="ak"><span class="tab hell">${UI.brett}</span><span class="plus"><span>+2 ${UI.perlen}</span></span></div>${staubig ? `<p class="wischz">${UI.wisch}</p>` : ''}${brettHtml(nr, nr, staubig)}</section>`;
  fuss.innerHTML = `<div class="fz"><button class="kn haupt" data-a="weiter" style="visibility:hidden" tabindex="-1"><span>${UI.weiter}</span></button></div>`;
  const sec = $('.brett');
  const karte = $<HTMLElement>('.bkarte.neu', sec);
  const fertigWischen = () => {
    hookStaub = null;
    sec.querySelector<HTMLElement>('.wischz')?.style.setProperty('display', 'none');
    sec.querySelectorAll('.zettel.versteckt').forEach((z) => z.classList.remove('versteckt'));
    sec.querySelectorAll('.zettel.fr:has(em.neu)').forEach((z) => z.classList.add('frisch'));
    fuss.innerHTML = `<div class="fz">${knopf('weiter', UI.weiter)}</div>`;
    klick('weiter', () => { SP(nr).fragenWeg.forEach((id: string) => { if (!stand.geklaert.includes(id)) stand.geklaert.push(id); }); speichern(); weiter(); });
    summ(25);
  };
  if (staubig) hookStaub = staub(karte, fertigWischen); else fertigWischen();
  sec.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const q = t.closest<HTMLElement>('.zettel.wackelt');
    if (q && !q.querySelector('.stempel')) {
      q.classList.remove('wackelt');
      q.insertAdjacentHTML('beforeend', `<b class="stempel klein2">${UI.geklaert}</b>`);
      summ(30);
      if (!stand.geklaert.includes(q.dataset.q!)) stand.geklaert.push(q.dataset.q!);
      speichern();
      setTimeout(() => q.classList.add('faellt'), 900);
      setTimeout(() => q.remove(), 1500);
      return;
    }
    if (t.closest('[data-a="code"]')) return tresorInfo(() => { ueber.innerHTML = ''; });
    const k = t.closest<HTMLElement>('.bkarte[data-k]');
    if (k && !k.classList.contains('neu')) karteGross(+k.dataset.k!);
  });
}
function karteGross(n: number) {
  const k = SP(n).karte;
  ueber.innerHTML = `<div class="schl mitte"><div class="kgross"><div class="bk-bild">${bildKarte(k)}</div><p>${k.text}</p></div></div>`;
  ueber.onclick = () => { ueber.innerHTML = ''; };
}
function brettOffen() {
  const liste = kapSpuren(SP(stand.spur).kap);
  const bis = Math.max(liste[0], ...stand.fertig.filter((n) => liste.includes(n)));
  ueber.innerHTML = `<div class="schl"><section class="brett ueberl"><div class="ak"><span class="tab hell">${UI.brett}</span><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></div>${brettHtml(bis)}</section></div>`;
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) { ueber.innerHTML = ''; return; }
    const k = t.closest<HTMLElement>('.bkarte[data-k]');
    if (t.closest('[data-a="code"]')) return tresorInfo(brettOffen);
    if (k) { ueber.onclick = null; karteGross(+k.dataset.k!); }
  };
}

/* ---------- Haken ---------- */
function haken() {
  modus('haken');
  const sp = SP(stand.spur);
  buehne.innerHTML = `<section class="haken"><div class="lampe"></div><img class="hr" src="${fig('raupe/staunt')}" alt=""><p>${sp.haken}</p></section>`;
  nurKnopf('weiter', knopf('weiter', letzteSpur(stand.spur) ? UI.weiter : `${UI.weiterlesen} ›`), weiter);
}

/* ---------- Fallkarte, Ausblick ---------- */
function fallkarte() {
  modus('zug');
  const f = kap().fallkarte, c = kap().code;
  buehne.innerHTML = `<section class="zug fall"><div class="lampe"></div><article class="fk"><span class="tab">${UI.kapitel} ${kap().nr}</span><h2>${f.titel}</h2><figure class="foto"><img src="${img(f.bild)}" alt=""></figure><ul>${f.saetze.map((s: string) => `<li>${s}</li>`).join('')}</ul><p class="fk-frage">${f.frage}</p></article><div class="codez hell" hidden><span>${UI.code}</span><div class="wort">${c.wort.split('').map((_: string, i: number) => `<i class="${i === c.pos ? 'fall' : ''}">${i === c.pos ? c.buchstabe : (D.kapitel.find((k: any) => k.code.pos === i && verdient(k.nr))?.code.buchstabe ?? '')}</i>`).join('')}</div></div></section>`;
  const sec = $('.fall'), fk = $('.fk', sec);
  const stempelt = () => {
    fk.classList.add('stempelziel');
    fk.insertAdjacentHTML('beforeend', `<b class="stempel abdruck">${f.stempel}</b>`);
    summ(40);
    const cz = $('.codez', sec);
    cz.hidden = false;
    cz.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1"><span>·</span></button></div>';
    setTimeout(() => {
      const feld = $('.wort i.fall', sec);
      hookStaub = staub(feld, () => { hookStaub = null; nurKnopf('weiter', knopf('weiter', UI.weiter), () => { stand.view = D.kapitel[kap().nr] ? 'ausblick' : 'finale'; stand.fin = 0; zeige(); }); });
    }, 700);
  };
  nurKnopf('stempeln', knopf('stempeln', UI.stempeln), stempelt);
}
function ausblick() {
  modus('haken');
  const k = kap(), nxt = D.kapitel[k.nr];
  buehne.innerHTML = `<section class="haken"><div class="lampe"></div><img class="hr" src="${fig('raupe/staunt')}" alt=""><p>${k.ausblick}</p>${nxt ? '' : `<p class="forts">${UI.fortsetzung}</p>`}</section>`;
  if (!nxt) return nurKnopf('neu', knopf('neu', UI.neuStart, 'still'), neuStart);
  nurKnopf('naechstes', knopf('naechstes', `${UI.naechstesKapitel} ${nxt.nr} ›`), () => {
    Object.assign(stand, { spur: kapSpuren(nxt.nr)[0], i: 0, blatt: 0, mix: [], view: 'kapitel' });
    zeige();
  });
}
/** Finale nach dem letzten Kapitel: Szene, Tresor, Urkunde (siehe finale.ts) */
function finale() {
  const letzt = D.kapitel[D.kapitel.length - 1];
  zeigeFinale({ buehne, fuss, UI, img, fig, summ, fin: letzt.finale, wort: D.kapitel[0].code.wort, stand, speichern, perlen, modus, neuStart, hook: R.hook, knopf });
}
/** Fragt erst nach: ein versehentlicher Tipp darf den Fall nicht löschen. */
function neuStart() {
  ueber.innerHTML = `<div class="schl"><section class="einst frage"><header><b>${UI.neuTitel}</b></header><p class="nf">${UI.neuFrage}</p><div class="er">${knopf('nein', UI.neuNein)}</div><div class="er">${knopf('ja', UI.neuJa, 'still')}</div></section></div>`;
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="ja"]')) { ueber.innerHTML = ''; Object.assign(stand, structuredClone(START), { fs: stand.fs, silben: stand.silben }); zeige(); }
    else if (t.closest('[data-a="nein"]') || t.classList.contains('schl')) ueber.innerHTML = '';
  };
}

/* ---------- Kopf-Knöpfe, Einstellungen ---------- */
$('#bBrett').onclick = brettOffen;
$('#bAa').onclick = () => {
  ueber.innerHTML = `<div class="schl"><section class="einst"><header><b>${UI.schrift}</b><button class="kb" data-a="zu" aria-label="Schließen">${IC.zu}</button></header><div class="er"><button class="kn zwei" data-f="-2">A−</button><button class="kn zwei" data-f="2">A+</button></div><div class="er"><button class="kn zwei${stand.silben ? ' an' : ''}" data-si="1"><span>${UI.silben}: ${stand.silben ? 'an' : 'aus'}</span></button></div><div class="er">${knopf('neu', UI.neuStart, 'still')}</div></section></div>`;
  ueber.onclick = (e) => {
    const t = e.target as HTMLElement, f = t.closest<HTMLElement>('[data-f]');
    if (f) { stand.fs = Math.max(18, Math.min(26, stand.fs + +f.dataset.f!)); kopf(); speichern(); return; }
    if (t.closest('[data-si]')) { stand.silben = !stand.silben; kopf(); speichern(); $('#bAa').click(); return; }
    if (t.closest('[data-a="neu"]')) { ueber.innerHTML = ''; neuStart(); return; }
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) { ueber.innerHTML = ''; if (app.dataset.m === 'lesen') zeige(); }
  };
};
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(() => { if (stand.view === 'spur' && steps(stand.spur)[stand.i] === 'lesen' && !ueber.innerHTML) zeige(); }, 200); });
(window as any).__v8 = { stand, D, loese, zeige, steps };
stand.view = 'titel'; // beim Öffnen immer der Titel, dann „Weiter ermitteln“
document.fonts.ready.then(zeige);
