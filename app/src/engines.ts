/**
 * Fünf Spiel-Motoren (SPIELE.md, Abschnitt 3). Jede Spur liefert nur Daten.
 * Richtig/falsch wird hier NIE mit Grün/Rot oder Haken gezeigt (A-10) – das macht der Spiel-Rahmen über Figuren.
 */
import { img } from './data';
import { T, plain } from './text';

export interface Engine {
  html(): string;
  bind(root: HTMLElement, rerender: () => void): void;
  complete(): boolean;
  correct(): boolean;
  /** erstes falsch gelegtes Ding mit eigenem Beweis (proDing), sonst null */
  wrongItem(): string | null;
  reset(): void;
  solve(): void;
  locked: boolean;
  won?: boolean;
}

const pic = (name: string, cls = 'obj', alt = '') => (name === 'vorhang' ? VORHANG : `<img class="${cls}" src="${img(name)}" alt="${alt}" draggable="false">`);
const VORHANG = `<svg class="vorhang-svg" viewBox="0 0 70 56" aria-hidden="true"><rect x="4" y="3" width="62" height="6" rx="2" fill="#C98A3A"/><path d="M6 9h29v44c-6-2-10-1-14 1-4-14-10-30-15-45z" fill="#C8382E"/><path d="M64 9H35v44c6-2 10-1 14 1 4-14 10-30 15-45z" fill="#B32E25"/><path d="M12 12c4 12 8 26 10 38M58 12c-4 12-8 26-10 38" stroke="#8E1F18" stroke-width="1.5" fill="none" opacity=".5"/></svg>`;

/* ---------- Ziehen oder Tippen (gemeinsam) ---------- */
interface DragOpts {
  onDrop(item: string, zone: string | null): void;
  onTap(item: string): void;
  onZoneTap?(zone: string): void;
  isLocked(): boolean;
}
function dragTap(root: HTMLElement, o: DragOpts) {
  root.addEventListener('pointerdown', (e) => {
    const it = (e.target as HTMLElement).closest<HTMLElement>('[data-drag]');
    if (!it || o.isLocked() || e.button > 0) return;
    e.preventDefault();
    const id = it.dataset.drag!;
    const sx = e.clientX, sy = e.clientY;
    let ghost: HTMLElement | null = null;
    let hot: HTMLElement | null = null;
    const zoneAt = (x: number, y: number) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('[data-zone]') ?? null;
    const move = (ev: PointerEvent) => {
      if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        ghost = it.cloneNode(true) as HTMLElement;
        ghost.classList.add('ghost');
        ghost.style.width = it.offsetWidth + 'px';
        document.body.appendChild(ghost);
        it.style.opacity = '.35';
      }
      if (ghost) {
        ghost.style.left = ev.clientX + 'px';
        ghost.style.top = ev.clientY + 'px';
        const z = zoneAt(ev.clientX, ev.clientY);
        if (z !== hot) { hot?.classList.remove('drop-hot'); z?.classList.add('drop-hot'); hot = z; }
      }
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      hot?.classList.remove('drop-hot');
      it.style.opacity = '';
      if (ghost) {
        ghost.remove();
        if (ev.type === 'pointercancel') return;
        o.onDrop(id, zoneAt(ev.clientX, ev.clientY)?.dataset.zone ?? null);
      } else if (ev.type === 'pointerup') o.onTap(id);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (o.isLocked() || t.closest('[data-drag]')) return;
    const z = t.closest<HTMLElement>('[data-zone]');
    if (z && o.onZoneTap) o.onZoneTap(z.dataset.zone!);
  });
}

