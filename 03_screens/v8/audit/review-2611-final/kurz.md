# UI-Audit „review-2611-final“ · 2026-11-26 17:13 · 2:31 min
Build: http://localhost:4173 · Viewports: 320x568 390x844 768x1024 1280x800 844x390 · fs=20 · dpr=1
Zustände×Viewport: 1886 · mit Problemen: 200 · NOT TESTED: 55 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
zug-rollt(i) 38·378 | text-gekuerzt(i) 3·237 | brett-rollt(i) 1·111 | rollt(i) 8·87 | tippflaeche-klein 16·78 | text-verdeckt 10·66 | rollt-doppelt(i) 1·42 | bild-winzig 5·32 | ragt-raus 1·24 | text-abgeschnitten 2·21 | schrift-klein 7·19 | text-ragt-raus 2·12 | bild-verzerrt 1·8 | unerreichbar 4·7 | blatt-rollt(i) 1·5 | ueber-rollt(i) 2·4 | verdeckt 2·4

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-verdeckt · span @ .brett · 10Z · 5V · s06_brett_loese1@320x568 · „ge“ (Text 75.9,443.7) verdeckt von span.s-r @ .brett [Box 75.7,447.3…115,469.9] [×4]
ragt-raus · p.wzm-t @ .wzm · 24Z · 1V · s01_moment@844x390 · unten 7px abgeschnitten von main#buehne
text-abgeschnitten · b.ls-b @ .zug[data-art=laubspur] · 7Z · 2V · s11_raetsel@320x568 · Höhe 6.2px zu viel: „B“ in div.ls-feld.neu.staubig
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 4Z · 4V · s02_raetsel@320x568 · 11x15px [×4]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@320x568 · 38x42px [×4]
bild-winzig · img.wzm-r @ .wzm · 9Z · 1V · s01_moment@844x390 · 18x31px
text-ragt-raus · b.ls-b @ .zug[data-art=laubspur] · 3Z · 3V · s11_raetsel@390x844 · „B“ 2.1px über b.ls-b hinaus
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@320x568 · 36x46px [×20]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 4Z · 2V · s02_raetsel@320x568 · Seitenverhältnis 1.5 statt 1.6 (6% daneben), Box 9x6, Original 372x232
tippflaeche-klein · div.pk-st @ .zug[data-art=plakat] · 5Z · 2V · s19_raetsel@320x568 · 42.9x38.6px [×6]
tippflaeche-klein · input#dname @ .dipl · 2Z · 4V · finale_2_start@320x568 · 141.6x18.2px
bild-winzig · img.ding @ .zug.raupe-unten[data-art=unterschiede] · 4Z · 2V · s02_raetsel@1280x800 · 28x17px [×2]
text-abgeschnitten · b.ls-b @ .zug.raupe-unten[data-art=laubspur] · 7Z · 1V · s11_raetsel@1280x800 · Höhe 22.5px zu viel: „B“ in div.ls-feld.neu.staubig
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 3Z · 4V · s08_geloest@320x568 · 12.5x19.1px
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@320x568 · 36x46px
text-verdeckt · p @ .brett · 5Z · 2V · s11_brett_loese1@320x568 · „I“ (Text 123,253.6) verdeckt von span.s-r @ .brett [Box 126.4,253.7…149.2,269.1]
text-verdeckt · span.tab.hell @ .brett · 3Z · 2V · s12_brett_fertig@320x568 · „Dein“ (Text 26,117) verdeckt von img [Box 32.4,114…70.4,152] [×5]
schrift-klein · p.dh @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.9px: „hat“
schrift-klein · p.dl @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.3px: „Al“
schrift-klein · span.dpt @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.9px: „Schim“
text-verdeckt · b.nt-klick @ .zug[data-art=nest] · 1Z · 4V · s24_geloest@320x568 · „Klick!“ (Text 189,144) verdeckt von div.nt-zoom @ .zug[data-art=nest] [Box 56,106.9…264,242.9]
tippflaeche-klein · button.nt-schluessel @ .zug[data-art=nest] · 2Z · 2V · s24_raetsel@320x568 · 37.8x47.8px
text-ragt-raus · b.ls-b @ .zug.raupe-unten[data-art=laubspur] · 3Z · 1V · s11_raetsel@1280x800 · „B“ 2.6px über b.ls-b hinaus
text-verdeckt · h3 @ .brett · 3Z · 1V · s06_brett_fertig@844x390 · „fe“ (Text 534.6,133) verdeckt von img [Box 540.5,114…578.5,152] [×4]
tippflaeche-klein · button.pg-fleck @ .zug[data-art=passtgenau] · 1Z · 3V · s15_raetsel@320x568 · 27.2x27.2px [×2]
tippflaeche-klein · button.pg-loch @ .zug[data-art=passtgenau] · 1Z · 3V · s15_raetsel@320x568 · 27.9x27.9px
tippflaeche-klein · button.pg-loch.zu @ .zug[data-art=passtgenau] · 1Z · 3V · s15_geloest@320x568 · 27.9x27.9px
tippflaeche-klein · div.pk-platz.voll @ .zug[data-art=plakat] · 3Z · 1V · s19_fehler_voll@844x390 · 44.8x39.8px [×6]
verdeckt · div.zettel.fr @ .brett · 3Z · 1V · s04_brett_fertig@320x568 · 3/5 Punkte verdeckt von div.fragen @ .brett; Box 140.9x59.3 @ 15.5,487.7
bild-winzig · img @ .zug[data-art=sortieren] · 2Z · 1V · s07_raetsel@844x390 · 145x17px [×6]
schrift-klein · p.dt @ .dipl · 2Z · 1V · finale_2_start@844x390 · 5.2px: „Meis“
schrift-klein · p.df @ .dipl · 2Z · 1V · finale_2_start@844x390 · 4.3px: „Der“
schrift-klein · b @ .dipl · 2Z · 1V · finale_2_start@844x390 · 4.1px: „49“
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 2Z · 1V · s12_loese1@390x844 · „Scho“ (Text 282.6,634.4) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 277.9,568.4…338.5,654.6] [×2]
tippflaeche-klein · div.pk-st.neu @ .zug[data-art=plakat] · 1Z · 2V · s19_fehler_voll@320x568 · 42.7x37.3px
tippflaeche-klein · button.nt-schluessel.aufrecht @ .zug[data-art=nest] · 1Z · 2V · s24_loese3@320x568 · 34x46.4px
tippflaeche-klein · div.pk-platz @ .zug[data-art=plakat] · 2Z · 1V · s19_raetsel@844x390 · 44.8x39.8px [×6]
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 2V · s07_geloest@320x568 · höher (406.2px) als der Scrollbereich section.zug[data-art=sortieren] (398px); Box 128.9x406.2 @ 26.1,379.3 [×2]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 2V · s16_loese1@320x568 · unten 8.1px beschnitten von div.kr-bild; Box 44x44 @ 94.6,254.1 [×2]
unerreichbar · article.lx-seite.treffer @ .zug[data-art=lexikon] · 2Z · 1V · s23_loese1@844x390 · höher (312.3px) als der Scrollbereich section.zug[data-art=lexikon] (220px); Box 287x312.3 @ 515,-28
bild-winzig · img.kl-flasche @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@844x390 · 13x15px
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 1V · s20_geloest@320x568 · 11px: „HIER SITZT DAS NEST“
text-verdeckt · span @ .zug[data-art=reihe] · 1Z · 1V · s05_fehler_falsch@320x568 · „­“ (Text 281.4,442) verdeckt von button.rund [Box 274,446…318,490]
text-verdeckt · span.ww-it @ .zug[data-art=waage] · 1Z · 1V · s18_geloest@390x844 · „Wir“ (Text 78.2,368.7) verdeckt von div.ww-kind.neu @ .zug[data-art=waage] [Box 30.2,123…136.7,379] [×8]
text-verdeckt · span @ .zug[data-art=kreise] · 1Z · 1V · s16_raetsel@844x390 · „den“ (Text 762.3,271.7) verdeckt von button.rund [Box 772,268…816,312]
text-verdeckt · p.ww-wunsch @ .zug[data-art=waage] · 1Z · 1V · s18_raetsel@844x390 · „.“ (Text 786.9,266.8) verdeckt von button.rund [Box 772,268…816,312]
tippflaeche-klein · b.kl-zone @ .zug.raupe-unten[data-art=klebstoff] · 1Z · 1V · s08_geloest@1280x800 · 18.1x27.7px
unerreichbar · article.lx-seite @ .zug[data-art=lexikon] · 1Z · 1V · s23_raetsel@844x390 · höher (253.9px) als der Scrollbereich section.zug[data-art=lexikon] (220px); Box 287x253.9 @ 515,177
verdeckt · button.nt-schluessel @ .zug[data-art=nest] · 1Z · 1V · s24_loese1@844x390 · 4/5 Punkte verdeckt von div.nt-zoom @ .zug[data-art=nest]; Box 47.1x53 @ 598.1,52.8

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 30Z · 5V · s03_brett_fertig@320x568 · Breite 11.4px zu viel, line-clamp 3: „cken“ in p
brett-rollt · section.brett · 55Z · 3V · s01_brett_neu@320x568 · vertikal +40px (scrollHeight 434, clientHeight 394)
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.8px zu viel, line-clamp 3: „Mi“ in p [×3]
rollt · div.fundov @ .brett · 22Z · 2V · s01_brett_neu@320x568 · vertikal +16px (scrollHeight 410, clientHeight 394)
rollt-doppelt · div.fundov @ .brett · 22Z · 2V · s01_brett_neu@320x568 · rollt innerhalb eines ebenfalls rollenden Elements (+16px)
zug-rollt · section.zug[data-art=ausschluss] · 15Z · 4V · s06_moment@320x568 · vertikal +246px (scrollHeight 644, clientHeight 398)
zug-rollt · section.zug[data-art=astgabel] · 8Z · 4V · s20_moment@320x568 · vertikal +264px (scrollHeight 662, clientHeight 398)
zug-rollt · section.zug[data-art=nest] · 6Z · 5V · s24_moment@320x568 · vertikal +320px (scrollHeight 718, clientHeight 398)
rollt · section.haken · 23Z · 1V · s01_haken@844x390 · vertikal +170px (scrollHeight 390, clientHeight 220)
zug-rollt · section.zug[data-art=buchstaben] · 8Z · 3V · s01_moment@320x568 · vertikal +209px (scrollHeight 607, clientHeight 398)
… 44 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
8 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s03_fehler (wort), s04_fehler (merkmale), s11_fehler (laubspur), s15_fehler (passtgenau)
1 Zustände/5V · Weiter wurde nach 6 loese()-Aufrufen nicht aktiv · z. B. s11_geloest (laubspur)
1 Zustände/5V · Stempeln misslungen: page.click: Timeout 2500ms exceeded. · z. B. kap4_fallkarte_stempel
1 Zustände/5V · Finale abgebrochen: page.click: Timeout 2500ms exceeded. · z. B. finale_*
