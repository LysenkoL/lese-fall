"""Spur 15 „Was ist anders?": erzeugt aus der Illustration k3_s15 sieben kleine Bildstücke mit Änderungen.
Die App legt sie im Bild „Jetzt" passgenau über die unveränderte Illustration (Daten: 04_data/kapitel3_v8_raetsel.json).
Aufruf: python3 app/scripts/unterschiede-s15.py  -> assets/illustrationen/objekte/u15_*.webp und die Maße für die Daten
"""
import colorsys, json, os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'assets/illustrationen/k3_s15.webp')
DST = os.path.join(ROOT, 'assets/illustrationen/objekte')
im = Image.open(SRC).convert('RGB')
W, H = im.size
neu = im.copy()


def farbe(box, von, bis, dreh, s_min=0.35, v_min=0.25):
    """Farbton im Kasten drehen: nur Pixel mit Farbton zwischen von und bis (Grad)."""
    px = neu.load()
    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            r, g, b = px[x, y]
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hd = h * 360
            drin = von <= hd <= bis if von <= bis else (hd >= von or hd <= bis)
            if drin and s >= s_min and v >= v_min:
                r2, g2, b2 = colorsys.hsv_to_rgb(((hd + dreh) % 360) / 360, s, v)
                px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255))


def kopie(von_box, nach_mitte):
    """Ein ovales Stück (weicher Rand) an eine andere Stelle kopieren."""
    st = im.crop(von_box)
    m = Image.new('L', st.size, 0)
    ImageDraw.Draw(m).ellipse([3, 3, st.size[0] - 4, st.size[1] - 4], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(2.5))
    neu.paste(st, (nach_mitte[0] - st.size[0] // 2, nach_mitte[1] - st.size[1] // 2), m)


def fuellen(mitte, rx, ry, probe):
    """Ein Loch mit der Farbe der Umgebung füllen (weicher Rand, leichte Körnung bleibt durch Mischung)."""
    f = im.getpixel(probe)
    lage = Image.new('RGB', im.size, f)
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).ellipse([mitte[0] - rx, mitte[1] - ry, mitte[0] + rx, mitte[1] + ry], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(2))
    neu.paste(lage, (0, 0), m)


# id: (Kasten in Pixeln, Hinweis für das Kind)
STUECKE = {
    'spange': ((180, 368, 285, 462), 'Schau auf Milas Haare.'),
    'herz': ((915, 800, 1030, 900), 'Schau auf die Maus.'),
    'schere': ((1180, 850, 1370, 965), 'Schau auf die Schere.'),
    'fleck': ((640, 868, 745, 950), 'Zähle die braunen Flecken auf dem Käse.'),
    'loch': ((895, 462, 995, 545), 'Zähle die Löcher im braunen Papier.'),
    'umhang': ((1185, 140, 1275, 225), 'Schau auf die Lese-Raupe am Fenster.'),
    'gummi': ((105, 640, 180, 705), 'Schau auf Milas Zopf.'),
}
farbe(STUECKE['spange'][0], 38, 62, 150, s_min=0.5, v_min=0.6)      # gelbe Mond-Spange -> blau
farbe(STUECKE['herz'][0], 345, 15, 215, s_min=0.5)                  # rotes Herz -> blau
farbe(STUECKE['schere'][0], 195, 235, 135, s_min=0.45)              # blaue Griffe -> rot
kopie((617, 780, 692, 830), (692, 908))                             # vierter brauner Fleck
fuellen((945, 503), 34, 30, (985, 470))                             # ein Loch im braunen Papier weniger
farbe(STUECKE['umhang'][0], 200, 240, 130, s_min=0.45)              # blauer Umhang -> rot
farbe(STUECKE['gummi'][0], 38, 62, 300, s_min=0.5, v_min=0.6)       # gelbes Haargummi -> rot

dinge = []
for name, (box, tipp) in STUECKE.items():
    neu.crop(box).save(os.path.join(DST, f'u15_{name}.webp'), 'WEBP', lossless=True)
    cx, cy = (box[0] + box[2]) / 2 / W * 100, (box[1] + box[3]) / 2 / H * 100
    w, h = (box[2] - box[0]) / W * 100, (box[3] - box[1]) / H * 100
    dinge.append({'id': name, 'bild': f'objekte/u15_{name}', 'x': round(cx, 2), 'y': round(cy, 2), 'w': round(w, 2),
                  'zonen': [{'x': round(cx, 1), 'y': round(cy, 1), 'w': round(w + 3, 1), 'h': round(h * 1.5 + 4, 1)}],
                  'vorhin': False, 'jetzt': True, 'tipp': tipp})
json.dump(dinge, open(os.path.join(os.path.dirname(__file__), 'unterschiede-s15.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
neu.save('/tmp/u15_vorschau.png')
print(len(dinge), 'Stücke')
