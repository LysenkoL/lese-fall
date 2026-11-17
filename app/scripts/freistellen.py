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
OHNE = {'vogelschatten.webp', 'plakat.webp', 'gelbe_kreise_vorne.webp', 'gelbe_kreise_hinten.webp', 'kinder_hinten.webp', 'raum_leer.webp'}  # ganze Bilder mit eigenem Papiergrund: nicht freistellen
JOBS = [(f, os.path.join(DST, os.path.basename(f))) for f in sorted(glob.glob(os.path.join(SRC, '*.webp'))) if os.path.basename(f) not in OHNE and not os.path.basename(f).startswith(('u15_', 'pulli_', 'kraft_'))]
# Figuren, die im Spiel als Ding gelegt werden (z. B. Spur 2: die Lese-Raupe unter das Blatt)
FREI = os.path.join(ROOT, 'app/src/gen/frei')
os.makedirs(FREI, exist_ok=True)
JOBS += [(os.path.join(ROOT, f'assets/illustrationen/raupe/{n}.webp'), os.path.join(FREI, f'raupe_{n}.webp')) for n in ('staunt', 'lob')]
# Vorschau v7: alle Stimmungen der Lese-Raupe und der Kinder freigestellt (stehen auf dunklem Grund und auf Kork)
JOBS += [(os.path.join(ROOT, f'assets/illustrationen/raupe/{n}.webp'), os.path.join(FREI, f'raupe_{n}.webp')) for n in ('denkt', 'tipp', 'lacht', 'klatscht', 'traurig', 'muede')]
JOBS += [(os.path.join(ROOT, f'assets/illustrationen/{k}/{n}.webp'), os.path.join(FREI, f'{k}_{n}.webp')) for k in ('mila', 'ben', 'oskar') for n in ('denkt', 'froh', 'staunt', 'besorgt', 'lacht', 'traurig')]
# Garderobe (D-08): Symbole freistellen, Raupen-Figuren verkleinert freistellen
GAR = os.path.join(ROOT, 'assets/illustrationen/garderobe')
GDST = os.path.join(ROOT, 'app/src/gen/garderobe')
os.makedirs(GDST, exist_ok=True)
for n in ('fliege', 'schal', 'brille', 'notizbuch', 'taschenlampe', 'hut', 'mondbrosche', 'tasche'):
    JOBS += [(os.path.join(GAR, f'{n}.webp'), os.path.join(GDST, f'{n}.webp')), (os.path.join(GAR, f'raupe_{n}.webp'), os.path.join(GDST, f'raupe_{n}.webp'))]
# v8: Nebenfiguren (Kinder) freistellen
KDST = os.path.join(ROOT, 'app/src/gen/kinder')
os.makedirs(KDST, exist_ok=True)
JOBS += [(f, os.path.join(KDST, os.path.basename(f))) for f in sorted(glob.glob(os.path.join(ROOT, 'assets/illustrationen/kinder', '*.webp')))]
# Feinere Schwelle / größere Breite für Bilder mit weißen Flächen am Rand (Elster: weißer Bauch)
SCHWELLE = {}
BREITE = {'voegel.webp': 1400}
WARM = set()
for f, ziel in JOBS:
    src = Image.open(f)
    if src.mode == 'RGBA':  # hat schon Transparenz (z. B. Tasche, Mondbrosche): nur übernehmen
        src.save(ziel, 'WEBP', quality=88, method=6); print('✓', os.path.basename(f)); continue
    im = src.convert('RGB')
    b = BREITE.get(os.path.basename(f), 640)
    if max(im.size) > b + 60: im.thumbnail((b, b))  # große Figuren für die App verkleinern
    w, h = im.size
    work = im.copy()
    if os.path.basename(f) in WARM:  # cremiger Grund, weiße Flächen im Bild: nur warmen Grund als Hintergrund zählen
        wp = work.load()
        for yy in range(h):
            for xx in range(w):
                r_, g_, b_ = wp[xx, yy]
                wp[xx, yy] = (250, 246, 236) if (r_ > 228 and g_ > 224 and r_ - b_ >= 6) else (0, 0, 0) if (r_ > 228 and g_ > 224) else wp[xx, yy]
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        if work.getpixel(s) != (255, 0, 255):
            ImageDraw.floodfill(work, s, (255, 0, 255), thresh=SCHWELLE.get(os.path.basename(f), 28))
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


