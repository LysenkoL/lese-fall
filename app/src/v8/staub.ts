/**
 * Staub auf einer Fläche: mit Maus oder Finger wegwischen (mehr als die Hälfte frei), dann verschwindet der Rest.
 * Übernommen aus der alten App (src/main.ts, `staub`). Gibt eine Funktion zurück, die den Staub sofort entfernt.
 */
export function staub(box: HTMLElement, fertig: () => void): () => void {
  const cv = document.createElement('canvas');
  cv.className = 'staub';
  cv.setAttribute('aria-label', 'Staub');
  box.appendChild(cv);
  const r = box.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.scale(dpr, dpr);
  g.fillStyle = '#CDBB98'; g.fillRect(0, 0, r.width, r.height);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = ['#BFAA82', '#D9CAA8', '#B39C74', '#E2D5B8'][i % 4];
    g.globalAlpha = 0.5; g.beginPath(); g.arc(Math.random() * r.width, Math.random() * r.height, 1 + Math.random() * 3.5, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out';
  const breit = Math.max(22, Math.min(34, Math.min(r.width, r.height) / 3));
  let strokes = 0, done = false, last: number[] | null = null;
  const brush = document.createElement('div');
  brush.className = 'brush';
  brush.innerHTML = '<svg viewBox="0 0 44 44"><path d="M30 4l10 10-14 14-10-10z" fill="#8A5A44"/><path d="M16 18l10 10-6 6c-4 4-12 6-16 6 0-4 2-12 6-16z" fill="#F4C243" stroke="#D9A21E"/></svg>';
  const ende = () => { if (done) return; done = true; cv.classList.add('weg'); brush.remove(); box.classList.remove('staubig'); setTimeout(() => cv.remove(), 700); fertig(); };
  const check = () => {
    if (done) return;
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 29) { n++; if (d[i] < 40) clear++; }
    if (clear / n > 0.55) ende();
  };
  const wipe = (x: number, y: number) => {
    g.lineWidth = breit; g.lineCap = 'round';
    g.beginPath(); g.moveTo(last ? last[0] : x, last ? last[1] : y); g.lineTo(x, y); g.stroke();
    last = [x, y];
    if (++strokes % 5 === 0) check();
  };
  const at = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); brush.style.left = e.clientX + 'px'; brush.style.top = e.clientY + 'px'; wipe(e.clientX - b.left, e.clientY - b.top); };
  box.classList.add('staubig');
  // Pinseln darf überall auf der Fläche beginnen (auch am Rand)
  box.addEventListener('pointerdown', (e) => { if (done) return; e.preventDefault(); box.setPointerCapture(e.pointerId); document.body.appendChild(brush); last = null; at(e); });
  box.addEventListener('pointermove', (e) => { if (!done && box.hasPointerCapture(e.pointerId)) at(e); });
  const los = () => { last = null; brush.remove(); check(); };
  box.addEventListener('pointerup', los);
  box.addEventListener('pointercancel', los);
  return ende;
}

/**
 * Laub auf einer Fläche (Spur 24): mit Maus oder Finger zur Seite wischen, bis mehr als die Hälfte frei ist.
 * Gibt eine Funktion zurück, die das Laub sofort entfernt.
 */
export function laub(box: HTMLElement, fertig: () => void, zone?: { x: number; y: number; r: number }): () => void {
  const cv = document.createElement('canvas');
  cv.className = 'staub laub';
  cv.setAttribute('aria-label', 'Laub');
  box.appendChild(cv);
  const r = box.getBoundingClientRect();
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.scale(dpr, dpr);
  g.fillStyle = '#3F8A34'; g.fillRect(0, 0, r.width, r.height);
  const farben = ['#2F7A2C', '#4E9E3E', '#5FB04A', '#3C8B35', '#76BF55', '#2A6E2A'];
  for (let i = 0; i < 520; i++) {
    const x = Math.random() * r.width, y = Math.random() * r.height, a = Math.random() * Math.PI, L = 14 + Math.random() * 20;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = farben[i % farben.length];
    g.beginPath(); g.ellipse(0, 0, L, L * 0.42, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(20,60,20,.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke();
    g.restore();
  }
  g.globalCompositeOperation = 'destination-out';
  const breit = Math.max(30, Math.min(46, Math.min(r.width, r.height) / 3.4));
  let strokes = 0, done = false, last: number[] | null = null;
  const brush = document.createElement('div');
  brush.className = 'brush';
  brush.innerHTML = '<svg viewBox="0 0 44 44"><path d="M30 4l10 10-14 14-10-10z" fill="#8A5A44"/><path d="M16 18l10 10-6 6c-4 4-12 6-16 6 0-4 2-12 6-16z" fill="#F4C243" stroke="#D9A21E"/></svg>';
  const ende = () => { if (done) return; done = true; cv.classList.add('weg'); brush.remove(); box.classList.remove('staubig'); setTimeout(() => cv.remove(), 700); fertig(); };
  const check = () => {
    if (done) return;
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 29) { n++; if (d[i] < 40) clear++; }
    if (!zone) { if (clear / n > 0.5) ende(); return; }
    // mit Zone: die Stelle (z. B. die Astgabel) muss frei sein, sonst reicht erst viel freie Fläche
    const W = cv.width, H = cv.height, cx = (zone.x / 100) * W, cy = (zone.y / 100) * H, rad = (zone.r / 100) * W;
    let zin = 0, zclear = 0;
    for (let yy = Math.max(0, Math.floor(cy - rad)); yy < Math.min(H, cy + rad); yy += 5) for (let xx = Math.max(0, Math.floor(cx - rad)); xx < Math.min(W, cx + rad); xx += 5) {
      if (Math.hypot(xx - cx, yy - cy) > rad) continue;
      zin++; if (d[(yy * W + xx) * 4 + 3] < 40) zclear++;
    }
    if ((zin && zclear / zin > 0.6 && clear / n > 0.12) || clear / n > 0.8) ende();
  };
  const wipe = (x: number, y: number) => {
    g.lineWidth = breit; g.lineCap = 'round';
    g.beginPath(); g.moveTo(last ? last[0] : x, last ? last[1] : y); g.lineTo(x, y); g.stroke();
    last = [x, y];
    if (++strokes % 5 === 0) check();
  };
  const at = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); brush.style.left = e.clientX + 'px'; brush.style.top = e.clientY + 'px'; wipe(e.clientX - b.left, e.clientY - b.top); };
  box.classList.add('staubig');
  box.addEventListener('pointerdown', (e) => { if (done) return; e.preventDefault(); box.setPointerCapture(e.pointerId); document.body.appendChild(brush); last = null; at(e); });
  box.addEventListener('pointermove', (e) => { if (!done && box.hasPointerCapture(e.pointerId)) at(e); });
  const los = () => { last = null; brush.remove(); check(); };
  box.addEventListener('pointerup', los);
  box.addEventListener('pointercancel', los);
  return ende;
}
