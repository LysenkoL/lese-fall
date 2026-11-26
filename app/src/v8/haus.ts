/**
 * Haus der Lese-Raupe (nach der Entscheidung der Besitzerin, 17.11.2026):
 * füttern und anziehen, alles ohne Bezahlen. Perlen werden nie ausgegeben — sie schalten Sachen frei
 * (alle 6 Perlen eine Sache, also etwa alle 3 Spuren). Die goldene Lupe gibt es nur für den gelösten Fall.
 * Die Raupe wird nie hungrig, krank oder traurig; nichts geht verloren, nichts drängt.
 * Damit das Haus lebt (Rückmeldung der Besitzerin, 25.11.2026: „ein bisschen Spaß und Quatsch“), reagiert die Raupe ohne
 * lange Texte: jedes Essen anders (Eis: Zittern, Käse: „Ist das etwa der Mond?“), nach vielen Happen pappsatt mit Schluckauf,
 * Kitzeln beim Antippen (dreimal schnell: Purzelbaum), eine Wunsch-Wolke mit einem Bild, Einschlafen, wenn man sie lange
 * nicht anstupst. Sachen lassen sich kombinieren (Hut + Brille + Fliege …); manche Paare haben einen eigenen Satz.
 * Der Wunsch läuft nie ab und nichts wird schlechter, wenn man ihn nicht erfüllt.
 */
import { img } from '../data';
import { weniger } from './effekte.ts';
import './haus.css';

