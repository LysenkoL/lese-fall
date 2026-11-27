/**
 * Lese-Fall · Vorschau „v8“: Kapitel 1–3 mit Rätseln nach dem Text, Ermittlungsbrett und Fallkarte.
 * Eigener Einstieg (v8.html), eigener Speicherstand (lesefall.v8). Alte App und v7 bleiben unverändert.
 */
import { tresorSvg, werkzeugIcon, WERKZEUGE, type Werkzeug } from './zeichnen.ts';
import { werkzeugMoment, wzChip, wzName, belohnung, weniger } from './effekte.ts';
import './ui/tokens.css';
import './ui/basis.css';
import './ui/komponenten.css';
import './ansichten.css';
import './raetsel.css';
import './k3.css';
import './k4.css';
import './effekte.css';
import './ende.css';
import DATA_ from '../../../04_data/buch1_v8.json';
import { T as silbenHtml } from '../text';
/** Silben-HTML der v8 mit weichen Trennstellen zwischen den Silben (umgebrochen wird nur, wo CSS `hyphens: manual` erlaubt) */
const T = (t: string) => silbenHtml(t, true);
import { TEXT_SCHLUESSEL } from './textschluessel.ts';
import { bildUrl as img } from './bilder';
import { staub } from './staub';
import * as R from './raetsel';
import { SPIELE_WEG } from './raetsel_weg.ts';
import { SPIELE_LESEN } from './raetsel_lesen.ts';
import { zeigeFinale, urkundeHtml, urkundeMitStand } from './finale.ts';
import { zeigeHaus, neuHinweis, freiBei, raupeMitSache, konfetti, feuerwerk } from './haus.ts';
import { App } from '@capacitor/app';

const D: any = structuredClone(DATA_);
/** Texte der Daten einmal in HTML mit Silben verwandeln (gleiche Schlüssel wie in build-v8.ts) */
const TEXT = new Set(TEXT_SCHLUESSEL); // gleiche Liste wie in build-v8.ts (textschluessel.ts)
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
  view: 'titel' | 'intro' | 'kapitel' | 'spur' | 'fallkarte' | 'ausblick' | 'finale' | 'fertig' | 'album';
  weiter: 'intro' | 'kapitel' | 'spur' | 'fallkarte' | 'ausblick' | 'finale' | 'fertig' | 'album';
  spur: number; i: number; blatt: number;
  fertig: number[]; tipps: Record<number, string>; tippPerle: number;
  /** Spuren, in deren Bild das Kind die versteckte Schimmer-Perle gefunden hat (eine je Spur, 27.11.2026) */
  perlen: number[]; geklaert: string[]; mix: string[];
  intro: boolean; fs: number; silben: boolean;
  /** Finale (finale.ts, D-19): 0 Code, 1 Tresor offen mit Lupe, 2 Urkunde, 3 Epilog; Name und Titel (Detektiv/Detektivin) auf der Urkunde */
  fin: number; name: string; titel?: 'detektiv' | 'detektivin'; finV?: number;
  /** weitester erreichter Schritt (pos()); alles davor darf man vor- und zurückblättern */
  weit: number;
  /** Fall gelöst (Epilog erreicht): „Weiter“ führt ab jetzt zur Seite „Fall gelöst“ */
  geloest: boolean;
  /** Spur aus dem Fall-Album noch einmal: nur Lesen und Rätsel, danach zurück ins Album; Fortschritt bleibt */
  wieder: boolean;
  /** offenes Kapitel im Fall-Album */
  albumKap: number;
  /** Haus der Lese-Raupe: was sie trägt ('' = nichts), welche freien Sachen schon angekündigt sind */
  traegt: string; gesehen: string[] | null;
}
const KEY = 'lesefall.v8';
const START: Stand = { view: 'titel', weiter: 'intro', spur: 1, i: 0, blatt: 0, fertig: [], tipps: {}, tippPerle: 0, perlen: [], geklaert: [], mix: [], intro: false, fs: 20, silben: true, fin: 0, name: '', weit: 0, geloest: false, wieder: false, albumKap: 1, traegt: '', gesehen: null };
const stand: Stand = (() => { try { const r = localStorage.getItem(KEY); if (r) return { ...structuredClone(START), ...JSON.parse(r) }; } catch { /* ohne Speichern weiter */ } return structuredClone(START); })();
const speichern = () => { try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch { /* egal */ } };
urkundeMitStand(stand, speichern); // „Meine Urkunde“ liest und speichert Name und Titel direkt im Stand

const SP = (n: number) => D.spuren[n - 1];
const kapOf = (n: number) => D.kapitel[SP(n).kap - 1];
const kap = () => kapOf(stand.spur);
/** letzte Spur ihres Kapitels? Dann folgt gleich die Fallkarte */
const letzteSpur = (n: number) => !D.spuren[n] || D.spuren[n].kap !== SP(n).kap;
const kapSpuren = (k: number): number[] => D.spuren.filter((s: any) => s.kap === k).map((s: any) => s.nr);
/** Buchstabe von Kapitel c ist verdient: Fallkarte gelöst (bei uns schon beim Ausblick) oder ein späteres Kapitel läuft */
const verdient = (c: number) => { const cur = SP(stand.spur).kap; return c < cur || (c === cur && (stand.weiter === 'ausblick' || stand.weiter === 'finale')); };
/** Schimmer-Perlen: in jedem Spur-Bild ist eine versteckt; gezählt wird, was das Kind gefunden hat (höchstens 24) */
const perlen = () => stand.perlen.length;
const PERLEN_GESAMT = D.spuren.filter((sp: any) => sp.perle).length;
/** für die Urkunde: „19 von 24“ */
const perlenVon = () => `${perlen()} ${UI.vonWort} ${PERLEN_GESAMT}`;
// Alter Speicherstand: was schon frei ist, nicht nachträglich ankündigen
if (!stand.gesehen) { stand.gesehen = freiBei(perlen()); speichern(); }
/** Schritte einer Spur: Lesen → [Tipp-Auflösung] → Rätsel → Brett → [Tipp-Frage] → Haken; letzte Spur eines Kapitels mit Ausklang: … → Brett → Ausklang */
type Step = 'lesen' | 'tippAufl' | 'raetsel' | 'brett' | 'tippFrage' | 'haken' | 'ausklang';
function steps(n: number): Step[] {
  if (stand.wieder) return ['lesen', 'raetsel'];
  const out: Step[] = ['lesen'];
  if (n === 2 && SP(1).tipp) out.push('tippAufl');
  out.push('raetsel', 'brett');
  if (SP(n).tipp) out.push('tippFrage');
  if (!letzteSpur(n)) out.push('haken'); // nach der letzten Spur des Kapitels folgt gleich die Fallkarte
  else if (D.kapitel[SP(n).kap - 1].ausklang) out.push('ausklang'); // immer am Ende: alte Spielstände (stand.i) zeigen weiter auf denselben Schritt
  return out;
}
/** Schritte mit Leseblättern (beim Zurückblättern aufs letzte Blatt, beim Drehen des Geräts neu verteilen) */
const istLesen = (st: Step | undefined) => st === 'lesen' || st === 'ausklang';

/* ---------- Icons ---------- */
const IC = {
  akte: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 13h8M8 16.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lupe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.500" cy="10.500" r="6" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M15 15l5.500 5.500" stroke="currentColor" stroke-width="2.800" stroke-linecap="round"/></svg>',
  vor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zur: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  runter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg>',
};

/* ---------- Gerüst ---------- */
const app = $('#app');
// Kopf: vier gleich große runde Knöpfe mit Beschriftung darunter, spiegelgleich um den Titel in der Mitte.
// Außen die Werkzeuge (Brett, Schrift), innen der Fortschritt (Mond = so viel vom Fall gelöst, Perlen → Haus der Raupe).
app.innerHTML = `<header class="kopf"><div class="k-seite k-links"><button class="kk brettb" id="bBrett" aria-label="Brett">${IC.akte}<span class="kk-t">Brett</span></button><button class="kk mond" id="bMond" aria-label="Mond: so viel vom Fall ist gelöst"><span class="mondp" id="kMond" aria-hidden="true"></span><span class="kk-t">Mond</span></button></div><div class="kt"><b id="kT1"></b><span id="kT2"></span></div><div class="k-seite k-rechts"><button class="kk perl" id="kPerl" aria-label="Haus der Lese-Raupe"><b id="kPerlZ"></b><span class="kk-t">Perlen</span></button><button class="kk aa" id="bAa" aria-label="Schrift">Aa<span class="kk-t">Schrift</span></button></div><div class="kweg" aria-hidden="true"><i></i><img id="kWegR" alt=""></div></header><main id="buehne"></main><footer id="fuss"></footer><div id="ueber"></div>`;
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
  // Kärtchen am Kopf (Neu im Haus, Mond) gehören zum Kopf: ohne Kopf (Fallkarte, Finale, Album …) sofort weg
  if (stand.view !== 'spur') app.querySelectorAll('.neuhaus, .kblase').forEach((e) => e.remove());
  $('#kT1').textContent = `Spur ${SP(stand.spur).spur}`;
  $('#kT2').innerHTML = `${UI.kapitel} ${kap().nr}<span class="kt-titel"> · ${kap().titelH}</span>`;
  $('#kPerlZ').textContent = String(perlen());
  { const li = kapSpuren(kap().nr); const kw = $('.kweg'); kw.style.setProperty('--weg', (li.filter((n) => stand.fertig.includes(n)).length / li.length * 100) + '%'); kw.style.setProperty('--teile', String(li.length)); ($('#kWegR') as HTMLImageElement).src = fig('raupe/lacht'); }
  $('#kMond').innerHTML = mondPhase(Math.min(1, stand.fertig.length / D.spuren.length));
  document.documentElement.style.setProperty('--fs', stand.fs + 'px');
  document.documentElement.classList.toggle('ohne-silben', !stand.silben);
}
const raupe = (b: string, t: string, kl = '') => `<div class="rp ${kl}"><img src="${fig('raupe/' + b)}" alt=""><p>${t}</p></div>`;
/** lange Beschriftung (z. B. „Weiter zu Kapitel 2 ›“): etwas kleinere Schrift statt zweiter Zeile – der Knopf bleibt überall gleich hoch */
const lang = (t: string) => (t.replace(/<[^>]*>|&shy;|\u00ad|\|/g, '').length > 14 ? ' lang' : '');
const knopf = (a: string, t: string, kl = 'haupt', dis = false) => `<button class="kn ${kl}${lang(t)}" data-a="${a}" ${dis ? 'disabled' : ''}>${t.startsWith('<svg') ? t : `<span>${t}</span>`}</button>`;
const nurKnopf = (a: string, html: string, f: () => void) => { fuss.innerHTML = `<div class="fz">${html}</div>`; fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };
const klick = (a: string, f: () => void) => { fuss.onclick = (e) => { if ((e.target as HTMLElement).closest(`[data-a="${a}"]`)) f(); }; };

