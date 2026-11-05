import './styles.css';
import { DATA, teil, img, type Block } from './data';
import { stand, speichern, perlen, geloestAnzahl, zuruecksetzen } from './store';
import { T, plain } from './text';
import { makeEngine, type Engine } from './engines';

/* ====================== Schale ====================== */
const ICON_WAND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h3v3H7zM14 9h3M14 13h3M7 16h10"/></svg>`;
const LUPE = `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" fill="#CFE6F5" stroke="#2D3138" stroke-width="1.5"/><path d="M11.3 11.3 L16 16" stroke="#2D3138" stroke-width="2" stroke-linecap="round"/></svg>`;

const app = document.getElementById('app')!;
app.innerHTML = `
<header class="app-header">
  <button class="hb" id="home" aria-label="Spurenwand">${ICON_WAND}</button>
  <div class="ttl"><b id="t1"></b><span id="t2"></span></div>
  <div class="moon" id="moon" role="img"></div>
  <div class="pearls" id="pearls" aria-label="Schimmer-Perlen"><i></i><span id="pc">0</span></div>
  <button class="hb" id="aa" aria-label="Schrift und Silben" style="font-weight:800;font-size:19px">Aa</button>
</header>
<main class="reader-viewport"><div class="sheet" id="sheet"><div id="content"></div><div class="measure story" id="measure" aria-hidden="true"></div></div></main>
<nav class="app-foot"><div class="in" id="foot"></div></nav>`;
const $ = (id: string) => document.getElementById(id)!;
const sheetEl = $('sheet'), content = $('content'), measure = $('measure'), foot = $('foot');
const U = DATA.ui;

function applySettings() {
  document.documentElement.style.setProperty('--fs', stand.fs + 'px');
  document.documentElement.classList.toggle('silben', stand.silben);
  document.documentElement.classList.toggle('reduce', stand.ruhig);
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
  $('t1').textContent = t1;
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
interface Ev { ids: string[]; ask: string; near: string; miss: number; found: string | null; done: (s: string) => void }
const R = { teil: 0, sheets: [] as string[][], idx: 0, ev: null as Ev | null };
let paginated = '';

function headHTML(n: number) {
  const t = teil(n);
  if (n === 0) return `<div class="blk" data-b="head"><div style="text-align:center"><img src="${img('raupe/lob')}" alt="Die Leseraupe" style="height:150px;mix-blend-mode:multiply"></div><div class="kicker">Vorgeschichte</div><div class="title">${T(t.titel)}</div></div>`;
  return `<div class="blk" data-b="head"><div class="illu"><img src="${img(t.spiel.bildVorher)}" alt=""></div><div class="kicker">Kapitel 1 · Spur ${n}</div><div class="title">${T(t.titel)}</div></div>`;
}
function blockHTML(b: Block) {
  const found = R.ev?.found;
  const sents = b.s.map((s, i) => `<span class="sent${found === `${b.id}-${i}` ? ' found' : ''}" data-s="${b.id}-${i}">${T(s)}</span>`).join(' ');
  if (b.typ === 'th') return `<div class="thought" data-b="${b.id}"><img src="${img('raupe/lob')}" alt=""><div class="tx"><div class="lbl">Raupen-Gedanke</div>${sents}</div></div>`;
  return `<p data-b="${b.id}">${sents}</p>`;
}
function itemHTML(n: number, id: string) {
  if (id === 'head') return headHTML(n);
  return blockHTML(teil(n).blocks.find((b) => b.id === id)!);
}
/** Blöcke auf Blätter verteilen; ein Absatz wird nie geteilt */
function paginate(n: number) {
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
    const mid = E.found ? `<button class="btn cta" data-a="evback">Zurück zum Spiel</button>` : `<div class="banner" id="banner">${T(E.miss >= 2 ? E.near : E.ask)}</div>`;
    f = prev + mid + `<button class="nav" data-a="next" ${last ? 'disabled' : ''} aria-label="Nächstes Blatt">›</button>`;
  } else {
    const dots = `<div class="dots" role="img" aria-label="Blatt ${R.idx + 1} von ${R.sheets.length}">${R.sheets.map((_, i) => `<i class="${i < R.idx ? 'on' : i === R.idx ? 'cur' : ''}"></i>`).join('')}</div>`;
    let next = `<button class="nav" data-a="next" aria-label="Nächstes Blatt">›</button>`;
    if (last) {
      const label = n === 0 ? 'Los geht’s' : game && game.spur === n ? 'Zurück zum Spiel' : stand.geloest[n] ? 'Zur Spurenwand' : 'Zum Spiel';
      next = `<button class="btn cta" data-a="end">${label} ›</button>`;
    }
    f = prev + (last ? '' : dots) + next;
  }
  setView(html, f, { dir, ev: !!R.ev, story: true });
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
  if (E.ids.includes(s.dataset.s!)) { E.found = s.dataset.s!; zeigeBlatt(0); return; }
  E.miss++;
  s.classList.remove('nope'); void s.offsetWidth; s.classList.add('nope');
  const b = document.getElementById('banner');
  if (b) b.innerHTML = T(E.miss >= 2 ? E.near : U.beweisNein);
});

