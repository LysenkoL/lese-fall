/**
 * UI-Prüfer für Lese-Fall v8: EIN Durchlauf im Browser pro Bildschirm, liefert Befunde {typ, sel, info}.
 * Alles gegen das echte Layout (getBoundingClientRect, elementFromPoint), keine erzwungenen Klicks.
 *
 *   import { pruefe, aggregiere } from './ui-pruef.mjs';
 *   const befunde = await pruefe(page, 'zustandsname', { insets: { top: 40, bottom: 48 }, vp: { w: 360, h: 620 } });
 *
 * `sel` ist stabil und ohne Zahlen („button.kn.haupt @ .zug[data-art=buchstaben]“), die Messwerte stehen in `info`.
 * Typen: doc-breit · ragt-raus · verdeckt · unerreichbar · text-verdeckt · text-abgeschnitten · text-gekuerzt · text-ragt-raus ·
 *        tippflaeche-klein · schrift-klein · bild-verzerrt · bild-winzig · blatt-rollt · zug-rollt · brett-rollt · ueber-rollt ·
 *        rollt · rollt-doppelt · fuss-ab · kopf-ueberlappt · safe-area · safe-doppelt
 */

/** reine Hinweise (kein Fehler): Rollen und absichtliches Kürzen */
export const INFO_TYPEN = new Set(['blatt-rollt', 'zug-rollt', 'brett-rollt', 'ueber-rollt', 'rollt', 'rollt-doppelt', 'text-gekuerzt']);
export const istInfo = (typ) => INFO_TYPEN.has(typ);