/* ---------- Zielfeld (Hin damit!) und Slots (Nachgebaut!) ---------- */
class Ablage implements Engine {
  place: Record<string, string | null> = {};
  sel: string | null = null;
  locked = false;
  won = false;
  constructor(public st: any, public kind: 'zielfeld' | 'slots') { this.reset(); }
  get items(): any[] { return this.kind === 'slots' ? this.st.karten : this.st.dinge; }
  reset() { this.place = Object.fromEntries(this.items.map((d: any) => [d.id, null])); this.sel = null; this.locked = false; }
  solve() {
    if (this.kind === 'slots') for (const d of this.items) this.place[d.id] = this.st.loesung.includes(d.id) ? 'ziel' : null;
    else this.place = { ...this.st.loesung };
    this.locked = true;
  }
  complete() {
    return this.kind === 'slots' ? Object.values(this.place).some((z) => z === 'ziel') : Object.values(this.place).every((z) => z !== null);
  }
  correct() {
    if (this.kind === 'slots') return this.items.every((d: any) => (this.place[d.id] === 'ziel') === this.st.loesung.includes(d.id));
    return this.items.every((d: any) => this.place[d.id] === this.st.loesung[d.id]);
  }
  wrongItem() {
    if (this.kind === 'slots' || !this.st.proDing) return null;
    return this.items.find((d: any) => this.place[d.id] !== this.st.loesung[d.id] && this.st.proDing[d.id])?.id ?? null;
  }
  chip(d: any, small: boolean) {
    return `<div class="chip ${small ? 'small' : ''} ${this.sel === d.id ? 'sel' : ''}" data-drag="${d.id}" role="button" tabindex="0" aria-label="${plain(d.label)}">${pic(d.bild)}<span class="l">${T(d.label)}</span></div>`;
  }
  inZone(z: string, small = true) { return this.items.filter((d: any) => this.place[d.id] === z).map((d: any) => this.chip(d, small)).join(''); }
  html() {
    const st = this.st;
    const tray = `<div class="tray" data-zone="__tray" aria-label="Ablage">${this.items.filter((d: any) => this.place[d.id] === null).map((d: any) => this.chip(d, false)).join('')}</div>`;
    const tgt = this.sel ? 'sel-target' : '';
    if (this.kind === 'slots') {
      return `<div class="korb ziel ${tgt}" data-zone="ziel"><h4>${T(st.ziel)}</h4>${this.inZone('ziel', false)}</div>${tray.replace('class="tray"', 'class="tray"')}`;
    }
    if (st.layout === 'theater') {
      // Ausschnitt aus dem großen Spielbild: nur das Theater, Zonen in % des Ausschnitts
      const a = st.ausschnitt;
      const bg = `<img class="bg" src="${img(st.hintergrund)}" alt="Puppentheater mit Vorhang und Wolke" draggable="false" style="width:${100 / a.w}%;left:${(-a.x / a.w) * 100}%;top:${(-a.y / a.h) * 100}%">`;
      return `<div class="feld" style="aspect-ratio:${a.seite}">${bg}${st.zonen.map((z: any) => `<div class="zone ${tgt}" data-zone="${z.id}" aria-label="${plain(z.label)}" style="transform:none;left:${z.x - z.w / 2}%;top:${z.y - (z.w * a.seite) / 2}%;width:${z.w}%;height:${z.w * a.seite}%">${this.inZone(z.id)}</div>`).join('')}</div>${tray}`;
    }
    // Tisch am Fenster
    const zone = (id: string) => st.zonen.find((z: any) => z.id === id);
    const tz = (id: string, extra = '') => `<div class="tz ${id === 'auf' ? 'auf' : ''} ${tgt}" data-zone="${id}" aria-label="${plain(zone(id).label)}">${extra}${this.inZone(id)}</div>`;
    return `<div class="fenster">▲ Fenster</div><div class="tisch">${tz('links')}${tz('auf', `<img class="tab" src="${img('objekte/tablett_leer')}" alt="" draggable="false">`)}${tz('rechts')}</div>${tray}`;
  }
  bind(root: HTMLElement, rerender: () => void) {
    dragTap(root, {
      isLocked: () => this.locked,
      onDrop: (item, zone) => { this.place[item] = zone && zone !== '__tray' ? zone : null; this.single(item); this.sel = null; rerender(); },
      onTap: (item) => {
        // schon ein Ding gewählt und auf ein liegendes Ding getippt: dorthin legen
        if (this.sel && this.sel !== item && this.place[item]) {
          this.place[this.sel] = this.place[item]; this.single(this.sel); this.sel = null; rerender(); return;
        }
        this.sel = this.sel === item ? null : item; rerender();
      },
      onZoneTap: (zone) => {
        if (!this.sel) return;
        this.place[this.sel] = zone === '__tray' ? null : zone;
        this.single(this.sel); this.sel = null; rerender();
      },
    });
  }
  /** Theater: ein Platz = ein Ding */
  single(item: string) {
    if (this.st.layout !== 'theater') return;
    const z = this.place[item];
    if (z) for (const k of Object.keys(this.place)) if (k !== item && this.place[k] === z) this.place[k] = null;
  }
}