R.init({ UI, img, fig, fuss, summ, staub, mischen: (ids) => {
  if (stand.mix.length !== ids.length || !ids.every((x) => stand.mix.includes(x))) { stand.mix = [...ids].sort(() => Math.random() - 0.5); speichern(); }
  return stand.mix;
} });
let hookStaub: (() => void) | null = null;
/** Für Tests: löst das aktuelle Rätsel oder die aktuelle Wisch-Fläche sofort */
let momentWeg: (() => void) | null = null;
const loese = () => { momentWeg?.(); (R.hook.loese ?? hookStaub)?.(); };

/* ---------- Ablauf ---------- */
function zeige() { app.querySelectorAll('.neuhaus').forEach((e) => e.remove()); zeigeRaw(); wechsel(); if (stand.view !== 'titel') { stand.weit = Math.max(stand.weit, pos()); speichern(); } nav(); }
function zeigeRaw() {
  ueber.innerHTML = ''; R.hook.loese = null; hookStaub = null; fuss.onclick = null; buehne.onclick = null;
  momentWeg?.(); momentWeg = null; $('.wzm', buehne)?.remove();
  if (stand.view !== 'titel') stand.weiter = stand.view;
  kopf(); speichern();
  if (stand.view === 'titel') return titel();
  if (stand.view === 'intro') return intro();
  if (stand.view === 'kapitel') return kapitelKarte();
  if (stand.view === 'fallkarte') return fallkarte();
  if (stand.view === 'ausblick') return ausblick();
  if (stand.view === 'finale') return finale();
  if (stand.view === 'fertig') return fertigSeite();
  if (stand.view === 'album') return album();
  stand.i = Math.max(0, Math.min(stand.i, steps(stand.spur).length - 1)); // Spielstand aus einer Fassung mit mehr Schritten
  const st = steps(stand.spur)[stand.i];
  if (st === 'lesen') return lesen();
  if (st === 'tippAufl') return tippAufl();
  if (st === 'raetsel') return raetsel();
  if (st === 'brett') return brett();
  if (st === 'tippFrage') return tippFrage();
  if (st === 'ausklang') return lesen(ausklangVon(stand.spur));
  return haken();
}
/** sanftes Hineingleiten der neuen Ansicht (höchstens 300 ms, bei „weniger Bewegung“ aus) */
/** Hineingleiten der neuen Ansicht; Effekt-Ebenen (Konfetti, Feuerwerk, Pfeil „mehr unten“) zählen nicht als Ansicht */
function wechsel() { buehne.querySelector(':scope > :not(.konfetti, .feuerwerk, .mehr)')?.classList.add('ein2'); }
function weiter() {
  const n = steps(stand.spur).length;
  stand.blatt = 0;
  if (stand.i + 1 < n) stand.i++;
  else if (stand.wieder) { stand.wieder = false; stand.view = 'album'; }
  else if (letzteSpur(stand.spur)) stand.view = 'fallkarte';
  else { stand.spur++; stand.i = 0; }
  zeige();
}

/* ---------- Titel, Vorgeschichte, Kapitelkarte ---------- */
/** Nachthimmel: ein paar langsam funkelnde Sterne und ein Mond mit weichem Schein */
const himmel = () => `<div class="himmel" aria-hidden="true"><span class="mondg"></span>${[...Array(7)].map((_, i) => `<i class="st s${i + 1}"></i>`).join('')}</div>`;
function titel() {
  modus('titel');
  const angefangen = stand.fertig.length > 0 || stand.i > 0 || stand.spur > 1 || stand.weiter === 'fallkarte' || stand.weiter === 'ausblick' || stand.weiter === 'finale';
  buehne.innerHTML = `<section class="titel"><div class="lampe"></div>${himmel()}<p class="tl">SPUREN-RAUPE · FALL 1</p><h1>${T(D.fall.titel)}</h1><figure class="foto gross"><img src="${img('cover')}" alt=""></figure><p class="tu">Ein Krimi zum Selberlesen</p><img class="t-raupe" src="${fig('raupe/lacht')}" alt=""></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('start', stand.geloest ? UI.weiter : angefangen ? UI.weiterFall : UI.start)}${angefangen ? knopf('neu', UI.neuStart, 'still') : ''}</div>`;
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'start' && stand.geloest) { stand.wieder = false; stand.view = 'fertig'; zeige(); }
    else if (a === 'start') { stand.view = angefangen ? (['spur', 'kapitel', 'fallkarte', 'ausblick', 'finale'].includes(stand.weiter) ? stand.weiter : 'spur') : stand.intro ? 'kapitel' : 'intro'; zeige(); }
    else if (a === 'neu') neuStart();
  };
}
let introK = 0;
function intro() {
  modus('titel');
  introK = Math.min(Math.max(introK, 0), D.intro.length - 1);
  const mal = () => {
    const k = introK, s = D.intro[k], letzt = k === D.intro.length - 1;
    const bildH = s.werkzeuge ? `<div class="ib wzraster">${WERKZEUGE.map((w) => `<div class="wzr" data-w="${w}">${werkzeugIcon(w)}<b>${wzName(UI, w)}</b></div>`).join('')}</div>`
      : `<div class="ib ${s.bild === 'tresor' ? 'tresor' : s.bild.includes('/') ? 'frei' : 'foto'}">${s.bild === 'tresor' ? `<img src="${img('tresor_zu')}" alt="">` : `<img src="${fig(s.bild)}" alt="">`}</div>`;
    buehne.innerHTML = `<section class="intro"><div class="lampe"></div>${himmel()}${bildH}<p>${s.text}</p><div class="pkt hell">${D.intro.map((_: any, i: number) => `<i class="${i === k ? 'an' : ''}"></i>`).join('')}</div></section>`;
    fuss.innerHTML = `<div class="fz">${knopf('w', letzt ? UI.los : UI.weiter)}<button class="leise" data-a="skip" ${letzt ? 'style="visibility:hidden"' : ''}>${UI.ueberspringen}</button></div>`;
  };
  mal();
  fuss.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="skip"]')) introK = D.intro.length;
    else if (!t.closest('[data-a="w"]')) return;
    if (++introK < D.intro.length) { mal(); wechsel(); return nav(); }
    introK = 0; stand.intro = true; stand.view = 'kapitel'; zeige();
  };
}
function kapitelKarte() {
  modus('titel');
  buehne.innerHTML = `<section class="kapk"><div class="lampe"></div>${himmel()}<span class="tab hell">${UI.kapitel} ${kap().nr}</span><h1>${kap().titelH}</h1><img class="vig" src="${img(kap().bild)}" alt=""><p>${kap().vorspann}</p></section>`;
  nurKnopf('w', knopf('w', UI.los), () => { stand.view = 'spur'; zeige(); });
}