foot.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-a]')?.dataset.a;
  if (!a) return;
  if (a === 'prev') blaettern(-1);
  else if (a === 'next') blaettern(1);
  else if (a === 'end') endeLesen();
  else if (a === 'evback') {
    const E = R.ev!; R.ev = null;
    const [, bid, k] = E.found!.match(/^(.*)-(\d+)$/)!;
    E.done(teil(R.teil).blocks.find((b) => b.id === bid)!.s[+k]);
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
type Phase = 'select' | 'wrong' | 'retry' | 'help' | 'explain' | 'stepdone';
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
  constructor(public spur: number, public replay: boolean) {
    this.data = teil(spur).spiel;
    this.startStep();
  }
  get st() { return this.data.schritte[this.step]; }
  startStep() { this.engine = makeEngine(this.st); this.phase = 'select'; this.target = null; this.quote = ''; }
  show(dir = 0) {
    ort('game', this.spur);
    header(`Kapitel 1 · Spur ${this.spur}`);
    const st = this.st, d = this.data, n = d.schritte.length;
    const steps = n > 1 ? `<span class="steps">${d.schritte.map((_: any, i: number) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</span>` : '';
    const html = `<div class="task">
      <div class="case">${LUPE}<span>Dein Ermittlerauftrag ·</span><span class="name">${T(d.spiel)}</span>${steps}</div>
      ${this.fb()}
      ${this.phase === 'select' || this.phase === 'retry' || this.phase === 'help' ? `<p class="intro">${T(st.intro)}</p>` : ''}
      ${st.frage ? `<p class="q">${T(st.frage)}</p>` : ''}
      <div class="engine"></div></div>`;
    let primary: string;
    if (this.phase === 'wrong') primary = `<button class="btn cta" data-a="beweis">${LUPE}Zeig den Beweis!</button>`;
    else if (this.phase === 'explain') primary = `<button class="btn cta" data-a="verstanden">Verstanden</button>`;
    else if (this.phase === 'stepdone') primary = `<button class="btn cta" data-a="weiter">Weiter ›</button>`;
    else primary = `<button class="btn cta" data-a="pruefen" ${this.engine.complete() ? '' : 'disabled'}>Prüfen</button>`;
    setView(html, `<button class="btn" data-a="geschichte">Zur Geschichte</button>${primary}`, { scroll: true, dir });
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
      case 'help': return bubble('tipp', `<span>${this.quote ? `${T(U.deinBeweis)} <span class="quote">${T(this.quote)}</span><br>` : ''}<b>${T(U.hilfe)}</b> ${T(t?.help ?? this.st.help)}</span>`, 'help');
      case 'explain': return bubble('lob', `<span>${T(this.st.explain ?? '')}</span>`, 'help');
      case 'stepdone': return bubble('klatscht', `<span><b>${T(U.siegVoll)}</b></span>`);
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
    sieg(this.spur, Math.min(...this.stepPearls), this.replay);
  }
}
actions.pruefen = () => game?.pruefen();
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

