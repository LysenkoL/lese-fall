/**
 * Kleine Effekte der Vorschau v8: Werkzeug-Moment der Lese-Raupe, Belohnung (Perlen und Sterne),
 * Werkzeug-Chip. Alles reines CSS/SVG, nichts von außen. Bei „weniger Bewegung“ bleibt es still und kurz.
 */
import { werkzeugIcon, type Werkzeug } from './zeichnen.ts';

export const weniger = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const KEY: Record<Werkzeug, string> = { fuehler: 'wzFuehler', lupe: 'wzLupe', zeit: 'wzZeit', lesen: 'wzLesen' };
export const wzName = (UI: Record<string, string>, w: Werkzeug) => UI[KEY[w]] ?? '';
export const wzSatz = (UI: Record<string, string>, w: Werkzeug) => UI[KEY[w] + 'T'] ?? '';
/** kleiner Chip: Icon + Name */
export const wzChip = (UI: Record<string, string>, w: Werkzeug, kl = '') => `<span class="wzchip ${kl}" data-w="${w}">${werkzeugIcon(w)}<span>${wzName(UI, w)}</span></span>`;

/**
 * Werkzeug-Moment: Einblendung beim Start eines Rätsels (ca. 1,4 s). Die Fläche fängt keine Klicks ab
 * (pointer-events: none); der erste Tipp irgendwo schließt sie und geht ganz normal weiter.
 * Gibt eine Funktion zurück, die die Einblendung sofort entfernt.
 */
export function werkzeugMoment(host: HTMLElement, w: Werkzeug, UI: Record<string, string>, raupeUrl: string): () => void {
  host.querySelector('.wzm')?.remove();
  const el = document.createElement('div');
  el.className = 'wzm';
  el.dataset.w = w;
  el.innerHTML = `<div class="wzm-k"><img class="wzm-r" src="${raupeUrl}" alt=""><p class="wzm-kopf">${UI.wzKopf}</p><div class="wzm-i">${werkzeugIcon(w)}</div><b class="wzm-n">${wzName(UI, w)}</b><p class="wzm-t">${wzSatz(UI, w)}</p></div>`;
  host.appendChild(el);
  let weg = false, t = 0;
  const ab = () => {
    if (weg) return;
    weg = true; clearTimeout(t);
    document.removeEventListener('pointerdown', ab, true);
    if (weniger()) return el.remove();
    el.classList.add('geht');
    setTimeout(() => el.remove(), 220);
  };
  document.addEventListener('pointerdown', ab, true); // Capture: das Ereignis läuft danach unverändert weiter
  t = window.setTimeout(ab, weniger() ? 800 : 1450);
  return ab;
}

/** Das Werkzeug-Icon der Raupe leuchtet kurz auf (sie hilft) */
export function chipLeuchtet(wurzel: ParentNode) {
  const c = wurzel.querySelector('.zk .wzchip');
  if (!c) return;
  c.classList.remove('hilft'); void (c as HTMLElement).offsetWidth; c.classList.add('hilft');
  setTimeout(() => c.classList.remove('hilft'), 2400);
}

const STERN = '<svg viewBox="0 0 24 24"><path d="M12 1.500l3 7 7.500.700-5.700 5 1.800 7.300L12 17.500 5.400 21.500l1.800-7.300-5.700-5L9 8.500z" fill="#FFE9A6" stroke="#F4C243" stroke-width="1.500" stroke-linejoin="round"/></svg>';
/**
 * Belohnung beim gelösten Rätsel: 14 Perlen und Sternchen springen aus `von`,
 * vier Perlen fliegen zum Perlenzähler, der Zähler hüpft, der Mond pulsiert (wenn er wächst).
 */
export function belohnung(von: HTMLElement | null, perlen: HTMLElement, mond: HTMLElement | null) {
  const hupf = (el: HTMLElement | null, kl: string) => { if (!el) return; el.classList.remove(kl); void el.offsetWidth; el.classList.add(kl); setTimeout(() => el.classList.remove(kl), 1100); };
  if (weniger()) return;
  const r = (von ?? perlen).getBoundingClientRect();
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const ziel = perlen.getBoundingClientRect();
  const fx = document.createElement('div');
  fx.className = 'fx';
  fx.setAttribute('aria-hidden', 'true');
  const teile: string[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.22, d = 54 + (i % 3) * 22 + (i % 5) * 4;
    const stern = i % 2 === 0;
    teile.push(`<i class="fxp ${stern ? 'stern' : 'perle'}" style="left:${x0}px;top:${y0}px;--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d - 18)}px;--dr:${(i * 47) % 160 - 80}deg;animation-delay:${(i % 4) * 30}ms">${stern ? STERN : ''}</i>`);
  }
  for (let i = 0; i < 4; i++) teile.push(`<i class="fxp flug" data-i="${i}" style="left:${x0}px;top:${y0}px"></i>`);
  fx.innerHTML = teile.join('');
  document.body.appendChild(fx);
  const flug = [...fx.querySelectorAll<HTMLElement>('.flug')];
  const dx = ziel.left + ziel.width / 2 - x0, dy = ziel.top + ziel.height / 2 - y0;
  flug.forEach((el, i) => {
    const a = el.animate(
      [{ transform: 'translate(0, 0) scale(1)', opacity: 0 }, { transform: `translate(${(i - 1.5) * 16}px, -26px) scale(1.15)`, opacity: 1, offset: 0.25 }, { transform: `translate(${dx}px, ${dy}px) scale(.45)`, opacity: 1 }],
      { duration: 820, delay: 450 + i * 110, easing: 'cubic-bezier(.45, 0, .75, .55)', fill: 'both' },
    );
    a.onfinish = () => { el.style.visibility = 'hidden'; if (i === 0) hupf(perlen, 'hupft'); };
  });
  setTimeout(() => hupf(mond, 'puls'), 500);
  setTimeout(() => fx.remove(), 2200);
}
