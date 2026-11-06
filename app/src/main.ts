import './styles.css';
import './stil2.css';
import { DATA, teil, img, type Block } from './data';
import { stand, speichern, perlen, geloestAnzahl, zuruecksetzen } from './store';
import { T, plain } from './text';
import { makeEngine, type Engine } from './engines';
import { App } from '@capacitor/app';

/* ====================== Schale ====================== */
const ICON_WAND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h3v3H7zM14 9h3M14 13h3M7 16h10"/></svg>`;
/** kleine Symbole der fünf Spielarten (Sticker im neuen Stil) */
const SPIEL_ICON: Record<string, string> = {
  zielfeld: '<svg class="si" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="10" r="2.6" fill="currentColor"/></svg>',
  slots: '<svg class="si" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/></svg>',
  faden: '<svg class="si" viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="5" r="2.5" fill="currentColor"/><circle cx="16" cy="15" r="2.5" fill="currentColor"/><path d="M5 6c6 0 4 8 10 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  reihe: '<svg class="si" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="12" width="4" height="6" fill="currentColor"/><rect x="8" y="8" width="4" height="10" fill="currentColor"/><rect x="14" y="3" width="4" height="15" fill="currentColor"/></svg>',
  urteil: '<svg class="si" viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="2" width="6" height="8" rx="2" fill="currentColor"/><rect x="3" y="10" width="14" height="4" rx="1" fill="currentColor"/><rect x="3" y="16" width="14" height="2" fill="currentColor"/></svg>',
};
const LUPE = `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" fill="#CFE6F5" stroke="#2D3138" stroke-width="1.5"/><path d="M11.3 11.3 L16 16" stroke="#2D3138" stroke-width="2" stroke-linecap="round"/></svg>`;

const app = document.getElementById('app')!;
app.innerHTML = `
<header class="app-header">
  <button class="hb" id="home" aria-label="Spurenwand">${ICON_WAND}</button>
  <div class="ttl"><b id="t1"></b><span id="t2"></span></div>
  <div class="moon" id="moon" role="img"></div>
  <div class="pearls" id="pearls" aria-label="Schimmer-Perlen"><i></i><span id="pc">0</span></div>
  <button class="hb sil" id="sil" role="switch" aria-label="Silben farbig"><span class="s-b">Le</span><span class="s-r">se</span></button>
  <button class="hb" id="aa" aria-label="Schrift und Silben" style="font-weight:800;font-size:19px">Aa</button>
</header>
<main class="reader-viewport"><div class="sheet" id="sheet"><div id="content"></div><div class="measure story" id="measure" aria-hidden="true"></div></div></main>
<nav class="app-foot"><div class="in" id="foot"></div></nav>`;
const $ = (id: string) => document.getElementById(id)!;
const sheetEl = $('sheet'), content = $('content'), measure = $('measure'), foot = $('foot');
const U = DATA.ui;

function applySettings() {
  const sw = document.getElementById('sil');
  if (sw) sw.setAttribute('aria-checked', String(stand.silben));
  document.documentElement.style.setProperty('--fs', stand.fs + 'px');
  document.documentElement.classList.toggle('silben', stand.silben);
  document.documentElement.classList.toggle('reduce', stand.ruhig);
  document.documentElement.classList.toggle('stil2', stand.stil2);
}
const ruhig = () => stand.ruhig || matchMedia('(prefers-reduced-motion: reduce)').matches;

