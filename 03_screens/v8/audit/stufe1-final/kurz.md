# UI-Audit „stufe1-final“ · 2026-11-15 14:46 · 3:30 min
Build: http://localhost:4173 · Viewports: 390x844 1280x800 360x620 · fs=20 · dpr=1
Zustände×Viewport: 1031 · mit Problemen: 864 · NOT TESTED: 6 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
kopf-ueberlappt 4·747 | schrift-klein 9·581 | text-abgeschnitten 3·577 | text-verdeckt 6·367 | zug-rollt(i) 20·257 | text-gekuerzt(i) 4·211 | tippflaeche-klein 9·84 | brett-rollt(i) 2·77 | ragt-raus 4·56 | text-ragt-raus 3·54 | bild-winzig 1·9 | unerreichbar 2·9 | bild-verzerrt 2·9 | ueber-rollt(i) 1·2 | blatt-rollt(i) 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
schrift-klein · span#kT2 @ .kopf · 279Z · 2V · s01_lesen_1@390x844 · 11.5px: „Ka“
text-abgeschnitten · span#kT2 @ .kopf · 279Z · 2V · s01_lesen_1@390x844 · Breite 18.8px zu viel, ellipsis: „Mond“ in span#kT2 [×2]
text-verdeckt · span#kT2 @ .kopf · 165Z · 3V · s02_geloest@390x844 · „pi“ (Text 120.3,32.7) verdeckt von img#kWegR @ .kopf [Box 120.3,37…154.3,71] [×3]
kopf-ueberlappt · span#kT2(Text) x img#kWegR · 157Z · 3V · s02_geloest@390x844 · span#kT2(Text) ↔ img#kWegR: 34x9.7px
kopf-ueberlappt · button#bBrett.kb.brettb x img#kWegR · 91Z · 3V · s01_lesen_1@390x844 · button#bBrett.kb.brettb ↔ img#kWegR: 27x14px
kopf-ueberlappt · span#kMond.mondp x img#kWegR · 106Z · 3V · s04_geloest@390x844 · span#kMond.mondp ↔ img#kWegR: 28.6x8px
kopf-ueberlappt · button#bAa.kb.aa x img#kWegR · 19Z · 3V · s06_geloest@390x844 · button#bAa.kb.aa ↔ img#kWegR: 27x14px
tippflaeche-klein · button[data-s] @ .zug[data-art=unterschiede] · 11Z · 3V · s02_raetsel@390x844 · 110x36px [×2]
ragt-raus · span.plus @ .brett · 26Z · 1V · s01_brett_fertig@360x620 · seitlich: rechts 12.8px über #app (x 205…372.8, App 0…360)
text-abgeschnitten · span @ .brett · 26Z · 1V · s01_brett_fertig@360x620 · Breite 2.8px zu viel: „len“ in section.brett
text-ragt-raus · span @ .brett · 26Z · 1V · s01_brett_fertig@360x620 · „len“ 2.8px über #app hinaus
schrift-klein · em.neu @ .brett · 8Z · 3V · s01_brett_fertig@390x844 · 10px: „neu“
ragt-raus · span.plus @ .brett.fragt · 22Z · 1V · s06_brett_frage@360x620 · seitlich: rechts 12.8px über #app (x 205…372.8, App 0…360)
text-abgeschnitten · span @ .brett.fragt · 22Z · 1V · s06_brett_frage@360x620 · Breite 2.8px zu viel: „len“ in section.brett.fragt
text-ragt-raus · span @ .brett.fragt · 22Z · 1V · s06_brett_frage@360x620 · „len“ 2.8px über #app hinaus
schrift-klein · span @ .zug[data-art=reihe] · 4Z · 3V · s22_raetsel@390x844 · 11.5px: „Os“ [×6]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@390x844 · 38x42px [×4]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 3Z · 3V · s21_raetsel@390x844 · 18x24px [×6]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@390x844 · 36x46px [×20]
tippflaeche-klein · input#dname @ .dipl · 3Z · 3V · finale_3@390x844 · 253x39.1px
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 3V · s12_loese1@390x844 · „Scho“ (Text 283.3,664.2) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 278.5,574.8…339.5,680.8] [×2]
ragt-raus · button.bsk @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@360x620 · seitlich: rechts 3.5px über #app (x 28…363.5, App 0…360)
unerreichbar · button.bsk @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@360x620 · rechts 3.5px beschnitten von section.zug[data-art=buchstaben]; Box 335.5x64 @ 28,584.1
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 2V · s21_raetsel@390x844 · Seitenverhältnis 0.6 statt 0.6 (6% daneben), Box 10x17, Original 94x150
text-ragt-raus · span @ .zug[data-art=reihe] · 4Z · 2V · s05_fehler_voll@390x844 · „men“ 7.1px über span hinaus [×2]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@390x844 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@390x844 · 36x46px
text-verdeckt · p @ .brett · 4Z · 2V · s11_brett_fertig@1280x800 · „I“ (Text 550.7,385.6) verdeckt von span.s-r @ .brett [Box 554.1,385.7…570,401]
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 3V · s08_geloest@390x844 · Seitenverhältnis 3.5 statt 2.2 (60% daneben), Box 144x41, Original 412x188 [×2]
schrift-klein · span @ .zug[data-art=sortieren] · 1Z · 3V · s07_geloest@390x844 · 11px: „Fuchs-“ [×6]
schrift-klein · span @ .zug[data-art=unterschiede] · 1Z · 3V · s21_geloest@390x844 · 11px: „Pa“ [×7]
schrift-klein · p.dh @ .dipl · 3Z · 1V · finale_3@360x620 · 10.9px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 1V · finale_3@360x620 · 10.2px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 1V · finale_3@360x620 · 10.9px: „Schim“
text-verdeckt · p @ .brett.fragt · 3Z · 1V · s11_brett_frage@1280x800 · „I“ (Text 550.7,385.6) verdeckt von span.s-r @ .brett.fragt [Box 554.1,385.7…570,401]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 3V · s08_geloest@390x844 · 21.8x33.3px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 3V · finale_1@390x844 · 20.6x19.1px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 3V · finale_1_falsch@390x844 · 20.6x19.1px [×4]
text-verdeckt · span @ .brett · 2Z · 1V · s02_brett_neu@360x620 · „Leucht-“ (Text 68.4,132.4) verdeckt von div.bkarte @ .brett [Box 14.4,133.8…120.3,269.2] [×2]
text-verdeckt · p.wischz @ .brett · 2Z · 1V · s02_brett_neu@360x620 · „Staub“ (Text 244,129.8) verdeckt von div.bkarte.leer @ .brett [Box 241.3,135…344,268] [×2]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 2V · s16_loese1@390x844 · unten 5.1px beschnitten von div.kr-bild; Box 44x44 @ 118.5,482.2 [×2]
ragt-raus · p.tu @ .titel · 1Z · 1V · titel_weiter@360x620 · unten 4.1px abgeschnitten von main#buehne
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 1V · s19_geloest@360x620 · 11.5px: „HIER HÄNGT ER“

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 3V · s01_brett_fertig@390x844 · Höhe 15.4px zu viel, line-clamp 3: „hin“ in p [×7]
text-gekuerzt · p @ .fundov · 22Z · 3V · s01_brett_neu@390x844 · Höhe 5.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 3V · s06_brett_frage@390x844 · Höhe 15.4px zu viel, line-clamp 3: „hin“ in p [×43]
brett-rollt · section.brett · 47Z · 1V · s01_brett_neu@360x620 · vertikal +67px (scrollHeight 534, clientHeight 467)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 3V · s06_moment@390x844 · vertikal +3px (scrollHeight 698, clientHeight 695)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 3V · s15_geloest@390x844 · vertikal +68px (scrollHeight 763, clientHeight 695)
brett-rollt · section.brett.fragt · 22Z · 3V · s20_brett_frage_hilfe@390x844 · vertikal +5px (scrollHeight 696, clientHeight 691)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 3V · s19_moment@390x844 · vertikal +67px (scrollHeight 762, clientHeight 695)
zug-rollt · section.zug[data-art=plakat] · 6Z · 3V · s18_moment@390x844 · vertikal +61px (scrollHeight 756, clientHeight 695)
zug-rollt · section.zug[data-art=reihe] · 10Z · 2V · s22_moment@390x844 · vertikal +32px (scrollHeight 727, clientHeight 695)
… 18 weitere

## Pixelvergleich mit „vorher“ (Toleranz je Kanal > 8; gemeldet ab > 0,05 %)
Verglichen: 1031 · Abweichung > 0,05 %: 1 · ohne Referenz/Fehler: 0
pixel-diff · finale_1@360x620 · 110516px = 49.5143 %
Kleinstabweichungen (0 < Diff ≤ 0,05 %): 47

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/3V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