/* ---------- Lesen (ohne Markieren) ---------- */
const blockHtml = (b: any) => {
  if (b.roh) return b.roh;
  // <!-- Bild --> im Text: das Bild steht vor diesem Absatz (und wandert mit ihm aufs Blatt, nie allein ans Ende eines Blatts)
  const bild = b.bild ? `<figure class="foto im-text"><img src="${img(b.bild)}" alt="">${perleHtml(b.bild)}</figure>` : '';
  const s = b.s.map((x: string) => `<span class="satz">${T(x)}</span>`).join(' ');
  if (b.typ !== 'th') return `${bild}<p>${s}</p>`;
  // Gedanken der Raupe: vier Formen im Wechsel (Wolke mit Raupe links, rechts, Zettel, Wolke über der Raupe).
  // Pose: aus dem Text (<!-- Raupe: brrr --> → b.pose), sonst geraten nach dem Ton des Gedankens
  const roh = b.s.join(' '), v = (b.v ?? 0) % 4;
  const pose = b.pose ?? (/!/.test(roh) && !/\?/.test(roh) ? (v % 2 ? 'lacht' : 'staunt') : /\?/.test(roh) ? (/!/.test(roh) ? 'traurig' : 'denkt') : (v % 2 ? 'tipp' : 'lob'));
  return `${bild}<div class="ged g${v}"><img src="${fig('raupe/' + pose)}" alt=""><p>${s}</p></div>`;
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
  // 8 px Reserve: Rundungen und Schmuck der Denkblasen (Pünktchen unter der Blase) sollen das Blatt nie zum Rollen bringen
  const H = probe.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 8;
  const messe = (h: string) => { innen.innerHTML = h; return innen.offsetHeight; };
  const teile: any[] = [];
  // Passt nicht einmal der erste Satz unter Titel und Bild (kleine Fläche, große Schrift), bekommt der Kopf ein eigenes Blatt.
  const b0 = blocks[0];
  if (b0 && messe(kopfHtml + blockHtml({ ...b0, s: b0.s.slice(0, 1) })) > H) { teile.push({ roh: kopfHtml, s: [] }); kopfHtml = ''; }
  blocks.forEach((b, bi) => {
    let kopf = bi === 0 ? kopfHtml : '';
    if (b.s.length < 2 || messe(kopf + blockHtml(b)) <= H) { teile.push(b); return; }
    // langer Absatz: Satz für Satz auf Blätter verteilen; ein Bild davor gehört nur zum ersten Teil
    let akt: string[] = [], erster = true;
    const teil = () => (erster ? b : { ...b, bild: undefined, umbruch: false });
    const ab = () => { teile.push({ ...teil(), s: akt }); akt = []; erster = false; kopf = ''; };
    for (const x of b.s) { if (akt.length && messe(kopf + blockHtml({ ...teil(), s: [...akt, x] })) > H) ab(); akt.push(x); }
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
/** Versteckte Schimmer-Perle im Bild der laufenden Spur (nur einmal zu finden; Lage in % aus den Daten, `perle`) */
function perleHtml(bild: string) {
  const sp = SP(stand.spur), p = sp.perle;
  if (!p || sp.bild !== bild || stand.perlen.includes(sp.spur)) return '';
  return `<button class="sperle" type="button" style="left:${p.x}%;top:${p.y}%" aria-label="${ohneTags(UI.perlen)}"><i></i></button>`;
}
const ohneTags = (h: string) => h.replace(/<[^>]+>/g, '').replace(/\|/g, '');
/** Perle gefunden: sie fliegt zum Perlen-Knopf im Kopf; ist dadurch eine neue Sache im Haus frei, kurz zeigen */
function perleGefunden(pb: HTMLElement) {
  const n = stand.spur;
  if (stand.perlen.includes(n)) return;
  stand.perlen.push(n);
  speichern();
  summ([20, 40, 20]);
  const ziel = $('#kPerl'), a = pb.getBoundingClientRect(), z = ziel.getBoundingClientRect();
  const fl = document.createElement('i');
  fl.className = 'perle-flug';
  fl.style.left = `${a.left + a.width / 2}px`; fl.style.top = `${a.top + a.height / 2}px`;
  fl.style.setProperty('--dx', `${z.left + z.width / 2 - (a.left + a.width / 2)}px`);
  fl.style.setProperty('--dy', `${z.top + z.height / 2 - (a.top + a.height / 2)}px`);
  document.body.appendChild(fl);
  pb.remove();
  app.querySelector('.perl-tipp')?.remove();
  setTimeout(() => {
    fl.remove(); kopf();
    ziel.classList.remove('neu-da'); void ziel.offsetWidth; ziel.classList.add('neu-da');
    const neu = freiBei(perlen()).filter((id) => !stand.gesehen!.includes(id));
    if (neu.length) { stand.gesehen!.push(...neu); speichern(); neuHinweis(app, UI, neu[neu.length - 1], hausOeffnen); }
  }, 750);
}
/** Ausklang des Kapitels (kurze Schlussszene nach der letzten Spur, vor der Fallkarte) – oder null */
const ausklangVon = (n: number) => (letzteSpur(n) ? kapOf(n).ausklang ?? null : null);
/** Lesen: die Spur – oder `aus` = der Ausklang des Kapitels (gleiche Blätter, ohne Spur-Etikett) */
function lesen(aus: any = null) {
  modus('lesen');
  const sp = SP(stand.spur), q = aus ?? sp;
  const titelH = aus ? T(aus.titel) : sp.titelH;
  // Bild oben – außer der Text setzt es mit <!-- Bild --> an eine spätere Stelle (bildImText)
  const bildH = q.bild && !q.bildImText ? `<figure class="foto"><img src="${img(q.bild)}" alt="">${aus ? '' : perleHtml(q.bild)}</figure>` : '';
  const kopfH = `<div class="skopf${aus ? ' ausklang' : ''}">${aus ? '' : `<span class="tab etikett">SPUR ${sp.spur}</span>`}<h2>${titelH}</h2></div>${bildH}${!aus && !stand.perlen.length && sp.spur <= 3 && sp.perle ? `<p class="perl-tipp"><span class="perle"></span>${UI.perleTipp}</p>` : ''}`;
  buehne.innerHTML = '';
  { let n = sp.spur + (aus ? 1 : 0); for (const b of q.blocks) if (b.typ === 'th') b.v = n++; } // Form des Gedankens: fest je Spur und Reihenfolge
  const seiten = blaetter(q.blocks, kopfH);
  stand.blatt = Math.min(stand.blatt, seiten.length - 1);
  let richtung = '';
  const zeig = () => {
    const s = seiten[stand.blatt], n = seiten.length, b = stand.blatt;
    buehne.innerHTML = `<div class="blatt${s.voll < 0.5 && b > 0 ? ' kurz' : ''}" data-art="lesen" data-r="${richtung}">${s.html}</div>`;
    fuss.innerHTML = `<div class="fl"><button class="rund" data-a="prev" ${b === 0 && !hatVorher() ? 'disabled' : ''} aria-label="Zurück">${IC.zur}</button><div class="pkt${n > 12 ? ' sehr-dicht' : n > 5 ? ' dicht' : ''}" aria-label="Blatt ${b + 1} von ${n}">${[...Array(n)].map((_, k) => `<i class="${k === b ? 'an' : k < b ? 'war' : ''}"></i>`).join('')}</div>${b < n - 1 ? `<button class="rund gold" data-a="next" aria-label="Weiter">${IC.vor}</button>` : aus ? `<button class="kn haupt zugk" data-a="weiter"><span>${UI.weiter}</span></button>` : `<button class="kn haupt zugk" data-a="weiter">${IC.lupe}<span>${UI.raetsel}</span></button>`}</div>`;
    richtung = '';
    speichern();
  };
  zeig();
  buehne.onclick = (e) => { const pb = (e.target as HTMLElement).closest<HTMLElement>('.sperle'); if (pb) perleGefunden(pb); };
  fuss.onclick = (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
    if (a === 'prev') { if (stand.blatt === 0) return zurueckSchritt(); stand.blatt--; richtung = 'z'; zeig(); } else if (a === 'next') { stand.blatt++; richtung = 'v'; zeig(); } else if (a === 'weiter') weiter();
  };
  wisch(buehne, () => stand.blatt < seiten.length - 1 && (stand.blatt++, richtung = 'v', zeig()), () => stand.blatt > 0 && (stand.blatt--, richtung = 'z', zeig()));
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
  buehne.innerHTML = `<section class="haken aufl"><div class="lampe"></div><img class="hr" src="${fig('raupe/' + (richtig ? 'lob' : 'staunt'))}" alt=""><h2>${richtig ? UI.tippRichtig : UI.tippFalsch}</h2><p>${t.aufloesung}</p></section>`;
  nurKnopf('weiter', knopf('weiter', UI.weiter), weiter);
}

/* ---------- Rätsel ---------- */
const RAETSEL: Record<string, (r: HTMLElement, d: any, f: () => void) => void> = { buchstaben: R.buchstaben, unterschiede: R.unterschiede, versteckt: R.versteckt, merkmale: R.merkmale, reihe: R.reihe, ausschluss: R.ausschluss, sortieren: R.sortieren, umdrehen: R.umdrehen, klebstoff: R.klebstoff, lupe: R.lupe, schatten: R.schatten, kreise: R.kreise, agentencode: R.agentencode, plakat: R.plakat, suchbild: R.suchbild, spiegel: R.spiegel, astgabel: R.astgabel, wort: R.astgabel, faden: R.faden, nest: R.nest, ...SPIELE_WEG, ...SPIELE_LESEN };
function raetsel() {
  modus('zug');
  const z = SP(stand.spur).raetsel;
  const wz: Werkzeug | '' = (WERKZEUGE as string[]).includes(z.werkzeug) ? z.werkzeug : '';
  buehne.innerHTML = `<section class="zug" data-art="${z.art}"${wz ? ` data-wz="${wz}"` : ''}><div class="lampe"></div>${wz ? '<div class="wzfx" aria-hidden="true"></div>' : ''}<div class="zk"><div class="zkr"><span class="tab hell">${UI.raetsel}</span>${wz ? wzChip(UI, wz) : ''}</div><h2>${z.titel}</h2></div><p class="zt1">${z.text}</p><div class="zi"></div><div class="zr"></div></section>`;
  fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1" aria-hidden="true"><span>·</span></button></div>';
  const fertig = () => {
    if (!stand.fertig.includes(stand.spur)) {
      stand.fertig.push(stand.spur); kopf(); belohnung($('.zr .rp img', buehne) ?? $('.zr', buehne), $('#kMond'), null);
    }
    speichern();
    nurKnopf('weiter', knopf('weiter', stand.wieder ? UI.zumAlbum : UI.weiter), weiter);
  };
  RAETSEL[z.art]($('.zug'), z, fertig);
  if (wz) momentWeg = werkzeugMoment(buehne, wz, UI, fig('raupe/' + (wz === 'lesen' ? 'denkt' : wz === 'zeit' ? 'muede' : wz === 'lupe' ? 'tipp' : 'staunt')));
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
/**
 * Buchstaben-Beutel der Raupe: die Buchstaben für den Tresor liegen lose darin, in der Reihenfolge, in der das Kind sie bekommen hat
 * (je gelöstes Kapitel einer). Keine Felder, keine Plätze – das Wort legt das Kind erst im Finale selbst.
 */
const NEIGUNG_BS = [-7, 5, -3, 8, -5, 4];
const SACK = '<svg class="bt-sack" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="59" rx="20" ry="3.2" fill="#3A2408" opacity=".22"/><path d="M22 20 C10 28 7 44 12 52 C16 58 48 58 52 52 C57 44 54 28 42 20 Z" fill="#B97A3C" stroke="#7A4A1C" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 46 C24 52 40 52 49 46" stroke="#7A4A1C" stroke-width="1.6" fill="none" stroke-dasharray="3 3" opacity=".55"/><path d="M22 20 C20 14 24 10 26 12 C28 8 36 8 38 12 C40 10 44 14 42 20 Z" fill="#CF9150" stroke="#7A4A1C" stroke-width="2" stroke-linejoin="round"/><path d="M21 21 C27 24 37 24 43 21" stroke="#F4C243" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M43 21 C47 23 48 28 46 31 M43 21 C49 21 51 25 51 28" stroke="#F4C243" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="46" cy="31.5" r="2.2" fill="#F4C243"/><circle cx="51" cy="28.5" r="2.2" fill="#F4C243"/><path d="M24 45 C24 35 32 30 41 31 C41 40 33 46 24 45 Z" fill="#8CC152" stroke="#4E8A2A" stroke-width="1.5" stroke-linejoin="round"/><path d="M25.5 44 C30 39 34.5 35 39.5 32.5" stroke="#4E8A2A" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M17 30 C15 36 15 42 17 46" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".25"/></svg>';
/** verdiente Buchstaben in der Reihenfolge der Kapitel (so, wie das Kind sie bekommen hat) */
const beutelBuchst = (): string[] => D.kapitel.filter((k: any) => verdient(k.nr)).map((k: any) => k.code.buchstabe);
const bsKachel = (c: string, i: number, kl = '') => `<i class="bt-k${kl}" style="--r:${NEIGUNG_BS[i % NEIGUNG_BS.length]}deg">${c}</i>`;
function beutelHtml(buchst: string[], kl = '', knopf = true) {
  return `<div class="beutel${kl}"${knopf ? ' data-a="code" role="button" tabindex="0"' : ''}>${SACK}<div class="bt-in"><span class="bt-t">${UI.beutel ?? UI.code}</span><div class="bt-reihe">${buchst.map((c, i) => bsKachel(c, i)).join('')}</div></div></div>`;
}
function tresorInfo(zurueck: () => void) {
  ueber.innerHTML = `<div class="schl mitte"><div class="kgross tresorinfo"><img class="tresor-bild" src="${img('tresor_zu')}" alt=""><h3>${UI.tresor}</h3><p>${UI.tresorInfo}</p>${beutelHtml(beutelBuchst(), ' hell', false)}<button class="kn haupt" data-a="zu"><span>${UI.fertig}</span></button></div></div>`;
  ueber.onclick = (e) => { const t = e.target as HTMLElement; if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) zurueck(); };
}
const NEIGUNG = [-1.6, 1.1, -0.6, 1.8, -1.2, 0.7, -1.9, 1.4];
function brettHtml(bis: number, neu = 0, staubig = false, wartet = false) {
  const liste = kapSpuren(SP(bis).kap);
  const slots = liste.map((n) => {
    if (n > bis || !stand.fertig.includes(n)) return `<div class="bkarte leer"></div>`;
    const k = SP(n).karte;
    return `<div class="bkarte${n === neu ? (staubig ? ' neu' : wartet ? ' wartet' : ' fall') : ''}" data-k="${n}" role="button" tabindex="0" style="--n:${NEIGUNG[(n * 5 + 2) % NEIGUNG.length]}deg"><div class="bk-bild">${bildKarte(k)}</div><p>${k.titel ?? k.text}</p></div>`;
  }).join('');
  const fragen: { id: string; text: string; antwort?: string; n: number }[] = [];
  for (const sp of D.spuren) if (sp.spur <= bis) sp.fragenNeu.forEach((f: any) => fragen.push({ ...f, n: sp.spur }));
  const weg = new Set<string>(SP(bis).fragenWeg);
  const wegBei: Record<string, number> = {};
  for (const sp of D.spuren) (sp.fragenWeg ?? []).forEach((id: string) => { wegBei[id] = sp.spur; });
  const zettel = fragen.filter((f) => !stand.geklaert.includes(f.id) && !(wegBei[f.id] < bis)).map((f) => {
    const ok = !!neu && weg.has(f.id);
    // Rückseite: kleines Bild der Karte, die die Frage beantwortet, und die Antwort – sichtbar erst nach dem Umdrehen
    const rueck = ok ? `<div class="fr-rueck"><div class="fr-bild">${bildKarte(SP(bis).karte)}</div><b>${f.antwort ?? ''}</b></div>` : '';
    return `<div class="zettel fr ${farbe(f.id)}${f.n === neu && (staubig || wartet) ? ' versteckt' : ''}${ok ? ' zeig' : ''}" ${ok ? 'data-ok="1" role="button" tabindex="0" ' : ''}data-q="${f.id}" style="--n:${NEIGUNG[(f.id.length * 3 + f.n) % NEIGUNG.length] * 0.8}deg"><div class="fr-vorn"><span>${f.text}</span>${f.n === neu ? `<em class="neu">${UI.neu}</em>` : ''}${ok ? `<em class="klaer">${UI.klaerMich}</em>` : ''}</div>${rueck}</div>`;
  }).join('');
  return `<div class="bgrid">${slots}</div><h3>${UI.fragen}<img class="brett-raupe" src="${fig('raupe/denkt')}" alt=""></h3><div class="fragen">${zettel}</div><div class="bt-zeile">${beutelHtml(beutelBuchst())}${kisteHtml()}</div>`;
}
/** alle Fragen des Buchs mit Antwort, in der Reihenfolge, in der sie auftauchen */
const ALLE_FRAGEN: { id: string; text: string; antwort?: string }[] = D.spuren.flatMap((sp: any) => sp.fragenNeu);
/** feste Farbe je Frage (gelb, grün, rosa), unabhängig vom Platz am Brett – der Zettel wechselt nie die Farbe */
const farbe = (id: string) => `fc${Math.max(0, ALLE_FRAGEN.findIndex((f) => f.id === id)) % 3}`;
const geklaertListe = () => ALLE_FRAGEN.filter((f) => stand.geklaert.includes(f.id));
const KISTE = '<svg class="ki-svg" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="58" rx="22" ry="3.2" fill="#2A1A06" opacity=".25"/><path d="M10 26 L54 26 L50 55 L14 55 Z" fill="#C98A4B" stroke="#7A4A1C" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 36 L52 36 M13 46 L51 46" stroke="#7A4A1C" stroke-width="1.6" opacity=".5"/><path d="M8 20 L56 20 L54 27 L10 27 Z" fill="#DDA262" stroke="#7A4A1C" stroke-width="2.2" stroke-linejoin="round"/><rect x="18" y="8" width="13" height="15" rx="1.5" fill="#FFF3A6" stroke="#B9971C" stroke-width="1.4" transform="rotate(-10 24 15)"/><rect x="32" y="9" width="13" height="14" rx="1.5" fill="#D9F2B4" stroke="#6E9A3C" stroke-width="1.4" transform="rotate(8 38 16)"/><path d="M26 39 l4 4 l8 -9" stroke="#3E8E3A" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/** Kiste „Geklärt“ neben dem Beutel: Zähler (geklärt / alle), antippen zeigt alle geklärten Fragen mit Antwort */
function kisteHtml() {
  return `<button class="kiste" data-a="kiste" aria-label="${UI.kisteTitel.replace(/<[^>]+>/g, '').replace(/\|/g, '')}">${KISTE}<span class="ki-t">${UI.kiste}</span><b class="ki-z">${geklaertListe().length}<small>/${ALLE_FRAGEN.length}</small></b></button>`;
}
function kisteOffen(zurueck: () => void) {
  const liste = geklaertListe();
  const inhalt = liste.length
    ? `<ul class="ki-liste">${liste.map((f, i) => `<li class="zettel fr ${farbe(f.id)}" style="--n:${NEIGUNG[i % NEIGUNG.length] * 0.6}deg"><span>${f.text}</span><b class="ki-a">${f.antwort ?? ''}</b></li>`).join('')}</ul>`
    : `<p>${UI.kisteLeer}</p>`;
  ueber.innerHTML = `<div class="schl mitte"><div class="kgross kisteinfo">${KISTE}<h3>${UI.kisteTitel}</h3>${inhalt}<button class="kn haupt" data-a="zu"><span>${UI.fertig}</span></button></div></div>`;
  ueber.onclick = (e) => { const t = e.target as HTMLElement; if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) zurueck(); };
}
/** Karten und Beutel sind auch mit der Tastatur erreichbar: Eingabe oder Leertaste wirkt wie ein Tipp */
function tastenKlick(root: HTMLElement) {
  root.addEventListener('keydown', (e) => {
    const z = (e.target as HTMLElement).closest<HTMLElement>('.bkarte[data-k], .beutel[data-a]');
    if (z && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); z.click(); }
  });
}
/**
 * Neue Frage – wie „Neuer Fund!“: groß über dem Brett die nachdenkliche Raupe und der Zettel; das Kind tippt ihn an,
 * dann fliegt er an seinen Platz bei den offenen Fragen. Kein Zeitablauf: das Kind bestimmt das Tempo.
 */
function frageZeigen(sec: HTMLElement, q: HTMLElement, fertig: () => void) {
  sec.insertAdjacentHTML('beforeend', `<div class="fundov frageov"><p class="fund-t">${UI.neueFrage}</p><img class="fr-raupe" src="${fig('raupe/denkt')}" alt=""><button class="zettel fr fundz ${farbe(q.dataset.q!)}">${q.querySelector('.fr-vorn span')?.outerHTML ?? ''}</button><p class="fund-h">${UI.frageTipp}</p></div>`);
  const ov = sec.querySelector<HTMLElement>('.frageov:last-of-type')!, z = ov.querySelector<HTMLElement>('.fundz')!;
  summ(15);
  let weg = false;
  const haengen = () => {
    if (weg) return; weg = true;
    // FLIP: der Zettel am Brett startet genau dort, wo der große Zettel liegt, und gleitet weich an seinen Platz
    const v = z.getBoundingClientRect();
    q.classList.remove('versteckt');
    const ziel = q.getBoundingClientRect(), k = v.width / ziel.width;
    Object.assign(q.style, { transition: 'none', transformOrigin: 'top left', zIndex: '7', transform: `translate(${v.left - ziel.left}px, ${v.top - ziel.top}px) scale(${k})` });
    z.style.visibility = 'hidden';
    ov.classList.add('fliegt');
    void q.offsetWidth;
    q.style.transition = 'transform .65s cubic-bezier(.25, .9, .35, 1)';
    q.style.transform = '';
    setTimeout(() => { ov.remove(); Object.assign(q.style, { transition: '', transformOrigin: '', zIndex: '' }); if (sec.isConnected) fertig(); }, 700);
  };
  ov.addEventListener('click', (e) => { e.stopPropagation(); haengen(); });
  return haengen;
}
/** Neue Sache im Haus der Lese-Raupe (beim Lösen gemerkt): kurz zeigen auf dem Haken-Bildschirm nach dem Brett
 *  (oder, wenn die Spur keinen hat, auf dem fertigen Brett). Jeder Wechsel des Bildschirms nimmt den Hinweis weg (zeige()). */
let neuWartet: string | null = null;
function zeigNeuImHaus() {
  const id = neuWartet; neuWartet = null;
  const hier = `${stand.view}:${stand.spur}:${stand.i}`; // nur auf genau diesem Bildschirm zeigen, nicht auf dem nächsten
  if (id) setTimeout(() => { if (`${stand.view}:${stand.spur}:${stand.i}` === hier) neuHinweis(app, UI, id, hausOeffnen); }, 600);
}
function brett() {
  modus('brett');
  const nr = stand.spur, staubig = SP(nr).karte.staub === true;
  buehne.innerHTML = `<section class="brett"><div class="ak"><span class="tab hell">${UI.brett}</span></div>${staubig ? `<p class="wischz">${wzChip(UI, 'fuehler', 'klein')} ${UI.wisch}</p>` : ''}${brettHtml(nr, nr, staubig, !staubig)}</section>`;
  fuss.innerHTML = `<div class="fz"><button class="kn haupt" data-a="weiter" style="visibility:hidden" tabindex="-1"><span>${UI.weiter}</span></button></div>`;
  const sec = $('.brett');
  const karte = $<HTMLElement>('.bkarte.neu', sec);
  const fertigWischen = () => {
    hookStaub = null;
    // Staubkarte ist jetzt eine ganz normale Karte (gleiche Nadel, lässt sich vergrößern). Kurz warten: der Finger, der eben gewischt hat,
    // löst beim Loslassen noch einen Klick aus – der soll die Karte nicht gleich groß machen.
    if (karte) setTimeout(() => karte.classList.remove('neu'), 450);
    sec.querySelector<HTMLElement>('.wischz')?.style.setProperty('display', 'none');
    const zeigWeiter = () => {
      fuss.innerHTML = `<div class="fz">${knopf('weiter', UI.weiter)}</div>`;
      if (!steps(nr).includes('haken')) zeigNeuImHaus(); // ohne Haken-Bildschirm danach (letzte Spur): hier auf dem fertigen Brett
      klick('weiter', () => { SP(nr).fragenWeg.forEach((id: string) => { if (!stand.geklaert.includes(id)) stand.geklaert.push(id); }); speichern(); weiter(); });
    };
    summ(25);
    // 1) Neue Fragen stellt die Raupe selbst: Denkwolke mit der Frage, dann fliegt der Zettel aus der Wolke an seinen Platz
    const neue = [...sec.querySelectorAll<HTMLElement>('.zettel.versteckt')];
    // 2) Beantwortete Fragen wackeln; das Kind tippt sie an: Zettel dreht sich um (Antwort + Bild), Stempel, fliegt in die Kiste
    const offen = () => [...sec.querySelectorAll<HTMLElement>('.zettel[data-ok]')].filter((z) => !z.classList.contains('um'));
    const klaere = (q: HTMLElement) => {
      if (q.classList.contains('um')) return;
      q.classList.add('um');
      q.classList.remove('zeig');
      summ(30);
      if (!stand.geklaert.includes(q.dataset.q!)) stand.geklaert.push(q.dataset.q!);
      speichern();
      setTimeout(() => sec.isConnected && q.insertAdjacentHTML('beforeend', `<b class="stempel klein2">${UI.geklaert}</b>`), 450);
      // Antwort lesen lassen, dann in die Kiste; „Weiter“ erst, wenn der letzte Zettel in der Kiste liegt
      setTimeout(() => { if (sec.isConnected) inKiste(q, !offen().length); }, 2200);
      if (!offen().length) hookStaub = null;
    };
    const inKiste = (q: HTMLElement, letzter: boolean) => {
      const ki = sec.querySelector<HTMLElement>('.kiste');
      const danach = () => { if (letzter && sec.isConnected) zeigWeiter(); };
      if (!ki) { q.remove(); return danach(); }
      const z = ki.getBoundingClientRect(), v = q.getBoundingClientRect();
      q.classList.add('fliegt');
      q.style.transform = `translate(${z.left + z.width / 2 - (v.left + v.width / 2)}px, ${z.top + z.height / 2 - (v.top + v.height / 2)}px) scale(.15) rotate(20deg)`;
      setTimeout(() => {
        q.remove();
        ki.outerHTML = kisteHtml();
        sec.querySelector('.kiste')?.classList.add('wackelt');
        summ(20);
        danach();
      }, 650);
    };
    // solange das Kind noch etwas antippen soll: statt eines grauen Knopfs ein Hinweis, was zu tun ist
    const tippHinweis = () => { fuss.innerHTML = `<div class="fz"><p class="fuss-tipp">${UI.klaerTipp}</p></div>`; fuss.onclick = null; };
    const klaerenStarten = () => {
      if (!offen().length) return zeigWeiter();
      tippHinweis();
      offen()[0]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      hookStaub = () => offen().forEach(klaere);
    };
    sec.addEventListener('click', (e) => { const q = (e.target as HTMLElement).closest<HTMLElement>('.zettel[data-ok]'); if (q) klaere(q); });
    sec.addEventListener('keydown', (e) => { const q = (e.target as HTMLElement).closest<HTMLElement>('.zettel[data-ok]'); if (q && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); klaere(q); } });
    if (!neue.length) return klaerenStarten();
    // erst alle neuen Fragen (nacheinander, das Kind tippt jede an), dann die geklärten
    let n = 0;
    const naechste = () => {
      if (!sec.isConnected) return;
      const q = neue[n++];
      if (!q) { hookStaub = null; return klaerenStarten(); }
      fuss.innerHTML = ''; fuss.onclick = null;
      hookStaub = frageZeigen(sec, q, naechste);
    };
    naechste();
  };
  // Spur noch nicht gelöst (alter oder kaputter Spielstand): keine neue Karte zum Anheften – das Brett trotzdem zeigen
  if (!sec.querySelector('.bkarte.neu, .bkarte.wartet')) fertigWischen();
  else if (staubig) hookStaub = staub(karte, fertigWischen);
  else {
    // Neuer Fund: das Kind hängt die Karte selbst ans Brett
    const ziel = $<HTMLElement>('.bkarte.wartet', sec);
    sec.insertAdjacentHTML('beforeend', `<div class="fundov"><p class="fund-t">${UI.neuerFund}</p><button class="bkarte fundk">${ziel.innerHTML}</button><p class="fund-text">${SP(+ziel.dataset.k!).karte.text}</p><p class="fund-h">${UI.fundTipp}</p></div>`);
    const ov = $<HTMLElement>('.fundov', sec), fk = $<HTMLElement>('.fundk', ov);
    let weg = false;
    const haengen = () => {
      if (weg) return; weg = true; hookStaub = null;
      const z = ziel.getBoundingClientRect(), v = fk.getBoundingClientRect();
      ov.classList.add('fliegt');
      fk.style.transform = `translate(${z.left - v.left}px, ${z.top - v.top}px) scale(${z.width / v.width})`;
      setTimeout(() => { ov.remove(); ziel.classList.remove('wartet'); ziel.classList.add('gepinnt'); if (sec.isConnected) fertigWischen(); }, 560);
    };
    hookStaub = haengen;
    ov.addEventListener('click', (e) => { e.stopPropagation(); haengen(); });
  }
  sec.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="code"]')) return tresorInfo(() => { ueber.innerHTML = ''; });
    if (t.closest('[data-a="kiste"]')) return kisteOffen(() => { ueber.innerHTML = ''; ueber.onclick = null; });
    // jede Karte am Brett lässt sich vergrößern – nur nicht, solange sie noch unter Staub liegt oder auf das Anheften wartet
    const k = t.closest<HTMLElement>('.bkarte[data-k]');
    if (k && !k.matches('.neu, .staubig, .wartet')) karteGross(+k.dataset.k!);
  });
}
/** Karte groß (gleiche Nadel wie am Brett); Tippen schließt. `zurueck`: wohin danach (z. B. wieder das Brett aus dem Kopf) */
function karteGross(n: number, zurueck?: () => void) {
  const k = SP(n).karte;
  ueber.innerHTML = `<div class="schl mitte"><div class="kgross karte" role="dialog" aria-modal="true"><div class="bk-bild">${bildKarte(k)}</div>${k.titel ? `<h3>${k.titel}</h3>` : ''}<p>${k.text}</p></div></div>`;
  ueber.onclick = () => { ueber.innerHTML = ''; zurueck?.(); };
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
    if (t.closest('[data-a="kiste"]')) return kisteOffen(brettOffen);
    if (k) { ueber.onclick = null; karteGross(+k.dataset.k!, brettOffen); } // nach dem Schließen wieder das Brett
  };
}