/* ====================== Sieg → Spuren abpinseln → Spurenwand ====================== */
function sieg(spur: number, gained: number, replay: boolean) {
  const d = teil(spur).spiel;
  const neu = !replay && !stand.geloest[spur];
  if (neu) { stand.geloest[spur] = gained; speichern(); }
  game = null;
  header(`Kapitel 1 · Spur ${spur}`);
  if (neu) glowMoon();
  const voll = gained === 2;
  const extra = spur === 5 ? `<div class="mosaik">${d.schritte[0].loesung.map((id: string) => `<img src="${img(d.schritte[0].karten.find((k: any) => k.id === id).bild)}" alt="">`).join('')}</div>`
    : spur === 4 ? `<p><span class="stamp-big stamp-on">${T(d.schritte[1].stempel.find((s: any) => s.id === 'nicht').label)}</span></p>` : '';
  const html = `<div class="center task">
    <div class="win-top"><img class="r glow-fuehler" src="${raupe('klatscht', spur)}" alt="Die Leseraupe klatscht"><img class="k" src="${img(d.kind)}" alt=""></div>
    <div class="big">${T(voll ? U.siegVoll : U.siegHalb)}</div>
    <p>${T(d.sieg)}</p>${voll ? '' : `<p>${T(U.siegHalbText)}</p>`}
    ${extra}
    ${neu ? `<span class="gain">${'<i></i>'.repeat(gained)}+${gained} Schimmer-${gained > 1 ? 'Perlen' : 'Perle'}</span>` : ''}
  </div>`;
  const next = replay ? `<button class="btn cta" data-a="wand">Zur Spurenwand ›</button>`
    : stand.buchstaben.includes(spur) ? `<button class="btn cta" data-a="wandNach">Zur Spurenwand ›</button>`
    : `<button class="btn cta" data-a="pinsel">Spur abpinseln ›</button>`;
  actions.pinsel = () => pinsel(spur);
  actions.wandNach = () => wand(spur);
  setView(html, `<button class="btn" data-a="nochmalLesen">Noch einmal lesen</button>${next}`, { scroll: true, dir: 1 });
  actions.nochmalLesen = () => lesen(spur, { dir: -1 });
  ort(replay ? 'wand' : stand.buchstaben.includes(spur) ? 'wand' : 'pinsel', spur);
}

function wortHTML(neu = -1) {
  const gw = DATA.geheimwort;
  const offen = new Set(gw.reihenfolge.filter((r: any) => stand.buchstaben.includes(r.spur)).map((r: any) => r.pos));
  return `<div class="wort" aria-label="Geheimwort">${[...gw.wort].map((c: string, i: number) => `<span class="${offen.has(i) ? '' : 'leer'} ${i === neu ? 'neu' : ''}">${offen.has(i) ? c : ''}</span>`).join('')}</div>`;
}