/** Wartet auf Schriften und darauf, dass alle sichtbaren Bilder fertig dekodiert sind */
export async function warteBereit(page, maxMs = 4000) {
  await page.evaluate(async (maxMs) => {
    const frist = new Promise((r) => setTimeout(r, maxMs));
    const arbeit = (async () => {
      await document.fonts.ready;
      const bilder = [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      await Promise.all(bilder.map((i) => (i.complete ? (i.decode ? i.decode().catch(() => {}) : 0) : new Promise((res) => { i.addEventListener('load', res, { once: true }); i.addEventListener('error', res, { once: true }); }))));
    })();
    await Promise.race([arbeit, frist]);
  }, maxMs);
}

/** Läuft im Browser. Muss in sich geschlossen sein (wird serialisiert). */
const IM_BROWSER = ({ insets, max, vp }) => {
  const app = document.getElementById('app');
  if (!app) return [{ typ: 'doc-breit', sel: '#app', info: '#app fehlt' }];
  const A = app.getBoundingClientRect();
  const VW = innerWidth, VH = innerHeight;
  const insO = insets ? insets.top : 0, insU = insets ? insets.bottom : 0;
  const csC = new Map();
  const cs = (e) => { let c = csC.get(e); if (!c) { c = getComputedStyle(e); csC.set(e, c); } return c; };
  const R = (e) => e.getBoundingClientRect();
  const r1 = (x) => Math.round(x * 10) / 10;

  /* ---------- Beschreibung ---------- */
  const DYN = new Set(['ein2', 'nein', 'zeig', 'geht', 'zieht', 'an', 'war', 'da', 'hoch', 'fliegt', 'gepinnt', 'faellt', 'frisch', 'puls', 'tanzt', 'achtung']);
  const cl = (e) => [...(e.classList || [])].filter((c) => !DYN.has(c)).slice(0, 3).map((c) => '.' + c).join('');
  const ANCH = '#fuss,.kopf,.wzm,.fundov,.einst,.kgross,.brett,.blatt,.zug,.haken,.titel,.intro,.kapk,.fin,.dipl';
  const art = (e) => (e.dataset && e.dataset.art ? `[data-art=${e.dataset.art}]` : '');
  const datenAttr = (e) => { const a = e.getAttributeNames().find((x) => /^data-(?!art$|wz$)/.test(x)); return a ? `[${a}]` : ''; };
  const basis = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cl(e) || datenAttr(e)) + art(e);
  const desc = (e) => {
    let s = basis(e);
    const a = e.parentElement && e.parentElement.closest(ANCH);
    const ue = e.id !== 'ueber' && e.closest('#ueber');
    if (a && a !== app) s += ' @ ' + (ue ? '#ueber ' : '') + ((a.id ? '#' + a.id : '') + cl(a) + art(a));
    else if (ue) s += ' @ #ueber';
    return s;
  };

  /* ---------- Sammeln mit Deckel ---------- */
  const agg = new Map(), proTyp = new Map();
  const add = (typ, e, info, selNeu) => {
    const sel = selNeu ?? desc(e), k = typ + '|' + sel;
    const f = agg.get(k);
    if (f) { f.n++; return; }
    if ((proTyp.get(typ) || 0) >= max) return;
    proTyp.set(typ, (proTyp.get(typ) || 0) + 1);
    agg.set(k, { typ, sel, info, n: 1 });
  };

  /* ---------- Hilfen ---------- */
  const DECO = '.lampe,.lampe *,.himmel,.himmel *,.wzfx,.wzfx *,.fx,.fx *,.fxp,.brush,.brush *,.tv-licht,canvas.staub';
  const LAYOUT = '#app,#buehne,#fuss,#ueber,.kopf,.zug,.blatt,.brett,.haken,.titel,.intro,.kapk,.fin,.schl,.einst,.zi,.zr,.zk';
  const INTER = 'button,[role=button],[data-a],[data-o],[data-k],[data-q],[data-f],[data-si],[data-d],[data-z],[data-p],[data-s],[data-g],[data-x],[data-id],[data-i],.opt,input';
  const sichtbar = (e) => {
    const r = R(e);
    if (r.width <= 0 || r.height <= 0) return false;
    try { if (!e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; } catch { /* alter Browser */ }
    return parseFloat(cs(e).opacity) >= 0.05;
  };
  const ue = document.getElementById('ueber');
  const schicht = ue && ue.children.length ? ue : (app.querySelector('.fundov') || app.querySelector('.wzm'));
  const inSchicht = (e) => !schicht || schicht.contains(e);
  /** Kette der umschließenden Blöcke (absolut positionierte Elemente werden vom nächsten positionierten Vorfahren begrenzt) */
  const kette = (e) => {
    const out = [];
    let n = e;
    for (let i = 0; i < 60 && n; i++) {
      const s = cs(n);
      let cb;
      if (s.position === 'fixed') break;
      if (s.position === 'absolute') { cb = n.parentElement; while (cb && cb !== document.body && cs(cb).position === 'static' && cs(cb).transform === 'none') cb = cb.parentElement; }
      else cb = n.parentElement;
      if (!cb || cb === document.body || cb === document.documentElement) break;
      out.push(cb); n = cb;
    }
    return out;
  };
  const clipper = (p) => { const s = cs(p); if (s.display === 'inline' || s.display === 'contents') return null; const ox = s.overflowX !== 'visible', oy = s.overflowY !== 'visible'; if (!ox && !oy) return null; return { p, ox, oy, sx: /auto|scroll/.test(s.overflowX), sy: /auto|scroll/.test(s.overflowY) }; };
  const box = (p) => { const r = R(p); return { l: r.left + p.clientLeft, t: r.top + p.clientTop, r: r.left + p.clientLeft + p.clientWidth, b: r.top + p.clientTop + p.clientHeight }; };
  /** sichtbarer Teil (Viewport + alle Clipper) */
  const sichtRect = (e, r0 = R(e)) => {
    const c = { l: Math.max(r0.left, 0), t: Math.max(r0.top, 0), r: Math.min(r0.right, VW), b: Math.min(r0.bottom, VH) };
    for (const p of kette(e)) {
      const k = clipper(p); if (!k) continue;
      const b = box(p);
      if (k.ox) { c.l = Math.max(c.l, b.l); c.r = Math.min(c.r, b.r); }
      if (k.oy) { c.t = Math.max(c.t, b.t); c.b = Math.min(c.b, b.b); }
    }
    return c;
  };
  const eigenerText = (e) => { for (const n of e.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; };
  const textRect = (n) => { const rg = document.createRange(); rg.selectNodeContents(n); return [...rg.getClientRects()].filter((r) => r.width > 0 && r.height > 0); };
  const unionR = (rs) => rs.reduce((u, r) => ({ left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 });
  const blockVon = (e) => { let b = e; while (b && b !== app && /^(inline|contents)$/.test(cs(b).display)) b = b.parentElement; return b || app; };
  /** wird die Fläche absichtlich von einem schmaleren Rahmen (Bild, Vitrine) beschnitten? */
  const absichtlichBeschnitten = (e) => {
    for (const p of kette(e)) {
      if (p === app) break;
      const k = clipper(p); if (!k || !k.ox || p.matches(LAYOUT)) continue;
      const b = R(p);
      if (b.left >= A.left - 1 && b.right <= A.right + 1 && b.width < A.width - 2) return true;
    }
    return false;
  };
  const kurz = (s, n = 30) => { s = (s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; };

  const alle = [...app.querySelectorAll('*')].filter((e) => !e.ownerSVGElement && !e.closest('.probe') && !/^(SCRIPT|STYLE)$/.test(e.tagName));
  const sicht = new Map();
  const vis = (e) => { let v = sicht.get(e); if (v === undefined) { v = sichtbar(e); sicht.set(e, v); } return v; };
  const ia = (e) => e.matches(INTER) && !e.matches('#app') && !e.matches(DECO);
  const inters = alle.filter((e) => ia(e) && vis(e) && inSchicht(e) && cs(e).pointerEvents !== 'none' && !(e.getAttribute('aria-hidden') === 'true' && e.getAttribute('tabindex') === '-1') && cs(e).visibility !== 'hidden');

  /* ---------- 1 doc-breit ---------- */
  const de = document.documentElement;
  if (de.scrollWidth > innerWidth + 0.5) add('doc-breit', de, `scrollWidth ${de.scrollWidth} > innerWidth ${innerWidth}`, 'html');
  if (document.body.scrollLeft || document.body.scrollTop || de.scrollLeft || de.scrollTop) add('doc-breit', de, `Dokument verschoben: body ${document.body.scrollLeft}/${document.body.scrollTop}, html ${de.scrollLeft}/${de.scrollTop}`, 'html (verschoben)');
  if (vp && Math.abs(innerWidth - vp.w) > 1) add('doc-breit', de, `Layout-Viewport ${innerWidth} statt ${vp.w}`, 'html (Viewport weicht ab)');

  /* ---------- 2 ragt-raus ---------- */
  const geflaggt = new Set();
  for (const e of alle) {
    if (!inSchicht(e) && !e.matches('#fuss *,.kopf *')) continue;
    if (e.matches(DECO) || !vis(e)) continue;
    if (e.parentElement && e.parentElement.closest('.fliegt, .zieht')) continue;
    if (geflaggt.has(e.parentElement) || [...geflaggt].some((g) => g.contains(e))) continue;
    const r = R(e), s = cs(e);
    if (s.position === 'fixed') continue;
    let grund = '';
    if (r.right > A.right + 1 || r.left < A.left - 1) {
      if (!absichtlichBeschnitten(e)) grund = `seitlich: ${r.left < A.left - 1 ? 'links ' + r1(A.left - r.left) : 'rechts ' + r1(r.right - A.right)}px über #app (x ${r1(r.left)}…${r1(r.right)}, App ${r1(A.left)}…${r1(A.right)})`;
    }
    if (!grund && (ia(e) || eigenerText(e) || e.tagName === 'IMG')) {
      for (const p of kette(e)) {
        const k = clipper(p); if (!k) continue;
        if (k.sy && p.scrollHeight > p.clientHeight + 1) break; // rollt: die Reichweite prüft `unerreichbar`
        if (!k.oy) continue;
        if (!p.matches(LAYOUT)) break; // absichtlicher Rahmen
        const b = box(p);
        if (r.bottom > b.b + 1.5) grund = `unten ${r1(r.bottom - b.b)}px abgeschnitten von ${basis(p)}`;
        else if (r.top < b.t - 1.5) grund = `oben ${r1(b.t - r.top)}px abgeschnitten von ${basis(p)}`;
        break;
      }
    }
    if (grund) { add('ragt-raus', e, grund); geflaggt.add(e); }
  }

  /* ---------- 3 verdeckt · 4 unerreichbar · 8 tippflaeche-klein ---------- */
  const trefferName = (h) => (h ? desc(h) : 'nichts');
  for (const e of inters) {
    const r = R(e);
    if (!e.disabled) {
      const c = sichtRect(e, r), w = c.r - c.l, h = c.b - c.t;
      if (w >= 2 && h >= 2) {
        const pts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([fx, fy]) => [c.l + w * fx, c.t + h * fy]);
        let cov = 0, mitte = false, wer = null, absichtlich = false;
        pts.forEach(([x, y], i) => {
          if (x < 0 || y < 0 || x >= VW || y >= VH) return;
          const t = document.elementFromPoint(x, y);
          if (t && (e.contains(t) || (t.contains(e) && t.matches(INTER)))) return;
          if (t && t.matches('canvas.staub, .wzm, .wzm *, .stempel')) { absichtlich = true; return; }
          cov++; if (i === 0) mitte = true; if (!wer) wer = t;
        });
        if (!absichtlich && (mitte || cov >= 3)) add('verdeckt', e, `${cov}/5 Punkte verdeckt${mitte ? ' (Mitte)' : ''} von ${trefferName(wer)}; Box ${r1(r.width)}x${r1(r.height)} @ ${r1(r.left)},${r1(r.top)}`);
      }
    }
    // unerreichbar: Rechteck durch die Kette wandern lassen
    {
      const eps = 2;
      let t = { l: r.left, t: r.top, r: r.right, b: r.bottom }, grund = '';
      for (const p of kette(e)) {
        const k = clipper(p); if (!k) continue;
        const b = box(p);
        if (k.ox && !k.sx) { if (t.l < b.l - eps) grund ||= `links ${r1(b.l - t.l)}px beschnitten von ${basis(p)}`; if (t.r > b.r + eps) grund ||= `rechts ${r1(t.r - b.r)}px beschnitten von ${basis(p)}`; }
        if (k.oy && !(k.sy && p.scrollHeight > p.clientHeight + 1)) { if (t.t < b.t - eps) grund ||= `oben ${r1(b.t - t.t)}px beschnitten von ${basis(p)}`; if (t.b > b.b + eps) grund ||= `unten ${r1(t.b - b.b)}px beschnitten von ${basis(p)}`; }
        if (k.sy && p.scrollHeight > p.clientHeight + 1) {
          const pr = R(p), top = t.t - (pr.top + p.clientTop) + p.scrollTop, bot = t.b - (pr.top + p.clientTop) + p.scrollTop;
          if (top < -eps || bot > p.scrollHeight + eps) grund ||= `außerhalb des Scrollbereichs von ${basis(p)} (${r1(top)}…${r1(bot)} von ${p.scrollHeight})`;
          else if (t.b - t.t > p.clientHeight + eps) grund ||= `höher (${r1(t.b - t.t)}px) als der Scrollbereich ${basis(p)} (${p.clientHeight}px)`;
          t = { l: t.l, r: t.r, t: b.t, b: b.b };
        }
      }
      if (!grund) { if (t.l < -eps) grund = `links ${r1(-t.l)}px außerhalb des Bildschirms`; else if (t.r > VW + eps) grund = `rechts ${r1(t.r - VW)}px außerhalb des Bildschirms`; else if (t.t < -eps) grund = `oben ${r1(-t.t)}px außerhalb`; else if (t.b > VH + eps) grund = `unten ${r1(t.b - VH)}px außerhalb`; }
      if (grund) add('unerreichbar', e, `${grund}; Box ${r1(r.width)}x${r1(r.height)} @ ${r1(r.left)},${r1(r.top)}`);
    }
    if (r.width < 40 || r.height < 40) add('tippflaeche-klein', e, `${r1(r.width)}x${r1(r.height)}px`);
  }
  // Fußknöpfe: ganz im Bild und über dem unteren Sicherheitsrand
  const fuss = document.getElementById('fuss');
  const fussKnoepfe = fuss ? [...fuss.querySelectorAll('button')].filter((b) => R(b).width > 0 && cs(b).display !== 'none') : [];
  if (inSchicht(fuss) || !schicht || schicht === app.querySelector('.fundov') || schicht === app.querySelector('.wzm')) {
    for (const b of fussKnoepfe) {
      if (cs(b).visibility === 'hidden') continue;
      const r = R(b);
      const grenze = VH - insU;
      if (r.bottom > grenze + 0.5 || r.top < -0.5 || r.left < -0.5 || r.right > VW + 0.5) add('unerreichbar', b, `Fußknopf nicht ganz im Bild: unten ${r1(r.bottom)} (Grenze ${r1(grenze)}), x ${r1(r.left)}…${r1(r.right)}`);
    }
  }

  /* ---------- 5 text-verdeckt · 6 abgeschnitten/gekürzt · 7 text-ragt-raus · 9 schrift-klein ---------- */
  const tw = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
  const texte = [];
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (!n.nodeValue.trim()) continue; const p = n.parentElement; if (!p || p.ownerSVGElement || p.closest('.probe') || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || p.matches(DECO)) continue; texte.push(n); }
  const kleinSchon = new Set();
  for (const n of texte) {
    const p = n.parentElement;
    if (!vis(p) || !inSchicht(p)) continue;
    const s = cs(p), fs = parseFloat(s.fontSize);
    if (!(fs > 0)) continue;
    const rs = textRect(n); if (!rs.length) continue;
    const bl0 = blockVon(p);
    if (fs < 12 && !kleinSchon.has(bl0)) { kleinSchon.add(bl0); add('schrift-klein', bl0, `${r1(fs)}px: „${kurz(n.nodeValue)}“`); }
    // 5 text-verdeckt
    {
      const r = rs[0], c = sichtRect(p, r), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const kS = clipper(p);
      if (kS) { const b = box(p); if (kS.ox) { c.l = Math.max(c.l, b.l); c.r = Math.min(c.r, b.r); } if (kS.oy) { c.t = Math.max(c.t, b.t); c.b = Math.min(c.b, b.b); } }
      if (!p.closest('.wzm') && cx >= c.l + 1 && cx <= c.r - 1 && cy >= c.t + 1 && cy <= c.b - 1 && cx >= 0 && cy >= 0 && cx < VW && cy < VH) {
        const t = document.elementFromPoint(cx, cy);
        if (t && !(p.contains(t) || t.contains(p))) {
          const modal = t.closest('#ueber, .wzm, .fundov') && !p.closest('#ueber, .wzm, .fundov');
          const tr = R(t);
          if (!modal && !t.matches('canvas.staub, .stempel')) add('text-verdeckt', bl0, `„${kurz(n.nodeValue)}“ (Text ${r1(r.left)},${r1(r.top)}) verdeckt von ${trefferName(t)} [Box ${r1(tr.left)},${r1(tr.top)}…${r1(tr.right)},${r1(tr.bottom)}]`);
        }
      }
    }
    // 6 abgeschnitten / gekürzt: Textfläche reicht über einen beschneidenden Block hinaus
    {
      const u = unionR(rs);
      for (let b = p; b && b !== app; b = b.parentElement) {
        const k = clipper(b); if (!k || (cs(b).display === 'inline')) continue;
        const bb = box(b), sb = cs(b);
        const hor = k.ox && !k.sx && (u.right > bb.r + 1 || u.left < bb.l - 1);
        const ver = k.oy && !k.sy && !b.matches(LAYOUT) && (u.bottom > bb.b + 1.5 || u.top < bb.t - 1.5);
        if (hor || ver) {
          const clamp = sb.webkitLineClamp && sb.webkitLineClamp !== 'none';
          const typ = clamp ? 'text-gekuerzt' : 'text-abgeschnitten';
          const mass = hor ? `Breite ${r1(Math.max(u.right - bb.r, bb.l - u.left))}px zu viel` : `Höhe ${r1(Math.max(u.bottom - bb.b, bb.t - u.top))}px zu viel`;
          add(typ, bl0, `${mass}${sb.textOverflow === 'ellipsis' ? ', ellipsis' : ''}${clamp ? ', line-clamp ' + sb.webkitLineClamp : ''}: „${kurz(n.nodeValue)}“ in ${basis(b)}`);
          break;
        }
        if (hor === false && ver === false && k.oy && !k.sy && b.matches('#buehne,#app')) break;
      }
    }
    // 7 text-ragt-raus
    {
      const u = unionR(rs), bl = blockVon(p), br = R(bl), bs = cs(bl);
      const blockKlippt = /hidden|clip/.test(bs.overflowX);
      if (!blockKlippt && bl !== app && (u.right > br.right + 2 || u.left < br.left - 2)) add('text-ragt-raus', bl0, `„${kurz(n.nodeValue)}“ ${r1(Math.max(u.right - br.right, br.left - u.left))}px über ${basis(bl)} hinaus`);
      else if ((u.right > A.right + 2 || u.left < A.left - 2) && !absichtlichBeschnitten(p)) add('text-ragt-raus', bl0, `„${kurz(n.nodeValue)}“ ${r1(Math.max(u.right - A.right, A.left - u.left))}px über #app hinaus`);
    }
  }

  /* ---------- 10 Bilder ---------- */
  for (const im of alle.filter((e) => e.tagName === 'IMG')) {
    if (!vis(im) || im.matches(DECO) || !inSchicht(im)) continue;
    const w = im.offsetWidth, h = im.offsetHeight;
    if (im.complete && im.naturalWidth > 0 && w > 0 && h > 0) {
      const fit = cs(im).objectFit;
      if (fit === 'fill' || fit === 'none') {
        const a1 = w / h, a2 = im.naturalWidth / im.naturalHeight, d = Math.abs(a1 / a2 - 1);
        if (fit === 'fill' && d > 0.04) add('bild-verzerrt', im, `Seitenverhältnis ${r1(a1)} statt ${r1(a2)} (${Math.round(d * 100)}% daneben), Box ${w}x${h}, Original ${im.naturalWidth}x${im.naturalHeight}`);
      }
    }
    if (w > 0 && h > 0 && (w < 20 || h < 20) && im.naturalWidth > 0) add('bild-winzig', im, `${w}x${h}px`);
  }

  /* ---------- 11 rollt ---------- */
  const rollende = [];
  for (const e of [...alle]) {
    const s = cs(e);
    if (!vis(e)) continue;
    if (/auto|scroll/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) rollende.push({ e, ach: 'y', mass: e.scrollHeight - e.clientHeight });
    else if (/auto|scroll/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1) rollende.push({ e, ach: 'x', mass: e.scrollWidth - e.clientWidth });
  }
  for (const { e, ach, mass } of rollende) {
    let typ = 'rollt';
    if (e.closest('#ueber')) typ = 'ueber-rollt';
    else if (e.matches('.blatt')) typ = 'blatt-rollt';
    else if (e.matches('#buehne > .zug')) typ = 'zug-rollt';
    else if (e.matches('.brett')) typ = 'brett-rollt';
    add(typ, e, `${ach === 'y' ? 'vertikal' : 'horizontal'} +${mass}px (scrollHeight ${e.scrollHeight}, clientHeight ${e.clientHeight})`);
    if (rollende.some((o) => o.e !== e && o.e.contains(e))) add('rollt-doppelt', e, `rollt innerhalb eines ebenfalls rollenden Elements (+${mass}px)`);
  }

  /* ---------- 12 fuss-ab · kopf-ueberlappt ---------- */
  if (fuss) {
    const fr = R(fuss);
    if (fr.bottom > VH + 1) add('fuss-ab', fuss, `#fuss unten bei ${r1(fr.bottom)} > Viewport ${VH}`, '#fuss');
    if (fr.height === 0 && fuss.children.length) add('fuss-ab', fuss, '#fuss hat Höhe 0 trotz Inhalt', '#fuss (Höhe 0)');
  }
  const kopf = app.querySelector('.kopf');
  if (kopf && !kopf.hidden && cs(kopf).display !== 'none') {
    if (R(kopf).height === 0 && kopf.children.length) add('fuss-ab', kopf, '.kopf hat Höhe 0 trotz Inhalt', '.kopf (Höhe 0)');
    const teile = [];
    const nimm = (e, wie) => { if (!e || !vis(e)) return; let r = R(e); if (wie === 'text') { const rs = []; const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n = t.nextNode(); n; n = t.nextNode()) if (n.nodeValue.trim()) rs.push(...textRect(n)); if (!rs.length) return; r = unionR(rs); if (clipper(e)) { const b = box(e); r = { left: Math.max(r.left, b.l), top: Math.max(r.top, b.t), right: Math.min(r.right, b.r), bottom: Math.min(r.bottom, b.b) }; } } teile.push({ e, r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom }, name: wie === 'text' ? basis(e) + '(Text)' : basis(e) }); };
    kopf.querySelectorAll('.kk').forEach((e) => nimm(e, 'box'));
    nimm(kopf.querySelector('.kt b'), 'text'); nimm(kopf.querySelector('.kt span'), 'text'); nimm(kopf.querySelector('.perl'), 'text');
    nimm(kopf.querySelector('.mondp'), 'box'); nimm(kopf.querySelector('.kweg'), 'box'); nimm(kopf.querySelector('.kweg img'), 'box');
    for (let i = 0; i < teile.length; i++) for (let j = i + 1; j < teile.length; j++) {
      const a = teile[i], b = teile[j];
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ox > 3 && oy > 3) add('kopf-ueberlappt', a.e, `${a.name} ↔ ${b.name}: ${r1(ox)}x${r1(oy)}px`, `${a.name} x ${b.name}`);
    }
  }

  /* ---------- 13 safe-area ---------- */
  if (insets) {
    const zeile = (e, was, wert, grenze) => add('safe-area', e, `${was}: ${r1(wert)} (Grenze ${r1(grenze)})`);
    if (kopf && !kopf.hidden && R(kopf).height > 0) kopf.querySelectorAll('.kk, .kt').forEach((e) => { const r = R(e); if (r.top < insO - 0.5) zeile(e, 'Kopf oben im Sicherheitsrand', r.top, insO); });
    else {
      const bu = document.getElementById('buehne');
      for (const e of alle) if (bu && bu.contains(e) && vis(e) && !e.matches(DECO) && (ia(e) || eigenerText(e)) && !e.closest('.zug, .blatt, .brett') && R(e).top < insO - 0.5) zeile(e, 'Inhalt oben im Sicherheitsrand', R(e).top, insO);
    }
    for (const b of fussKnoepfe) { if (cs(b).visibility === 'hidden') continue; const r = R(b); if (r.bottom > VH - insU + 0.5) zeile(b, 'Fußknopf im unteren Sicherheitsrand', r.bottom, VH - insU); }
    if (ue && ue.children.length) for (const e of alle) if (ue.contains(e) && vis(e) && (ia(e) || eigenerText(e)) && !e.matches(DECO) && !e.closest('.brett .bgrid, .brett .fragen') && R(e).bottom > VH - insU + 0.5 && !e.closest('.schl > section:has(.fragen)')) { const s = e.closest('.einst, .kgross'); if (s || e.closest('.brett')) zeile(e, 'Overlay-Inhalt im unteren Sicherheitsrand', R(e).bottom, VH - insU); }
    const sicht1 = fussKnoepfe.filter((b) => R(b).height > 0);
    if (sicht1.length && !(ue && ue.children.length)) {
      const letzt = Math.max(...sicht1.map((b) => R(b).bottom)), luecke = VH - letzt;
      if (luecke > insU + 28) add('safe-doppelt', fuss, `Abstand Fußknopf–Unterkante ${r1(luecke)}px > Inset ${insU} + 28`, '#fuss');
    }
  }
  return [...agg.values()].map((f) => ({ typ: f.typ, sel: f.sel, info: f.info + (f.n > 1 ? ` [×${f.n}]` : '') }));
};