/* ---------- Faden (Spurenfaden) ---------- */
class Faden implements Engine {
  link: Record<string, string | null> = {};
  sel: string | null = null;
  locked = false;
  won = false;
  constructor(public st: any) { this.reset(); }
  reset() { this.link = Object.fromEntries(this.st.links.map((k: any) => [k.id, null])); this.sel = null; this.locked = false; }
  solve() { this.link = { ...this.st.loesung }; this.locked = true; }
  complete() { return Object.values(this.link).every(Boolean); }
  correct() { return this.st.links.every((k: any) => this.link[k.id] === this.st.loesung[k.id]); }
  wrongItem() { return this.st.links.find((k: any) => this.link[k.id] !== this.st.loesung[k.id] && this.st.proDing?.[k.id])?.id ?? null; }
  html() {
    const kids = this.st.links.map((k: any) => `<div class="fk kid ${this.sel === k.id ? 'sel' : ''} ${this.link[k.id] ? 'linked' : ''}" data-kid="${k.id}" role="button" tabindex="0"><img src="${img(k.bild)}" alt="" draggable="false"><b>${T(k.label)}</b><span class="knob"></span></div>`).join('');
    const places = this.st.rechts.map((p: any) => {
      const who = Object.keys(this.link).find((k) => this.link[k] === p.id);
      const face = this.won && who ? `<img class="face" src="${img(this.st.links.find((k: any) => k.id === who).bild.replace(/\/.*$/, '/lacht'))}" alt="">` : '';
      return `<div class="fk place ${who ? 'linked' : ''}" data-place="${p.id}" role="button" tabindex="0"><span class="knob"></span><img src="${img(p.bild)}" alt="" draggable="false"><span>${T(p.label)}</span>${face}</div>`;
    }).join('');
    return `<div class="faden"><svg class="lines" aria-hidden="true"></svg><div class="col">${kids}</div><div class="col">${places}</div></div>`;
  }
  bind(root: HTMLElement, rerender: () => void) {
    const box = root.querySelector<HTMLElement>('.faden')!;
    const svg = box.querySelector('svg')!;
    const knob = (el: Element) => { const r = el.querySelector('.knob')!.getBoundingClientRect(); const b = box.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; };
    const path = (a: number[], b: number[], dash = false) => `<path d="M${a[0]} ${a[1]} C${a[0] + 40} ${a[1]} ${b[0] - 40} ${b[1]} ${b[0]} ${b[1]}" stroke="#8A5A44" stroke-width="3.5" fill="none" stroke-linecap="round" ${dash ? 'stroke-dasharray="6 6"' : ''}/>`;
    const draw = (temp = '') => {
      svg.innerHTML = Object.entries(this.link).filter(([, p]) => p).map(([k, p]) => path(knob(box.querySelector(`[data-kid="${k}"]`)!), knob(box.querySelector(`[data-place="${p}"]`)!))).join('') + temp;
    };
    requestAnimationFrame(() => draw());
    const connect = (kid: string, place: string) => {
      for (const k of Object.keys(this.link)) if (this.link[k] === place) this.link[k] = null;
      this.link[kid] = place; this.sel = null; rerender();
    };
    box.addEventListener('pointerdown', (e) => {
      const kidEl = (e.target as HTMLElement).closest<HTMLElement>('[data-kid]');
      if (!kidEl || this.locked) return;
      e.preventDefault();
      const kid = kidEl.dataset.kid!;
      const sx = e.clientX, sy = e.clientY;
      let dragging = false;
      const move = (ev: PointerEvent) => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) dragging = true;
        if (dragging) { const b = box.getBoundingClientRect(); draw(path(knob(kidEl), [ev.clientX - b.left, ev.clientY - b.top], true)); }
      };
      const up = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (dragging) {
          const pl = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-place]');
          if (pl && ev.type === 'pointerup') connect(kid, pl.dataset.place!); else draw();
        } else { this.sel = this.sel === kid ? null : kid; rerender(); }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
    box.addEventListener('click', (e) => {
      const pl = (e.target as HTMLElement).closest<HTMLElement>('[data-place]');
      if (!pl || this.locked || !this.sel) return;
      connect(this.sel, pl.dataset.place!);
    });
  }
}

