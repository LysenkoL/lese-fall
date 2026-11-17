# UI-Audit „nachher-zoom“ · 2026-11-15 15:30 · 4:46 min
Build: http://localhost:4173 · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=20 · zoom=1.3 (nativ per text-size-adjust) · dpr=1
Zustände×Viewport: 1950 · mit Problemen: 601 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
zug-rollt(i) 21·498 | text-ragt-raus 4·447 | text-gekuerzt(i) 4·357 | text-abgeschnitten 8·295 | kopf-ueberlappt 1·239 | brett-rollt(i) 2·223 | text-verdeckt 23·71 | tippflaeche-klein 8·57 | rollt(i) 6·25 | bild-winzig 1·16 | bild-verzerrt 2·11 | schrift-klein 3·9 | ueber-rollt(i) 2·6 | unerreichbar 2·5 | ragt-raus 3·4 | verdeckt 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-ragt-raus · b#kT1 @ .kopf · 294Z · 2V · s12_lesen_1@320x568 · „Spur 12“ 3.4px über b#kT1 hinaus
kopf-ueberlappt · b#kT1(Text) x span#kMond.mondp · 239Z · 1V · s10_lesen_1@360x640 · b#kT1(Text) ↔ span#kMond.mondp: 10.4x18.8px
text-abgeschnitten · span#kT2 @ .kopf · 231Z · 1V · s07_lesen_1@360x640 · Breite 1.4px zu viel, ellipsis: „2“ in span#kT2
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 7Z · 4V · s02_raetsel@320x568 · 19x25px
text-abgeschnitten · p.dt @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 2px zu viel: „Meis“ in div.dipl-in [×2]
text-abgeschnitten · p.dl @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 10.3px zu viel: „Al“ in div.dipl-in [×16]
text-abgeschnitten · b @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 46.7px zu viel: „49“ in div.dipl-in
text-abgeschnitten · span.dpt @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 43.7px zu viel: „Schim“ in div.dipl-in [×4]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 8Z · 5V · s23_fehler_falsch@320x568 · „se“ (Text 96.5,189.6) verdeckt von span.s-b @ .zug[data-art=ausschluss] [Box 105.8,189.6…155.2,213.6] [×2]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@320x568 · 36x46px [×20]
tippflaeche-klein · input#dname @ .dipl · 3Z · 3V · finale_3@320x568 · 130.2x24.1px
text-verdeckt · p.zt1 @ .zug[data-art=lupe] · 7Z · 1V · s13_raetsel@1024x768 · „Was“ (Text 28.5,300.4) verdeckt von div.rp @ .zug[data-art=lupe] [Box 28.5,317.2…337.9,665.9] [×21]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 2V · s21_raetsel@320x568 · Seitenverhältnis 0.8 statt 0.8 (4% daneben), Box 12x16, Original 200x256 [×2]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@320x568 · 36x46px
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (24% daneben), Box 111x41, Original 412x188 [×2]
text-verdeckt · p.zt1 @ .zug[data-art=buchstaben] · 5Z · 1V · s01_fehler_knopf@1024x768 · „Bild“ (Text 28.5,294.6) verdeckt von div.rp @ .zug[data-art=buchstaben] [Box 28.5,281.6…337.9,665.9] [×32]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · 12.9x19.8px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.8x15.5px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.8x20px [×4]
text-verdeckt · p @ .brett · 4Z · 2V · s03_brett_fertig@320x568 · „ße“ (Text 275.8,283.3) verdeckt von span.s-r @ .brett [Box 248.5,282.7…291.7,303.6]
text-verdeckt · span @ .zug[data-art=unterschiede] · 1Z · 4V · s21_geloest@360x640 · „ben“ (Text 241.4,252.1) verdeckt von span.s-b @ .zug[data-art=unterschiede] [Box 244.5,252.1…270.5,271.1]
text-verdeckt · p.zt1 @ .zug[data-art=unterschiede] · 4Z · 1V · s15_geloest@1024x768 · „Die“ (Text 28.5,256.1) verdeckt von div.rp.gut @ .zug[data-art=unterschiede] [Box 28.5,245.9…337.9,665.9] [×33]
text-verdeckt · p.zt1 @ .zug[data-art=kreise] · 4Z · 1V · s16_raetsel@1024x768 · „zu“ (Text 28.5,412.9) verdeckt von div.rp @ .zug[data-art=kreise] [Box 28.5,424.2…337.9,665.9] [×6]
text-verdeckt · p.zt1 @ .zug[data-art=astgabel] · 4Z · 1V · s19_fehler_falsch@1024x768 · „sie“ (Text 28.5,444.6) verdeckt von div.rp @ .zug[data-art=astgabel] [Box 28.5,450…337.9,584.7] [×11]
schrift-klein · p.dh @ .dipl · 3Z · 1V · finale_3@320x568 · 11.8px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 1V · finale_3@320x568 · 11px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 1V · finale_3@320x568 · 11.8px: „Schim“
text-ragt-raus · h2 @ .zug[data-art=agentencode] · 3Z · 1V · s17_raetsel@1024x768 · „ten-“ 14.3px über h2 hinaus
text-verdeckt · p.zt1 @ .zug[data-art=agentencode] · 3Z · 1V · s17_raetsel@1024x768 · „fal“ (Text 28.5,407.1) verdeckt von div.rp @ .zug[data-art=agentencode] [Box 28.5,424.2…337.9,665.9] [×13]
text-verdeckt · p.zt1 @ .zug[data-art=nest] · 3Z · 1V · s24_raetsel@1024x768 · „her“ (Text 28.5,487.9) verdeckt von div.rp @ .zug[data-art=nest] [Box 28.5,495.5…337.9,665.9] [×4]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8.1px beschnitten von div.kr-bild; Box 44x44 @ 94.6,180 [×2]
ragt-raus · h1 @ .titel · 2Z · 1V · titel@320x568 · seitlich: links 17.4px über #app (x -17.4…337.4, App 0…320)
text-abgeschnitten · h1 @ .titel · 2Z · 1V · titel@320x568 · Breite 17.4px zu viel: „ver“ in section.titel [×2]
text-ragt-raus · h1 @ .titel · 2Z · 1V · titel@320x568 · „ver“ 17.4px über #app hinaus [×2]
text-verdeckt · p.zt1 @ .zug[data-art=ausschluss] · 2Z · 1V · s06_geloest@1024x768 · „pas“ (Text 28.5,407.1) verdeckt von div.rp.gut @ .zug[data-art=ausschluss] [Box 28.5,424.2…337.9,665.9] [×3]
text-verdeckt · p.zt1 @ .zug[data-art=plakat] · 2Z · 1V · s18_fehler_falsch@1024x768 · „neu“ (Text 28.5,250.2) verdeckt von div.rp @ .zug[data-art=plakat] [Box 28.5,245.9…337.9,665.9] [×20]
text-verdeckt · h2 @ .zug[data-art=lupe] · 2Z · 1V · s20_raetsel@1024x768 · „Maus“ (Text 28.5,245.8) verdeckt von div.rp @ .zug[data-art=lupe] [Box 28.5,245.9…337.9,665.9] [×2]
text-verdeckt · p.zt1 @ .zug[data-art=reihe] · 2Z · 1V · s22_fehler_falsch@1024x768 · „Rei“ (Text 28.5,532.3) verdeckt von div.rp @ .zug[data-art=reihe] [Box 28.5,531.2…337.9,665.9] [×5]
text-verdeckt · p.zt1 @ .zug.fin[data-art=tresorcode] · 2Z · 1V · finale_1@1024x768 · „Wort“ (Text 28.5,393.1) verdeckt von div.rp @ .zug.fin[data-art=tresorcode] [Box 28.5,388.5…337.9,665.9] [×31]
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 2V · s07_geloest@320x568 · höher (530.8px) als der Scrollbereich section.zug[data-art=sortieren] (412px); Box 128.9x530.8 @ 26.1,-280.8 [×2]
ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · seitlich: rechts 14.5px über #app (x 96…334.5, App 0…320)
ragt-raus · span @ .zug[data-art=kreise] · 1Z · 1V · s16_loese1@320x568 · seitlich: links 9.4px über #app (x -9.4…329.4, App 0…320)
text-abgeschnitten · b.stempel.abdruck @ .zug[data-art=merkmale] · 1Z · 1V · s04_geloest@320x568 · Höhe 7.2px zu viel: „NICHT MILAS MOND“ in div.mm-box.stempelziel
text-abgeschnitten · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · Breite 13.6px zu viel: „se-“ in div.blatt[data-art=lesen] [×3]
text-ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · „se-“ 13.6px über #app hinaus [×3]
text-verdeckt · p @ .brett.fragt · 1Z · 1V · s06_brett_frage@320x568 · „ße“ (Text 275.8,283.3) verdeckt von span.s-r @ .brett.fragt [Box 248.5,282.7…291.7,303.6]
text-verdeckt · i @ .brett.fragt · 1Z · 1V · s20_brett_frage_falsch@320x568 · „N“ (Text 164,445.8) verdeckt von footer#fuss [Box 0,462…320,568] [×3]
text-verdeckt · p @ #ueber .brett.ueberl · 1Z · 1V · ueber_brett_k1@320x568 · „ße“ (Text 275.8,188.9) verdeckt von span.s-r @ #ueber .brett.ueberl [Box 248.5,188.4…291.7,209.2]
text-verdeckt · p.zt1 @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@1024x768 · „Bas“ (Text 28.5,362.7) verdeckt von div.rp.gut @ .zug[data-art=sortieren] [Box 28.5,352.9…337.9,665.9] [×28]
text-verdeckt · p.zt1 @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@1024x768 · „Der“ (Text 28.5,300.4) verdeckt von div.rp.gut @ .zug[data-art=klebstoff] [Box 28.5,317.2…337.9,665.9] [×26]
text-verdeckt · p.zt1 @ .zug[data-art=suchbild] · 1Z · 1V · s09_geloest@1024x768 · „Tip“ (Text 28.5,412.9) verdeckt von div.rp.gut @ .zug[data-art=suchbild] [Box 28.5,424.2…337.9,665.9] [×7]
text-verdeckt · p.zt1 @ .zug[data-art=schatten] · 1Z · 1V · s14_geloest@1024x768 · „Schna“ (Text 28.5,375.4) verdeckt von div.rp.gut @ .zug[data-art=schatten] [Box 28.5,388.5…337.9,665.9] [×35]
text-verdeckt · h2 @ .zug[data-art=nest] · 1Z · 1V · s24_geloest@1024x768 · „Der“ (Text 28.5,201.4) verdeckt von div.rp.gut @ .zug[data-art=nest] [Box 28.5,210.3…337.9,665.9] [×5]
verdeckt · div.bkarte @ .brett · 1Z · 1V · s11_brett_fertig@360x640 · 3/5 Punkte verdeckt (Mitte) von div.bgrid @ .brett; Box 106.2x149.9 @ 239.5,-63.9

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 20.6px zu viel, line-clamp 3: „o“ in p [×15]
brett-rollt · section.brett · 48Z · 5V · s01_brett_neu@320x568 · vertikal +179px (scrollHeight 587, clientHeight 408)
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 3.7px zu viel, line-clamp 5: „blau“ in p [×2]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 20.6px zu viel, line-clamp 3: „o“ in p [×70]
brett-rollt · section.brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · vertikal +488px (scrollHeight 868, clientHeight 380)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 5V · s06_moment@320x568 · vertikal +426px (scrollHeight 838, clientHeight 412)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 5V · s02_moment@320x568 · vertikal +206px (scrollHeight 618, clientHeight 412)
zug-rollt · section.zug.fall · 12Z · 5V · kap1_fallkarte@320x568 · vertikal +96px (scrollHeight 590, clientHeight 494)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 4V · s19_moment@320x568 · vertikal +375px (scrollHeight 787, clientHeight 412)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +404px (scrollHeight 816, clientHeight 412)
… 25 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
