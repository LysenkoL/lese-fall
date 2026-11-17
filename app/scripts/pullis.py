"""Stellt Bilder mit einfarbigem Hintergrund frei (Flutfüllung von den Ecken) und legt sie als WebP ab.
Aufruf: python3 -I pullis.py <quelle> <ziel.webp> [toleranz]
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
tol = int(sys.argv[3]) if len(sys.argv) > 3 else 38
im = Image.open(src).convert('RGB')
im.thumbnail((900, 900), Image.LANCZOS)
w, h = im.size
px = im.load()
bg = px[2, 2]
weg = bytearray(w * h)
q = deque()
for x in range(w):
    q.append((x, 0)); q.append((x, h - 1))
for y in range(h):
    q.append((0, y)); q.append((w - 1, y))
while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h or weg[y * w + x]:
        continue
    r, g, b = px[x, y]
    if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > tol:
        continue
    weg[y * w + x] = 1
    q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
a = Image.frombytes('L', (w, h), bytes(0 if v else 255 for v in weg))
a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
out = im.convert('RGBA'); out.putalpha(a)
out = out.crop(out.getbbox())
out.save(dst, 'WEBP', quality=90, method=6)
print('ok', dst, out.size)
