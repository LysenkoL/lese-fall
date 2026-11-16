# UI-Audit „nachher-fs26“ · 2026-11-15 15:21 · 4:38 min
Build: http://localhost:4173 · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=26 · dpr=1
Zustände×Viewport: 1940 · mit Problemen: 97 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
zug-rollt(i) 20·371 | text-gekuerzt(i) 4·356 | brett-rollt(i) 2·151 | tippflaeche-klein 8·57 | text-verdeckt 4·20 | schrift-klein 4·20 | bild-winzig 1·16 | bild-verzerrt 2·8 | verdeckt 1·6 | rollt(i) 5·6 | ueber-rollt(i) 1·3 | unerreichbar 1·3 | ragt-raus 1·1 | text-abgeschnitten 1·1 | text-ragt-raus 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 7Z · 4V · s02_raetsel@320x568 · 19x25px
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@320x568 · 38x42px [×4]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 4V · s23_loese1@360x640 · „Am“ (Text 264.5,481.2) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 256.6,419.5…311.6,499.3] [×2]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@320x568 · 36x46px [×20]
tippflaeche-klein · input#dname @ .dipl · 3Z · 3V · finale_3@320x568 · 130.2x19.1px
schrift-klein · p.dh @ .dipl · 3Z · 2V · finale_3@320x568 · 9px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 2V · finale_3@320x568 · 8.4px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 2V · finale_3@320x568 · 9px: „Schim“
text-verdeckt · p @ .brett · 4Z · 3V · s11_brett_fertig@320x568 · „I“ (Text 120.9,163.2) verdeckt von span.s-r @ .brett [Box 124.4,163.3…140.3,178.6]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@320x568 · 36x46px
verdeckt · div.zettel.fr @ .brett.fragt · 6Z · 1V · s13_brett_frage@360x640 · 3/5 Punkte verdeckt von div.fragen @ .brett.fragt; Box 161.2x60.6 @ 15.4,547.9 [×2]
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (24% daneben), Box 111x41, Original 412x188 [×2]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · 13.1x20.1px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.8x15.5px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.8x15.5px [×4]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 1V · s21_raetsel@320x568 · Seitenverhältnis 0.8 statt 0.8 (4% daneben), Box 12x16, Original 200x256 [×2]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8.1px beschnitten von div.kr-bild; Box 44x44 @ 94.6,254.1 [×2]
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 2V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
text-verdeckt · p @ .brett.fragt · 2Z · 1V · s11_brett_frage@320x568 · „I“ (Text 120.9,358.2) verdeckt von span.s-r @ .brett.fragt [Box 124.4,358.3…140.3,373.6]
text-verdeckt · p.zt1 @ .zug.fin[data-art=tresorcode] · 2Z · 1V · finale_1@1024x768 · „Schlüs“ (Text 28.5,462.3) verdeckt von div.rp @ .zug.fin[data-art=tresorcode] [Box 28.5,473.6…337.9,665.9] [×3]
ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · seitlich: rechts 14.5px über #app (x 96…334.5, App 0…320)
text-abgeschnitten · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · Breite 13.6px zu viel: „se-“ in div.blatt[data-art=lesen] [×3]
text-ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · „se-“ 13.6px über #app hinaus [×3]

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
brett-rollt · section.brett · 48Z · 2V · s01_brett_neu@320x568 · vertikal +66px (scrollHeight 480, clientHeight 414)
brett-rollt · section.brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · vertikal +276px (scrollHeight 678, clientHeight 402)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 5V · s02_moment@320x568 · vertikal +101px (scrollHeight 519, clientHeight 418)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 5V · s06_moment@320x568 · vertikal +199px (scrollHeight 617, clientHeight 418)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 4V · s19_moment@320x568 · vertikal +252px (scrollHeight 670, clientHeight 418)
zug-rollt · section.zug[data-art=plakat] · 6Z · 5V · s18_moment@320x568 · vertikal +144px (scrollHeight 562, clientHeight 418)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +255px (scrollHeight 673, clientHeight 418)
… 22 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
