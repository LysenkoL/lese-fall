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