function moonSVG(k: number) {
  const dash = `<circle cx="17" cy="17" r="12" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  if (!k) return `<svg viewBox="0 0 34 34">${dash}</svg>`;
  if (k >= 6) return `<svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="12" fill="#F5C542"/></svg>`;
  const off = 24 * (k / 6) + 0.5;
  return `<svg viewBox="0 0 34 34"><defs><mask id="mk"><rect width="34" height="34" fill="#fff"/><circle cx="${17 - off}" cy="17" r="12.2" fill="#000"/></mask></defs>${dash}<circle cx="17" cy="17" r="12" fill="#F5C542" mask="url(#mk)"/></svg>`;
}
function header(t1: string, t2 = DATA.kapitel ? plain(DATA.kapitel.titel) : '') {
  // „Kapitel 1 · Spur 3“: auf schmalen Telefonen nur „Spur 3“ (Kapitel steht darunter)
  const m = t1.match(/^(Kapitel \d+ · )(.+)$/);
  $('t1').innerHTML = m ? `<span class="kap">${m[1]}</span>${m[2]}` : t1;
  $('t2').textContent = t2;
  const n = geloestAnzahl();
  $('moon').innerHTML = moonSVG(n);
  $('moon').setAttribute('aria-label', `Mond: ${n} von 6 Spuren`);
  $('pc').textContent = String(perlen());
}
function glowMoon() {
  const m = $('moon'), p = $('pearls');
  for (const el of [m, p]) { el.classList.remove('glow', 'bump'); void el.offsetWidth; }
  m.classList.add('glow'); p.classList.add('bump');
}
function setView(html: string, f: string, opts: { scroll?: boolean; dir?: number; ev?: boolean; story?: boolean } = {}) {
  content.className = opts.story ? 'story' : '';
  // Art des Blatts für den neuen Stil: Lesen (Papier) oder Ermittlertisch (Holz)
  sheetEl.dataset.art = opts.story ? 'lesen' : html.includes('class="engine"') ? 'spiel' : html.includes('class="wand"') ? 'wand' : 'sonst';
  content.innerHTML = html;
  foot.innerHTML = f;
  sheetEl.classList.toggle('scroll', !!opts.scroll);
  sheetEl.classList.toggle('ev', !!opts.ev);
  sheetEl.scrollTop = 0;
  if (opts.dir && !ruhig()) {
    content.classList.remove('page-in', 'back'); void content.offsetWidth;
    content.classList.add('page-in'); if (opts.dir < 0) content.classList.add('back');
  }
}
function ort(view: string, t = 0, anker = '') { stand.ort = { view, teil: t, anker }; speichern(); }
const raupe = (mood: string, spur: number) => {
  // Fühler leuchten nur, wenn ein Rätsel in der Nähe ist (ILLUSTRATIONEN.md): ab dem Verschwinden des Mondes (Ende Spur 2)
  if (spur < 2 && (mood === 'denkt' || mood === 'tipp')) mood = mood === 'denkt' ? 'staunt' : 'lob';
  return img('raupe/' + mood);
};

/* ====================== Lesen (Blättern, D-06 / A-02 / A-13) ====================== */
interface Ev { ids: string[]; ask: string; near: string; miss: number; found: string[] | null; done: (s: string) => void }
const R = { teil: 0, sheets: [] as string[][], idx: 0, ev: null as Ev | null };
let paginated = '';

function headHTML(n: number) {
  const t = teil(n);
  if (n === 0) return `<div class="blk" data-b="head"><div class="illu"><img src="${img('vorgeschichte')}" alt="Die Lese-Raupe auf ihrem Blatt am Fenster"></div><div class="kicker">Vorgeschichte</div><div class="title">${T(t.titel)}</div></div>`;
  return `<div class="blk" data-b="head"><div class="illu"><img src="${img(t.spiel.bildVorher)}" alt=""></div><div class="kicker">Kapitel 1 · Spur ${n}</div><div class="title">${T(t.titel)}</div></div>`;
}
function blockHTML(b: Block) {
  const found = R.ev?.found;
  const sents = b.s.map((s, i) => `<span class="sent${found?.includes(`${b.id}-${i}`) ? ' found' : ''}" data-s="${b.id}-${i}">${T(s)}</span>`).join(' ');
  if (b.typ === 'th') return `<div class="thought" data-b="${b.id}"><img src="${img('raupe/lob')}" alt=""><div class="tx"><div class="lbl">Raupen-Gedanke</div>${sents}</div></div>`;
  return `<p data-b="${b.id}">${sents}</p>`;
}
function itemHTML(n: number, id: string) {
  if (id === 'head') return headHTML(n);
  return blockHTML(teil(n).blocks.find((b) => b.id === id)!);
}
/** Blöcke auf Blätter verteilen; ein Absatz wird nie geteilt */
function paginate(n: number) {
  sheetEl.dataset.art = 'lesen'; // gleiche Ränder beim Messen wie beim Anzeigen (neuer Stil)
  const cs = getComputedStyle(sheetEl);
  const maxH = sheetEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  measure.style.width = content.clientWidth + 'px';
  const ids = ['head', ...teil(n).blocks.map((b) => b.id)];
  const sheets: string[][] = [];
  let cur: string[] = [];
  measure.innerHTML = '';
  for (const id of ids) {
    measure.insertAdjacentHTML('beforeend', itemHTML(n, id));
    if (measure.scrollHeight > maxH + 1 && cur.length) {
      sheets.push(cur); cur = [id]; measure.innerHTML = itemHTML(n, id);
    } else cur.push(id);
  }
  if (cur.length) sheets.push(cur);
  measure.innerHTML = '';
  R.sheets = sheets;
  paginated = `${n}|${stand.fs}|${sheetEl.clientWidth}x${sheetEl.clientHeight}`;
}
function lesen(n: number, opts: { anker?: string; letzte?: boolean; dir?: number } = {}) {
  R.teil = n;
  paginate(n);
  let idx = 0;
  if (opts.letzte) idx = R.sheets.length - 1;
  else if (opts.anker) idx = Math.max(0, R.sheets.findIndex((s) => s.includes(opts.anker!)));
  R.idx = idx;
  zeigeBlatt(opts.dir ?? 0);
}
function zeigeBlatt(dir: number) {
  const n = R.teil, s = R.sheets[R.idx];
  const last = R.idx === R.sheets.length - 1;
  header(n === 0 ? 'Vorgeschichte' : `Kapitel 1 · Spur ${n}`, n === 0 ? 'Lese-Fall' : undefined);
  if (!R.ev) ort('read', n, s[0]);
  const html = s.map((id) => itemHTML(n, id)).join('');
  const prev = `<button class="nav" data-a="prev" ${R.idx === 0 ? 'disabled' : ''} aria-label="Vorheriges Blatt">‹</button>`;
  let f: string;
  if (R.ev) {
    const E = R.ev;
    const mid = E.found ? `<button class="btn cta" data-a="evback">Zurück zum Spiel</button>` : `<div class="banner" id="banner"><span>${E.miss >= 2 ? `<b>${T(U.hilfe)}</b> ${T(E.near)}` : T(E.ask)}</span></div>`;
    f = prev + mid + `<button class="nav" data-a="next" ${last ? 'disabled' : ''} aria-label="Nächstes Blatt">›</button>`;
  } else {
    const pos = R.sheets.length > 1 ? (R.idx / (R.sheets.length - 1)) * 100 : 0;
    const dots = `<div class="zweig" role="img" aria-label="Blatt ${R.idx + 1} von ${R.sheets.length}"><span class="ast"></span>${R.sheets.map((_, i) => `<i class="${i <= R.idx ? 'on' : ''}" style="left:${R.sheets.length > 1 ? (i / (R.sheets.length - 1)) * 100 : 0}%"></i>`).join('')}<img class="kriech" src="${img('frei/raupe_lob')}" alt="" style="left:${pos}%"></div>`;
    let next = `<button class="nav" data-a="next" aria-label="Nächstes Blatt">›</button>`;
    if (last) {
      const label = n === 0 ? 'Los geht’s' : game && game.spur === n ? 'Zurück zum Spiel' : stand.geloest[n] ? 'Zur Spurenwand' : 'Zum Spiel';
      next = `<button class="btn cta" data-a="end">${label} ›</button>`;
    }
    f = prev + (last ? '' : dots) + next;
  }
  const ecke = R.ev ? '' : `<div class="raupe-ecke ${last ? 'winkt' : ''}" aria-hidden="true"><img src="${img(last ? 'frei/raupe_lob' : 'frei/raupe_staunt')}" alt="">${last && n > 0 ? '<span class="sprech">Los, ermitteln!</span>' : ''}</div>`;
  setView(html + ecke, f, { dir, ev: !!R.ev, story: true });
  // A-13: passt ein einzelner Block bei großer Schrift nicht, darf das Blatt ausnahmsweise rollen
  sheetEl.classList.toggle('scroll', content.scrollHeight > sheetEl.clientHeight);
}
function blaettern(d: number) {
  const n = R.idx + d;
  if (n < 0) return;
  if (n >= R.sheets.length) { if (!R.ev) endeLesen(); return; }
  R.idx = n; zeigeBlatt(d);
}
function endeLesen() {
  const n = R.teil;
  if (n === 0) { stand.vorgeschichte = true; speichern(); lesen(1, { dir: 1 }); return; }
  if (game && game.spur === n) { game.show(1); return; }
  if (stand.geloest[n]) { wand(); return; }
  game = new Spiel(n, false); game.show(1);
}

/* Beweis suchen: immer ab dem ersten Blatt (A-11) */
function beweisSuchen(n: number, E: Ev) {
  R.ev = E;
  lesen(n, { dir: -1 });
}
content.addEventListener('click', (e) => {
  const s = (e.target as HTMLElement).closest<HTMLElement>('.sent');
  if (!s || !R.ev || R.ev.found || content.querySelector('.sent.found')) return;
  const E = R.ev;
  if (E.ids.includes(s.dataset.s!)) {
    // alle Beweissätze aus demselben Absatz gehören zusammen (z. B. Wolke + „Links daneben …“)
    const blk = s.dataset.s!.replace(/-\d+$/, '');
    E.found = E.ids.filter((id) => id.replace(/-\d+$/, '') === blk);
    zeigeBlatt(0); return;
  }
  E.miss++;
  if (E.miss === 2) {
    const blk = E.ids[0].replace(/-\d+$/, '');
    const ziel = R.sheets.findIndex((sh) => sh.includes(blk));
    if (ziel >= 0 && ziel !== R.idx) { const d = ziel > R.idx ? 1 : -1; R.idx = ziel; zeigeBlatt(d); return; }
  }
  s.classList.remove('nope'); void s.offsetWidth; s.classList.add('nope');
  const b = document.getElementById('banner');
  if (b) b.innerHTML = `<span>${E.miss >= 2 ? `<b>${T(U.hilfe)}</b> ${T(E.near)}` : T(U.beweisNein)}</span>`;
});

foot.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
  if (!a) return;
  if (a === 'prev') blaettern(-1);
  else if (a === 'next') blaettern(1);
  else if (a === 'end') endeLesen();
  else if (a === 'evback') {
    const E = R.ev!; R.ev = null;
    E.done(E.found!.map((id) => { const [, bid, k] = id.match(/^(.*)-(\d+)$/)!; return teil(R.teil).blocks.find((b) => b.id === bid)!.s[+k]; }).join(' '));
  } else actions[a]?.();
});

/* Wischen = Blättern (nur beim Lesen) */
let sx: number | null = null, sy = 0;
sheetEl.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
sheetEl.addEventListener('pointerup', (e) => {
  if (sx === null || !isReading()) { sx = null; return; }
  const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) blaettern(dx < 0 ? 1 : -1);
});
const isReading = () => !!content.querySelector('[data-b]');

/* ====================== Spiel (Zyklus einer Spur) ====================== */
type Phase = 'select' | 'wrong' | 'retry' | 'help' | 'explain' | 'stepdone' | 'won';
let game: Spiel | null = null;
const actions: Record<string, () => void> = {};

class Spiel {
  data: any;
  step = 0;
  phase: Phase = 'select';
  engine!: Engine;
  target: any = null;
  quote = '';
  stepPearls: number[] = [];
  falsch = 0;
  gained = 0;
  mitHilfe = false;
  neu = false;
  constructor(public spur: number, public replay: boolean) {
    this.data = teil(spur).spiel;
    this.startStep();
  }
  get st() { return this.data.schritte[this.step]; }
  startStep() { this.engine = makeEngine(this.st); this.phase = 'select'; this.target = null; this.quote = ''; }
  show(dir = 0) {
    if (this.phase !== 'won') ort('game', this.spur);
    header(`Kapitel 1 · Spur ${this.spur}`);
    const st = this.st, d = this.data, n = d.schritte.length;
    const steps = n > 1 ? `<span class="steps">${d.schritte.map((_: any, i: number) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</span>` : '';
    const notiz = (this.phase === 'select' || this.phase === 'retry' || this.phase === 'help' ? `<p class="intro">${T(st.intro)}</p>` : '')
      + (st.frage && this.phase !== 'won' ? `<p class="q">${T(st.frage)}</p>` : '');
    const html = `<div class="task">
      <div class="case">${LUPE}<span class="dea">Dein Ermittlerauftrag ·</span><span class="name">${SPIEL_ICON[st.motor] ?? ''}${T(d.spiel)}</span>${steps}</div>
      ${this.fb()}
      ${notiz ? `<div class="notiz">${notiz}</div>` : ''}
      <div class="engine"></div></div>`;
    let primary: string;
    if (this.phase === 'wrong') primary = `<button class="btn cta" data-a="beweis">${LUPE}Im Text nachsehen</button>`;
    else if (this.phase === 'explain') primary = `<button class="btn cta" data-a="verstanden">Verstanden</button>`;
    else if (this.phase === 'stepdone') primary = `<button class="btn cta" data-a="weiter">Weiter ›</button>`;
    else if (this.phase === 'won') primary = this.replay ? `<button class="btn cta" data-a="wand">Zur Spurenwand ›</button>` : `<button class="btn cta" data-a="sichern">Spur sichern ›</button>`;
    else primary = `<button class="btn cta" data-a="pruefen" ${this.engine.complete() ? '' : 'disabled'}>Prüfen</button>`;
    const second = this.phase === 'won' ? `<button class="btn klein" data-a="nochmalLesen">Noch einmal lesen</button>` : `<button class="btn" data-a="geschichte">Zur Geschichte</button>`;
    setView(html, second + primary, { scroll: true, dir });
    this.mountEngine();
  }
  mountEngine() {
    const old = content.querySelector('.engine')!;
    const el = document.createElement('div');
    el.className = 'engine';
    el.innerHTML = this.engine.html();
    old.replaceWith(el);
    this.engine.bind(el, () => {
      this.mountEngine();
      const p = foot.querySelector<HTMLButtonElement>('[data-a="pruefen"]');
      if (p) p.disabled = !this.engine.complete();
    });
  }
  fb(): string {
    const s = this.spur;
    const bubble = (mood: string, text: string, cls = '') => `<div class="fb ${cls}" role="status"><img src="${raupe(mood, s)}" alt="">${text}</div>`;
    const t = this.target;
    switch (this.phase) {
      case 'wrong': return bubble('denkt', `<span>${T(U.falsch[this.falsch % U.falsch.length])}</span>`);
      case 'retry': return bubble('tipp', `<span>${T(U.deinBeweis)} <span class="quote">${T(this.quote)}</span> ${T(U.nochmal)}</span>`);
      case 'help': return bubble('tipp', `<span><b>${T(U.hilfe)}</b> ${T(t?.help ?? this.st.help)}</span>`, 'help');
      case 'explain': return bubble('lob', `<span>${T(this.st.explain ?? '')}</span>`, 'help');
      case 'stepdone': return bubble('lob', `<span><b>${T(this.st.zwischen ?? U.siegVoll)}</b></span>`);
      case 'won': {
        const d = this.data, voll = !this.mitHilfe;
        return `<div class="sieg-box" role="status"><div class="win-top"><img class="r" src="${raupe('klatscht', s)}" alt="Die Lese-Raupe klatscht"><img class="k" src="${img(d.kind)}" alt=""></div>
          <div class="big">${T(voll ? U.siegVoll : U.siegHalb)}</div>${voll ? '' : `<p>${T(U.siegHalbText)}</p>`}<p>${T(d.sieg)}</p>
          ${this.neu ? `<span class="gain">${'<i></i>'.repeat(this.gained)}+${this.gained} Schimmer-${this.gained > 1 ? 'Perlen' : 'Perle'}</span>` : ''}</div>`;
      }
      default: return '';
    }
  }
  pruefen() {
    const e = this.engine;
    if (!e.complete()) return;
    if (e.correct()) { this.stepFertig(this.phase === 'help' ? 1 : 2); return; }
    if (this.phase === 'select') {
      const w = e.wrongItem();
      this.target = w ? { ...this.st.proDing[w] } : { beweis: this.st.beweis, ask: this.st.ask, near: this.st.near, help: this.st.help };
      this.phase = 'wrong'; e.locked = true; this.falsch++;
    } else if (this.phase === 'retry') {
      this.phase = 'help'; e.reset();
    } else if (this.phase === 'help') {
      this.phase = 'explain'; e.solve();
    }
    this.show();
  }
  stepFertig(p: number) {
    this.stepPearls[this.step] = p;
    this.engine.locked = true; this.engine.won = true;
    if (this.step < this.data.schritte.length - 1) { this.phase = 'stepdone'; this.show(); return; }
    this.gained = 2; // A-05: immer +2 pro Spur, mit oder ohne Hilfe
    this.mitHilfe = Math.min(...this.stepPearls) < 2;
    this.neu = !this.replay && !stand.geloest[this.spur];
    if (this.neu) { stand.geloest[this.spur] = this.gained; speichern(); glowMoon(); }
    this.phase = 'won';
    this.show();
    if (stand.stil2 && !ruhig()) konfetti();
    ort(this.replay || stand.buchstaben.includes(this.spur) ? 'wand' : 'pinsel', this.spur);
  }
}
actions.pruefen = () => game?.pruefen();
actions.sichern = () => { const n = game!.spur; game = null; wand(n); };
actions.nochmalLesen = () => { const n = game!.spur; game = null; lesen(n, { dir: -1 }); };
actions.weiter = () => { if (!game) return; game.step++; game.startStep(); game.show(1); };
actions.verstanden = () => game?.stepFertig(1);
actions.geschichte = () => { if (game) lesen(game.spur, { letzte: true, dir: -1 }); };
actions.beweis = () => {
  const g = game!; const t = g.target;
  beweisSuchen(g.spur, {
    ids: t.beweis, ask: t.ask ?? g.st.ask, near: t.near ?? g.st.near, miss: 0, found: null,
    done: (sentence) => { g.quote = sentence; g.phase = 'retry'; g.engine.reset(); g.show(1); },
  });
};

/** Papierschnipsel-Konfetti in der Palette (nur transform/opacity) */
function konfetti() {
  const box = document.createElement('div');
  box.className = 'konfetti';
  const farben = ['#F4C243', '#1D3F9E', '#E8473A', '#7DCB3A', '#FFFDF8', '#2C4176'];
  box.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${farben[i % farben.length]};animation-delay:${Math.random() * 0.35}s;--dx:${(Math.random() - 0.5) * 120}px;--r:${(Math.random() - 0.5) * 720}deg"></i>`).join('');
  sheetEl.appendChild(box);
  setTimeout(() => box.remove(), 2200);
}

/* ====================== Spurenwand mit Spuren abpinseln ====================== */
function wortHTML(neu = -1) {
  const gw = DATA.geheimwort;
  const offen = new Set(gw.reihenfolge.filter((r: any) => stand.buchstaben.includes(r.spur)).map((r: any) => r.pos));
  return `<div class="wort" aria-label="Geheimwort">${[...gw.wort].map((c: string, i: number) => `<span class="${offen.has(i) ? '' : 'leer'} ${i === neu ? 'neu' : ''}">${offen.has(i) ? c : ''}</span>`).join('')}</div>`;
}

/** roter Faden von Nadel zu Nadel in der Reihenfolge der Spuren, leicht durchhängend; der neueste spannt sich */
function faeden(neu = 0) {
  const wand = content.querySelector<HTMLElement>('.wand');
  const svg = wand?.querySelector('svg.faden-svg');
  if (!wand || !svg) return;
  const w = wand.getBoundingClientRect();
  const pins = [...wand.querySelectorAll<HTMLElement>('.fund:not(.staubig) .nr')].map((n) => {
    const r = n.getBoundingClientRect();
    return { spur: +n.closest<HTMLElement>('[data-fund]')!.dataset.fund!, x: r.left + r.width / 2 - w.left - 14, y: r.top + r.height / 2 - w.top - 14 };
  }).sort((a, b) => a.spur - b.spur);
  svg.innerHTML = pins.slice(1).map((b, i) => {
    const a = pins[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const d = `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 10 + len * 0.08} ${b.x} ${b.y}`;
    return `<path d="${d}" class="${b.spur === neu ? 'neu' : ''}" style="--l:${Math.ceil(len * 1.2)}"/>`;
  }).join('');
}
window.addEventListener('resize', () => requestAnimationFrame(() => faeden()));

/** Staub auf einer Karte: mit dem Pinsel wegwischen (≥ 55 % frei), dann `fertig` */
function staub(box: HTMLElement, fertig: () => void) {
  const cv = document.createElement('canvas');
  cv.className = 'staub';
  cv.setAttribute('aria-label', 'Staub – mit dem Finger wegwischen');
  box.appendChild(cv);
  const r = box.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.scale(dpr, dpr);
  g.fillStyle = '#CDBB98'; g.fillRect(0, 0, r.width, r.height);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = ['#BFAA82', '#D9CAA8', '#B39C74', '#E2D5B8'][i % 4];
    g.globalAlpha = 0.5; g.beginPath(); g.arc(Math.random() * r.width, Math.random() * r.height, 1 + Math.random() * 3.5, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out';
  let strokes = 0, done = false, last: number[] | null = null;
  const brush = document.createElement('div');
  brush.className = 'brush';
  brush.innerHTML = `<svg viewBox="0 0 44 44"><path d="M30 4l10 10-14 14-10-10z" fill="#8A5A44"/><path d="M16 18l10 10-6 6c-4 4-12 6-16 6 0-4 2-12 6-16z" fill="#F4C243" stroke="#D9A21E"/></svg>`;
  const check = () => {
    if (done) return;
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 29) { n++; if (d[i] < 40) clear++; }
    if (clear / n > 0.55) { done = true; cv.classList.add('weg'); brush.remove(); fertig(); }
  };
  const wipe = (x: number, y: number) => {
    g.lineWidth = 34; g.lineCap = 'round';
    g.beginPath(); g.moveTo(last ? last[0] : x, last ? last[1] : y); g.lineTo(x, y); g.stroke();
    last = [x, y];
    if (++strokes % 5 === 0) check();
  };
  const at = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); brush.style.left = e.clientX + 'px'; brush.style.top = e.clientY + 'px'; wipe(e.clientX - b.left, e.clientY - b.top); };
  // Pinseln darf überall auf der Karte beginnen (auch am Rand oder an der Nadel)
  box.addEventListener('pointerdown', (e) => { if (done) return; e.preventDefault(); box.setPointerCapture(e.pointerId); document.body.appendChild(brush); last = null; at(e); });
  box.addEventListener('pointermove', (e) => { if (!done && box.hasPointerCapture(e.pointerId)) at(e); });
  box.addEventListener('pointerup', () => { last = null; brush.remove(); check(); });
}

