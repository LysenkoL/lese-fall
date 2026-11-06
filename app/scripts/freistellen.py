"""Freigestellte Kopien der Objekt-Bilder für die App (Originale in assets/ bleiben unverändert).
Der helle Hintergrund wird von den Rändern her per Flutfüllung transparent gemacht,
weiße Dinge innerhalb des Objekts (Wolke, Mond-Rückseite) bleiben erhalten.
Aufruf: python3 app/scripts/freistellen.py"""
import glob, os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'assets/illustrationen/objekte')
DST = os.path.join(ROOT, 'app/src/gen/objekte')
os.makedirs(DST, exist_ok=True)
JOBS = [(f, os.path.join(DST, os.path.basename(f))) for f in sorted(glob.glob(os.path.join(SRC, '*.webp')))]
# Figuren, die im Spiel als Ding gelegt werden (z. B. Spur 2: die Lese-Raupe unter das Blatt)
FREI = os.path.join(ROOT, 'app/src/gen/frei')
os.makedirs(FREI, exist_ok=True)
JOBS += [(os.path.join(ROOT, f'assets/illustrationen/raupe/{n}.webp'), os.path.join(FREI, f'raupe_{n}.webp')) for n in ('staunt', 'lob')]
# Garderobe (D-08): Symbole freistellen, Raupen-Figuren verkleinert freistellen
GAR = os.path.join(ROOT, 'assets/illustrationen/garderobe')
GDST = os.path.join(ROOT, 'app/src/gen/garderobe')
os.makedirs(GDST, exist_ok=True)
for n in ('fliege', 'schal', 'brille', 'notizbuch', 'taschenlampe', 'hut', 'mondbrosche', 'tasche'):
    JOBS += [(os.path.join(GAR, f'{n}.webp'), os.path.join(GDST, f'{n}.webp')), (os.path.join(GAR, f'raupe_{n}.webp'), os.path.join(GDST, f'raupe_{n}.webp'))]
for f, ziel in JOBS:
    src = Image.open(f)
    if src.mode == 'RGBA':  # hat schon Transparenz (z. B. Tasche, Mondbrosche): nur übernehmen
        src.save(ziel, 'WEBP', quality=88, method=6); print('✓', os.path.basename(f)); continue
    im = src.convert('RGB')
    if max(im.size) > 700: im.thumbnail((640, 640))  # große Figuren für die App verkleinern
    w, h = im.size
    work = im.copy()
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        if work.getpixel(s) != (255, 0, 255):
            ImageDraw.floodfill(work, s, (255, 0, 255), thresh=28)
    mask = Image.new('L', (w, h), 255)
    px, mp = work.load(), mask.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == (255, 0, 255):
                mp[x, y] = 0
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA')
    out.putalpha(mask)
    out.save(ziel, 'WEBP', quality=88, method=6)
    print('✓', os.path.basename(f))
