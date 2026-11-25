/**
 * UI-Audit v8: läuft alle Bildschirme der Vorschau v8 über eine Matrix von Viewports, prüft jeden mit ui-pruef.mjs,
 * speichert Bilder, Kontaktbögen, audit.json und kurz.md (kompakt, für Prüfer gedacht).
 *
 * Aufruf: node scripts/ui-audit.mjs [--vp=320x568,360x640,...] [--nur=<regex auf Zustandsnamen>] [--name=<Lauf>]
 *            [--snapshot=<ordner>] [--compare=<ordner>] [--fs=20] [--insets=40,48] [--zoom=1.3] [--jobs=4] [--dpr=1]
 *            [--dist=<build-ordner>] [--url=http://localhost:4173]
 * Ausgabe: 03_screens/v8/audit/<name>/<viewport>/<nnn>_<zustand>.png, sheet_<viewport>[_n].png, audit.json, kurz.md
 * Vorher: npm run build; läuft schon `vite preview --port 4173`, wird er genutzt, sonst startet das Skript einen (oder --dist=<Ordner>
 * liefert einen Build-Ordner selbst aus, unabhängig von späteren Builds).
 *
 * Zustände werden per Sprung (window.__v8.stand + zeige) angesteuert; Zeit läuft über page.clock (deterministisch),
 * Math.random ist gesät, Animationen werden vor Messung und Bild zu Ende gesetzt.
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, copyFileSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pruefe, aggregiere, warteBereit, istInfo } from './ui-pruef.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HIER = dirname(fileURLToPath(import.meta.url));
const AUDIT = resolve(HIER, '../../03_screens/v8/audit');
const t0 = Date.now();

/* ---------- Aufrufargumente ---------- */
const arg = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...v] = a.slice(2).split('='); return [k, v.length ? v.join('=') : 'true']; }));
const STANDARD_VP = '320x568,360x620,360x640,360x800,390x844,412x915,430x932,480x854,600x960,768x1024,820x1180,1024x768,1280x800,844x390,1024x600';
const VPS = (arg.vp ?? STANDARD_VP).split(',').map((s) => { const [w, h] = s.split('x').map(Number); return { w, h, name: `${w}x${h}` }; });
const NUR = arg.nur ? new RegExp(arg.nur) : null;
const FS = +(arg.fs ?? 20);
const INSETS = arg.insets ? (([a, b]) => ({ top: +a, bottom: +b }))(arg.insets.split(',')) : null;
const ZOOM = arg.zoom ? +arg.zoom : 0;
const JOBS = +(arg.jobs ?? 4);
const DPR = +(arg.dpr ?? 1);
const NAME = arg.name ?? arg.snapshot ?? 'lauf-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const RUN = resolve(AUDIT, NAME);
const SNAP = arg.snapshot ? resolve(AUDIT, arg.snapshot) : null;
const VERGLEICH = arg.compare ? resolve(AUDIT, arg.compare) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')} min`;

/* ---------- kleiner Dateiserver: Build-Ordner (optional) und Audit-Ordner (/__audit/) ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
function startServer(dist) {
  const srv = createServer((q, a) => {
    try {
      const u = decodeURIComponent(q.url.split('?')[0]);
      if (u === '/__blank') { a.writeHead(200, { 'content-type': 'text/html' }); return a.end('<!doctype html><title>x</title>'); }
      const wurzel = u.startsWith('/__audit/') ? AUDIT : dist;
      const rel = u.startsWith('/__audit/') ? u.slice(9) : u;
      if (!wurzel) { a.writeHead(404); return a.end(); }
      let f = resolve(wurzel, '.' + (rel.startsWith('/') ? rel : '/' + rel));
      if (!f.startsWith(wurzel)) { a.writeHead(403); return a.end(); }
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
      if (!existsSync(f)) { a.writeHead(404); return a.end(); }
      a.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
      a.end(readFileSync(f));
    } catch (e) { a.writeHead(500); a.end(String(e)); }
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ port: srv.address().port, close: () => srv.close() })));
}
async function antwortet(url) { try { const r = await fetch(url, { signal: AbortSignal.timeout(2000) }); return r.ok; } catch { return false; } }

/* ---------- Seite öffnen (deterministisch) ---------- */
const INIT = `
  (() => {
    let a = 0x9E3779B9 >>> 0;
    Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { localStorage.removeItem('lesefall.v8'); } catch {}
    const glatt = (o) => (o && typeof o === 'object' ? { ...o, behavior: 'instant' } : o);
    const si = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function (o) { return si.call(this, glatt(o)); };
    const st = Element.prototype.scrollTo; Element.prototype.scrollTo = function (...x) { return st.apply(this, x.map(glatt)); };
  })();`;

