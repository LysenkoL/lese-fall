"""Aus einem Durchlauf (03_screens/v7/telefon) eine kleine Galerie und Vorher-Nachher-Paare bauen.
Aufruf: python3 app/scripts/galerie-v7.py   →  03_screens/v7/galerie/*.jpg, 03_screens/v7/vergleich/*.jpg"""
import glob, os, re
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
NEU = os.path.join(ROOT, '03_screens/v7/telefon')
ALT = os.path.join(ROOT, '03_screens/kapitel1')
GAL = os.path.join(ROOT, '03_screens/v7/galerie')
VGL = os.path.join(ROOT, '03_screens/v7/vergleich')
for d in (GAL, VGL):
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, '*.jpg')): os.remove(f)

def neu(teil):
    """Bild aus dem Durchlauf, dessen Name (ohne laufende Nummer) genau `teil` ist"""
    for f in sorted(glob.glob(os.path.join(NEU, '*.png'))):
        if re.sub(r'^\d+_', '', os.path.basename(f))[:-4] == teil: return f
    raise SystemExit('fehlt im Durchlauf: ' + teil)

try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except OSError: FONT = ImageFont.load_default()

# Galerie: die wichtigsten Bildschirme des ganzen Buches
GALERIE = ['titel', 'intro_1', 'intro_3', 'intro_4', 's1_lesen_1', 's1_zug1_markieren_markiert', 's1_zug1_markieren_ok', 's1_akte', 's1_haken',
           's2_zug1_blick_ok', 's2_zug2_zwei_ok', 's2_zug3_sortieren_fast', 's2_zug4_wahl', 's2_akte', 's3_zug2_wahl_notizbuch', 's3_zug2_wahl_imtext', 's4_zug1_steckbrief_ok',
           's4_zug3_wahl_ok', 's5_zug1_zwei_ok', 's5_zug2_weg_ok', 's5_akte', 's6_haken', 'k1_tresor_offen', 'k2_karte_1', 's8_zug1_wahl_ok', 's9_zug3_blick_ok', 's10_akte',
           's13_zug1_blick_ok', 's16_zug1_wahl', 's16_zug3_wahl_ok', 's18_haken', 's19_zug3_steckbrief_ok', 's20_zug2_blick_ok', 's23_zug3_wahl_ok', 's24_akte', 'k4_tresor_offen', 'finale', 'notizbuch']
for i, n in enumerate(GALERIE):
    im = Image.open(neu(n)).convert('RGB'); im.thumbnail((540, 1170))
    im.save(os.path.join(GAL, f'{i + 1:02d}_{n}.jpg'), quality=82)

# Vorher – Nachher
PAARE = [('1_lesen', 'telefon_13_spur2_lesen', 's2_lesen_1', 'Lesen'),
         ('2_aufgabe', 'telefon_14_spur2_spiel', 's2_zug2_zwei_ok', 'Aufgabe'),
         ('3_fehler', 'telefon_06_spur1_beweis_suchen', 's3_zug2_wahl_notizbuch', 'Nach einem Fehler'),
         ('4_wand', 'telefon_21_spur2_spurenwand', 's2_akte', 'Nach der Spur'),
         ('5_weiter', 'telefon_20_spur2_sieg', 's2_haken', 'Übergang zur nächsten Spur')]
for name, a, b, titel in PAARE:
    A = Image.open(os.path.join(ALT, a + '.jpg')).convert('RGB'); B = Image.open(neu(b)).convert('RGB')
    h = 1000; A = A.resize((round(A.width * h / A.height), h)); B = B.resize((round(B.width * h / B.height), h))
    out = Image.new('RGB', (A.width + B.width + 60, h + 70), '#F3EEE2'); d = ImageDraw.Draw(out)
    d.text((20, 20), f'{titel} – vorher', fill='#26221C', font=FONT); d.text((A.width + 40, 20), 'jetzt', fill='#26221C', font=FONT)
    out.paste(A, (20, 60)); out.paste(B, (A.width + 40, 60))
    out.save(os.path.join(VGL, name + '.jpg'), quality=84)
print('✓ Galerie', len(GALERIE), '· Vergleich', len(PAARE))