/* ---------- Haken ---------- */
function haken() {
  modus('haken');
  const sp = SP(stand.spur);
  buehne.innerHTML = `<section class="haken"><div class="lampe"></div><img class="hr" src="${fig('raupe/staunt')}" alt=""><p>${sp.haken}</p></section>`;
  nurKnopf('weiter', knopf('weiter', letzteSpur(stand.spur) ? UI.weiter : `${UI.weiterlesen} ›`), weiter);
  zeigNeuImHaus(); // ruhiger Bildschirm mit viel Platz: hier kommt „Neu im Haus der Lese-Raupe“
}

/* ---------- Fallkarte, Ausblick ---------- */
function fallkarte() {
  modus('zug');
  const f = kap().fallkarte, c = kap().code;
  // Buchstabe dieses Kapitels: liegt erst unter Staub, dann springt er in den Beutel zu den anderen (ohne Plätze im Wort)
  const frueher = D.kapitel.filter((k: any) => k.nr < kap().nr).map((k: any) => k.code.buchstabe);
  const codeHtml = `<div class="bt-ausgabe" hidden><div class="bt-neu">${bsKachel(c.buchstabe, frueher.length, ' gross')}</div>${beutelHtml(frueher, ' hell', false)}</div>`;
  // D-19: In Kapitel 4 erzählt die Raupe den Fall und flunkert zweimal (Flunker-Finder) – statt die Fallkarte nur zu lesen
  if (f.flunker) {
    buehne.innerHTML = `<section class="zug fall" data-art="flunker"><div class="lampe"></div><div class="zk"><div class="zkr"><span class="tab hell">${UI.kapitel} ${kap().nr}</span></div><h2>${f.titel}</h2></div><p class="zt1">${f.flunker.text}</p><div class="zi"></div><div class="zr"></div>${codeHtml}</section>`;
    const sec = $('.fall');
    SPIELE_LESEN.flunker(sec, f.flunker, () => nurKnopf('stempeln', knopf('stempeln', UI.stempeln), () => stempeltAuf(sec, $('.flk-blatt', sec), f)));
    return;
  }
  buehne.innerHTML = `<section class="zug fall"><div class="lampe"></div><article class="fk"><span class="tab">${UI.kapitel} ${kap().nr}</span><h2>${f.titel}</h2><figure class="foto"><img src="${img(f.bild)}" alt=""></figure><ul>${f.saetze.map((s: string) => `<li>${s}</li>`).join('')}</ul><p class="fk-frage">${f.frage}</p></article>${codeHtml}</section>`;
  const sec = $('.fall'), fk = $('.fk', sec);
  nurKnopf('stempeln', knopf('stempeln', UI.stempeln), () => stempeltAuf(sec, fk, f));
}
/** Kapitel 4 (Bericht der Raupe): Stempel auf die Höhe der Überschrift; rechts daneben, wenn dort Platz ist, sonst quer darüber */
function stempelNebenKopf(blatt: HTMLElement, st: HTMLElement) {
  const kopf = blatt.querySelector(':scope > .flk-kopf');
  if (!kopf) return;
  const r = document.createRange();
  r.selectNodeContents(kopf);
  const T = r.getBoundingClientRect(), B = blatt.getBoundingClientRect();
  st.style.top = `${T.top - B.top + T.height / 2 - 6}px`; // etwas höher: oben ist Rand frei, unten beginnt der erste Satz
  st.classList.add('kl'); // daneben etwas kleiner, damit die schräge Ecke nicht in den ersten Satz ragt
  if (B.right - T.right - 28 < st.offsetWidth) return st.classList.remove('kl');
  st.style.left = `${B.width - 14 - st.offsetWidth / 2}px`;
}
/** Stempel „Kapitel gelöst“ auf die Fallkarte (oder die Spielfläche), dann erscheint der neue Buchstabe unter Staub und springt in den Beutel */
function stempeltAuf(sec: HTMLElement, fk: HTMLElement, f: any) {
  fk.classList.add('stempelziel');
  fk.insertAdjacentHTML('beforeend', `<b class="stempel abdruck">${f.stempel}</b>`);
  if (fk.classList.contains('flk-blatt')) stempelNebenKopf(fk, fk.lastElementChild as HTMLElement);
  fk.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // der Stempel landet im Bild, auch wenn das Kind weiter unten liest
  summ(40);
  konfetti(sec);
  const aus = $('.bt-ausgabe', sec), neu = $('.bt-neu .bt-k', aus);
  aus.classList.add('zu');
  aus.hidden = false;
  fuss.innerHTML = '<div class="fz"><button class="kn haupt" style="visibility:hidden" tabindex="-1"><span>·</span></button></div>';
  const weiterKnopf = () => nurKnopf('weiter', knopf('weiter', UI.weiter), () => { stand.view = D.kapitel[kap().nr] ? 'ausblick' : 'finale'; stand.fin = 0; zeige(); });
  setTimeout(() => { // erst den Stempel sehen lassen, dann zum Buchstaben rollen (Telefon: der Beutel liegt unter dem Blatt)
    aus.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    requestAnimationFrame(() => aus.classList.remove('zu'));
    hookStaub = staub(neu, () => { hookStaub = null; setTimeout(() => springInBeutel(aus, neu, weiterKnopf), 450); });
  }, 700);
}
/** Der freigewischte Buchstabe hüpft im Bogen in den Beutel und liegt dann lose bei den anderen */
function springInBeutel(aus: HTMLElement, neu: HTMLElement, fertig: () => void) {
  if (!aus.isConnected) return;
  const reihe = $('.bt-reihe', aus), sack = $('.bt-sack', aus);
  const platz = document.createElement('i');
  platz.className = 'bt-k platz'; platz.textContent = neu.textContent; platz.style.cssText = neu.style.cssText;
  reihe.appendChild(platz);
  const v = neu.getBoundingClientRect(), z = platz.getBoundingClientRect();
  const dx = z.left + z.width / 2 - (v.left + v.width / 2), dy = z.top + z.height / 2 - (v.top + v.height / 2), sk = z.width / v.width;
  const hoch = Math.min(dy, 0) - Math.max(60, Math.abs(dx) * 0.35);
  const ankommen = () => {
    platz.classList.remove('platz'); platz.classList.add('rein'); sack.classList.add('wackelt'); summ([20, 30]);
    // der leere Platz oben klappt weich zu (der Beutel rutscht nach, statt zu springen)
    const leer = neu.closest<HTMLElement>('.bt-neu');
    if (leer) { neu.style.visibility = 'hidden'; if (weniger()) leer.remove(); else leer.animate([{ height: leer.offsetHeight + 'px' }, { height: '0px', marginBottom: '-.875rem' }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).onfinish = () => leer.remove(); }
    fertig();
  };
  if (weniger()) return ankommen();
  // im Bogen: hoch, über den Beutel, hinein zu den anderen Buchstaben (ein bisschen kleiner, wie die anderen)
  const a = neu.animate([
    { transform: 'translate(0, 0) rotate(0) scale(1)', easing: 'cubic-bezier(.3, .7, .5, 1)' },
    { transform: `translate(${dx * 0.55}px, ${hoch}px) rotate(-12deg) scale(${(1 + sk) / 2})`, offset: 0.45, easing: 'cubic-bezier(.5, 0, .7, .4)' },
    { transform: `translate(${dx}px, ${dy}px) rotate(0) scale(${sk})` },
  ], { duration: 900, fill: 'forwards' });
  a.onfinish = ankommen;
}
function ausblick() {
  modus('haken');
  const k = kap(), nxt = D.kapitel[k.nr];
  buehne.innerHTML = `<section class="haken${k.ausblickBild ? ' mitbild' : ''}"><div class="lampe"></div>${k.ausblickBild ? `<figure class="foto ab-bild"><img src="${img(k.ausblickBild)}" alt=""></figure>` : `<img class="hr" src="${fig('raupe/staunt')}" alt="">`}<p>${k.ausblick}</p>${nxt ? '' : `<p class="forts">${UI.fortsetzung}</p>`}</section>`;
  if (!nxt) return nurKnopf('neu', knopf('neu', UI.neuStart, 'still'), neuStart);
  nurKnopf('naechstes', knopf('naechstes', `${UI.naechstesKapitel} ${nxt.nr} ›`), () => {
    Object.assign(stand, { spur: kapSpuren(nxt.nr)[0], i: 0, blatt: 0, mix: [], view: 'kapitel' });
    zeige();
  });
}
/** Finale nach dem letzten Kapitel: Code, Tresor mit Lupe, Urkunde, Epilog (siehe finale.ts) */
function finale() {
  const letzt = D.kapitel[D.kapitel.length - 1];
  zeigeFinale({ buehne, fuss, UI, img, fig, summ, fin: letzt.finale, wort: D.kapitel[0].code.wort, reihe: D.kapitel.map((k: any) => k.code.pos), sack: SACK, stand, speichern, perlen: perlenVon, modus, neuStart, hook: R.hook, knopf,
    geloest: () => { if (!stand.geloest) { stand.geloest = true; speichern(); } },
    album: () => { stand.view = 'album'; zeige(); },
    haus: hausOeffnen,
    traegt: () => stand.traegt });
}

/* ---------- Nach dem Fall: Seite „Fall gelöst“, Fall-Album, Haus der Lese-Raupe ---------- */
function fertigSeite() {
  modus('titel');
  buehne.innerHTML = `<section class="titel fertig"><div class="lampe"></div>${himmel()}<p class="tl">SPUREN-RAUPE · FALL 1</p><h1>${T(D.fall.titel)}</h1><figure class="foto gross fg-cover"><img src="${img('cover')}" alt=""><b class="fg-stempel">${UI.geloestStempel}</b></figure><button class="fg-raupe" data-a="haus" aria-label="Haus der Lese-Raupe">${raupeMitSache(stand.traegt, fig)}</button><p class="forts">${UI.fortsetzung}</p><button class="fg-urk" data-a="urkunde"><span>${UI.meineUrkunde}</span></button></section>`;
  feuerwerk($('.fertig', buehne), 3, 0.2);
  fuss.innerHTML = `<div class="fz">${knopf('album', UI.album)}${knopf('haus', UI.zurRaupe, 'still')}</div>`;
  const tu = (a?: string) => { if (a === 'album') { stand.view = 'album'; zeige(); } else if (a === 'haus') hausOeffnen(); else if (a === 'urkunde') urkundeOffen(); };
  fuss.onclick = (e) => tu((e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a);
  buehne.onclick = (e) => tu((e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a);
}
function urkundeOffen() {
  ueber.innerHTML = `<div class="schl mitte urk-schl"><div class="urk-box">${urkundeHtml(UI, stand.name, perlenVon(), fig)}<div class="fz">${knopf('zu', UI.fertig)}</div></div></div>`;
  const inp = $<HTMLInputElement>('#dname', ueber);
  inp.addEventListener('input', () => { stand.name = inp.value; speichern(); });
  ueber.onclick = (e) => { const t = e.target as HTMLElement; if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) ueber.innerHTML = ''; };
}
/** Fall-Album: oben die vier Kapitel, darunter ihre Spuren als Karten mit dem Bild der Szene. Tippen = noch einmal lesen */
function album() {
  modus('album');
  stand.wieder = false;
  const k = D.kapitel.find((x: any) => x.nr === stand.albumKap) ?? D.kapitel[0];
  const reiter = D.kapitel.map((x: any) => `<button class="al-reiter${x.nr === k.nr ? ' an' : ''}" data-k="${x.nr}" aria-pressed="${x.nr === k.nr}"><img src="${img(x.bild)}" alt=""><span>${UI.kapitel} ${x.nr}</span></button>`).join('');
  const karten = kapSpuren(k.nr).map((n) => { const sp = SP(n); return `<button class="al-karte" data-s="${n}" style="--n:${NEIGUNG[(n * 5 + 2) % NEIGUNG.length] * 0.6}deg"><span class="al-bild"><img src="${img(sp.bild)}" alt="" loading="lazy"></span><span class="tab etikett">SPUR ${sp.spur}</span><b>${sp.titelH}</b></button>`; }).join('');
  buehne.innerHTML = `<section class="album"><div class="lampe"></div><div class="al-kopf"><span class="tab hell">${UI.album}</span><p>${UI.albumTipp}</p></div><div class="al-reiterz" role="tablist">${reiter}</div><h2 class="al-titel">${k.titelH}</h2><div class="al-grid">${karten}</div></section>`;
  fuss.innerHTML = `<div class="fz">${knopf('haus', UI.zurRaupe, 'still')}</div>`;
  klick('haus', hausOeffnen);
  buehne.onclick = (e) => {
    const t = e.target as HTMLElement;
    const r = t.closest<HTMLElement>('.al-reiter');
    if (r) { stand.albumKap = +r.dataset.k!; speichern(); album(); nav(); return; }
    const c = t.closest<HTMLElement>('.al-karte');
    if (c) { Object.assign(stand, { view: 'spur', spur: +c.dataset.s!, i: 0, blatt: 0, mix: [], wieder: true }); zeige(); }
  };
}
function hausOeffnen() {
  zeigeHaus({ ueber, UI, fig, perlen, summ, lupe: () => stand.geloest, traegt: () => stand.traegt,
    setzeTraegt: (id) => { stand.traegt = id; speichern(); },
    zu: () => { if (stand.view === 'fertig') fertigSeite(); } });
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
tastenKlick(buehne); tastenKlick(ueber);
$('#bBrett').onclick = brettOffen;
/** Mond im Kopf antippen: ein kleines Kärtchen darunter sagt, was er zeigt („3 von 24 Spuren gelöst“), und verschwindet von selbst */
$('#bMond').onclick = () => {
  app.querySelector('.kblase')?.remove();
  const el = document.createElement('div');
  el.className = 'kblase'; el.setAttribute('role', 'status');
  el.innerHTML = (UI.mondInfo ?? '{1} / {2}').replace('{1}', String(stand.fertig.length)).replace('{2}', String(D.spuren.length));
  app.appendChild(el);
  const A = app.getBoundingClientRect(), k = $('#bMond').getBoundingClientRect(), mitte = k.left + k.width / 2 - A.left;
  const links = Math.max(8, Math.min(mitte - 26, A.width - el.offsetWidth - 8));
  el.style.top = `${$('.kopf').getBoundingClientRect().bottom - A.top + 10}px`;
  el.style.left = `${links}px`;
  el.style.setProperty('--spitze', `${mitte - links}px`);
  setTimeout(() => { el.classList.add('weg'); setTimeout(() => el.remove(), 350); }, 2800);
};
$('#kPerl').onclick = hausOeffnen;
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
addEventListener('resize', () => { clearTimeout(rz); rz = window.setTimeout(() => { if (stand.view === 'spur' && istLesen(steps(stand.spur)[stand.i]) && !ueber.innerHTML) zeige(); }, 200); });

/* ---------- Zurück und wieder vor: auf jedem Bildschirm ein Schritt zurück ---------- */
const ersteSpur = (n: number) => kapSpuren(SP(n).kap)[0] === n;
/** Reihenfolge aller Bildschirme als Zahl (Abstand 20 je Spur, damit Kapitelkarte, Fallkarte und Ausblick dazwischen passen) */
function pos(): number {
  if (stand.view === 'intro') return -100 + introK;
  if (stand.view === 'kapitel') return kapSpuren(kap().nr)[0] * 20 - 1;
  if (stand.view === 'fallkarte') return stand.spur * 20 + 15;
  if (stand.view === 'ausblick') return stand.spur * 20 + 16;
  if (stand.view === 'finale') return 10000 + stand.fin;
  if (stand.view === 'fertig') return 20000;
  if (stand.view === 'album') return 20001;
  if (stand.view === 'spur') return stand.spur * 20 + stand.i;
  return -1000;
}
const hatVorher = () => stand.view !== 'titel';
function zurueckSchritt() {
  ueber.innerHTML = '';
  stand.blatt = 0;
  if (stand.view === 'intro') { if (introK > 0) { introK--; return zeige(); } stand.view = 'titel'; return zeige(); }
  if (stand.view === 'kapitel') {
    if (kap().nr === 1) { stand.view = 'intro'; introK = D.intro.length - 1; return zeige(); }
    const vorher = kapSpuren(kap().nr - 1); stand.spur = vorher[vorher.length - 1]; stand.view = 'ausblick'; return zeige();
  }
  if (stand.view === 'album') { stand.view = 'fertig'; return zeige(); }
  if (stand.view === 'fertig') { stand.view = 'titel'; return zeige(); }
  if (stand.view === 'spur') {
    if (stand.i > 0) { stand.i--; if (istLesen(steps(stand.spur)[stand.i])) stand.blatt = 999; return zeige(); }
    if (stand.wieder) { stand.wieder = false; stand.view = 'album'; return zeige(); }
    if (ersteSpur(stand.spur)) { stand.view = 'kapitel'; return zeige(); }
    stand.spur--; stand.i = steps(stand.spur).length - 1; return zeige();
  }
  if (stand.view === 'fallkarte') { stand.view = 'spur'; stand.i = steps(stand.spur).length - 1; if (istLesen(steps(stand.spur)[stand.i])) stand.blatt = 999; return zeige(); }
  if (stand.view === 'ausblick') { stand.view = 'fallkarte'; return zeige(); }
  if (stand.view === 'finale') { if (stand.fin > 0) { stand.fin--; return zeige(); } stand.view = 'fallkarte'; return zeige(); }
}
/** Vor: nur über Schritte, die das Kind schon einmal geschafft hat */
function vorSchritt() {
  if (stand.view === 'spur') return weiter();
  if (stand.view === 'fallkarte') { stand.view = D.kapitel[kap().nr] ? 'ausblick' : 'finale'; stand.fin = 0; return zeige(); }
  if (stand.view === 'finale') { stand.fin++; return zeige(); }
}
/** Steht im Fuß gerade ein sichtbarer Haupt-Knopf, der weiterführt? Dann braucht es keinen Vor-Pfeil. */
const hatWeiter = () => [...fuss.querySelectorAll<HTMLButtonElement>('.fz .kn.haupt')].some((k) => !k.disabled && k.style.visibility !== 'hidden' && k.dataset.a !== 'stempeln' && k.dataset.a !== 'warte' && k.dataset.a !== 'mehr'); // „mehr“ = „Und dann?“ im Flunker-Finder, führt nicht weiter
/** Pfeile links und rechts vom Haupt-Knopf; beim Lesen gibt es sie schon im Fuß (‹ ›) */
function nav() {
  const lesen = app.dataset.m === 'lesen';
  const zur = hatVorher() && !lesen && !!fuss.querySelector('.fz');
  const vor = zur && pos() < stand.weit && !hatWeiter();
  const hat = (a: string) => !!fuss.querySelector(`:scope > [data-a="${a}"]`);
  if (fuss.classList.contains('mitnav') === zur && hat('zback') === zur && hat('zvor') === vor && (!zur || hat('zplatz') === !vor)) return;
  fuss.querySelectorAll(':scope > .znav').forEach((x) => x.remove());
  fuss.classList.toggle('mitnav', zur);
  if (!zur) return;
  fuss.insertAdjacentHTML('afterbegin', `<button class="rund znav zback" data-a="zback" aria-label="Zurück">${IC.zur}</button>`);
  fuss.insertAdjacentHTML('beforeend', vor ? `<button class="rund znav zvor" data-a="zvor" aria-label="Weiter">${IC.vor}</button>` : '<span class="znav" data-a="zplatz" aria-hidden="true"></span>');
}
new MutationObserver(() => nav()).observe(fuss, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'style'] });
fuss.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('.znav')?.dataset.a;
  if (a === 'zback') { e.stopPropagation(); zurueckSchritt(); }
  else if (a === 'zvor') { e.stopPropagation(); vorSchritt(); }
}, true);
/**
 * Mehr unten: Passt ein Rätsel (oder die Fallkarte) nicht ganz auf den Bildschirm, liegen Karten unter dem Rand.
 * Damit das Kind das merkt: unten ein dunkler Verlauf und ein runder Pfeil; Antippen rollt ein Stück weiter.
 * Ganz unten verschwindet beides. Neu gebunden, sobald eine neue .zug auf der Bühne steht.
 */