/**
 * Prüft den aktuellen Bildschirm. `opts`: { insets: {top, bottom} | null, vp: {w, h}, max: Deckel je Typ (25) }.
 * Rückgabe: [{ typ, sel, info, state }]
 */
export async function pruefe(page, name, opts = {}) {
  const r = await page.evaluate(IM_BROWSER, { insets: opts.insets ?? null, max: opts.max ?? 25, vp: opts.vp ?? null });
  return r.map((f) => ({ ...f, state: name }));
}

/**
 * Fasst Befunde (mit `state` und `vp`) nach (typ, sel) zusammen:
 * [{ typ, sel, n (Zustand×Viewport), zustaende: Set (Zustandsnamen), vps: Set, beispiele: [{state, vp, info}] (≤3), info }]
 */
export function aggregiere(alle) {
  const m = new Map();
  for (const f of alle) {
    const k = f.typ + '\u0001' + f.sel;
    let g = m.get(k);
    if (!g) { g = { typ: f.typ, sel: f.sel, n: 0, states: new Set(), zustaende: new Set(), vps: new Set(), beispiele: [], info: f.info }; m.set(k, g); }
    const sk = (f.vp ?? '') + '|' + f.state;
    if (!g.states.has(sk)) { g.states.add(sk); g.n++; }
    g.zustaende.add(f.state);
    if (f.vp) g.vps.add(f.vp);
    if (g.beispiele.length < 3 && !g.beispiele.some((b) => b.state === f.state)) g.beispiele.push({ state: f.state, vp: f.vp, info: f.info });
  }
  return [...m.values()].sort((a, b) => b.n - a.n || a.typ.localeCompare(b.typ));
}