/** Spurenwand: Funde, Geheimwort, Weiter. Nach einer Spur oben das Bild „nachher“. */
function wand(nach = 0) {
  game = null; R.ev = null;
  ort('wand', nach);
  header('Spurenwand');
  const spuren = DATA.spuren;
  const staubig = !!nach && stand.geloest[nach] !== undefined && !stand.buchstaben.includes(nach);
  const funde = spuren.map((s: any) => {
    const ok = stand.geloest[s.spur] !== undefined;
    return ok ? `<button class="fund ${s.spur === nach && !staubig ? 'neu' : ''} ${s.spur === nach && staubig ? 'staubig' : ''}" data-fund="${s.spur}" aria-label="Spur ${s.spur}: ${plain(s.spiel.fund.text)}"><span class="nr"></span><img src="${img(s.spiel.fund.bild)}" alt=""><span class="ft">${T(s.spiel.fund.text)}</span><span class="fz">${T(s.spiel.fund.fazit)}</span></button>`
      : `<div class="fund zu">Spur ${s.spur}</div>`;
  }).join('');
  const naechste = [1, 2, 3, 4, 5, 6].find((n) => stand.geloest[n] === undefined);
  const offenPinsel = [1, 2, 3, 4, 5, 6].find((n) => n !== nach && stand.geloest[n] !== undefined && !stand.buchstaben.includes(n));
  const bild = nach ? `<div class="illu"><img src="${img(teil(nach).spiel.bildNachher)}" alt="Spur ${nach}: nachher"></div>`
    : `<div style="text-align:center"><img src="${img('kapitel_1')}" alt="Kapitel 1: Wo ist der Mond?" style="width:min(220px,60%);mix-blend-mode:multiply"></div>`;
  const html = `<div class="task">${bild}<div class="kicker" style="margin-top:10px">${U.wand ? T(U.wand) : ''}</div>
    ${staubig ? `<p class="pinsel-tipp" id="pmsg">${T(U.pinseln)}</p>` : ''}
    <div class="wand brett" style="border-image-source:url('${img('spurenwand_board')}')">${funde}<svg class="faden-svg" aria-hidden="true"></svg></div>${wortHTML()}
    ${geloestAnzahl() && !staubig ? `<p style="font-size:15px;color:var(--muted);text-align:center">${T(U.wandTipp)}</p>` : ''}</div>`;
  let f: string;
  if (offenPinsel) { actions.go = () => wand(offenPinsel); f = `<button class="btn cta" data-a="go">Spur ${offenPinsel} abpinseln ›</button>`; }
  else if (!naechste) { actions.go = stand.tresorOffen ? kapitel2 : tresor; f = `<button class="btn cta" data-a="go" ${staubig ? 'disabled' : ''}>${stand.tresorOffen ? 'Weiter zu Kapitel 2' : 'Zum Mondtresor'} ›</button>`; }
  else if (nach || !stand.ort.anker) { actions.go = () => lesen(naechste, { dir: 1 }); f = `<button class="btn cta" data-a="go" ${staubig ? 'disabled' : ''}>${naechste === 1 && !nach ? 'Los geht’s' : `Weiter zu Spur ${naechste}`} ›</button>`; }
  else { actions.go = () => lesen(naechste, { dir: 1 }); f = `<button class="btn cta" data-a="go">Weiterlesen: Spur ${naechste} ›</button>`; }
  setView(html, f, { scroll: true, dir: 1 });
  requestAnimationFrame(() => faeden(nach && !staubig ? nach : 0));
  content.querySelectorAll<HTMLElement>('[data-fund]').forEach((b) => {
    // Menü nur, wenn der Finger auf der Karte (nicht im Staub) angefangen hat
    let vonStaub = false;
    b.addEventListener('pointerdown', () => { vonStaub = b.classList.contains('staubig'); });
    b.addEventListener('click', () => { if (vonStaub || b.classList.contains('staubig')) { vonStaub = false; return; } fundMenu(+b.dataset.fund!); });
  });
  if (staubig) {
    const card = content.querySelector<HTMLElement>(`[data-fund="${nach}"]`)!;
    card.scrollIntoView({ block: 'center' });
    requestAnimationFrame(() => staub(card, () => {
      if (!stand.buchstaben.includes(nach)) { stand.buchstaben.push(nach); speichern(); }
      card.classList.remove('staubig'); card.classList.add('neu');
      setTimeout(() => faeden(nach), 250);
      const pos = DATA.geheimwort.reihenfolge.find((r: any) => r.spur === nach).pos;
      content.querySelector('.wort')!.outerHTML = wortHTML(pos);
      if (stand.stil2 && !ruhig()) {
        const slot = content.querySelectorAll<HTMLElement>('.wort span')[pos];
        const a = card.getBoundingClientRect(), b = slot.getBoundingClientRect();
        const fl = document.createElement('div');
        fl.className = 'flug'; fl.textContent = DATA.geheimwort.wort[pos];
        fl.style.left = b.left + 'px'; fl.style.top = b.top + 'px';
        fl.style.setProperty('--fx', `${a.left + a.width / 2 - b.left - 20}px`); fl.style.setProperty('--fy', `${a.top + a.height / 2 - b.top - 24}px`);
        document.body.appendChild(fl); slot.style.opacity = '0';
        setTimeout(() => { fl.remove(); slot.style.opacity = ''; }, 900);
      }
      const m = document.getElementById('pmsg'); if (m) m.innerHTML = T(U.buchstabe);
      foot.querySelectorAll<HTMLButtonElement>('[data-a="go"]').forEach((b) => (b.disabled = false));
      ort('wand', nach);
    }));
  }
}
function fundMenu(spur: number) {
  const bg = document.createElement('div');
  bg.className = 'pop-bg';
  bg.style.alignItems = 'center'; bg.style.justifyContent = 'center';
  const f = teil(spur).spiel.fund;
  const zitat = f.beweis.map((id: string) => { const [, bid, k] = id.match(/^(.*)-(\d+)$/)!; return teil(spur).blocks.find((b) => b.id === bid)!.s[+k]; }).join(' ');
  bg.innerHTML = `<div class="pop fazit" role="dialog" aria-label="Spur ${spur}"><div class="kicker">Spur ${spur} · ${T(f.text)}</div>
    <img src="${img(f.bild)}" alt=""><p class="big">${T(f.fazit)}</p>
    <p class="beleg"><span class="kicker">Im Text steht:</span><br>„${T(zitat.replace(/^„|“$/g, ''))}“</p><div class="menu">
    <button class="btn cta" data-m="zu">Schließen</button>
    <button class="btn" data-m="lesen">Noch einmal lesen</button>
    <button class="btn klein" data-m="spiel">Spiel noch einmal spielen</button></div></div>`;
  document.body.appendChild(bg);
  bg.addEventListener('click', (e) => {
    const m = (e.target as HTMLElement).closest<HTMLElement>('[data-m]')?.dataset.m;
    if (e.target !== bg && !m) return;
    bg.remove();
    if (m === 'spiel') { game = new Spiel(spur, true); game.show(1); }
    if (m === 'lesen') lesen(spur, { dir: 1 });
  });
}