function pinsel(spur: number) {
  ort('pinsel', spur);
  header(`Kapitel 1 · Spur ${spur}`);
  const gw = DATA.geheimwort;
  const pos = gw.reihenfolge.find((r: any) => r.spur === spur).pos;
  const ch = gw.wort[pos];
  const html = `<div class="center task"><div class="kicker">Spuren abpinseln</div>
    <p class="intro">${T(U.pinseln)}</p>
    <div class="pinsel" id="pbox"><span class="letter">${ch}</span><canvas id="dust" aria-label="Staub"></canvas></div>
    <p id="pmsg" style="min-height:1.5em"></p>${wortHTML()}</div>`;
  setView(html, `<button class="btn cta" data-a="pinselWeiter" disabled>Zur Spurenwand ›</button>`, { scroll: true, dir: 1 });
  const box = $('pbox'), cv = $('dust') as HTMLCanvasElement;
  const r = box.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const g = cv.getContext('2d')!;
  g.scale(dpr, dpr);
  // Staubschicht
  g.fillStyle = '#CDBB98'; g.fillRect(0, 0, r.width, r.height);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = ['#BFAA82', '#D9CAA8', '#B39C74', '#E2D5B8'][i % 4];
    g.globalAlpha = 0.5; g.beginPath(); g.arc(Math.random() * r.width, Math.random() * r.height, 1 + Math.random() * 4, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out';
  let strokes = 0, done = false, last: number[] | null = null;
  const brush = document.createElement('div');
  brush.className = 'brush';
  brush.innerHTML = `<svg viewBox="0 0 44 44"><path d="M30 4l10 10-14 14-10-10z" fill="#8A5A44"/><path d="M16 18l10 10-6 6c-4 4-12 6-16 6 0-4 2-12 6-16z" fill="#F4C243" stroke="#D9A21E"/></svg>`;
  const wipe = (x: number, y: number) => {
    g.lineWidth = 46; g.lineCap = 'round';
    g.beginPath(); g.moveTo(last ? last[0] : x, last ? last[1] : y); g.lineTo(x, y); g.stroke();
    last = [x, y];
    if (++strokes % 6 === 0) check();
  };
  const check = () => {
    if (done) return;
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 37) { n++; if (d[i] < 40) clear++; }
    if (clear / n > 0.55) aufgedeckt();
  };
  const aufgedeckt = () => {
    done = true; cv.classList.add('weg'); brush.remove();
    if (!stand.buchstaben.includes(spur)) { stand.buchstaben.push(spur); speichern(); }
    ort('wand', spur);
    $('pmsg').innerHTML = T(U.buchstabe);
    content.querySelector('.wort')!.outerHTML = wortHTML(pos);
    (foot.querySelector('[data-a="pinselWeiter"]') as HTMLButtonElement).disabled = false;
  };
  cv.addEventListener('pointerdown', (e) => {
    if (done) return;
    cv.setPointerCapture(e.pointerId); document.body.appendChild(brush);
    const b = cv.getBoundingClientRect(); last = null; wipe(e.clientX - b.left, e.clientY - b.top);
    brush.style.left = e.clientX + 'px'; brush.style.top = e.clientY + 'px';
  });
  cv.addEventListener('pointermove', (e) => {
    if (done || !cv.hasPointerCapture(e.pointerId)) return;
    const b = cv.getBoundingClientRect(); wipe(e.clientX - b.left, e.clientY - b.top);
    brush.style.left = e.clientX + 'px'; brush.style.top = e.clientY + 'px';
  });
  cv.addEventListener('pointerup', () => { last = null; brush.remove(); check(); });
  actions.pinselWeiter = () => wand(spur);
}