/* ---------- Reihe (Beweis-Mosaik) ---------- */
class Reihe implements Engine {
  order: (string | null)[] = [];
  sel: string | null = null;
  locked = false;
  won = false;
  shuffled: any[];
  constructor(public st: any) { this.shuffled = mischen(st.karten, (a) => a.map((k: any) => k.id).join() !== st.loesung.join()); this.reset(); }
  reset() { this.order = this.st.loesung.map(() => null); this.sel = null; this.locked = false; }
  solve() { this.order = [...this.st.loesung]; this.locked = true; }
  complete() { return this.order.every(Boolean); }
  correct() { return this.order.join() === this.st.loesung.join(); }
  wrongItem() { return null; }
  card(id: string) { return this.st.karten.find((k: any) => k.id === id); }
  html() {
    // gelöst: groß und mit Beschriftung untereinander 1–4 (A11)
    if (this.won) return `<ol class="reihe-fertig">${this.st.loesung.map((id: string, i: number) => `<li><span class="n">${i + 1}</span><img src="${img(this.card(id).bild)}" alt=""><span>${T(this.card(id).label)}</span></li>`).join('')}</ol>`;
    const slots = this.order.map((id, i) => `<div class="rslot ${id ? 'filled' : ''}" data-zone="${i}" ${id ? `data-drag="${id}"` : ''} role="button" aria-label="Platz ${i + 1}"><span class="n">${i + 1}</span>${id ? `<img src="${img(this.card(id).bild)}" alt="${plain(this.card(id).label)}" draggable="false">` : ''}</div>`).join('');
    const pool = this.shuffled.map((k: any) => `<div class="rcard ${this.order.includes(k.id) ? 'used' : ''} ${this.sel === k.id ? 'sel' : ''}" data-drag="${k.id}" role="button" tabindex="0"><img src="${img(k.bild)}" alt="" draggable="false"><span class="l">${T(k.label)}</span></div>`).join('');
    return `<div class="reihe">${slots}</div><div class="rpool" data-zone="__pool">${pool}</div>`;
  }
  bind(root: HTMLElement, rerender: () => void) {
    const put = (id: string, slot: number) => {
      const from = this.order.indexOf(id);
      const there = this.order[slot];
      if (from >= 0) this.order[from] = there; // tauschen
      this.order[slot] = id;
    };
    dragTap(root, {
      isLocked: () => this.locked,
      onDrop: (id, zone) => {
        if (zone === null || zone === '__pool') { const i = this.order.indexOf(id); if (i >= 0) this.order[i] = null; }
        else put(id, +zone);
        this.sel = null; rerender();
      },
      onTap: (id) => {
        const i = this.order.indexOf(id);
        if (i >= 0) this.order[i] = null; // aus dem Platz zurück
        else { const free = this.order.indexOf(null); if (free >= 0) this.order[free] = id; }
        rerender();
      },
    });
  }
}