/* ---------- ein Viewport ---------- */
async function laufViewport(browser, vp, cfg) {
  const dir = resolve(RUN, vp.name);
  if (!NUR) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const mobil = vp.w < 900 || !!ZOOM;
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: DPR, hasTouch: true, isMobile: mobil, reducedMotion: 'reduce', locale: 'de-DE' });
  await ctx.addInitScript(INIT);
  const L = { page: null, vp, ctx, dir, nr: 0, zustaende: [], nt: [], konsole: [], zoomModus: ZOOM ? 'nativ' : null, D: cfg.D, instabil: [] };
  const D = cfg.D;
  const nn = (n) => String(n).padStart(2, '0');

  /* ---- Grundoperationen ---- */
  L.neuSeite = async () => {
    if (L.page) await L.page.close().catch(() => {});
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    p.on('pageerror', (e) => L.konsole.push('Seitenfehler: ' + String(e).slice(0, 200)));
    p.on('console', (m) => { if (m.type() === 'error') L.konsole.push('Konsole: ' + m.text().slice(0, 200)); });
    await p.clock.install({ time: 1_700_000_000_000 });
    await p.goto(cfg.url + '/v8.html', { waitUntil: 'load' });
    await p.waitForFunction(() => !!window.__v8, null, { timeout: 15000 });
    L.page = p;
    await p.waitForTimeout(300); // Start-Promises (Schriften) laufen lassen
    await p.clock.pauseAt(1_700_000_000_000 + 5000); // ab hier steht die Zeit still und läuft nur über runFor
    await p.clock.runFor(200);
    if (INSETS) await p.addStyleTag({ content: `:root{--safe-area-inset-top:${INSETS.top}px;--safe-area-inset-bottom:${INSETS.bottom}px}` });
    if (ZOOM) {
      const mess = () => p.evaluate(() => { const e = document.querySelector('.tl') ?? document.querySelector('#app h1'); return e ? e.getBoundingClientRect().height : 0; });
      const vor = await mess();
      await p.addStyleTag({ content: `html{-webkit-text-size-adjust:${ZOOM * 100}%;text-size-adjust:${ZOOM * 100}%}` });
      await p.clock.runFor(100);
      const nach = await mess();
      L.zoomModus = nach > vor * 1.05 ? 'nativ' : 'naeherung';
    }
    await warteBereit(p);
    return p;
  };
  L.beruhigen = async (ms = 250) => {
    const p = L.page;
    await p.clock.runFor(ms);
    if (L.zoomModus === 'naeherung') {
      await p.evaluate((z) => { document.querySelectorAll('#app *').forEach((e) => { if (e.ownerSVGElement) return; if (!e.dataset.fz0) e.dataset.fz0 = getComputedStyle(e).fontSize; e.style.fontSize = (parseFloat(e.dataset.fz0) * z).toFixed(2) + 'px'; }); }, ZOOM);
      await p.clock.runFor(50);
    }
    await warteBereit(p);
    await p.evaluate(() => { for (const a of document.getAnimations()) { try { a.finish(); } catch { a.cancel(); } } });
  };
  L.wollen = (name) => !NUR || NUR.test(name);
  /** Zustand festhalten: prüfen und Bild speichern */
  L.zustand = async (name, ms = 250) => {
    if (!L.wollen(name)) return;
    try {
      await L.beruhigen(ms);
      const befunde = await pruefe(L.page, name, { insets: INSETS, vp: { w: vp.w, h: vp.h } });
      const nr = ++L.nr, datei = `${String(nr).padStart(3, '0')}_${name}.png`;
      await L.page.screenshot({ path: resolve(dir, datei), animations: 'disabled' });
      L.zustaende.push({ nr, name, datei, befunde: befunde.map((b) => ({ ...b, vp: vp.name })) });
    } catch (e) { L.nicht(name, 'Messung/Bild fehlgeschlagen: ' + String(e.message ?? e).split('\n')[0]); }
  };
  L.nicht = (name, grund) => { if (L.wollen(name)) L.nt.push({ name, grund }); };
  L.klick = async (sel, ms = 150) => { await L.page.click(sel, { timeout: 2500 }); await L.page.clock.runFor(ms); };
  L.box = async (sel, i = 0) => { const h = (await L.page.$$(sel))[i]; if (!h) throw new Error('nicht gefunden: ' + sel); await h.scrollIntoViewIfNeeded(); const b = await h.boundingBox(); if (!b) throw new Error('keine Box: ' + sel); return b; };
  L.klickAnteil = async (sel, fx, fy, i = 0, ms = 250) => { const b = await L.box(sel, i); await L.page.mouse.click(b.x + b.width * fx, b.y + b.height * fy); await L.page.clock.runFor(ms); };
  L.hat = async (sel) => !!(await L.page.$(sel));
  L.loese = async (ms = 1800) => { await L.page.evaluate(() => window.__v8.loese()); await L.page.clock.runFor(ms); };

  /* ---- Stand ---- */
  const kapSp = (k) => D.spuren.filter((s) => s.kap === k).map((s) => s.nr);
  const wegBis = (n) => D.spuren.filter((s) => s.nr <= n).flatMap((s) => s.fragenWeg ?? []);
  /** realistischer Spielstand: alles vor Spur n gelöst (nach dem Rätsel: auch n) */
  const stand = (n, i, nachRaetsel, extra = {}) => ({
    view: 'spur', weiter: 'spur', spur: n, i, blatt: 0, fertig: Array.from({ length: nachRaetsel ? n : n - 1 }, (_, k) => k + 1),
    tipps: n >= 1 && D.spuren[0].tipp ? { 1: D.spuren[0].tipp.richtig } : {}, tippPerle: n >= 3 && D.spuren[0].tipp ? 1 : 0,
    geklaert: wegBis(nachRaetsel ? n : n - 1), mix: [], intro: true, fs: FS, silben: true, fin: 0, name: '', ...extra,
  });
  L.sprung = async (o) => { await L.page.evaluate((o) => { const v = window.__v8; Object.assign(v.stand, o); v.zeige(); }, o); };
  L.momentWeg = async () => {
    if (!(await L.hat('.wzm'))) return false;
    const [x, y] = await L.page.evaluate(() => { const e = document.querySelector('.zk h2') ?? document.querySelector('.zug') ?? document.body; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, Math.max(4, r.top + r.height / 2)]; });
    await L.page.touchscreen.tap(x, y);
    await L.page.clock.runFor(120);
    return true;
  };
  const weiterBereit = async () => !!(await L.page.$('#fuss [data-a="weiter"]:not([disabled])'));

  /* ---- Fehlzüge je Rätselart (echte Klicks). Misslingt einer, steht er unter NOT TESTED ---- */
  const fehlzuege = {
    async buchstaben(z, s) {
      const rd0 = z.runden[0];
      for (const c of [...rd0.wort].reverse()) await L.klick(`.bs-lose .bk:text-is("${c}")`, 60);
      await L.zustand(`${s}_fehler_falsch`, 450);
      await L.sprung({}); await L.momentWeg();
      for (let r = 0; r < z.runden.length; r++) {
        const rd = z.runden[r];
        if (!rd.passt) {
          for (let i = 0; i < rd.wort.length; i++) await L.klick(`.bs-lose .bk >> nth=0`, 60);
          await L.page.clock.runFor(450);
          await L.zustand(`${s}_fehler_knopf`, 100);
          return;
        }
        await L.loese(900); await L.klick('#fuss [data-a="weiter"]', 300);
      }
      L.nicht(`${s}_fehler_knopf`, 'keine Runde mit passt=false gefunden');
    },
    async unterschiede(z, s) {
      await L.klickAnteil('.ub-bild', 0.05, 0.9); await L.zustand(`${s}_fehler_daneben`);
      const d = z.dinge[1], zz = d.zonen?.[0] ?? d;
      await L.klickAnteil('.ub-bild', zz.x / 100, zz.y / 100, 1); await L.zustand(`${s}_fehler_ein_treffer`);
      if (z.sortieren) {
        await L.loese(1500); await L.zustand(`${s}_sortieren`);
        const x = z.sortieren.dinge[0], falsch = z.sortieren.ziele.find((q) => q.id !== x.ziel).id;
        await L.klick(`.so-pool [data-d="${x.id}"]`); await L.klick(`.so-ziel[data-z="${falsch}"]`, 300); await L.zustand(`${s}_fehler_sortieren_falsch`);
      }
    },
    async versteckt(z, s) {
      const b = await L.box('.vb'), m = L.page.mouse;
      await m.move(b.x + b.width * 0.2, b.y + b.height * 0.3); await m.down();
      for (let i = 1; i <= 12; i++) await m.move(b.x + b.width * (0.2 + i * 0.05), b.y + b.height * (0.3 + (i % 2) * 0.3));
      await m.up(); await L.page.clock.runFor(200); await L.zustand(`${s}_fehler_gewischt`);
      await L.klick(`.vb-o[data-o="${z.optionen.find((o) => o !== z.buchstabe)}"]`, 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async reihe(z, s) {
      const gegeben = z.karten.map((k) => k.id);
      for (const [i, id] of gegeben.entries()) { await L.klick(`.rh-pool [data-k="${id}"]`, 60); await L.klick(`.rh-platz[data-p="${i}"]`, 60); }
      await L.zustand(`${s}_fehler_voll`);
      await L.klick('#fuss [data-a="fertig"]', 500); await L.zustand(`${s}_fehler_falsch`);
    },
    async ausschluss(z, s) {
      await L.klick(`.as-k[data-id="${z.loesung}"]`); await L.klick('#fuss [data-a="fertig"]', 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async sortieren(z, s) {
      const d = z.dinge[0], falsch = z.ziele.find((q) => q.id !== d.ziel).id;
      await L.klick(`.so-pool [data-d="${d.id}"]`); await L.klick(`.so-ziel[data-z="${falsch}"]`, 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async umdrehen(z, s) {
      await L.klick('#fuss [data-a="legen"]', 300); await L.zustand(`${s}_fehler_klebt`);
    },
    async klebstoff(z, s) {
      await L.klick('[data-a="dreh"]', 700); await L.zustand(`${s}_dreh`);
      await L.klickAnteil('.kl-mond', 0.5, 0.88); await L.zustand(`${s}_fehler_daneben`);
    },
    async suchbild(z, s) { await L.klickAnteil('.sb-bild', 0.1, 0.85); await L.zustand(`${s}_fehler_daneben`); },
    async lupe(z, s) { await L.klickAnteil('.lp-box', 0.2, 0.2, 0, 300); await L.zustand(`${s}_fehler_daneben`); },
    async schatten(z, s) {
      const falsch = await L.page.$eval(`.sc-k:not([data-i="${z.richtig}"])`, (e) => e.dataset.i);
      await L.klick(`.sc-k[data-i="${falsch}"]`, 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async kreise(z, s) {
      const rich = z.erinnern.karten.filter((k) => k.richtig).map((k) => k.id), falsch0 = z.erinnern.karten.find((k) => !k.richtig).id;
      await L.klick(`.kr-mk[data-m="${falsch0}"]`); await L.klick(`.kr-mk[data-m="${rich[0]}"]`); await L.klick('#fuss [data-a="pruefen"]', 300); await L.zustand(`${s}_fehler_erinnern`);
    },
    async agentencode(z, s) {
      await L.klick('.ag-feld .ag-t[data-w="0"][data-i="0"]'); await L.klick('#fuss [data-a="pruefen"]', 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async plakat(z, s) {
      const N = z.spalten * z.zeilen;
      for (let i = 0; i < N; i++) { await L.klick(`.pk-pool .pk-st[data-s="${i}"]`, 40); await L.klick(`.pk-platz[data-p="${(i + 1) % N}"]`, 40); }
      await L.zustand(`${s}_fehler_voll`);
      await L.klick('#fuss [data-a="fertig"]', 600); await L.zustand(`${s}_fehler_falsch`);
    },
    async astgabel(z, s) {
      const q = z.runden[0];
      await L.klick(`.vb-o[data-o="${q.optionen.find((o) => o !== q.buchstabe)}"]`, 300); await L.zustand(`${s}_fehler_falsch`);
    },
    async spiegel(z, s) {
      const falsch = z.lesungen.findIndex((_, i) => i !== z.richtig);
      await L.klick(`.sp-o[data-o="${falsch}"]`, 300); await L.zustand(`${s}_fehler_falsch`);
    },
  };

  /* ---- Schritte einer Spur ---- */
  async function lesen(n, i, s) {
    await L.sprung(stand(n, i, false));
    await L.zustand(`${s}_lesen_1`);
    for (let k = 2; k <= 16; k++) {
      if (!(await L.hat('#fuss [data-a="next"]'))) break;
      try { await L.klick('#fuss [data-a="next"]', 400); } catch (e) { L.nicht(`${s}_lesen_${k}`, 'Weiter-Pfeil nicht klickbar: ' + String(e.message).split('\n')[0]); break; }
      await L.zustand(`${s}_lesen_${k}`);
    }
  }
  async function raetsel(n, i, s, sp) {
    const z = sp.raetsel;
    // A: Werkzeug-Moment, Start, Fehlzug
    await L.sprung(stand(n, i, false));
    if (await L.hat('.wzm')) await L.zustand(`${s}_moment`, 200);
    await L.momentWeg();
    await L.zustand(`${s}_raetsel`);
    if (!L.wollen(`${s}_fehler`) && !NUR) { /* alles andere läuft ohnehin */ }
    const fz = fehlzuege[z.art];
    if (fz) { try { await fz(z, s); } catch (e) { L.nicht(`${s}_fehler (${z.art})`, 'Fehlzug misslungen: ' + String(e.message ?? e).split('\n')[0].slice(0, 140)); } }
    else L.nicht(`${s}_fehler (${z.art})`, 'kein Fehlzug für diese Art umgesetzt (zu aufwändig)');
    // B: lösen (wiederholt, bis „Weiter“ da ist)
    await L.sprung(stand(n, i, false));
    await L.momentWeg();
    let ok = false;
    const geloest = () => L.page.evaluate((n) => window.__v8.stand.fertig.includes(n), n);
    for (let k = 1; k <= 6; k++) {
      try { await L.loese(1800); } catch (e) { L.nicht(`${s}_geloest (${z.art})`, 'loese() fehlgeschlagen: ' + String(e.message).split('\n')[0]); break; }
      if ((await geloest()) && (await weiterBereit())) { await L.zustand(`${s}_geloest`); ok = true; break; }
      await L.zustand(`${s}_loese${k}`);
      // Zwischenschritte: „Weiter“ in die nächste Runde oder ein Stempel-Knopf in der Fußzeile
      const knopf = (await weiterBereit()) ? '#fuss [data-a="weiter"]' : (await L.page.$('#fuss [data-a="stempeln"]:not([disabled])')) ? '#fuss [data-a="stempeln"]' : null;
      if (knopf) { try { await L.klick(knopf, 1500); } catch { /* nächster Versuch */ } if ((await geloest()) && (await weiterBereit())) { await L.zustand(`${s}_geloest`); ok = true; break; } }
    }
    if (!ok) L.nicht(`${s}_geloest (${z.art})`, 'Weiter wurde nach 6 loese()-Aufrufen nicht aktiv');
  }
  async function brett(n, i, s) {
    await L.sprung(stand(n, i, true, { geklaert: wegBis(n - 1) }));
    await L.zustand(`${s}_brett_neu`);
    let frage = false, ok = false;
    for (let k = 1; k <= 5; k++) {
      if (!frage && (await L.hat('.fr-frage'))) {
        frage = true; await L.zustand(`${s}_brett_frage`);
        if (await L.hat('.zettel.fr:not([data-ok])')) {
          try { await L.klick('.zettel.fr:not([data-ok])', 300); await L.zustand(`${s}_brett_frage_falsch`); await L.klick('.zettel.fr:not([data-ok])', 300); await L.zustand(`${s}_brett_frage_hilfe`); }
          catch (e) { L.nicht(`${s}_brett_frage_falsch`, 'Klick auf falsche Frage misslungen: ' + String(e.message).split('\n')[0].slice(0, 120)); }
        }
      }
      await L.loese(1500);
      if (await weiterBereit()) { await L.zustand(`${s}_brett_fertig`); ok = true; break; }
      if (!frage && (await L.hat('.fr-frage'))) continue;
      await L.zustand(`${s}_brett_loese${k}`);
    }
    if (!ok) L.nicht(`${s}_brett_fertig`, 'Weiter erschien nicht nach 5 loese()-Aufrufen');
  }

  /* ---- Gesamtablauf ---- */
  const wanted = (prefix, suffixe) => !NUR || suffixe.some((x) => NUR.test(prefix + x));
  try {
    await L.neuSeite();
    // Titel, Einführung
    if (wanted('', ['titel', 'titel_weiter', 'intro_1'])) {
      await L.sprung({ ...stand(1, 0, false), view: 'titel', weiter: 'intro', intro: false, fertig: [] }); await L.zustand('titel');
      await L.sprung({ ...stand(4, 0, false), view: 'titel', weiter: 'spur' }); await L.zustand('titel_weiter');
      await L.sprung({ ...stand(1, 0, false), view: 'intro', intro: false, fertig: [] });
      const nIntro = D.intro.length;
      for (let k = 1; k <= nIntro; k++) {
        await L.zustand(`intro_${k}`);
        if (k < nIntro) { try { await L.klick('#fuss [data-a="w"]', 300); } catch (e) { L.nicht(`intro_${k + 1}`, 'Weiter nicht klickbar: ' + String(e.message).split('\n')[0]); break; } }
      }
    }
    // Kapitelkarten
    for (const k of D.kapitel.map((x) => x.nr)) {
      if (!wanted(`kap${k}_`, ['karte'])) continue;
      const erst = kapSp(k)[0];
      await L.sprung({ ...stand(erst, 0, false), view: 'kapitel', weiter: 'kapitel' }); await L.zustand(`kap${k}_karte`);
    }
    // Spuren
    for (const sp of D.spuren) {
      const n = sp.nr;
      const sl = `s${nn(n)}`;
      if (!wanted(sl + '_', ['lesen_1', 'moment', 'raetsel', 'geloest', 'fehler_falsch', 'brett_neu', 'brett_fertig', 'haken', 'tippfrage', 'tippaufl'])) continue;
      await L.neuSeite();
      const steps = await L.page.evaluate((n) => window.__v8.steps(n), n);
      for (const [i, st] of steps.entries()) {
        try {
          if (st === 'lesen') await lesen(n, i, sl);
          else if (st === 'tippAufl') {
            await L.sprung(stand(n, i, false)); await L.zustand(`${sl}_tippaufl`);
            await L.sprung({ ...stand(n, i, false), tipps: { 1: D.spuren[0].tipp.optionen.find((o) => o.id !== D.spuren[0].tipp.richtig).id }, tippPerle: 0 }); await L.zustand(`${sl}_tippaufl_falsch`);
          } else if (st === 'raetsel') await raetsel(n, i, sl, sp);
          else if (st === 'brett') await brett(n, i, sl);
          else if (st === 'tippFrage') {
            await L.sprung(stand(n, i, true)); await L.zustand(`${sl}_tippfrage`);
            try { await L.klick('.opt[data-o="a"]', 200); await L.zustand(`${sl}_tippfrage_gewaehlt`); } catch (e) { L.nicht(`${sl}_tippfrage_gewaehlt`, String(e.message).split('\n')[0]); }
          } else if (st === 'haken') { await L.sprung(stand(n, i, true)); await L.zustand(`${sl}_haken`); }
        } catch (e) { L.nicht(`${sl}_${st}`, 'Schritt abgebrochen: ' + String(e.message ?? e).split('\n')[0].slice(0, 160)); }
      }
    }
    // Fallkarten und Ausblicke
    for (const k of D.kapitel.map((x) => x.nr)) {
      if (!wanted(`kap${k}_`, ['fallkarte', 'ausblick'])) continue;
      await L.neuSeite();
      const sps = kapSp(k), letzt = sps[sps.length - 1];
      const fk = { ...stand(letzt, 0, true), view: 'fallkarte', weiter: 'fallkarte', geklaert: wegBis(letzt) };
      try {
        await L.sprung(fk); await L.zustand(`kap${k}_fallkarte`);
        await L.klick('#fuss [data-a="stempeln"]', 1600); await L.zustand(`kap${k}_fallkarte_stempel`);
        await L.loese(1500); await L.zustand(`kap${k}_fallkarte_fertig`);
      } catch (e) { L.nicht(`kap${k}_fallkarte_stempel`, 'Stempeln misslungen: ' + String(e.message).split('\n')[0].slice(0, 140)); }
      if (D.kapitel[k]) { await L.sprung({ ...fk, view: 'ausblick', weiter: 'ausblick' }); await L.zustand(`kap${k}_ausblick`); }
    }
    // Finale
    if (wanted('finale_', ['0', '1', '2', '3', '4'])) {
      await L.neuSeite();
      const fin = { ...stand(24, 0, true), view: 'finale', weiter: 'finale', fertig: D.spuren.map((x) => x.nr), geklaert: wegBis(24), name: 'Mia' };
      try {
        await L.sprung({ ...fin, fin: 0 }); await L.zustand('finale_0');
        await L.sprung({ ...fin, fin: 1 }); await L.zustand('finale_1');
        const ks = await L.page.$$eval('.fin-k:not(.weg)', (e) => e.map((x) => x.dataset.k));
        for (const k of ks) await L.klick(`.fin-k[data-k="${k}"]`, 60);
        await L.page.clock.runFor(300); await L.zustand('finale_1_falsch');
        await L.sprung({ ...fin, fin: 2 }); await L.zustand('finale_2_start', 100);
        await L.page.clock.runFor(3200); await L.zustand('finale_2_offen', 300);
        await L.sprung({ ...fin, fin: 3 }); await L.zustand('finale_3');
        await L.sprung({ ...fin, fin: 3, name: '' }); await L.zustand('finale_3_leer');
        await L.sprung({ ...fin, fin: 3, name: '' });
        await L.klick('#dname'); await L.page.keyboard.type('Maximilian-Alexander Schmidt', { delay: 0 }); await L.zustand('finale_3_name_lang_fokus', 300);
        await L.sprung({ ...fin, fin: 4 }); await L.zustand('finale_4');
      } catch (e) { L.nicht('finale_*', 'Finale abgebrochen: ' + String(e.message ?? e).split('\n')[0].slice(0, 140)); }
    }
    // Overlays
    if (wanted('ueber_', ['brett_k1', 'karte_gross', 'tresorinfo', 'aa', 'neustart', 'brett_k3'])) {
      await L.neuSeite();
      const k1 = kapSp(1), k3 = kapSp(3);
      const basis1 = { ...stand(k1[k1.length - 1], 0, true), geklaert: wegBis(k1[k1.length - 1] - 1) };
      const basis3 = { ...stand(k3[2], 0, true), geklaert: wegBis(k3[2] - 1) };
      const overlay = async (name, basis, schritt) => { try { await L.sprung(basis); await schritt(); await L.zustand(name, 400); } catch (e) { L.nicht(name, String(e.message ?? e).split('\n')[0].slice(0, 140)); } };
      await overlay('ueber_brett_k1', basis1, () => L.klick('#bBrett', 300));
      await overlay('ueber_karte_gross', basis1, async () => { await L.klick('#bBrett', 300); await L.klick('.ueberl .bkarte[data-k]', 300); });
      await overlay('ueber_tresorinfo', basis1, async () => { await L.klick('#bBrett', 300); await L.klick('.ueberl .beutel[data-a="code"]', 300); });
      await overlay('ueber_brett_k3', basis3, () => L.klick('#bBrett', 300));
      await overlay('ueber_aa', stand(3, 0, false), () => L.klick('#bAa', 300));
      await overlay('ueber_neustart', stand(3, 0, false), async () => { await L.klick('#bAa', 300); await L.klick('.einst [data-a="neu"]', 300); });
    }
  } catch (e) { L.nicht('(Viewport)', 'Lauf abgebrochen: ' + String(e.stack ?? e).split('\n').slice(0, 3).join(' | ').slice(0, 300)); }
  await ctx.close().catch(() => {});
  return L;
}

/* ---------- Kontaktbögen und Vergleich (im Browser, ohne Abhängigkeiten) ---------- */
async function kontaktbogen(browser, base, L, vpName) {
  if (!L.zustaende.length) return [];
  const page = await browser.newPage();
  await page.goto(base + '/__blank');
  const items = L.zustaende.map((z) => ({ url: `${base}/__audit/${NAME}/${vpName}/${z.datei}`, label: `${z.nr} ${z.name}`, rot: z.befunde.some((b) => !istInfo(b.typ)) }));
  const bogen = await page.evaluate(async ({ items, maxH }) => {
    const BR = 200, SP = 8, LAB = 16, SPALTEN = 8;
    const lade = (u) => new Promise((ok) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = u; });
    const bilder = [];
    for (const it of items) bilder.push(await lade(it.url));
    const ersteGueltig = bilder.find(Boolean);
    if (!ersteGueltig) return [];
    const th = Math.round(BR * ersteGueltig.naturalHeight / ersteGueltig.naturalWidth), zeile = th + LAB + SP;
    const reihenProBogen = Math.max(1, Math.floor((maxH - SP) / zeile)), proBogen = reihenProBogen * SPALTEN;
    const out = [];
    for (let s = 0; s * proBogen < items.length; s++) {
      const teil = items.slice(s * proBogen, (s + 1) * proBogen), rows = Math.ceil(teil.length / SPALTEN);
      const cv = document.createElement('canvas'); cv.width = SPALTEN * (BR + SP) + SP; cv.height = rows * zeile + SP;
      const g = cv.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, cv.width, cv.height);
      teil.forEach((it, k) => {
        const x = SP + (k % SPALTEN) * (BR + SP), y = SP + Math.floor(k / SPALTEN) * zeile, im = bilder[s * proBogen + k];
        if (im) g.drawImage(im, x, y + LAB, BR, th);
        g.fillStyle = '#fff'; g.font = '11px sans-serif'; g.fillText(it.label.length > 34 ? it.label.slice(0, 33) + '…' : it.label, x, y + 12);
        if (it.rot) { g.strokeStyle = '#ff2a2a'; g.lineWidth = 3; g.strokeRect(x - 1, y + LAB - 1, BR + 2, th + 2); }
      });
      out.push(cv.toDataURL('image/png').split(',')[1]);
    }
    return out;
  }, { items, maxH: 4000 });
  await page.close();
  const dateien = [];
  bogen.forEach((b64, k) => { const f = `sheet_${vpName}${bogen.length > 1 ? '_' + (k + 1) : ''}.png`; writeFileSync(resolve(RUN, f), Buffer.from(b64, 'base64')); dateien.push(f); });
  return dateien;
}
/** Pixelvergleich mit gespeicherten Bildern: Toleranz je Kanal > 8 */
async function vergleiche(browser, base, L, vpName) {
  const refDir = resolve(VERGLEICH, vpName);
  const ergebnis = [];
  if (!existsSync(refDir)) { return L.zustaende.map((z) => ({ state: z.name, fehlt: true })); }
  const refDateien = new Map(readdirSync(refDir).filter((f) => f.endsWith('.png')).map((f) => [f.replace(/^\d+_/, '').replace(/\.png$/, ''), f]));
  const page = await browser.newPage();
  await page.goto(base + '/__blank');
  mkdirSync(resolve(RUN, vpName, 'diff'), { recursive: true });
  for (const z of L.zustaende) {
    const ref = refDateien.get(z.name);
    if (!ref) { ergebnis.push({ state: z.name, fehlt: true }); continue; }
    const rel = (d, f) => `${base}/__audit/${d}/${vpName}/${f}`;
    const r = await page.evaluate(async ({ a, b, schwelle }) => {
      const lade = (u) => new Promise((ok, err) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => err(new Error('Bild fehlt ' + u)); i.src = u; });
      const [A, B] = await Promise.all([lade(a), lade(b)]);
      const w = Math.max(A.naturalWidth, B.naturalWidth), h = Math.max(A.naturalHeight, B.naturalHeight);
      const px = (im) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); return g.getImageData(0, 0, w, h); };
      const da = px(A), db = px(B), diff = new Uint8ClampedArray(w * h * 4);
      let n = 0;
      for (let i = 0; i < w * h; i++) {
        const o = i * 4, d = Math.max(Math.abs(da.data[o] - db.data[o]), Math.abs(da.data[o + 1] - db.data[o + 1]), Math.abs(da.data[o + 2] - db.data[o + 2]), Math.abs(da.data[o + 3] - db.data[o + 3]));
        if (d > 8) { n++; diff[o] = 255; diff[o + 3] = 255; } else { diff[o] = da.data[o] >> 2; diff[o + 1] = da.data[o + 1] >> 2; diff[o + 2] = da.data[o + 2] >> 2; diff[o + 3] = 255; }
      }
      const pct = (n / (w * h)) * 100;
      let bild = null;
      if (pct > schwelle) {
        const c = document.createElement('canvas'); c.width = w * 3 + 20; c.height = h; const g = c.getContext('2d');
        g.fillStyle = '#444'; g.fillRect(0, 0, c.width, c.height); g.drawImage(A, 0, 0); g.drawImage(B, w + 10, 0);
        const m = document.createElement('canvas'); m.width = w; m.height = h; m.getContext('2d').putImageData(new ImageData(diff, w, h), 0, 0); g.drawImage(m, 2 * w + 20, 0);
        bild = c.toDataURL('image/png').split(',')[1];
      }
      return { n, pct, bild, masse: [A.naturalWidth, A.naturalHeight, B.naturalWidth, B.naturalHeight] };
    }, { a: rel(VERGLEICH.slice(AUDIT.length + 1), ref), b: rel(NAME, z.datei), schwelle: 0.05 }).catch((e) => ({ fehler: String(e.message).slice(0, 100) }));
    if (r.fehler) { ergebnis.push({ state: z.name, fehler: r.fehler }); continue; }
    if (r.bild) writeFileSync(resolve(RUN, vpName, 'diff', `${z.name}_diff.png`), Buffer.from(r.bild, 'base64'));
    ergebnis.push({ state: z.name, pixel: r.n, prozent: +r.pct.toFixed(4), masse: r.masse.join(',') });
  }
  await page.close();
  return ergebnis;
}

/* ---------- Bericht ---------- */
function kurzBericht(laeufe, vgl, meta) {
  const alle = laeufe.flatMap((L) => L.zustaende.flatMap((z) => z.befunde));
  const agg = aggregiere(alle);
  const probleme = agg.filter((g) => !istInfo(g.typ)), infos = agg.filter((g) => istInfo(g.typ));
  const zeilen = [];
  const nZ = laeufe.reduce((a, L) => a + L.zustaende.length, 0), nNT = laeufe.reduce((a, L) => a + L.nt.length, 0);
  zeilen.push(`# UI-Audit „${NAME}“ · ${meta.datum} · ${fmt(Date.now() - t0)}`);
  zeilen.push(`Build: ${meta.quelle} · Viewports: ${laeufe.map((L) => L.vp.name).join(' ')} · fs=${FS}${INSETS ? ` · insets=${INSETS.top},${INSETS.bottom}` : ''}${ZOOM ? ` · zoom=${ZOOM} (${laeufe[0]?.zoomModus === 'nativ' ? 'nativ per text-size-adjust' : 'NÄHERUNG per Schriftgrößen×' + ZOOM})` : ''} · dpr=${DPR}`);
  zeilen.push(`Zustände×Viewport: ${nZ} · mit Problemen: ${laeufe.reduce((a, L) => a + L.zustaende.filter((z) => z.befunde.some((b) => !istInfo(b.typ))).length, 0)} · NOT TESTED: ${nNT} · Konsolenfehler: ${laeufe.reduce((a, L) => a + L.konsole.length, 0)}`);
  zeilen.push('', '## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)');
  const typen = new Map();
  for (const g of agg) { const t = typen.get(g.typ) ?? { u: 0, n: 0 }; t.u++; t.n += g.n; typen.set(g.typ, t); }
  zeilen.push([...typen.entries()].sort((a, b) => b[1].n - a[1].n).map(([t, v]) => `${t}${istInfo(t) ? '(i)' : ''} ${v.u}·${v.n}`).join(' | '));
  zeilen.push('', '## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände');
  const MAXP = 82;
  for (const g of probleme.slice(0, MAXP)) {
    const b = g.beispiele[0];
    zeilen.push(`${g.typ} · ${g.sel} · ${g.zustaende.size}Z · ${g.vps.size}V · ${b.state}@${b.vp} · ${b.info.slice(0, 150)}`);
  }
  if (probleme.length > MAXP) zeilen.push(`… ${probleme.length - MAXP} weitere in audit.json`);
  if (infos.length) {
    zeilen.push('', '## Info (Rollen/Kürzen, kein Fehler)');
    for (const g of infos.slice(0, 10)) { const b = g.beispiele[0]; zeilen.push(`${g.typ} · ${g.sel} · ${g.zustaende.size}Z · ${g.vps.size}V · ${b.state}@${b.vp} · ${b.info.slice(0, 90)}`); }
    if (infos.length > 10) zeilen.push(`… ${infos.length - 10} weitere`);
  }
  if (vgl) {
    zeilen.push('', `## Pixelvergleich mit „${arg.compare}“ (Toleranz je Kanal > 8; gemeldet ab > 0,05 %)`);
    const flach = vgl.flatMap((v) => v.ergebnis.map((e) => ({ vp: v.vp, ...e })));
    const ueber = flach.filter((e) => e.prozent > 0.05), fehlt = flach.filter((e) => e.fehlt || e.fehler);
    zeilen.push(`Verglichen: ${flach.length - fehlt.length} · Abweichung > 0,05 %: ${ueber.length} · ohne Referenz/Fehler: ${fehlt.length}`);
    for (const e of ueber.slice(0, 25)) zeilen.push(`pixel-diff · ${e.state}@${e.vp} · ${e.pixel}px = ${e.prozent} %`);
    if (ueber.length > 25) zeilen.push(`… ${ueber.length - 25} weitere`);
    const kleine = flach.filter((e) => e.pixel > 0 && e.prozent <= 0.05).length;
    zeilen.push(`Kleinstabweichungen (0 < Diff ≤ 0,05 %): ${kleine}`);
  }
  zeilen.push('', '## NOT TESTED (nicht erreicht, nie als bestanden gezählt)');
  const gr = new Map();
  for (const L of laeufe) for (const x of L.nt) { const k = x.grund.replace(/\d+(\.\d+)?px/g, 'Npx'); const e = gr.get(k) ?? { n: 0, namen: new Set(), vps: new Set() }; e.n++; e.namen.add(x.name); e.vps.add(L.vp.name); gr.set(k, e); }
  const liste = [...gr.entries()].sort((a, b) => b[1].n - a[1].n);
  for (const [grund, e] of liste.slice(0, 24)) zeilen.push(`${e.namen.size} Zustände/${e.vps.size}V · ${grund.slice(0, 110)} · z. B. ${[...e.namen].slice(0, 4).join(', ')}`);
  if (liste.length > 24) zeilen.push(`… ${liste.length - 24} weitere Gründe in audit.json`);
  if (!liste.length) zeilen.push('(keine)');
  return { text: zeilen.join('\n') + '\n', agg, probleme, infos };
}

/* ---------- Hauptlauf ---------- */
mkdirSync(RUN, { recursive: true });
const dist = arg.dist ? resolve(arg.dist) : null;
const srv = await startServer(dist);
let url = dist ? `http://127.0.0.1:${srv.port}` : (arg.url ?? 'http://localhost:4173');
let preview = null;
if (!dist && !(await antwortet(url + '/v8.html'))) {
  console.log('Starte vite preview auf 4173 …');
  preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: resolve(HIER, '..'), stdio: 'ignore', detached: true });
  for (let k = 0; k < 40 && !(await antwortet(url + '/v8.html')); k++) await sleep(500);
  if (!(await antwortet(url + '/v8.html'))) { console.error('Kein Server erreichbar. Zuerst npm run build.'); preview.kill(); srv.close(); process.exit(0); }
}
const browser = await chromium.launch();
const base = `http://127.0.0.1:${srv.port}`;
// Daten einmal holen
const cfg = { url };
{
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto(url + '/v8.html'); await p.waitForFunction(() => !!window.__v8, null, { timeout: 15000 });
  cfg.D = await p.evaluate(() => JSON.parse(JSON.stringify({ spuren: window.__v8.D.spuren.map((s) => ({ nr: s.nr, spur: s.spur, kap: s.kap, tipp: s.tipp ? { richtig: s.tipp.richtig, optionen: s.tipp.optionen.map((o) => ({ id: o.id })) } : null, fragenWeg: s.fragenWeg ?? [], raetsel: s.raetsel })), kapitel: window.__v8.D.kapitel.map((k) => ({ nr: k.nr })), intro: window.__v8.D.intro.map(() => 1) })));
  await c.close();
}
const queue = [...VPS], laeufe = [];
let fertigeVp = 0;
async function arbeiter() {
  while (queue.length) {
    const vp = queue.shift(), s0 = Date.now();
    let L;
    try { L = await laufViewport(browser, vp, cfg); } catch (e) { console.error(`${vp.name}: Lauf abgebrochen`, e.message); continue; }
    L.dateien = await kontaktbogen(browser, base, L, vp.name).catch((e) => { console.error('Kontaktbogen', e.message); return []; });
    if (VERGLEICH) L.vergleich = await vergleiche(browser, base, L, vp.name).catch((e) => { console.error('Vergleich', e.message); return []; });
    if (SNAP && SNAP !== RUN) {
      const ziel = resolve(SNAP, vp.name); rmSync(ziel, { recursive: true, force: true }); mkdirSync(ziel, { recursive: true });
      for (const z of L.zustaende) copyFileSync(resolve(RUN, vp.name, z.datei), resolve(ziel, z.datei));
    }
    laeufe.push(L);
    const probl = L.zustaende.filter((z) => z.befunde.some((b) => !istInfo(b.typ))).length;
    console.log(`[${++fertigeVp}/${VPS.length}] ${vp.name}: ${L.zustaende.length} Zustände (${probl} mit Problemen), ${L.nt.length} NOT TESTED, ${fmt(Date.now() - s0)}`);
  }
}
await Promise.all(Array.from({ length: Math.max(1, JOBS) }, arbeiter));
await browser.close();
laeufe.sort((a, b) => VPS.findIndex((v) => v.name === a.vp.name) - VPS.findIndex((v) => v.name === b.vp.name));

const vgl = VERGLEICH ? laeufe.map((L) => ({ vp: L.vp.name, ergebnis: L.vergleich ?? [] })) : null;
const meta = { datum: new Date().toISOString().slice(0, 16).replace('T', ' '), quelle: dist ? `Ordner ${arg.dist}` : url };
const { text, agg } = kurzBericht(laeufe, vgl, meta);
writeFileSync(resolve(RUN, 'kurz.md'), text);
writeFileSync(resolve(RUN, 'audit.json'), JSON.stringify({
  name: NAME, meta, args: arg, dauerMs: Date.now() - t0, zoomModus: laeufe[0]?.zoomModus ?? null,
  viewports: laeufe.map((L) => ({ vp: L.vp.name, bogen: L.dateien, konsole: [...new Set(L.konsole)].slice(0, 30), nt: L.nt, zustaende: L.zustaende.map((z) => ({ nr: z.nr, name: z.name, datei: z.datei, befunde: z.befunde })) })),
  aggregiert: agg.map((g) => ({ typ: g.typ, sel: g.sel, treffer: g.n, zustaende: [...g.zustaende], viewports: [...g.vps], beispiele: g.beispiele })),
  vergleich: vgl,
}, null, 1));
srv.close();
if (preview) { try { process.kill(-preview.pid); } catch { /* weg */ } }

// Zusammenfassung auf einen Blick
const nZ = laeufe.reduce((a, L) => a + L.zustaende.length, 0), nNT = laeufe.reduce((a, L) => a + L.nt.length, 0);
console.log(`\nUI-Audit „${NAME}“ fertig in ${fmt(Date.now() - t0)}: ${laeufe.length} Viewports, ${nZ} Zustände, ${nNT} NOT TESTED`);
console.log(text.split('\n').slice(3, 14).join('\n'));
console.log(`\n→ ${RUN}/kurz.md · audit.json · sheet_*.png`);
if (vgl) { const f = vgl.flatMap((v) => v.ergebnis); console.log(`Vergleich: ${f.filter((e) => e.prozent === 0).length} identisch, ${f.filter((e) => e.prozent > 0.05).length} > 0,05 %`); }
process.exit(0);