/* ====================== Mondtresor ====================== */
function tresor() {
  ort('tresor');
  header('Mondtresor');
  const gw = DATA.geheimwort, innen = gw.innen;
  const wort: string = gw.wort;
  const slotsX = [27.1, 36.3, 45.5, 54.6, 63.8, 73.0];
  const opts = [...innen.optionen].sort(() => Math.random() - 0.5);
  let gewaehlt: string | null = null, falsch = false;
  const fertig = () => stand.tresorOffen;
  const render = (sofort: boolean) => {
    const slots = slotsX.map((x, i) => `<span class="slot ${sofort ? '' : 'fliegt'}" style="left:${x}%;animation-delay:${i * 0.28}s">${wort[i]}</span>`).join('');
    const frage = fertig() ? `<div class="big">${T(U.geschafft)}</div><p>${T(gw.haken)}</p><span class="gain"><i></i>${perlen()} Schimmer-Perlen</span>`
      : `<div class="innen ${sofort ? '' : 'spaeter'}"><p class="q">${T(innen.frage)}</p><div class="opts">${opts.map((o: any) => `<button class="opt" data-io="${o.id}" aria-pressed="${gewaehlt === o.id}">${T(o.label)}</button>`).join('')}</div>
         ${falsch ? `<div class="fb help"><img src="${raupe('tipp', 6)}" alt=""><span>${T(innen.falsch)}</span></div><ul class="fazit-liste">${DATA.spuren.map((sp: any) => `<li>${T(sp.spiel.fund.fazit)}</li>`).join('')}</ul>` : ''}</div>`;
    const html = `<div class="task center"><div class="kicker">${T(U.tresorTitel)}</div>
      <p class="q">${T(gw.frage)}</p>
      <div class="tresor ${sofort ? 'open' : 'oeffnet'}" id="tr"><img src="${img('mondtresor_zu')}" alt="Der Mondtresor"><img class="auf" src="${img('mondtresor_auf')}" alt="">
        <div class="door"><div class="inside" style="background-image:url('${img('k2_s7')}')"></div></div>${slots}</div>${frage}</div>`;
    const f = fertig() ? `<button class="btn" data-a="fertig">Für heute fertig</button><button class="btn cta" data-a="kap2">Weiter zu Kapitel 2 ›</button>`
      : `<button class="btn" data-a="wand">Spurenwand</button>`;
    setView(html, f, { scroll: true });
    if (!sofort) {
      // Buchstaben fliegen in die Felder, dann geht die Tür von selbst auf (Ritual)
      const tr = $('tr');
      setTimeout(() => tr.classList.add('open'), ruhig() ? 0 : 6 * 280 + 400);
    }
    content.querySelectorAll<HTMLElement>('[data-io]').forEach((b) => b.addEventListener('click', () => {
      gewaehlt = b.dataset.io!;
      if (gewaehlt === innen.loesung) { stand.tresorOffen = true; speichern(); glowMoon(); }
      else falsch = true;
      render(true);
    }));
  };
  render(fertig());
}

