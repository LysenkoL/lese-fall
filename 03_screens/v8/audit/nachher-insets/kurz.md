# UI-Audit „nachher-insets“ · 2026-11-15 15:25 · 4:16 min
Build: http://localhost:4173 · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=20 · insets=40,48 · dpr=1
Zustände×Viewport: 1812 · mit Problemen: 118 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
zug-rollt(i) 21·483 | text-gekuerzt(i) 4·356 | brett-rollt(i) 2·207 | tippflaeche-klein 9·65 | schrift-klein 7·41 | rollt(i) 7·37 | text-verdeckt 9·28 | bild-winzig 1·20 | bild-verzerrt 2·11 | verdeckt 2·8 | ueber-rollt(i) 2·7 | unerreichbar 2·5 | blatt-rollt(i) 1·1 | safe-area 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 7Z · 4V · s02_raetsel@320x568 · 19x25px
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@320x568 · 38x42px [×4]
tippflaeche-klein · input#dname @ .dipl · 3Z · 4V · finale_3@320x568 · 86.4x13.1px
schrift-klein · p.dh @ .dipl · 3Z · 3V · finale_3@320x568 · 6px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 3V · finale_3@320x568 · 5.6px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 3V · finale_3@320x568 · 6px: „Schim“
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@320x568 · 36x46px [×20]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 3V · s12_loese1@412x915 · „Scho“ (Text 300.2,706.1) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 293.5,620.1…358.3,723.2] [×2]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 3Z · 5V · s08_dreh@320x568 · 36.7x56.2px
verdeckt · div.zettel.fr @ .brett · 7Z · 1V · s04_brett_fertig@360x640 · 3/5 Punkte verdeckt von div.fragen @ .brett; Box 161.4x77.6 @ 15.3,511.4 [×2]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 2V · s21_raetsel@320x568 · Seitenverhältnis 0.8 statt 0.8 (4% daneben), Box 12x16, Original 200x256 [×2]
schrift-klein · b @ .dipl · 3Z · 2V · finale_3@320x568 · 8.4px: „49“
text-verdeckt · p @ .brett · 4Z · 3V · s11_brett_fertig@320x568 · „I“ (Text 120.9,115.2) verdeckt von span.s-r @ .brett [Box 124.4,115.3…140.3,130.6]
text-verdeckt · span @ .brett.fragt · 6Z · 1V · s06_brett_frage@768x1024 · „Är“ (Text 169.3,878.1) verdeckt von footer#fuss [Box 0,888.3…768,1024] [×2]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@320x568 · 36x46px
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (24% daneben), Box 111x41, Original 412x188 [×2]
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.8x15.5px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.8x15.5px [×4]
schrift-klein · p.dt @ .dipl · 3Z · 1V · finale_3@320x568 · 11px: „Meis“
schrift-klein · p.df @ .dipl · 3Z · 1V · finale_3@320x568 · 8.6px: „Der“
tippflaeche-klein · div.pk-st @ .zug[data-art=plakat] · 3Z · 1V · s18_raetsel@320x568 · 42.5x38.2px [×6]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8.1px beschnitten von div.kr-bild; Box 44x44 @ 94.6,206.1 [×2]
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 2V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
text-verdeckt · p.zt1 @ .zug[data-art=kreise] · 2Z · 1V · s16_fehler_erinnern@1024x768 · „ge“ (Text 28.5,360.4) verdeckt von div.rp @ .zug[data-art=kreise] [Box 28.5,370.8…337.9,617.9] [×4]
text-verdeckt · p.zt1 @ .zug.fin[data-art=tresorcode] · 2Z · 1V · finale_1@1024x768 · „Buch“ (Text 28.5,415.8) verdeckt von div.rp @ .zug.fin[data-art=tresorcode] [Box 28.5,425.6…337.9,617.9] [×26]
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 2V · s07_geloest@320x568 · höher (406.2px) als der Scrollbereich section.zug[data-art=sortieren] (330px); Box 128.9x406.2 @ 26.1,-139.7 [×2]
safe-area · button.kn.haupt @ #ueber .kgross.tresorinfo · 1Z · 1V · ueber_tresorinfo@320x568 · Overlay-Inhalt im unteren Sicherheitsrand: 522.3 (Grenze 520)
text-verdeckt · p @ .brett.fragt · 1Z · 1V · s11_brett_frage@320x568 · „I“ (Text 120.9,398.2) verdeckt von span.s-r @ .brett.fragt [Box 124.4,398.3…140.3,413.6]
text-verdeckt · p.zt1 @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@1024x768 · „sie“ (Text 28.5,412.8) verdeckt von div.rp.gut @ .zug[data-art=sortieren] [Box 28.5,425.6…337.9,617.9] [×3]
text-verdeckt · p.zt1 @ .zug[data-art=astgabel] · 1Z · 1V · s19_loese3@1024x768 · „er“ (Text 28.5,326.2) verdeckt von div.rp.gut @ .zug[data-art=astgabel] [Box 28.5,317…337.9,536.7] [×14]
text-verdeckt · p.zt1 @ .zug[data-art=nest] · 1Z · 1V · s24_geloest@1024x768 · „sam“ (Text 28.5,331.5) verdeckt von div.rp.gut @ .zug[data-art=nest] [Box 28.5,343.3…337.9,617.9] [×20]
verdeckt · button.kr-k @ .zug[data-art=kreise] · 1Z · 1V · s16_loese1@320x568 · 5/5 Punkte verdeckt (Mitte) von button.kr-x @ .zug[data-art=kreise]; Box 75.3x75.3 @ 38.9,44 [×3]

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
brett-rollt · section.brett · 48Z · 4V · s01_brett_neu@320x568 · vertikal +152px (scrollHeight 478, clientHeight 326)
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
brett-rollt · section.brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · vertikal +364px (scrollHeight 678, clientHeight 314)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 5V · s06_moment@320x568 · vertikal +287px (scrollHeight 617, clientHeight 330)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 5V · s02_moment@320x568 · vertikal +189px (scrollHeight 519, clientHeight 330)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 5V · s19_moment@320x568 · vertikal +308px (scrollHeight 638, clientHeight 330)
zug-rollt · section.zug.fall · 12Z · 3V · kap1_fallkarte@320x568 · vertikal +35px (scrollHeight 441, clientHeight 406)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +343px (scrollHeight 673, clientHeight 330)
… 27 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