/** Spurenwand: Funde, Geheimwort, Weiter. Nach einer Spur oben das Bild „nachher“. */
function wand(nach = 0) {
  game = null; R.ev = null;
  ort('wand', nach);
  header('Kapitel 1 · Spurenwand');
  const spuren = DATA.spuren;
  const funde = spuren.map((s: any) => {
    const ok = stand.geloest[s.spur] !== undefined;
    return ok ? `<button class="fund ${s.spur === nach ? 'neu' : ''}" data-fund="${s.spur}" aria-label="Spur ${s.spur}: ${plain(s.spiel.fund.text)}"><span class="nr"></span><img src="${img(s.spiel.fund.bild)}" alt="">${T(s.spiel.fund.text)}</button>`
      : `<div class="fund zu">Spur ${s.spur}</div>`;
  }).join('');
  const naechste = [1, 2, 3, 4, 5, 6].find((n) => stand.geloest[n] === undefined);
  const offenPinsel = [1, 2, 3, 4, 5, 6].find((n) => stand.geloest[n] !== undefined && !stand.buchstaben.includes(n));
  const bild = nach ? `<div class="illu"><img src="${img(teil(nach).spiel.bildNachher)}" alt="Spur ${nach}: nachher"></div>` : '';
  const html = `<div class="task">${bild}<div class="kicker" style="margin-top:10px">${U.wand ? T(U.wand) : ''}</div>
    <div class="wand">${funde}</div>${wortHTML()}
    ${geloestAnzahl() ? `<p style="font-size:15px;color:var(--muted);text-align:center">${T(U.wandTipp)}</p>` : ''}
    <div class="menu"><button class="btn" data-a="vg">Vorgeschichte lesen</button></div></div>`;
  let f: string;
  if (offenPinsel) { actions.go = () => pinsel(offenPinsel); f = `<button class="btn cta" data-a="go">Spur ${offenPinsel} abpinseln ›</button>`; }
  else if (!naechste) { actions.go = tresor; f = `<button class="btn cta" data-a="go">${stand.tresorOffen ? 'Zum offenen Mondtresor' : 'Zum Mondtresor'} ›</button>`; }
  else if (nach || !stand.ort.anker) { actions.go = () => lesen(naechste, { dir: 1 }); f = `<button class="btn cta" data-a="go">${naechste === 1 && !nach ? 'Los geht’s' : `Weiter zu Spur ${naechste}`} ›</button>`; }
  else { actions.go = () => lesen(naechste, { dir: 1 }); f = `<button class="btn cta" data-a="go">Weiterlesen: Spur ${naechste} ›</button>`; }
  actions.vg = () => lesen(0, { dir: -1 });
  setView(html, f, { scroll: true, dir: 1 });
  content.querySelectorAll<HTMLElement>('[data-fund]').forEach((b) => b.addEventListener('click', () => fundMenu(+b.dataset.fund!)));
}
function fundMenu(spur: number) {
  const bg = document.createElement('div');
  bg.className = 'pop-bg';
  bg.style.alignItems = 'center'; bg.style.justifyContent = 'center';
  bg.innerHTML = `<div class="pop" role="dialog" aria-label="Spur ${spur}"><h3>Spur ${spur}: ${T(teil(spur).titel)}</h3><div class="menu">
    <button class="btn cta" data-m="spiel">${T(teil(spur).spiel.spiel)} – noch einmal spielen</button>
    <button class="btn" data-m="lesen">Noch einmal lesen</button><button class="btn" data-m="zu">Schließen</button></div></div>`;
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
  header('Kapitel 1 · Mondtresor');
  const gw = DATA.geheimwort;
  const wort: string = gw.wort;
  const slotsX = [25.8, 35.4, 45.0, 54.6, 64.2, 73.8];
  let eingabe: number[] = [];
  let fehl = 0;
  const tiles = [...wort].map((c, i) => ({ c, i }));
  for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
  if (tiles.map((t) => t.c).join('') === wort) tiles.reverse();
  const tresorUrl = img('mondtresor_zu');
  const render = (msg = '') => {
    const offen = stand.tresorOffen;
    const slots = slotsX.map((x, i) => `<span class="slot" style="left:${x}%">${offen ? wort[i] : eingabe[i] !== undefined ? tiles[eingabe[i]].c : ''}</span>`).join('');
    const html = `<div class="task center"><div class="kicker">${T(U.tresorTitel)}</div>
      <p class="q">${T(gw.frage)}</p>
      <div class="tresor ${offen ? 'open' : ''}" id="tr"><img src="${tresorUrl}" alt="Der Mondtresor">
        <div class="door"><div class="inside" style="background-image:url('${img('k2_s7')}')"></div><div class="lid" style="background:url('${tresorUrl}') 50.7% 25.9% / 229.9% auto"></div></div>${slots}</div>
      ${offen ? `<div class="big">${T(U.geschafft)}</div><p>${T(gw.offen)}</p><p>${T(gw.haken)}</p><span class="gain"><i></i>${perlen()} Schimmer-Perlen</span>`
        : `<div class="tiles">${tiles.map((t, k) => `<button class="tile" data-t="${k}" ${eingabe.includes(k) ? 'disabled' : ''}>${t.c}</button>`).join('')}</div>
           <p style="font-size:15px;color:var(--muted)">${T(U.tresorTipp)}</p><div id="tmsg" role="status">${msg}</div>`}
    </div>`;
    const f = offen ? `<button class="btn cta" data-a="wand">Zur Spurenwand ›</button>` : `<button class="btn" data-a="tzurueck" ${eingabe.length ? '' : 'disabled'}>‹ Zurück</button><button class="btn" data-a="wand">Spurenwand</button>`;
    setView(html, f, { scroll: true });
    content.querySelectorAll<HTMLElement>('[data-t]').forEach((b) => b.addEventListener('click', () => {
      eingabe.push(+b.dataset.t!);
      if (eingabe.length < wort.length) { render(); return; }
      if (eingabe.map((k) => tiles[k].c).join('') === wort) {
        stand.tresorOffen = true; speichern();
        render();
        if (!ruhig()) { const tr = $('tr'); tr.classList.remove('open'); void tr.offsetWidth; requestAnimationFrame(() => tr.classList.add('open')); }
      } else {
        fehl++; eingabe = [];
        const hilfe = fehl >= 2 ? `<div class="fb help"><img src="${raupe('tipp', 6)}" alt=""><span>${T(gw.near)}<br><span class="quote">${T(gw.zitat[0])}</span></span></div>` : `<div class="fb"><img src="${raupe('denkt', 6)}" alt=""><span>${T(U.tresorFalsch)}</span></div>`;
        render(hilfe);
      }
    }));
  };
  actions.tzurueck = () => { eingabe.pop(); render(); };
  render();
}