function kapitel2() {
  ort('kapitel2');
  header('Kapitel 2', 'Ein Tablett für alle');
  const html = `<div class="task center"><div class="illu"><img src="${img('k2_s7')}" alt=""></div>
    <div class="win-top"><img class="r" src="${img('raupe/staunt')}" alt=""></div>
    <div class="big">${T(U.bald)}</div><p>${T(DATA.geheimwort.haken)}</p></div>`;
  setView(html, `<button class="btn cta" data-a="fertig">Für heute fertig</button>`, { scroll: true, dir: 1 });
}
actions.kap2 = kapitel2;
actions.fertig = () => cover();

/* ====================== Titelbild ====================== */
function cover() {
  header('Lese-Fall', 'Spur im Text');
  const weiter = stand.ort.view !== 'cover' || stand.vorgeschichte;
  const html = `<div class="cover"><div class="art" style="background-image:url('${img('cover')}')" role="img" aria-label="Titelbild: Die Lese-Raupe mit Lupe"></div>
    <h1>Lese-Fall</h1><div class="sub">Fall ${DATA.fall.nr}: ${T(DATA.fall.titel)}</div></div>`;
  setView(html, `${weiter ? '<button class="btn" data-a="wand">Spurenwand</button>' : ''}<button class="btn cta" data-a="los">${weiter ? 'Weiterlesen' : 'Los geht’s'} ›</button>`);
}
actions.los = () => resume(true);
actions.wand = () => wand();

