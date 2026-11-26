"""Auflagen für das Haus der Lese-Raupe: Hut, Brille, Fliege und Mondbrosche als eigene, durchsichtige Ebenen.
Die acht Garderoben-Bilder (app/src/gen/garderobe/raupe_<sache>.webp, aus freistellen.py) zeigen dieselbe Raupe
im selben Bildausschnitt, jeweils mit einer Sache. Hier wird die Sache aus ihrem Bild herausgelöst: nur die Stellen,
die sich vom Bild einer anderen Sache unterscheiden (Vergleichsbild ohne Überschneidung), und nur im Kasten der Sache.
So kann die Raupe im Haus mehrere Sachen zugleich tragen: Grundbild (z. B. raupe_schal) + Auflagen darüber.
Ergebnis: app/src/gen/garderobe/auflage_<sache>.webp (640 × 640 wie die Grundbilder, an derselben Stelle).
Aufruf: python3 app/scripts/garderobe_ebenen.py   (nach freistellen.py)"""
import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
G = os.path.join(ROOT, 'app/src/gen/garderobe')
# Sache: (Vergleichsbild, Kasten im 640er-Bild). Kästen von Hand aus einem Unterschiedsbild abgelesen.
AUFLAGEN = {
    'hut': ('fliege', (205, 55, 425, 195)),
    'brille': ('fliege', (190, 165, 425, 265)),
    'fliege': ('brille', (230, 300, 350, 390)),
    'mondbrosche': ('fliege', (185, 335, 275, 430)),
}


def lade(n):
    return Image.open(os.path.join(G, f'raupe_{n}.webp')).convert('RGBA')


def unterschied(a, b, schwelle=36):
    """Maske der Pixel, die sich in Farbe oder Deckkraft deutlich unterscheiden"""
    r, g, bl, al = ImageChops.difference(a, b).split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), ImageChops.lighter(bl, al))
    return m.point(lambda v: 255 if v > schwelle else 0)


for sache, (vergleich, kasten) in AUFLAGEN.items():
    bild = lade(sache)
    m = unterschied(bild, lade(vergleich))
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # kleine Löcher in der Sache schließen
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(7))  # dünne Umriss-Abweichungen weg, weicher Rand dazu
    k = Image.new('L', bild.size, 0)
    ImageDraw.Draw(k).rectangle(kasten, fill=255)
    m = ImageChops.multiply(m, k).filter(ImageFilter.GaussianBlur(1.2))
    bild.putalpha(ImageChops.multiply(bild.getchannel('A'), m))
    ziel = os.path.join(G, f'auflage_{sache}.webp')
    bild.save(ziel, 'WEBP', quality=88, method=6)
    print('✓', os.path.basename(ziel))

# Mondbrosche rechts: Taschenlampe und Notizbuch hält die Raupe links vor dem Umhang – genau dort sitzt die Brosche.
# Trägt sie beides, steckt die Brosche an der rechten Umhangecke (frei von grüner und goldener Lupe).
# Die Brosche ist eine runde Scheibe: Kreis aus raupe_mondbrosche ausschneiden (Mitte und Radius von Hand abgelesen),
# etwas kleiner an die rechte Ecke setzen. Ergebnis: auflage_mondbrosche_rechts.webp (640 × 640).
BROSCHE_MITTE, BROSCHE_R = (230.5, 382.0), 27
RECHTS_MITTE, RECHTS_SKALA = (420, 395), 0.85
quelle = lade('mondbrosche')
x, y, r = BROSCHE_MITTE[0], BROSCHE_MITTE[1], BROSCHE_R
kreis = quelle.crop((int(x - r - 2), int(y - r - 2), int(x + r + 2), int(y + r + 2)))
maske = Image.new('L', kreis.size, 0)
ImageDraw.Draw(maske).ellipse((2, 2, 2 + 2 * r, 2 + 2 * r), fill=255)
maske = maske.filter(ImageFilter.GaussianBlur(0.8))
kreis.putalpha(ImageChops.multiply(kreis.getchannel('A'), maske))
neu = int(kreis.size[0] * RECHTS_SKALA)
kreis = kreis.resize((neu, neu), Image.LANCZOS)
ebene = Image.new('RGBA', quelle.size, (0, 0, 0, 0))
ebene.alpha_composite(kreis, (RECHTS_MITTE[0] - neu // 2, RECHTS_MITTE[1] - neu // 2))
ziel = os.path.join(G, 'auflage_mondbrosche_rechts.webp')
ebene.save(ziel, 'WEBP', quality=88, method=6)
print('✓', os.path.basename(ziel))