/** Bilder, die die Besitzerin noch erzeugt (02_design/PROMPT_RAUPENHAUS.md). Fehlen sie, gilt der gezeichnete Ersatz. */
const KOMMT = {
  ...import.meta.glob('../../../assets/illustrationen/raupenhaus.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../gen/frei/raupe_{isst,schlaeft,lupe,brrr}.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;
const HAUS_BILD = KOMMT['../../../assets/illustrationen/raupenhaus.webp'];
const ISST = KOMMT['../gen/frei/raupe_isst.webp'];
const BRRR = KOMMT['../gen/frei/raupe_brrr.webp'];
const SCHLAEFT = KOMMT['../gen/frei/raupe_schlaeft.webp'];
const MIT_LUPE = KOMMT['../gen/frei/raupe_lupe.webp'];
/** Raupe schläft (Epilog) und Raupe hält die goldene Lupe – oder null, solange die Bilder fehlen */
export const schlaeftBild = (): string | null => SCHLAEFT ?? null;
export const mitLupeBild = (): string | null => MIT_LUPE ?? null;

export const DINGE: { id: string; ab: number }[] = [
  { id: 'fliege', ab: 6 }, { id: 'schal', ab: 12 }, { id: 'brille', ab: 18 }, { id: 'notizbuch', ab: 24 },
  { id: 'taschenlampe', ab: 30 }, { id: 'hut', ab: 36 }, { id: 'mondbrosche', ab: 42 }, { id: 'tasche', ab: 48 },
];
/** Sachen, die bei dieser Perlenzahl frei sind (die Lupe zählt extra, siehe `lupeFrei`) */
export const freiBei = (p: number) => DINGE.filter((d) => p >= d.ab).map((d) => d.id);

/** goldene Tautropfen-Lupe: das fertige Bild aus objekte/ (geflochtener Goldring, Glas wie ein Tropfen) */
export const LUPE_SVG = `<img class="glupe" src="${img('objekte/goldene_lupe')}" alt="" draggable="false">`;

/** Essen: fertige Bilder (essen/<id>.webp, sonst objekte/), sonst sorgfältig gezeichnet (Licht von links oben, weicher Schatten) */
const ESSEN_BILD = import.meta.glob('../../../assets/illustrationen/essen/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const schatten = '<ellipse cx="32" cy="58" rx="17" ry="3.2" fill="#3A2A10" opacity=".13"/>';
const GEZEICHNET: Record<string, string> = {
  blatt: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="eb1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4E9A2C"/><stop offset=".55" stop-color="#86C653"/><stop offset="1" stop-color="#B9E28A"/></linearGradient></defs>${schatten}<path d="M12 52 C6 30 20 10 52 8 C55 34 40 52 12 52Z" fill="url(#eb1)" stroke="#3D7A22" stroke-width="2" stroke-linejoin="round"/><path d="M12 52 C22 40 34 26 47 13" stroke="#3D7A22" stroke-width="2.200" fill="none" stroke-linecap="round"/><path d="M22 41 L18 30 M28 34 L25 22 M34 27 L33 17 M27 37 L38 34 M33 30 L44 26 M39 22 L48 19" stroke="#3D7A22" stroke-width="1.300" fill="none" stroke-linecap="round" opacity=".7"/><path d="M8 56 C9 53 11 52 12 52" stroke="#3D7A22" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M20 20 C26 14 34 11 42 10" stroke="#fff" stroke-width="2.400" stroke-linecap="round" fill="none" opacity=".45"/><circle cx="40" cy="35" r="2.300" fill="#E9F6FF" stroke="#9CC6E6" stroke-width=".8" opacity=".9"/></svg>`,
  apfel: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="ea1" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".45" stop-color="#E8473A"/><stop offset="1" stop-color="#A9271D"/></radialGradient></defs>${schatten}<path d="M32 19 C22 11 8 16 9 32 C10 47 21 57 32 53 C43 57 54 47 55 32 C56 16 42 11 32 19Z" fill="url(#ea1)" stroke="#8E2018" stroke-width="2" stroke-linejoin="round"/><path d="M32 20 C31 14 33 9 36 6" stroke="#6E4520" stroke-width="3.200" fill="none" stroke-linecap="round"/><path d="M35 11 C40 4 50 5 51 8 C46 13 40 13 35 11Z" fill="#86C653" stroke="#3D7A22" stroke-width="1.600" stroke-linejoin="round"/><path d="M37 10 C42 8 46 8 49 8" stroke="#3D7A22" stroke-width="1" fill="none" opacity=".7"/><ellipse cx="19" cy="28" rx="4" ry="7" transform="rotate(20 19 28)" fill="#fff" opacity=".55"/><circle cx="23" cy="20" r="1.800" fill="#fff" opacity=".6"/></svg>`,
  erdbeere: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="ee1" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FF7A6A"/><stop offset=".5" stop-color="#E5352E"/><stop offset="1" stop-color="#A11E1A"/></radialGradient></defs>${schatten}<path d="M12 22 C10 38 22 54 32 57 C42 54 54 38 52 22 C42 16 22 16 12 22Z" fill="url(#ee1)" stroke="#8E1C17" stroke-width="2" stroke-linejoin="round"/><g fill="#FFE59A" stroke="#C9951A" stroke-width=".6"><ellipse cx="21" cy="29" rx="1.300" ry="2"/><ellipse cx="31" cy="27" rx="1.300" ry="2"/><ellipse cx="41" cy="29" rx="1.300" ry="2"/><ellipse cx="26" cy="37" rx="1.300" ry="2"/><ellipse cx="36" cy="37" rx="1.300" ry="2"/><ellipse cx="45" cy="36" rx="1.300" ry="2"/><ellipse cx="19" cy="38" rx="1.300" ry="2"/><ellipse cx="31" cy="45" rx="1.300" ry="2"/><ellipse cx="40" cy="45" rx="1.300" ry="2"/><ellipse cx="24" cy="46" rx="1.300" ry="2"/></g><path d="M14 21 L20 12 L25 19 L32 9 L39 19 L44 12 L50 21 C40 26 24 26 14 21Z" fill="#6DB33F" stroke="#3D7A22" stroke-width="1.800" stroke-linejoin="round"/><path d="M32 12 C32 8 33 5 35 3" stroke="#3D7A22" stroke-width="2.600" fill="none" stroke-linecap="round"/><ellipse cx="20" cy="30" rx="3" ry="6" transform="rotate(25 20 30)" fill="#fff" opacity=".4"/></svg>`,
  eis: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ei1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2C27A"/><stop offset="1" stop-color="#C98A3E"/></linearGradient><radialGradient id="ei2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFE6EF"/><stop offset=".55" stop-color="#FFB3CB"/><stop offset="1" stop-color="#E5779C"/></radialGradient><radialGradient id="ei3" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".6" stop-color="#FFE59A"/><stop offset="1" stop-color="#E7BE55"/></radialGradient></defs>${schatten}<path d="M19 33 L32 60 L45 33Z" fill="url(#ei1)" stroke="#8A5A2B" stroke-width="2" stroke-linejoin="round"/><path d="M22 39 L40 37 M25 45 L37 44 M28 51 L35 50 M24 35 L35 56 M33 35 L40 42 M28 35 L37 52" stroke="#8A5A2B" stroke-width="1.100" opacity=".55"/><circle cx="25" cy="26" r="10.500" fill="url(#ei3)" stroke="#C99A2E" stroke-width="1.800"/><circle cx="39" cy="26" r="10.500" fill="url(#ei2)" stroke="#C25B85" stroke-width="1.800"/><path d="M15 31 C18 36 24 35 27 33 C31 37 35 37 39 34 C43 36 47 35 49 31" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".6"/><circle cx="32" cy="13" r="4.200" fill="#D8352E" stroke="#8E1C17" stroke-width="1.400"/><path d="M32 9 C33 6 35 4 37 3" stroke="#3D7A22" stroke-width="1.600" fill="none" stroke-linecap="round"/><circle cx="31" cy="12" r="1.200" fill="#fff" opacity=".7"/><circle cx="21" cy="22" r="2.400" fill="#fff" opacity=".7"/><circle cx="35" cy="22" r="2.400" fill="#fff" opacity=".7"/></svg>`,
};
/** Reihenfolge im Haus; Keks und Käse gibt es schon als Bilder aus dem Buch */
const FUTTER: Record<string, string> = Object.fromEntries(['blatt', 'apfel', 'erdbeere', 'keks', 'kaese', 'eis'].map((id) => {
  const datei = ESSEN_BILD[`../../../assets/illustrationen/essen/${id}.webp`] ?? (id === 'keks' ? img('objekte/raetsel_keks') : id === 'kaese' ? img('objekte/raetsel_kaese') : '');
  return [id, datei ? `<img class="e-${id}" src="${datei}" alt="" draggable="false">` : GEZEICHNET[id]];
}));
const FUTTER_IDS = Object.keys(FUTTER);

export interface HausCtx {
  ueber: HTMLElement;
  UI: Record<string, string>;
  fig: (n: string) => string;
  perlen: () => number;
  /** Lupe frei (Fall gelöst)? */
  lupe: () => boolean;
  /** was die Raupe trägt, mit Komma getrennt ("hut,brille"; '' = nichts) */
  traegt: () => string;
  setzeTraegt: (ids: string) => void;
  summ: (ms: number | number[]) => void;
  /** nach dem Schließen (z. B. neu zeichnen) */
  zu?: () => void;
}

/** Sachen, die als durchsichtige Auflage auf jedes Garderoben-Bild passen (scripts/garderobe_ebenen.py), von unten nach oben */
const AUFLAGEN = ['mondbrosche', 'fliege', 'brille', 'hut'];
/**
 * Wo eine Sache sitzt. Sachen mit gemeinsamem Platz schließen sich aus: Schal, Notizbuch, Taschenlampe und Tasche sind
 * ganze Bilder (also nur eins davon), der Schal liegt außerdem am Hals wie die Fliege. Die goldene Lupe passt zu allem.
 */
const PLATZ: Record<string, string[]> = {
  hut: ['kopf'], brille: ['augen'], fliege: ['hals'], mondbrosche: ['brosche'],
  schal: ['bild', 'hals'], notizbuch: ['bild'], taschenlampe: ['bild'], tasche: ['bild'], lupe: ['hand'],
};
/** getragene Sachen aus dem Speicherstand: "hut,brille" (ältere Stände: nur eine Sache, z. B. "hut") */
export const getragen = (t: string): string[] => [...new Set((t || '').split(',').filter((id) => PLATZ[id]))];

/**
 * Bild der Raupe mit ihren Sachen. Nichts an: Stimmungsbild (`pose`). Nur die goldene Lupe: Raupe mit Lupe.
 * Sonst ein Garderoben-Bild als Grund (die Sache mit eigenem Bild, z. B. der Schal) und die übrigen Sachen als Auflagen
 * an derselben Stelle darüber; die goldene Lupe liegt dann genau über der grünen Lupe in ihrer Hand.
 */
export function raupeMitSache(traegt: string, fig: (n: string) => string, pose = 'lacht'): string {
  const ids = getragen(traegt), lupe = ids.includes('lupe'), dinge = ids.filter((d) => d !== 'lupe');
  if (!dinge.length) {
    if (!lupe) return `<span class="rms"><img src="${fig('raupe/' + pose)}" alt=""></span>`;
    return MIT_LUPE ? `<span class="rms"><img src="${MIT_LUPE}" alt=""></span>` : `<span class="rms mitlupe"><img src="${fig('raupe/lob')}" alt="">${LUPE_SVG}</span>`;
  }
  const grund = dinge.find((d) => !AUFLAGEN.includes(d)) ?? dinge[0];
  const auf = AUFLAGEN.filter((d) => d !== grund && dinge.includes(d));
  const grundBild = `<img src="${img('garderobe/raupe_' + grund)}" alt="">`;
  if (!auf.length && !lupe) return `<span class="rms gard">${grundBild}</span>`;
  return `<span class="rms gard kombi">${grundBild}${auf.map((d) => `<img class="auf" src="${img('garderobe/auflage_' + d)}" alt="">`).join('')}${lupe ? `<img class="auf glupe" src="${img('objekte/goldene_lupe')}" alt="">` : ''}</span>`;
}

/** Zeiten im Haus (ms) */
const ZEIT = {
  pose: 1400,          // so lange bleibt eine Stimmung (kauen, staunen …), dann wieder das Grundbild
  kitzel: 2500,        // drei Stupser in dieser Zeit: Purzelbaum
  sattFenster: 12000,  // vier Happen in dieser Zeit: pappsatt
  satt: 5600,          // so lange dauert der Schluckauf
  muede: 25000,        // so lange nichts angetippt: die Raupe gähnt …
  schlaf: 8000,        // … und schläft danach ein
  wunschStart: 6000,   // erste Wunsch-Wolke nach dem Öffnen
  wunschWieder: 14000, // nächste Wunsch-Wolke nach einem erfüllten Wunsch
  lesen: 4500,         // ein neuer Satz der Raupe frühestens so lange nach dem letzten (das Kind liest noch)
};
/** Wie die Raupe auf jedes Essen reagiert: Bild (ohne Sachen), Bewegung, kleiner Effekt */
const REAKTION: Record<string, { pose: string; bew: string; fx: string }> = {
  blatt: { pose: 'isst', bew: 'mampf', fx: 'blatt' },
  apfel: { pose: 'isst', bew: 'mampf', fx: 'apfel' },
  erdbeere: { pose: 'isst', bew: 'mampf', fx: 'herz' },
  keks: { pose: 'isst', bew: 'mampf', fx: 'kruemel' },
  kaese: { pose: 'staunt', bew: 'staun', fx: 'mond' },   // „Ist das etwa der Mond?“
  eis: { pose: 'brrr', bew: 'brrr', fx: 'kalt' },
};
/** Paare mit eigenem Satz (beide an); ab vier Sachen gilt „kombiViel“ */
const KOMBIS: [string[], string][] = [[['hut', 'lupe'], 'kombiMeister'], [['brille', 'notizbuch'], 'kombiLehrerin'], [['hut', 'schal'], 'kombiWinter'], [['hut', 'fliege'], 'kombiTheater']];
/** kurze Bewegungen der Raupe (CSS-Klassen in haus.css), immer nur eine zugleich */
const BEWEGUNGEN = ['mampf', 'zieht', 'brrr', 'kitzel', 'purzel', 'staun', 'juhu', 'hicks', 'nein'];
/** Stimmungsbilder, falls ein erzeugtes Bild (noch) fehlt */
const POSE_ERSATZ: Record<string, string> = { isst: 'lacht', brrr: 'staunt', schlaeft: 'muede' };

let sagtNr = 0;
export function zeigeHaus(c: HausCtx): void {
  const { ueber, UI } = c;
  const label = (id: string) => UI['d_' + id] ?? id;
  const p = c.perlen(), frei = freiBei(p);
  const sachen = [
    `<button class="h-sache" data-s=""><span class="h-bild h-ohne" aria-hidden="true"></span><b>${UI.ohneSachen}</b></button>`,
    ...(c.lupe() ? [`<button class="h-sache gold" data-s="lupe"><span class="h-bild">${LUPE_SVG}</span><b>${label('lupe')}</b></button>`] : []),
    ...DINGE.map((d) => frei.includes(d.id)
      ? `<button class="h-sache" data-s="${d.id}"><span class="h-bild"><img src="${img('garderobe/' + d.id)}" alt=""></span><b>${label(d.id)}</b></button>`
      : `<div class="h-sache zu" aria-label="${d.id}"><span class="h-bild"><img src="${img('garderobe/' + d.id)}" alt=""></span><b>${UI.abWort} ${d.ab} ${UI.perlenWort}</b></div>`),
  ].join('');
  ueber.innerHTML = `<div class="schl mitte"><section class="haus" role="dialog" aria-label="Haus der Lese-Raupe"><div class="h-oben"><header><b>${UI.haus}</b><button class="kb" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/></svg></button></header>
<div class="h-buehne${HAUS_BILD ? ' mitbild' : ''}"${HAUS_BILD ? ` style="background-image:url(${HAUS_BILD})"` : ''}><div class="h-dunkel" aria-hidden="true"><i></i></div><button class="h-raupe" type="button" aria-label="Lese-Raupe kitzeln"></button><div class="h-rede"><p class="h-blase" aria-live="polite"></p></div><span class="h-wunsch" aria-hidden="true" hidden></span></div></div>
<div class="h-unten"><p class="h-perl"><span class="perle" aria-hidden="true"></span><span>${UI.duHast} <b>${p}</b> ${UI.perlen}</span></p>
<h4>${UI.futter}</h4><div class="h-futter">${FUTTER_IDS.map((f) => `<button class="h-essen" data-f="${f}" aria-label="${f}">${FUTTER[f]}</button>`).join('')}</div>
<h4>${UI.anziehen}</h4><div class="h-sachen">${sachen}</div></div></section></div>`;
  const haus = ueber.querySelector<HTMLElement>('.haus')!, buehne = haus.querySelector<HTMLElement>('.h-buehne')!;
  const raupe = haus.querySelector<HTMLElement>('.h-raupe')!, blase = haus.querySelector<HTMLElement>('.h-blase')!, wolke = haus.querySelector<HTMLElement>('.h-wunsch')!;

  /** wach, pappsatt (Schluckauf, isst gerade nichts), müde (gähnt) oder schläft */
  let zustand: 'wach' | 'satt' | 'muede' | 'schlaeft' = 'wach';
  const gegessen = new Map<string, number>(), angezogen = new Map<string, number>();
  let happen: number[] = [], stupser: number[] = [], kitzelNr = 0, wachNr = 0, gesagt = 0, vielGesagt = false;
  let wunsch = '', letzterWunsch = '';

  // Uhren laufen nur, solange das Haus offen ist (auch wenn es von außen geschlossen wird)
  const uhren = new Set<number>();
  const spaeter = (f: () => void, ms: number): number => { const t = window.setTimeout(() => { uhren.delete(t); if (haus.isConnected) f(); }, ms); uhren.add(t); return t; };
  const stopp = (t: number) => { clearTimeout(t); uhren.delete(t); };

  /* ---------- Raupe zeichnen, bewegen, sprechen ---------- */
  const erzeugt: Record<string, string | undefined> = { isst: ISST, brrr: BRRR, schlaeft: SCHLAEFT };
  const poseUrl = (pose: string) => (pose in erzeugt ? erzeugt[pose] ?? c.fig('raupe/' + POSE_ERSATZ[pose]) : c.fig('raupe/' + pose));
  const grundPose = () => (zustand === 'schlaeft' ? 'schlaeft' : zustand === 'muede' ? 'muede' : '');
  /** mit Sachen: die Sachen; ohne Sachen: die Stimmung. Zum Schlafen legt sie alles ab (kommt beim Aufwachen wieder). */
  const zeichne = (pose = grundPose()) => {
    raupe.innerHTML = pose && (pose === 'schlaeft' || !getragen(c.traegt()).length) ? `<span class="rms"><img src="${poseUrl(pose)}" alt=""></span>` : raupeMitSache(c.traegt(), c.fig);
  };
  let zurueck = 0;
  /** kurz eine Stimmung zeigen, danach wieder das Grundbild */
  const stimmung = (pose: string, ms = ZEIT.pose) => { stopp(zurueck); zeichne(pose); zurueck = spaeter(() => zeichne(), ms); };
  const bewege = (kl: string) => { raupe.classList.remove(...BEWEGUNGEN); void raupe.offsetWidth; raupe.classList.add(kl); };
  raupe.addEventListener('animationend', (e) => { if (e.target === raupe) raupe.classList.remove(...BEWEGUNGEN); });
  const sag = (t: string) => { blase.innerHTML = t; blase.classList.remove('neu'); void blase.offsetWidth; blase.classList.add('neu'); gesagt = Date.now(); };

  /* ---------- kleine Effekte auf der Bühne (bei „weniger Bewegung“ keine) ---------- */
  /** Punkt bei der Raupe: Anteile ihrer Breite und Höhe, in Bühnen-Pixeln */
  const beiRaupe = (fx: number, fy: number) => ({ x: raupe.offsetLeft + raupe.offsetWidth * fx, y: raupe.offsetTop + raupe.offsetHeight * fy });
  const effekt = (art: string, x: number, y: number, inhalt: string, ms: number) => {
    if (weniger()) return;
    const fx = document.createElement('span');
    fx.className = 'h-fx ' + art;
    fx.setAttribute('aria-hidden', 'true');
    fx.style.cssText = `left:${Math.round(x)}px;top:${Math.round(y)}px`;
    fx.innerHTML = inhalt;
    buehne.appendChild(fx);
    spaeter(() => fx.remove(), ms);
  };
  /** Krümel, Apfelstückchen oder Blattschnipsel fallen vom Mund herunter */
  const teilchen = (art: string) => {
    const { x, y } = beiRaupe(.56, .42);
    effekt(art, x, y, [...Array(8)].map((_, i) => `<i style="--dx:${((i * 37) % 70) - 32}px;--dy:${44 + ((i * 23) % 40)}px;--r:${(i * 83) % 360}deg;--v:${(i % 4) * 0.06}s"></i>`).join(''), 1400);
  };
  /** nach dem Eis: Zitterstriche links und rechts */
  const kalt = () => {
    const { x, y } = beiRaupe(.5, .42), w = raupe.offsetWidth;
    effekt('kalt', x, y, [-1, 1].flatMap((s) => [0, 1].map((k) => `<i class="${s > 0 ? 'r' : ''}" style="left:${Math.round(s * (w * .42 + k * 7) - 4)}px;top:${k * 18 - 14}px;--v:${k * .12}s"></i>`)).join(''), 1300);
  };
  /** warmer Mond-Schein hinter der Raupe (Käse, Mondbrosche) */
  const mondschein = () => { const { x, y } = beiRaupe(.5, .5); effekt('mond', x, y, `<i style="--g:${Math.round(raupe.offsetHeight * 1.3)}px"></i>`, 1800); };
  /** Herzchen über der Raupe (herzchen() aus diesem Modul, an einem eigenen Ort, damit Neuzeichnen sie nicht löscht) */
  const herzen = () => {
    if (weniger()) return;
    const ort = document.createElement('span');
    ort.className = 'h-herzort';
    ort.style.cssText = `left:${raupe.offsetLeft}px;top:${raupe.offsetTop}px;width:${raupe.offsetWidth}px;height:${raupe.offsetHeight}px`;
    buehne.appendChild(ort);
    herzchen(ort);
    spaeter(() => ort.remove(), 1700);
  };
  /** Schluckauf: kleiner Hüpfer, „Hicks!“ steigt links über dem Kopf auf (nicht über der Sprechblase) */
  const hicksen = () => { const { x, y } = beiRaupe(.05, .02); effekt('hicks', x, y, `<b>${UI.hicks}</b>`, 1100); bewege('hicks'); c.summ(8); };
  /** Taschenlampe: kurz Licht aus, ein Lichtkegel sucht im Haus herum (bei „weniger Bewegung“ steht der Lichtkreis still) */
  const lampe = () => {
    buehne.classList.remove('dunkel'); void buehne.offsetWidth; buehne.classList.add('dunkel');
    spaeter(() => buehne.classList.remove('dunkel'), 2600);
  };
  const FX: Record<string, () => void> = { blatt: () => teilchen('blatt'), apfel: () => teilchen('apfel'), kruemel: () => teilchen('kruemel'), herz: herzen, mond: mondschein, kalt };

  /* ---------- Essen fliegt zur Raupe ---------- */
  const flieg = (knopf: HTMLElement, dann: () => void) => {
    const bild = knopf.firstElementChild as HTMLElement | null;
    if (weniger() || !bild) { dann(); return; }
    const a = bild.getBoundingClientRect(), z = raupe.getBoundingClientRect();
    const flug = bild.cloneNode(true) as HTMLElement;
    flug.classList.add('h-flug');
    flug.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
    document.body.appendChild(flug);
    const an = flug.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${z.left + z.width / 2 - a.left - a.width / 2}px, ${z.top + z.height * 0.45 - a.top - a.height / 2}px) scale(.35)`, opacity: .2 }], { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)' });
    an.onfinish = () => flug.remove();
    spaeter(dann, 420);
  };

  /* ---------- Wunsch-Wolke: ein Bild, das Kind findet das passende Essen ---------- */
  let wunschUhr = 0;
  const wunschPlanen = (ms: number) => { stopp(wunschUhr); wunschUhr = spaeter(wuenschen, ms); };
  const wuenschen = () => {
    if (wunsch || zustand === 'muede' || zustand === 'schlaeft') return; // nach dem Aufwachen neu geplant
    if (zustand === 'satt' || Date.now() - gesagt < ZEIT.lesen) { wunschPlanen(2500); return; } // erst zu Ende lesen lassen
    const moeglich = FUTTER_IDS.filter((f) => f !== letzterWunsch);
    wunsch = moeglich[Math.floor(Math.random() * moeglich.length)];
    wolke.innerHTML = FUTTER[wunsch];
    wolke.dataset.f = wunsch;
    wolke.classList.remove('weg');
    wolke.hidden = false;
    sag(UI.wunsch);
    stimmung('denkt', 2400);
  };
  const wunschErfuellt = () => {
    letzterWunsch = wunsch;
    wunsch = '';
    delete wolke.dataset.f;
    wolke.classList.add('weg');
    spaeter(() => { if (!wunsch) { wolke.hidden = true; wolke.classList.remove('weg'); } }, 320);
    wunschPlanen(ZEIT.wunschWieder);
  };

  /* ---------- müde werden, einschlafen, aufwachen ---------- */
  let ruhe = 0;
  const weckerStellen = () => { stopp(ruhe); ruhe = spaeter(muedeWerden, ZEIT.muede); };
  const muedeWerden = () => {
    if (zustand !== 'wach') { weckerStellen(); return; } // pappsatt: später noch einmal
    zustand = 'muede';
    raupe.classList.add('muede');
    stopp(zurueck); zeichne(); sag(UI.gaehnt);
    ruhe = spaeter(einschlafen, ZEIT.schlaf);
  };
  const einschlafen = () => {
    zustand = 'schlaeft';
    raupe.classList.remove('muede');
    raupe.classList.add('schlaeft');
    stopp(zurueck); zeichne(); sag(UI.schlaeft);
    wolke.hidden = true; // der Wunsch bleibt gemerkt, die Wolke kommt beim Aufwachen wieder
    stopp(wunschUhr);
    if (!weniger()) raupe.insertAdjacentHTML('beforeend', '<span class="h-fx zzz" aria-hidden="true" style="left:74%;top:18%"><b>z</b><b>z</b><b>Z</b></span>');
  };
  const aufwachen = () => {
    zustand = 'wach';
    raupe.classList.remove('muede', 'schlaeft');
    stopp(zurueck); zeichne(); // löscht auch die Schlaf-Z
    weckerStellen();
    if (wunsch) wolke.hidden = false; else wunschPlanen(ZEIT.wunschStart);
  };
  haus.addEventListener('pointerdown', () => { if (zustand === 'wach' || zustand === 'satt') weckerStellen(); });
  haus.addEventListener('keydown', () => { if (zustand === 'wach' || zustand === 'satt') weckerStellen(); });

  /* ---------- Füttern ---------- */
  const pappsatt = () => {
    raupe.classList.add('dick');
    sag(UI.satt);
    for (let k = 0; k < 4; k++) spaeter(hicksen, 350 + k * 1250);
    spaeter(() => { zustand = 'wach'; raupe.classList.remove('dick'); sag(UI.sattWeg); weckerStellen(); }, ZEIT.satt);
  };
  const fuettern = (knopf: HTMLElement) => {
    const id = knopf.dataset.f!;
    c.summ(20);
    if (zustand === 'satt') { bewege('nein'); sag(UI.sattNein); return; }
    const geweckt = zustand === 'muede' || zustand === 'schlaeft';
    if (geweckt) aufwachen();
    const n = gegessen.get(id) ?? 0;
    gegessen.set(id, n + 1);
    const schal = id === 'eis' && getragen(c.traegt()).includes('schal'); // mit Schal friert sie nicht
    const erfuellt = !!wunsch && id === wunsch;
    const r = schal ? REAKTION.erdbeere : REAKTION[id] ?? REAKTION.blatt;
    // Satz: Wunsch erfüllt > gerade aufgewacht > Eis mit Schal > zwei eigene Sätze je Essen, dazwischen ein allgemeiner
    const eigener = n % 3 === 0 ? UI['iss_' + id] : n % 3 === 1 ? UI['iss_' + id + '2'] : '';
    sag(erfuellt ? UI.wunschJa : geweckt ? UI.wachEssen : schal ? UI.eisSchal : eigener || UI['sagt' + ((sagtNr++ % 8) + 1)]);
    if (erfuellt) wunschErfuellt();
    flieg(knopf, () => {
      if (erfuellt) { stimmung('klatscht', 1600); bewege('juhu'); herzen(); return; }
      stimmung(r.pose);
      bewege(r.bew);
      FX[r.fx]?.();
    });
    // viele Happen schnell hintereinander: pappsatt, mit Schluckauf
    const jetzt = Date.now();
    happen = happen.filter((t) => jetzt - t < ZEIT.sattFenster);
    happen.push(jetzt);
    if (happen.length >= 4) { happen = []; zustand = 'satt'; spaeter(pappsatt, 1300); }
  };

  /* ---------- Kitzeln (Raupe antippen) ---------- */
  const kitzeln = () => {
    c.summ(12);
    if (zustand === 'muede' || zustand === 'schlaeft') { aufwachen(); bewege('zieht'); sag(UI['wach' + ((wachNr++ % 2) + 1)]); return; }
    const jetzt = Date.now();
    stupser = stupser.filter((t) => jetzt - t < ZEIT.kitzel);
    stupser.push(jetzt);
    if (stupser.length >= 3) { stupser = []; bewege('purzel'); stimmung('staunt', 1300); sag(UI.purzel); return; }
    bewege('kitzel');
    stimmung('klatscht', 1000);
    sag(UI['kitzel' + ((kitzelNr++ % 3) + 1)]);
  };

  /* ---------- Anziehen: antippen = an, noch einmal = aus; Sachen am selben Platz tauschen sich ---------- */
  const knoepfe = () => {
    const ids = getragen(c.traegt());
    haus.querySelectorAll<HTMLElement>('button.h-sache').forEach((k) => {
      const an = k.dataset.s ? ids.includes(k.dataset.s) : !ids.length;
      k.classList.toggle('an', an);
      k.setAttribute('aria-pressed', String(an));
    });
  };
  const anziehen = (id: string) => {
    c.summ(15);
    if (zustand === 'muede' || zustand === 'schlaeft') aufwachen();
    let ids = getragen(c.traegt()), satz: string, kombi: string | undefined;
    const dazu = !!id && !ids.includes(id);
    if (!id) { ids = []; satz = UI.ziehOhne; }
    else if (!dazu) { ids = ids.filter((d) => d !== id); satz = UI.ausziehen; }
    else {
      ids = ids.filter((d) => !PLATZ[d].some((pl) => PLATZ[id].includes(pl)));
      ids.push(id);
      // eigenes Paar zuerst; „So viele Sachen!“ nur einmal je Besuch, sonst hätte jede weitere Sache denselben Satz
      kombi = KOMBIS.find(([paar]) => paar.includes(id) && paar.every((d) => ids.includes(d)))?.[1];
      if (!kombi && ids.length >= 4 && !vielGesagt && !['taschenlampe', 'mondbrosche'].includes(id)) { kombi = 'kombiViel'; vielGesagt = true; } // Lampe und Brosche: ihr eigener Satz passt zum Effekt
      const n = angezogen.get(id) ?? 0;
      angezogen.set(id, n + 1);
      satz = (kombi && UI[kombi]) || (id === 'lupe' ? UI.ziehLupe : [UI['zieh_' + id], UI.zieh1, UI.zieh2][n % 3] || UI.zieh1);
    }
    c.setzeTraegt(ids.join(','));
    knoepfe();
    stopp(zurueck);
    zeichne();
    bewege(kombi ? 'juhu' : 'zieht');
    sag(satz);
    if (kombi) herzen();
    if (dazu && id === 'taschenlampe') lampe();
    if (dazu && id === 'mondbrosche') mondschein();
  };

  ueber.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-a="zu"]') || t.classList.contains('schl')) { uhren.forEach((u) => clearTimeout(u)); uhren.clear(); ueber.innerHTML = ''; ueber.onclick = null; c.zu?.(); return; }
    const f = t.closest<HTMLElement>('.h-essen');
    if (f) { fuettern(f); return; }
    if (t.closest('.h-raupe')) { kitzeln(); return; }
    const s = t.closest<HTMLElement>('button.h-sache');
    if (s) anziehen(s.dataset.s ?? '');
  };

  // Stimmungsbilder vorladen, damit beim ersten Wechsel nichts flackert
  for (const pose of ['isst', 'brrr', 'staunt', 'klatscht', 'denkt', 'muede', 'schlaeft']) { const i = new Image(); i.src = poseUrl(pose); }
  zeichne();
  knoepfe();
  sag(UI.hausHallo);
  weckerStellen();
  wunschPlanen(ZEIT.wunschStart);
}

/**
 * „Neu im Haus der Lese-Raupe“: kleines Kärtchen am Haus-Knopf (Perlen) im Kopf, mit Spitze zum Knopf – auf dem Rechner links daneben
 * in der Kopfzeile, sonst darunter über dem oberen Rand der Bühne; nie über Knöpfen im Fuß. Ohne sichtbaren Kopf: oben in der Mitte.
 * Gezeigt wird es, wenn das Brett fertig ist (main.ts: zeigNeuImHaus), nicht über einem Rätsel.
 * Verschwindet nach 4,5 s von selbst; Antippen öffnet das Haus.
 */
export function neuHinweis(app: HTMLElement, UI: Record<string, string>, id: string, oeffne: () => void): void {
  app.querySelector('.neuhaus')?.remove();
  const el = document.createElement('button');
  el.className = 'neuhaus';
  el.innerHTML = `<img src="${img('garderobe/' + id)}" alt=""><span class="nh-t"><small>${UI.neuImHaus}</small><b>${UI['d_' + id] ?? id}</b></span>`;
  app.appendChild(el);
  const kopf = app.querySelector<HTMLElement>('.kopf'), knopf = app.querySelector<HTMLElement>('#kPerl');
  const A = app.getBoundingClientRect();
  if (kopf && !kopf.hidden && knopf) {
    const k = kopf.getBoundingClientRect(), p = knopf.getBoundingClientRect();
    // Breiter Kopf (Rechner): links neben dem Perlen-Knopf in der Kopfzeile, Spitze nach rechts – liegt dann über nichts.
    // Ist die Lücke etwas zu schmal (langer Kapiteltitel), darf der Name umbrechen, statt dass der Hinweis über die Spur rutscht.
    const titel = kopf.querySelector<HTMLElement>('.kt')?.getBoundingClientRect();
    const luecke = titel ? p.left - titel.right - 28 : 0;
    if (luecke >= 200 && luecke < el.offsetWidth) el.style.maxWidth = `${Math.floor(luecke)}px`;
    const rand = 8, w = el.offsetWidth, h = el.offsetHeight;
    if (titel && luecke >= w) {
      el.style.top = `${Math.max(k.top + 4, p.top + p.height / 2 - h / 2) - A.top}px`; // umbrochen höher als der Knopf: nicht oben aus dem Bild
      el.style.right = `${A.right - p.left + 14}px`;
      el.classList.add('am-knopf', 'daneben');
      knopf.classList.remove('neu-da'); void knopf.offsetWidth; knopf.classList.add('neu-da');
    } else {
    el.style.maxWidth = '';
    const wu = el.offsetWidth;
    // rechte Kante unter dem Perlen-Knopf, aber nie über den Rand hinaus
    const rechts = Math.min(Math.max(A.right - p.right - 6, rand), A.width - wu - rand);
    el.style.top = `${k.bottom - A.top + 10}px`;
    el.style.right = `${rechts}px`;
    el.style.setProperty('--spitze', `${Math.min(Math.max(A.right - rechts - (p.left + p.width / 2), 18), wu - 18)}px`);
    el.classList.add('am-knopf');
    knopf.classList.remove('neu-da'); void knopf.offsetWidth; knopf.classList.add('neu-da');
    }
  }
  const weg = () => { el.classList.add('weg'); knopf?.classList.remove('neu-da'); setTimeout(() => el.remove(), 400); };
  el.onclick = () => { weg(); oeffne(); };
  setTimeout(weg, 4500);
}

/**
 * Konfetti und Feuerwerk liegen HINTER Text und Karten: als Kind der Bühne mit z-index -1
 * (die Bühne ist ein Container und damit eine eigene Ebene). So fällt nichts über Buchstaben, die das Kind gerade liest,
 * und beim nächsten Bildschirm verschwindet der Effekt mit der Bühne. Ohne Bühne (Haus der Lese-Raupe): wie bisher über allem.
 */
function effektHinten(host: HTMLElement, fx: HTMLElement): void {
  const b = host?.closest<HTMLElement>('#buehne');
  if (b) { fx.classList.add('hinten'); b.appendChild(fx); } else document.body.appendChild(fx);
}

/** Konfetti aus Perlen und Goldpapier (keine Sterne: Sterne sind im Buch Indizien) */
export function konfetti(host: HTMLElement): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'konfetti';
  fx.setAttribute('aria-hidden', 'true');
  const farben = ['#F4C243', '#FFE9A6', '#FFFFFF', '#7FC24E', '#E8473A', '#8FB4FF'];
  fx.innerHTML = [...Array(46)].map((_, i) => {
    const x = (i * 37) % 100, d = 1.6 + ((i * 13) % 10) / 10, v = (i % 7) * 0.09, rund = i % 3 === 0;
    return `<i style="left:${x}%;background:${rund ? 'var(--perle)' : farben[i % farben.length]};--d:${d}s;--v:${v}s;--r:${(i * 61) % 360}deg;--x:${((i * 29) % 60) - 30}px" class="${rund ? 'rund' : ''}"></i>`;
  }).join('');
  effektHinten(host, fx);
  setTimeout(() => fx.remove(), 3600);
}

/** Feuerwerk: Kreise aus Funken, die nacheinander aufgehen (Kreise, keine Sterne). `n` Raketen, `oben` = Anteil der Höhe */
export function feuerwerk(host: HTMLElement, n = 6, oben = 0.45): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'feuerwerk';
  fx.setAttribute('aria-hidden', 'true');
  const farben = [['#FFE082', '#F4C243'], ['#FFFFFF', '#C9D3F2'], ['#9FE07A', '#7FC24E'], ['#FF9A8C', '#E8473A'], ['#A9C4FF', '#5F86E8']];
  let html = '';
  for (let k = 0; k < n; k++) {
    const x = 12 + ((k * 41) % 76), y = 8 + ((k * 23) % Math.round(oben * 100)), v = k * 0.42, [c1, c2] = farben[k % farben.length];
    html += `<span class="fw" style="left:${x}%;top:${y}%;--v:${v}s">`;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, d = 46 + (k % 3) * 14;
      html += `<i style="--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;background:${i % 2 ? c1 : c2}"></i>`;
    }
    html += '</span>';
  }
  fx.innerHTML = html;
  effektHinten(host, fx);
  setTimeout(() => fx.remove(), (n * 0.42 + 2) * 1000);
}

/** kleine Herzchen über der Raupe, wenn sie gefüttert wird */
export function herzchen(host: HTMLElement): void {
  if (weniger()) return;
  const fx = document.createElement('div');
  fx.className = 'herzchen';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = [0, 1, 2].map((i) => `<i style="--v:${i * 0.15}s;--x:${(i - 1) * 22}px"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z" fill="#FF8FA8" stroke="#D2557A" stroke-width="1.500"/></svg></i>`).join('');
  host.appendChild(fx);
  setTimeout(() => fx.remove(), 1600);
}