/* ====================== Einstellungen (Aa) ====================== */
const SIZES = [18, 20, 23, 26];
/* Elternschloss: Rechenaufgabe (z. B. 7 · 14, für Zweitklässler zu schwer), dann Bestätigung */
type Lock = { a: number; b: number; ok?: boolean; falsch?: boolean } | null;
let lock: Lock = null;
function neueAufgabe(): Lock {
  return { a: 6 + Math.floor(Math.random() * 4), b: 12 + Math.floor(Math.random() * 5) };
}
function resetHTML() {
  if (!lock) return `<button class="reset" data-reset>Fortschritt löschen (für Eltern)</button>`;
  if (!lock.ok) return `<form class="eltern" id="elternform"><label for="elternzahl" style="display:block;min-height:0">Für Eltern: Wie viel ist ${lock.a} · ${lock.b}?</label><div class="zahl"><input id="elternzahl" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="3"><button class="btn cta" type="submit" data-antwort>OK</button></div>${lock.falsch ? '<p class="falsch">Das stimmt nicht.</p>' : ''}<button class="reset" type="button" data-abbrechen>Abbrechen</button></form>`;
  return `<div class="eltern"><p>Wirklich alles löschen? Perlen, Spuren und Buchstaben sind dann weg.</p><div class="menu"><button class="btn" data-loeschen>Ja, alles löschen</button><button class="btn cta" data-abbrechen>Nein, behalten</button></div></div>`;
}
$('aa').addEventListener('click', () => {
  lock = null;
  const bg = document.createElement('div');
  bg.className = 'pop-bg';
  const draw = () => {
    bg.innerHTML = `<div class="pop" role="dialog" aria-label="Einstellungen">
      <h3>Schriftgröße</h3><div class="sizes">${SIZES.map((s) => `<button data-fs="${s}" aria-pressed="${stand.fs === s}" style="font-size:${s - 2}px">A</button>`).join('')}</div>
      <p class="demo story">${T('Die Le|se-|Rau|pe schaut ge|nau hin.')}</p>
      <label>Silben farbig<button class="switch" role="switch" data-sw="silben" aria-checked="${stand.silben}" aria-label="Silben farbig"></button></label>
      <label>Bewegung reduzieren<button class="switch" role="switch" data-sw="ruhig" aria-checked="${stand.ruhig}" aria-label="Bewegung reduzieren"></button></label>
      <label>Neuer Stil (Test)<button class="switch" role="switch" data-sw="stil2" aria-checked="${stand.stil2}" aria-label="Neuer Stil (Test)"></button></label>
      <button class="btn" data-vg style="width:100%;margin-top:8px">Vorgeschichte noch einmal lesen</button>
      ${resetHTML()}
      <div style="text-align:right"><button class="btn cta" data-close style="flex:none;min-width:120px">Fertig</button></div></div>`;
  };
  const pruefeEltern = () => {
    const v = +((bg.querySelector('#elternzahl') as HTMLInputElement | null)?.value ?? '');
    if (lock) lock = v === lock.a * lock.b ? { ...lock, ok: true } : { ...lock, falsch: true };
    draw();
    (bg.querySelector('#elternzahl') as HTMLInputElement | null)?.focus();
  };
  bg.addEventListener('submit', (e) => { e.preventDefault(); pruefeEltern(); });
  draw();
  document.body.appendChild(bg);
  bg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const fs = t.closest<HTMLElement>('[data-fs]'), sw = t.closest<HTMLElement>('[data-sw]');
    if (fs) { stand.fs = +fs.dataset.fs!; }
    else if (sw) { const k = sw.dataset.sw as 'silben' | 'ruhig' | 'stil2'; stand[k] = !stand[k]; }
    else if (t.closest('[data-vg]')) { bg.remove(); R.ev = null; game = null; lesen(0, { dir: -1 }); return; }
    else if (t.closest('[data-reset]')) { lock = neueAufgabe(); draw(); return; }
    else if (t.closest('[data-antwort]')) { e.preventDefault(); pruefeEltern(); return; } else if (t.closest('[data-loeschen]')) { zuruecksetzen(); bg.remove(); applySettings(); game = null; cover(); return; }
    else if (t.closest('[data-abbrechen]')) { lock = null; draw(); return;
    } else if (t === bg || t.closest('[data-close]')) { bg.remove(); return; }
    else return;
    speichern(); applySettings(); draw(); refresh();
  });
});