let mehrZug: HTMLElement | null = null, mehrAus: (() => void) | null = null;
/** Nebeneinander: passt die linke Spalte (Titel, Aufgabe, Raupe …) ganz in die Bühne? Nur dann darf die Raupe unten kleben (basis.css .raupe-unten). */
function linksPasst(z: HTMLElement, I: DOMRect): boolean {
  const cs = getComputedStyle(z), innen = z.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  let h = 0, n = 0;
  for (const e of z.children) {
    const E = e.getBoundingClientRect(), es = getComputedStyle(e);
    if (!E.height || E.right > I.left + 1 || es.position === 'absolute' || es.position === 'fixed') continue;
    h += E.height + (parseFloat(es.marginTop) || 0) + (parseFloat(es.marginBottom) || 0); n++;
  }
  return h + Math.max(0, n - 1) * (parseFloat(cs.rowGap) || 0) + 8 <= innen;
}
function mehrPfeil() {
  const z = buehne.querySelector<HTMLElement>(':scope > .zug');
  if (z === mehrZug) return;
  mehrAus?.(); mehrAus = null; mehrZug = z;
  buehne.querySelector(':scope > .mehr')?.remove();
  if (!z) return;
  const m = document.createElement('div');
  m.className = 'mehr'; m.hidden = true;
  m.innerHTML = `<button class="rund" aria-label="Weiter unten">${IC.runter}</button>`;
  m.querySelector('button')!.onclick = () => z.scrollBy({ top: Math.round(z.clientHeight * 0.6), behavior: 'smooth' });
  let raf = 0;
  const ro = new ResizeObserver(() => pruef());
  const pruef = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!z.isConnected) return;
      for (const k of z.children) ro.observe(k);
      // Pfeil nur, wenn wirklich Inhalt fehlt – nicht für Polster und Rahmen unten (sonst lernt das Kind, ihn zu übersehen)
      const rest = z.scrollHeight - z.clientHeight - z.scrollTop - (parseFloat(getComputedStyle(z).paddingBottom) || 0);
      m.hidden = rest <= 28;
      // Nebeneinander (Rechner, Tablet quer): Verlauf und Pfeil nur über der Spielfläche, nicht über Aufgabe und Raupe links
      const zr = z.querySelector<HTMLElement>(':scope > .zr'), zi = z.querySelector<HTMLElement>(':scope > .zi');
      const B = buehne.getBoundingClientRect(), R = zr?.getBoundingClientRect(), I = zi?.getBoundingClientRect();
      const neben = !!(R && I && R.width && I.left >= R.right - 1);
      if (neben && I) { m.style.left = Math.round(I.left - B.left) + 'px'; m.style.right = Math.round(B.right - I.right) + 'px'; }
      else m.style.left = m.style.right = '';
      z.classList.toggle('raupe-unten', neben && linksPasst(z, I!));
    });
  };
  z.addEventListener('scroll', pruef, { passive: true });
  z.addEventListener('load', pruef, true); // Bilder laden nach und machen die Fläche höher
  const mo = new MutationObserver(pruef);
  mo.observe(z, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
  ro.observe(z);
  buehne.appendChild(m);
  pruef();
  mehrAus = () => { mo.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
}
new MutationObserver(mehrPfeil).observe(buehne, { childList: true });

/** Android-Zurück: erst Fenster schließen, dann zurückblättern, sonst zum Titel (Stand bleibt), auf dem Titel App beenden */
function zurueck() {
  if (ueber.innerHTML.trim()) {
    const bg = ueber.querySelector('.schl') as HTMLElement | null, vorher = ueber.firstElementChild;
    if (bg) bg.click(); else ueber.innerHTML = '';
    if (ueber.firstElementChild === vorher) ueber.innerHTML = ''; // schließt sich das Fenster nicht selbst, schließen wir es; ein neues (Karte groß → Brett) bleibt
    return;
  }
  const prev = fuss.querySelector('[data-a="prev"]:not([disabled])') as HTMLElement | null;
  if (prev) { prev.click(); return; }
  if (stand.view === 'titel') { App.exitApp().catch(() => {}); return; }
  if (hatVorher()) return zurueckSchritt();
  stand.view = 'titel'; zeige();
}
App.addListener('backButton', zurueck).catch(() => {});
(window as any).__v8 = { stand, D, loese, zeige, steps, zurueck };
stand.view = 'titel'; // beim Öffnen immer der Titel, dann „Weiter ermitteln“
document.fonts.ready.then(zeige);
