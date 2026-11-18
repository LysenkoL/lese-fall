"""
Schneidet den Essens-Bogen (assets/illustrationen/essen/essen_blatt.webp, 3 Spalten x 2 Reihen auf Weiß)
in sechs freigestellte Bilder: essen/blatt, apfel, erdbeere, keks, kaese, eis (.webp mit Transparenz).
Aufruf: python3 app/scripts/essen_schneiden.py
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DIR = os.path.join(ROOT, 'assets/illustrationen/essen')
NAMEN = [['blatt', 'apfel', 'erdbeere'], ['keks', 'kaese', 'eis']]
bogen = Image.open(os.path.join(DIR, 'essen_blatt.webp')).convert('RGB')
W, H = bogen.size
cw, ch = W // 3, H // 2
for r, reihe in enumerate(NAMEN):
    for c, name in enumerate(reihe):
        im = bogen.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        w, h = im.size
        # Hintergrund = vom Rand aus erreichbare, fast farblose helle Pixel (Weiß und der graue Schatten darunter)
        px = im.load()
        def grund(x, y):
            r_, g_, b_ = px[x, y]
            sat, hell = max(r_, g_, b_) - min(r_, g_, b_), (r_ + g_ + b_) / 3
            if sat < 16 and hell > 196: return True
            # warmer, weicher Schatten liegt nur unten unter dem Gegenstand (Vanilleeis weiter oben bleibt heil)
            return y > 0.72 * h and sat < 48 and hell > 178
        mask = Image.new('L', (w, h), 255)
        mp = mask.load()
        stapel = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
        while stapel:
            x, y = stapel.pop()
            if mp[x, y] == 0 or not grund(x, y):
                continue
            mp[x, y] = 0
            if x > 0: stapel.append((x - 1, y))
            if x < w - 1: stapel.append((x + 1, y))
            if y > 0: stapel.append((x, y - 1))
            if y < h - 1: stapel.append((x, y + 1))
        mask = mask.filter(ImageFilter.GaussianBlur(0.8))
        out = im.convert('RGBA')
        out.putalpha(mask)
        bb = mask.point(lambda v: 255 if v > 20 else 0).getbbox()
        p = 8
        out = out.crop((max(0, bb[0] - p), max(0, bb[1] - p), min(w, bb[2] + p), min(h, bb[3] + p)))
        out.thumbnail((320, 320))
        out.save(os.path.join(DIR, name + '.webp'), 'WEBP', quality=88, method=6)
        print('✓', name, out.size)