/* ====================== Titelbild ====================== */
function cover() {
  ort('cover');
  header('Lese-Fall', 'Spur im Text');
  const weiter = stand.ort.view !== 'cover' || stand.vorgeschichte;
  const html = `<div class="cover"><div class="art" style="background-image:url('${img('cover')}')" role="img" aria-label="Titelbild: Die Leseraupe mit Lupe"></div>
    <h1>Lese-Fall</h1><div class="sub">Fall ${DATA.fall.nr}: ${T(DATA.fall.titel)}</div></div>`;
  setView(html, `${weiter ? '<button class="btn" data-a="wand">Spurenwand</button>' : ''}<button class="btn cta" data-a="los">${weiter ? 'Weiterlesen' : 'Los geht’s'} ›</button>`);
}
actions.los = () => resume(true);
actions.wand = () => wand();

/* ====================== Einstellungen (Aa) ====================== */
const SIZES = [18, 20, 23, 26];
$('aa').addEventListener('click', () => {
  const bg = document.createElement('div');
  bg.className = 'pop-bg';
  const draw = () => {
    bg.innerHTML = `<div class="pop" role="dialog" aria-label="Einstellungen">
      <h3>Schriftgröße</h3><div class="sizes">${SIZES.map((s) => `<button data-fs="${s}" aria-pressed="${stand.fs === s}" style="font-size:${s - 2}px">A</button>`).join('')}</div>
      <p class="demo story">${T('Die Le|se|rau|pe schaut ge|nau hin.')}</p>
      <label>Silben farbig<button class="switch" role="switch" data-sw="silben" aria-checked="${stand.silben}" aria-label="Silben farbig"></button></label>
      <label>Bewegung reduzieren<button class="switch" role="switch" data-sw="ruhig" aria-checked="${stand.ruhig}" aria-label="Bewegung reduzieren"></button></label>
      <button class="reset" data-reset>Fortschritt löschen (für Eltern)</button>
      <div style="text-align:right"><button class="btn cta" data-close style="flex:none;min-width:120px">Fertig</button></div></div>`;
  };
  draw();
  document.body.appendChild(bg);
  bg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const fs = t.closest<HTMLElement>('[data-fs]'), sw = t.closest<HTMLElement>('[data-sw]');
    if (fs) { stand.fs = +fs.dataset.fs!; }
    else if (sw) { const k = sw.dataset.sw as 'silben' | 'ruhig'; stand[k] = !stand[k]; }
    else if (t.closest('[data-reset]')) {
      if (confirm('Wirklich den ganzen Fortschritt löschen? Perlen und Spuren sind dann weg.')) { zuruecksetzen(); bg.remove(); applySettings(); game = null; cover(); }
      return;
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
$('home').addEventListener('click', () => { R.ev = null; wand(); });

/* ====================== Start ====================== */
function resume(fromCover = false) {
  const o = stand.ort;
  if (o.view === 'read') return lesen(o.teil, { anker: o.anker });
  if (o.view === 'game' && o.teil) { game = new Spiel(o.teil, !!stand.geloest[o.teil]); return game.show(); }
  if (o.view === 'pinsel' && o.teil && !stand.buchstaben.includes(o.teil)) return pinsel(o.teil);
  if (o.view === 'tresor') return tresor();
  if (o.view === 'wand') return wand();
  if (fromCover) return stand.vorgeschichte ? wand() : lesen(0, { dir: 1 });
  cover();
}
applySettings();
document.fonts.ready.then(() => cover());

// Test-Hilfe für den automatischen Durchlauf (keine Wirkung für Kinder)
(window as any).__lesefall = { stand, DATA };