/** nach Schrift-/Größenänderung: Blätter neu verteilen, Lesestelle (Anker) behalten */
function refresh() {
  if (isReading()) {
    const anker = R.sheets[R.idx]?.[0];
    const ev = R.ev;
    paginate(R.teil);
    R.idx = Math.max(0, R.sheets.findIndex((s) => s.includes(anker)));
    R.ev = ev;
    zeigeBlatt(0);
  } else if (game && stand.ort.view === 'game') game.show();
}
let rt = 0;
window.addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { if (isReading() && paginated !== `${R.teil}|${stand.fs}|${sheetEl.clientWidth}x${sheetEl.clientHeight}`) refresh(); }, 150); });
// Silben-Schalter in der Kopfzeile: immer sichtbar, ein Tipp an/aus (mit „Aa“ abgeglichen)
$('sil').addEventListener('click', () => { stand.silben = !stand.silben; speichern(); applySettings(); refresh(); });
$('home').addEventListener('click', () => { R.ev = null; wand(); });

/* ====================== Start ====================== */
function resume(fromCover = false) {
  const o = stand.ort;
  if (o.view === 'read') return lesen(o.teil, { anker: o.anker });
  if (o.view === 'game' && o.teil) { game = new Spiel(o.teil, !!stand.geloest[o.teil]); return game.show(); }
  if (o.view === 'pinsel' && o.teil && !stand.buchstaben.includes(o.teil)) return wand(o.teil);
  if (o.view === 'kapitel2') return kapitel2();
  if (o.view === 'tresor') return tresor();
  if (o.view === 'wand') return wand();
  if (fromCover) return stand.vorgeschichte ? wand() : lesen(0, { dir: 1 });
  cover();
}
applySettings();
document.fonts.ready.then(() => cover());

/* ====================== Android-Zurück ====================== */
/** Zurück: Fenster schließen → Beweissuche beenden → vom Spiel zur Geschichte → Blatt zurück → Spurenwand → Titel → App schließen */
function zurueck() {
  const pop = document.querySelector('.pop-bg');
  if (pop) { pop.remove(); return; }
  if (R.ev && game) { R.ev = null; game.show(-1); return; }
  if (game && content.querySelector('.engine')) { lesen(game.spur, { letzte: true, dir: -1 }); return; }
  if (isReading()) { if (R.idx > 0) blaettern(-1); else if (R.teil > 0 && geloestAnzahl()) wand(); else cover(); return; }
  if (content.querySelector('.cover')) { App.exitApp().catch(() => {}); return; }
  cover();
}
App.addListener('backButton', zurueck).catch(() => {});

// Test-Hilfe für den automatischen Durchlauf (keine Wirkung für Kinder)
(window as any).__lesefall = { stand, DATA, zurueck };
