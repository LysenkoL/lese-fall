# UI-Audit „nachher“ · 2026-11-15 15:16 · 11:36 min
Build: http://localhost:4173 · Viewports: 320x568 360x620 360x640 360x800 390x844 412x915 430x932 480x854 600x960 768x1024 820x1180 1024x768 1280x800 844x390 1024x600 · fs=20 · dpr=1
Zustände×Viewport: 5126 · mit Problemen: 533 · NOT TESTED: 30 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
text-gekuerzt(i) 4·1065 | zug-rollt(i) 21·992 | brett-rollt(i) 2·352 | tippflaeche-klein 11·194 | text-abgeschnitten 1·176 | text-verdeckt 44·165 | schrift-klein 7·58 | bild-winzig 2·48 | rollt(i) 7·44 | blatt-rollt(i) 1·39 | bild-verzerrt 2·39 | unerreichbar 3·30 | verdeckt 1·6 | ueber-rollt(i) 2·6

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-abgeschnitten · span#kT2 @ .kopf · 121Z · 2V · s13_lesen_1@480x854 · Breite 16.3px zu viel, ellipsis: „auf“ in span#kT2 [×3]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 7Z · 13V · s02_raetsel@320x568 · 19x25px
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 10V · s01_fehler_falsch@320x568 · 38x42px [×4]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 13V · s23_loese1@360x620 · „Am“ (Text 264.5,481.2) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 256.6,419.5…311.6,499.3] [×2]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 10V · s17_raetsel@320x568 · 36x46px [×20]
tippflaeche-klein · input#dname @ .dipl · 3Z · 9V · finale_3@320x568 · 130.2x19.1px
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 8V · s21_raetsel@320x568 · Seitenverhältnis 0.8 statt 0.8 (4% daneben), Box 12x16, Original 200x256 [×2]
unerreichbar · button.bkarte.fundk @ .fundov · 22Z · 1V · s01_brett_neu@844x390 · außerhalb des Scrollbereichs von section.brett (-34.5…234.6 von 323); Box 258.9x269.1 @ 297,41.5
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 10V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 10V · s17_fehler_falsch@320x568 · 36x46px
text-verdeckt · p @ .brett · 11Z · 7V · s11_brett_fertig@320x568 · „I“ (Text 120.9,163.2) verdeckt von span.s-r @ .brett [Box 124.4,163.3…140.3,178.6]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 3Z · 15V · s08_geloest@320x568 · 13.1x20.1px
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 15V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (24% daneben), Box 111x41, Original 412x188 [×2]
schrift-klein · p.dh @ .dipl · 3Z · 5V · finale_3@320x568 · 9px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 5V · finale_3@320x568 · 8.4px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 5V · finale_3@320x568 · 9px: „Schim“
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 15V · finale_1@320x568 · 16.8x15.5px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 15V · finale_1_falsch@320x568 · 16.8x15.5px [×4]
text-verdeckt · p @ .brett.fragt · 12Z · 3V · s11_brett_frage@320x568 · „I“ (Text 120.9,358.2) verdeckt von span.s-r @ .brett.fragt [Box 124.4,358.3…140.3,373.6]
text-verdeckt · p.zt1 @ .zug[data-art=astgabel] · 7Z · 1V · s19_fehler_falsch@844x390 · „Wort“ (Text 24,254.1) verdeckt von img @ .zug[data-art=astgabel] [Box 24,262.3…78,316.3] [×9]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 7V · s16_loese1@320x568 · unten 8.1px beschnitten von div.kr-bild; Box 44x44 @ 94.6,254.1 [×2]
text-verdeckt · p.zt1 @ .zug[data-art=buchstaben] · 6Z · 1V · s01_fehler_falsch@844x390 · „Pas“ (Text 24,212) verdeckt von img @ .zug[data-art=buchstaben] [Box 24,220.2…78,274.2] [×14]
text-verdeckt · p.zt1 @ .zug[data-art=unterschiede] · 6Z · 1V · s02_geloest@844x390 · „Fin“ (Text 24,198.8) verdeckt von div.rp.gut @ .zug[data-art=unterschiede] [Box 24,187.6…278.7,304] [×8]
text-verdeckt · p.zt1 @ .zug[data-art=ausschluss] · 6Z · 1V · s06_fehler_falsch@844x390 · „und“ (Text 24,83.7) verdeckt von img @ .zug[data-art=ausschluss] [Box 24,91.9…78,145.9] [×14]
text-verdeckt · p.zt1 @ .zug[data-art=lupe] · 6Z · 1V · s13_raetsel@844x390 · „Was“ (Text 24,201.5) verdeckt von div.rp @ .zug[data-art=lupe] [Box 24,118.3…278.7,304] [×21]
verdeckt · div.zettel.fr @ .brett.fragt · 6Z · 1V · s13_brett_frage@360x640 · 3/5 Punkte verdeckt von div.fragen @ .brett.fragt; Box 161.2x60.6 @ 15.4,547.9 [×2]
text-verdeckt · p.zt1 @ .zug.fin[data-art=tresorcode] · 2Z · 3V · finale_1@1024x768 · „Schlüs“ (Text 28.5,462.3) verdeckt von div.rp @ .zug.fin[data-art=tresorcode] [Box 28.5,473.6…337.9,665.9] [×3]
text-verdeckt · h2 @ .zug[data-art=lupe] · 5Z · 1V · s13_raetsel@844x390 · „Der“ (Text 24,133) verdeckt von div.rp @ .zug[data-art=lupe] [Box 24,118.3…278.7,304] [×8]
tippflaeche-klein · div.pk-st @ .zug[data-art=plakat] · 5Z · 1V · s18_raetsel@844x390 · 29x26px [×6]
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 4V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
text-verdeckt · p.zt1 @ .zug[data-art=versteckt] · 4Z · 1V · s03_fehler_falsch@844x390 · „ver“ (Text 24,253.7) verdeckt von img @ .zug[data-art=versteckt] [Box 24,261.9…78,315.9] [×11]
text-verdeckt · p.zt1 @ .zug[data-art=reihe] · 4Z · 1V · s05_fehler_falsch@844x390 · „rich“ (Text 24,192.9) verdeckt von div.rp @ .zug[data-art=reihe] [Box 24,201.8…278.7,272] [×8]
text-verdeckt · h2 @ .zug[data-art=unterschiede] · 4Z · 1V · s15_geloest@844x390 · „Was“ (Text 24,133) verdeckt von div.rp.gut @ .zug[data-art=unterschiede] [Box 24,95.3…278.7,304] [×5]
text-verdeckt · p.zt1 @ .zug[data-art=kreise] · 4Z · 1V · s16_raetsel@844x390 · „Was“ (Text 24,201.5) verdeckt von div.rp @ .zug[data-art=kreise] [Box 24,176.4…278.7,315.9] [×24]
schrift-klein · p.dt @ .dipl · 3Z · 1V · finale_3@844x390 · 5.3px: „Meis“
schrift-klein · p.df @ .dipl · 3Z · 1V · finale_3@844x390 · 4.2px: „Der“
schrift-klein · b @ .dipl · 3Z · 1V · finale_3@844x390 · 4px: „49“
text-verdeckt · p @ #ueber .brett.ueberl · 1Z · 3V · ueber_brett_k1@480x854 · „e“ (Text 286,592.5) verdeckt von span.s-b @ #ueber .brett.ueberl [Box 259.2,591.6…298.4,607.9]
text-verdeckt · p.zt1 @ .zug[data-art=klebstoff] · 3Z · 1V · s08_dreh@844x390 · „Mond“ (Text 24,198.8) verdeckt von div.rp @ .zug[data-art=klebstoff] [Box 24,187.6…278.7,304] [×16]
text-verdeckt · p.zt1 @ .zug[data-art=agentencode] · 3Z · 1V · s17_raetsel@844x390 · „Os“ (Text 24,175.5) verdeckt von div.rp @ .zug[data-art=agentencode] [Box 24,176.5…278.7,316] [×32]
text-verdeckt · p.zt1 @ .zug[data-art=plakat] · 3Z · 1V · s18_fehler_falsch@844x390 · „Das“ (Text 24,172.8) verdeckt von div.rp @ .zug[data-art=plakat] [Box 24,72.2…278.7,304] [×25]
text-verdeckt · h2 @ .zug[data-art=astgabel] · 3Z · 1V · s19_loese4@844x390 · „Das“ (Text 24,110) verdeckt von div.rp @ .zug[data-art=astgabel] [Box 24,121.7…278.7,238] [×4]
text-verdeckt · p.zt1 @ .zug[data-art=nest] · 3Z · 1V · s24_raetsel@844x390 · „Krims“ (Text 24,201.6) verdeckt von div.rp @ .zug[data-art=nest] [Box 24,199.6…278.7,316] [×25]
tippflaeche-klein · div.pk-platz.voll @ .zug[data-art=plakat] · 3Z · 1V · s18_fehler_voll@844x390 · 33.4x29.7px [×6]
text-verdeckt · p.zt1 @ .zug[data-art=sortieren] · 2Z · 1V · s07_fehler_falsch@844x390 · „Sa“ (Text 24,254.2) verdeckt von div.rp @ .zug[data-art=sortieren] [Box 24,246.2…278.7,316.4] [×14]
text-verdeckt · p.zt1 @ .zug[data-art=spiegel] · 2Z · 1V · s10_fehler_falsch@844x390 · „sei“ (Text 24,66.9) verdeckt von div.rp @ .zug[data-art=spiegel] [Box 24,75.8…278.7,146] [×5]
text-verdeckt · h2 @ .zug[data-art=kreise] · 2Z · 1V · s16_raetsel@844x390 · „Mi“ (Text 24,161.8) verdeckt von div.rp @ .zug[data-art=kreise] [Box 24,176.4…278.7,315.9] [×4]
text-verdeckt · h2 @ .zug[data-art=plakat] · 2Z · 1V · s18_fehler_falsch@844x390 · „Das“ (Text 24,133) verdeckt von div.rp @ .zug[data-art=plakat] [Box 24,72.2…278.7,304] [×3]
text-verdeckt · span.tab.hell @ .zug[data-art=lupe] · 2Z · 1V · s20_raetsel@844x390 · „Rät“ (Text 34,101.5) verdeckt von div.rp @ .zug[data-art=lupe] [Box 24,49.1…278.7,304] [×2]
tippflaeche-klein · div.pk-platz @ .zug[data-art=plakat] · 2Z · 1V · s18_raetsel@844x390 · 33.4x29.7px [×6]
bild-winzig · img.kl-flasche @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@844x390 · 14x17px
text-verdeckt · span @ .brett.fragt · 1Z · 1V · s23_brett_frage_hilfe@600x960 · „Der“ (Text 85.5,862.8) verdeckt von footer#fuss [Box 0,872.3…600,960] [×7]
text-verdeckt · span.tab.hell @ .zug[data-art=buchstaben] · 1Z · 1V · s01_fehler_knopf@844x390 · „Rät“ (Text 34,73.5) verdeckt von div.rp @ .zug[data-art=buchstaben] [Box 24,76.5…278.7,285.2] [×2]
text-verdeckt · span @ .zug[data-art=buchstaben] · 1Z · 1V · s01_fehler_knopf@844x390 · „Le“ (Text 133.4,72.8) verdeckt von p @ .zug[data-art=buchstaben] [Box 86,76.5…278.7,285.2] [×3]
text-verdeckt · h2 @ .zug[data-art=buchstaben] · 1Z · 1V · s01_fehler_knopf@844x390 · „Buch“ (Text 24,105) verdeckt von div.rp @ .zug[data-art=buchstaben] [Box 24,76.5…278.7,285.2] [×5]
text-verdeckt · h2 @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@844x390 · „Wie“ (Text 24,133) verdeckt von div.rp.gut @ .zug[data-art=klebstoff] [Box 24,118.3…278.7,304] [×5]
text-verdeckt · h2 @ .zug[data-art=suchbild] · 1Z · 1V · s09_geloest@844x390 · „Rau“ (Text 24,161.8) verdeckt von div.rp.gut @ .zug[data-art=suchbild] [Box 24,164.5…278.7,304] [×3]
text-verdeckt · p.zt1 @ .zug[data-art=suchbild] · 1Z · 1V · s09_geloest@844x390 · „Die“ (Text 24,201.5) verdeckt von div.rp.gut @ .zug[data-art=suchbild] [Box 24,164.5…278.7,304] [×25]
text-verdeckt · p.zt1 @ .zug[data-art=schatten] · 1Z · 1V · s14_geloest@844x390 · „lan“ (Text 24,175.9) verdeckt von div.rp.gut @ .zug[data-art=schatten] [Box 24,176.9…278.7,316.4] [×30]
text-verdeckt · span.tab.hell @ .zug[data-art=unterschiede] · 1Z · 1V · s15_geloest@844x390 · „Rät“ (Text 34,101.5) verdeckt von div.rp.gut @ .zug[data-art=unterschiede] [Box 24,95.3…278.7,304] [×2]
text-verdeckt · span @ .zug[data-art=unterschiede] · 1Z · 1V · s15_geloest@844x390 · „Zeit“ (Text 133.4,100.8) verdeckt von span.s-r @ .zug[data-art=unterschiede] [Box 125.8,108.3…156,128.3] [×4]
text-verdeckt · span.tab.hell @ .zug[data-art=kreise] · 1Z · 1V · s16_fehler_erinnern@844x390 · „Rät“ (Text 34,93.5) verdeckt von div.rp @ .zug[data-art=kreise] [Box 24,76…278.7,307.9] [×2]
text-verdeckt · span @ .zug[data-art=kreise] · 1Z · 1V · s16_fehler_erinnern@844x390 · „Zeit“ (Text 133.4,92.8) verdeckt von span.s-b @ .zug[data-art=kreise] [Box 101,89…151.9,109] [×4]
text-verdeckt · span.tab.hell @ .zug[data-art=plakat] · 1Z · 1V · s18_fehler_falsch@844x390 · „Rät“ (Text 34,101.5) verdeckt von div.rp @ .zug[data-art=plakat] [Box 24,72.2…278.7,304] [×2]
text-verdeckt · span @ .zug[data-art=plakat] · 1Z · 1V · s18_fehler_falsch@844x390 · „Le“ (Text 133.4,100.8) verdeckt von span.s-r @ .zug[data-art=plakat] [Box 121.1,108.3…151.6,128.3] [×3]
text-verdeckt · span.tab.hell @ .zug[data-art=astgabel] · 1Z · 1V · s19_loese5@844x390 · „Rät“ (Text 34,79.5) verdeckt von div.rp.gut @ .zug[data-art=astgabel] [Box 24,76.5…278.7,239] [×2]
text-verdeckt · span @ .zug[data-art=astgabel] · 1Z · 1V · s19_loese5@844x390 · „Leucht-“ (Text 133.4,78.8) verdeckt von p @ .zug[data-art=astgabel] [Box 86,76.5…278.7,239] [×3]
text-verdeckt · span @ .zug[data-art=lupe] · 1Z · 1V · s20_raetsel@844x390 · „Tau“ (Text 133.4,100.8) verdeckt von p @ .zug[data-art=lupe] [Box 86,49.1…278.7,304] [×5]
text-verdeckt · h2 @ .zug[data-art=ausschluss] · 1Z · 1V · s23_geloest@844x390 · „es“ (Text 24,161.8) verdeckt von div.rp.gut @ .zug[data-art=ausschluss] [Box 24,176.4…278.7,315.9] [×2]
text-verdeckt · h2 @ .zug[data-art=nest] · 1Z · 1V · s24_geloest@844x390 · „Der“ (Text 24,107) verdeckt von div.rp.gut @ .zug[data-art=nest] [Box 24,84.1…278.7,316] [×5]
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@844x390 · höher (260.6px) als der Scrollbereich section.zug[data-art=sortieren] (240px); Box 241.6x260.6 @ 314.7,59 [×2]

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 15V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
text-gekuerzt · p @ .fundov · 22Z · 15V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 15V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
brett-rollt · section.brett · 48Z · 5V · s01_brett_neu@320x568 · vertikal +66px (scrollHeight 480, clientHeight 414)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 14V · s06_moment@320x568 · vertikal +199px (scrollHeight 617, clientHeight 418)
brett-rollt · section.brett.fragt · 22Z · 9V · s06_brett_frage@320x568 · vertikal +276px (scrollHeight 678, clientHeight 402)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 14V · s02_moment@320x568 · vertikal +101px (scrollHeight 519, clientHeight 418)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 13V · s19_moment@320x568 · vertikal +252px (scrollHeight 670, clientHeight 418)
zug-rollt · section.zug[data-art=plakat] · 6Z · 15V · s18_moment@320x568 · vertikal +144px (scrollHeight 562, clientHeight 418)
zug-rollt · section.zug[data-art=lupe] · 9Z · 14V · s13_moment@320x568 · vertikal +255px (scrollHeight 673, clientHeight 418)
… 27 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/15V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