# v8: Die fünf Vögel groß und unverzerrt in fünf quadratische Felder packen (für Schatten- und Ausschluss-Rätsel)
vp = os.path.join(DST, 'voegel.webp')
if os.path.exists(vp):
    blatt = Image.open(vp).convert('RGBA')
    n, F = 5, 300
    sw = blatt.width // n
    neu = Image.new('RGBA', (n * F, F), (0, 0, 0, 0))
    for i in range(n):
        st = blatt.crop((i * sw, 0, (i + 1) * sw, blatt.height))
        bb = st.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
        st = st.crop(bb)
        st.thumbnail((F - 24, F - 24))
        neu.alpha_composite(st, (i * F + (F - st.width) // 2, (F - st.height) // 2))
    neu.save(vp, 'WEBP', quality=90, method=6)
    # Schatten der Elster (Feld 1) an der hellen Wand: Bild für die Brettkarte
    el = neu.crop((0, 0, F, F))
    el.save(os.path.join(DST, 'elster.webp'), 'WEBP', quality=90, method=6)
    sch = Image.new('RGBA', (F, F), (20, 18, 16, 255))
    sch.putalpha(el.getchannel('A').point(lambda a: int(a * .68)))
    sch = sch.transpose(Image.FLIP_LEFT_RIGHT).filter(ImageFilter.GaussianBlur(2.2))
    wand = Image.new('RGBA', (400, 300), (243, 228, 190, 255))
    wand.alpha_composite(sch.resize((270, 270)), (65, 15))
    wand.convert('RGB').save(os.path.join(ROOT, 'assets/illustrationen/objekte/vogelschatten.webp'), 'WEBP', quality=90)
    print('✓ Vögel gepackt, Schattenbild')


# v8: Mond von vorn mit kurzem Fadenende (nach Bens Reparatur ist der Faden hinten aufgerollt; vorn schaut nur ein Stück heraus)
mv = os.path.join(DST, 'mond_vorne.webp')
if os.path.exists(mv):
    m = Image.open(mv).convert('RGBA')
    w, h = m.size
    px = m.load()
    def gelb(x, y):
        r, g, b, a = px[x, y]
        return a > 200 and r > 200 and g > 150 and b < 110
    oben = next(y for y in range(h) if sum(1 for x in range(0, w, 2) if gelb(x, y)) > w * 0.12)
    stummel = max(0, oben - int(h * 0.035))
    for y in range(stummel):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 0)
    m.crop(m.getbbox()).save(os.path.join(DST, 'mond_vorne_kurz.webp'), 'WEBP', quality=90, method=6)
    print('✓ mond_vorne_kurz')


# v8: Mond auf dem Tablett neu zusammengesetzt (leeres Tablett + Rückseite mit aufgerolltem Faden) – ohne langen Faden
tl, mh = os.path.join(DST, 'tablett_leer.webp'), os.path.join(DST, 'mond_hinten_faden.webp')
if os.path.exists(tl) and os.path.exists(mh):
    from PIL import ImageFilter
    t = Image.open(tl).convert('RGBA'); m = Image.open(mh).convert('RGBA')
    m = m.crop(m.getbbox())
    t = t.resize((t.width * 2, t.height * 2), Image.LANCZOS)
    mw = int(t.width * 0.42); mhh = int(mw * m.height / m.width * 0.44)
    m = m.resize((mw, mhh), Image.LANCZOS)
    x, y = int(t.width * 0.5 - mw / 2), int(t.height * 0.43 - mhh / 2)
    sch = Image.new('RGBA', t.size, (0, 0, 0, 0))
    dunkel = Image.new('RGBA', m.size, (10, 30, 80, 110)); dunkel.putalpha(m.getchannel('A').point(lambda v: v * 110 // 255))
    sch.paste(dunkel, (x + 3, y + 5), dunkel)
    t = Image.alpha_composite(t, sch.filter(ImageFilter.GaussianBlur(4)))
    t.paste(m, (x, y), m)
    t.save(os.path.join(DST, 'mond_auf_tablett.webp'), 'WEBP', quality=90, method=6)
    print('✓ mond_auf_tablett (neu zusammengesetzt)')