/* ---------- Urteil (Steckbrief & Stempel u. a.) ---------- */
class Urteil implements Engine {
  sel: string | null = null;
  multi = new Set<string>();
  rows: Record<string, string | null> = {};
  stamp: string | null = null;
  flipped = false;
  locked = false;
  won = false;
  opts: any[];
  constructor(public st: any) {
    this.opts = st.art === 'vergleich' ? [] : mischen(st.optionen, () => true);
    this.reset();
  }
  reset() {
    this.sel = null; this.multi = new Set(); this.stamp = null; this.locked = false;
    this.rows = Object.fromEntries((this.st.zeilen ?? []).map((z: any) => [z.id, null]));
  }
  solve() {
    const st = this.st;
    if (st.art === 'einzeln') this.sel = st.loesung;
    if (st.art === 'mehrere') this.multi = new Set(st.loesung);
    if (st.art === 'vergleich') { this.multi = new Set(st.zeilen.filter((z: any) => z.fehlt).map((z: any) => z.id)); this.stamp = st.loesung; this.flipped = true; }
    this.locked = true;
  }
  complete() {
    const st = this.st;
    if (st.art === 'einzeln') return this.sel !== null;
    if (st.art === 'mehrere') return this.multi.size === st.anzahl;
    return this.stamp !== null;
  }
  correct() {
    const st = this.st;
    if (st.art === 'einzeln') return this.sel === st.loesung;
    if (st.art === 'mehrere') return st.loesung.length === this.multi.size && st.loesung.every((x: string) => this.multi.has(x));
    return st.zeilen.every((z: any) => this.multi.has(z.id) === z.fehlt) && this.stamp === st.loesung;
  }
  wrongItem() { return null; }
  html() {
    const st = this.st;
    const dis = this.locked ? 'disabled' : '';
    if (st.art === 'einzeln') {
      return `<div class="opts">${this.opts.map((o) => `<button class="opt" data-o="${o.id}" aria-pressed="${this.sel === o.id}" ${dis}>${T(o.label)}</button>`).join('')}</div>`;
    }
    if (st.art === 'mehrere') {
      return `<div class="opts grid">${this.opts.map((o) => `<button class="opt" data-m="${o.id}" aria-pressed="${this.multi.has(o.id)}" ${dis}>${T(o.label)}</button>`).join('')}</div><p class="kicker" style="text-align:center;margin-top:8px">${this.multi.size} / ${st.anzahl}</p>`;
    }
    // Vergleich: links Milas Mond (Muster), rechts der gefundene Kreis zum Umdrehen; antippen, was fehlt; Stempel
    const m = st.muster;
    const stampOn = this.won ? `<span class="stamp-big stamp-on stamp-over">${T(st.stempel.find((x: any) => x.id === st.loesung).label)}</span>` : '';
    return `<div class="vgl">
      <div class="muster"><img src="${img(m.bild)}" alt=""><b>${T(m.label)}</b><ul>${m.merkmale.map((x: string) => `<li>${T(x)}</li>`).join('')}</ul></div>
      <button class="dreh-box" data-flip aria-label="Kreis umdrehen"><span class="dreh"><span class="card ${this.flipped ? 'flip' : ''}"><img src="${img(st.drehen.vorne)}" alt="Vorderseite"><img class="back" src="${img(st.drehen.hinten)}" alt="Rückseite"></span></span><b>${T(st.drehen.label)}</b><small>${this.flipped ? 'hinten' : 'vorne'} · tippen zum Umdrehen</small>${stampOn}</button>
    </div>
    <div class="fehlt">${st.zeilen.map((z: any) => `<button class="opt" data-m="${z.id}" aria-pressed="${this.multi.has(z.id)}" ${dis}>${T(z.label)}</button>`).join('')}</div>
    <p class="q">${T(st.stempelFrage)}</p><div class="stempel">${st.stempel.map((x: any) => `<button class="stamp" data-s="${x.id}" aria-pressed="${this.stamp === x.id}" ${dis}>${T(x.label)}</button>`).join('')}</div>`;
  }
  bind(root: HTMLElement, rerender: () => void) {
    root.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const b = t.closest<HTMLElement>('[data-o],[data-m],[data-r],[data-s],[data-flip]');
      if (!b) return;
      if (b.hasAttribute('data-flip')) { this.flipped = !this.flipped; b.querySelector('.card')!.classList.toggle('flip', this.flipped); const sm = b.querySelector('small'); if (sm) sm.textContent = `${this.flipped ? 'hinten' : 'vorne'} · tippen zum Umdrehen`; return; }
      if (this.locked) return;
      if (b.dataset.o) this.sel = b.dataset.o;
      if (b.dataset.m) { const m = b.dataset.m; if (this.multi.has(m)) this.multi.delete(m); else if (!this.st.anzahl || this.multi.size < this.st.anzahl) this.multi.add(m); }
      if (b.dataset.r) this.rows[b.dataset.r] = b.dataset.v!;
      if (b.dataset.s) this.stamp = b.dataset.s;
      rerender();
    });
  }
}

/** Reihenfolge mischen (bei jedem Spiel neu, AUFGABEN Regel 2); `ok` verhindert z. B. die schon richtige Reihenfolge */
function mischen<T>(a: T[], ok: (x: T[]) => boolean): T[] {
  for (let n = 0; n < 20; n++) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    if (ok(b)) return b;
  }
  return [...a].reverse();
}

export function makeEngine(st: any): Engine {
  switch (st.motor) {
    case 'zielfeld': return new Ablage(st, 'zielfeld');
    case 'slots': return new Ablage(st, 'slots');
    case 'faden': return new Faden(st);
    case 'reihe': return new Reihe(st);
    case 'urteil': return new Urteil(st);
  }
  throw new Error('Motor unbekannt: ' + st.motor);
}
