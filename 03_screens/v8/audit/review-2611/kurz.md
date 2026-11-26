# UI-Audit „review-2611“ · 2026-11-26 12:20 · 2:42 min
Build: http://localhost:4173 · Viewports: 320x568 390x844 768x1024 1280x800 844x390 · fs=20 · dpr=1
Zustände×Viewport: 1887 · mit Problemen: 425 · NOT TESTED: 55 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
text-verdeckt 83·415 | zug-rollt(i) 27·381 | text-gekuerzt(i) 3·235 | brett-rollt(i) 1·112 | rollt(i) 8·87 | tippflaeche-klein 16·83 | verdeckt 20·43 | rollt-doppelt(i) 1·42 | bild-winzig 4·32 | ragt-raus 1·24 | text-abgeschnitten 1·21 | schrift-klein 7·19 | text-ragt-raus 1·12 | bild-verzerrt 1·8 | unerreichbar 4·7 | blatt-rollt(i) 1·5 | ueber-rollt(i) 2·4

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-verdeckt · span @ .brett · 29Z · 5V · s03_brett_fertig@320x568 · „+2“ (Text 46,151) verdeckt von button.neuhaus.am-knopf [Box 24.4,106…267.9,160] [×5]
text-verdeckt · span.tab.hell @ .brett · 28Z · 2V · s03_brett_fertig@320x568 · „Dein“ (Text 26,117) verdeckt von img [Box 32.4,114…70.4,152] [×5]
text-verdeckt · h3 @ .brett · 28Z · 1V · s03_brett_fertig@844x390 · „fe“ (Text 534.6,148) verdeckt von button.neuhaus.am-knopf [Box 532.5,106…776,160] [×4]
ragt-raus · p.wzm-t @ .wzm · 24Z · 1V · s01_moment@844x390 · unten 7px abgeschnitten von main#buehne
text-abgeschnitten · b.ls-b @ .zug[data-art=laubspur] · 7Z · 3V · s11_raetsel@320x568 · Höhe 6.2px zu viel: „B“ in div.ls-feld.neu.staubig
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 4Z · 5V · s02_raetsel@320x568 · 11x15px [×4]
text-verdeckt · p.fund-t @ .fundov · 17Z · 1V · s04_brett_neu@320x568 · „Neu“ (Text 87.3,116) verdeckt von span.s-b [Box 106.3,129.6…135,149.6] [×4]
text-ragt-raus · b.ls-b @ .zug[data-art=laubspur] · 3Z · 4V · s11_raetsel@390x844 · „B“ 2.1px über b.ls-b hinaus
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 3V · s01_fehler_falsch@320x568 · 38x42px [×4]
text-verdeckt · p @ .brett · 11Z · 2V · s06_brett_loese1@320x568 · „las“ (Text 38.1,151.4) verdeckt von button.neuhaus.am-knopf [Box 24.4,106…267.9,160] [×4]
bild-winzig · img.wzm-r @ .wzm · 9Z · 1V · s01_moment@844x390 · 18x31px
text-verdeckt · p @ .zug[data-art=buchstaben] · 5Z · 2V · s01_fehler_knopf@320x568 · „auf“ (Text 135.8,436.5) verdeckt von button.rund [Box 138,442…182,486] [×3]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 3V · s17_raetsel@320x568 · 36x46px [×20]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 4Z · 2V · s02_raetsel@320x568 · Seitenverhältnis 1.5 statt 1.6 (6% daneben), Box 9x6, Original 372x232
tippflaeche-klein · div.pk-st @ .zug[data-art=plakat] · 5Z · 2V · s19_raetsel@320x568 · 42.9x38.6px [×6]
tippflaeche-klein · input#dname @ .dipl · 2Z · 4V · finale_2_start@320x568 · 141.6x18.2px
verdeckt · div.bkarte @ .brett · 8Z · 1V · s06_brett_loese1@320x568 · 3/5 Punkte verdeckt (Mitte) von img; Box 92x111.1 @ 14.7,81.9 [×3]
text-verdeckt · span @ .zug[data-art=nest] · 5Z · 3V · s24_raetsel@320x568 · „kelt“ (Text 149.3,448.1) verdeckt von svg [Box 148,452…172,476]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 3Z · 5V · s08_geloest@320x568 · 12.5x19.1px
text-verdeckt · p @ .zug[data-art=nest] · 3Z · 3V · s24_loese1@320x568 · „nau“ (Text 147.8,437.1) verdeckt von button.rund [Box 138,442…182,486]
text-verdeckt · b @ .zug[data-art=nest] · 4Z · 2V · s24_loese3@1280x800 · „Frau“ (Text 83.8,453.3) verdeckt von div.rp @ .zug[data-art=nest] [Box 30,333.6…420.4,506.9] [×5]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 3V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 3V · s17_fehler_falsch@320x568 · 36x46px
text-verdeckt · button.as-so.offen @ .zug[data-art=ausschluss] · 2Z · 4V · s06_geloest@320x568 · „.“ (Text 143,454.9) verdeckt von button.rund [Box 138,442…182,486]
text-verdeckt · span @ .zug[data-art=sortieren] · 3Z · 3V · s07_geloest@320x568 · „Le“ (Text 123.5,120.8) verdeckt von span.s-b [Box 108.5,129.6…154.1,149.6] [×3]
text-verdeckt · p @ .zug[data-art=raupenweg] · 2Z · 4V · s21_geloest@320x568 · „dün“ (Text 101.8,117.8) verdeckt von small [Box 78.4,116.2…251.9,130.6] [×10]
text-verdeckt · p @ .zug[data-art=lexikon] · 3Z · 2V · s23_loese1@320x568 · „vier“ (Text 126.5,460.3) verdeckt von button.rund [Box 138,442…182,486]
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_0@320x568 · 14.8x13.8px [×4]
schrift-klein · p.dh @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.9px: „hat“
schrift-klein · p.dl @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.3px: „Al“
schrift-klein · span.dpt @ .dipl · 2Z · 2V · finale_2_start@320x568 · 8.9px: „Schim“
text-verdeckt · p.as-bleibt @ .zug[data-art=ausschluss] · 4Z · 2V · s06_loese4@320x568 · „bleibt“ (Text 120.3,468.1) verdeckt von button.rund [Box 138,442…182,486]
text-verdeckt · p @ .zug[data-art=klebstoff] · 3Z · 3V · s08_fehler_daneben@320x568 · „noch“ (Text 146.1,437.1) verdeckt von button.rund [Box 138,442…182,486] [×3]
text-verdeckt · span @ .zug[data-art=klebstoff] · 1Z · 4V · s08_geloest@320x568 · „Tau“ (Text 123.5,120.8) verdeckt von span.s-b [Box 108.5,129.6…154.1,149.6] [×6]
text-verdeckt · span @ .zug[data-art=suchbild] · 1Z · 4V · s09_geloest@320x568 · „Tau“ (Text 123.5,120.8) verdeckt von span.s-r [Box 133.4,129.6…147.8,149.6] [×5]
text-verdeckt · p @ .zug[data-art=kreise] · 3Z · 3V · s16_fehler_erinnern@320x568 · „geht“ (Text 144.9,436.5) verdeckt von button.rund [Box 138,442…182,486] [×3]
text-verdeckt · p @ .zug[data-art=agentencode] · 2Z · 2V · s17_fehler_falsch@320x568 · „Wort“ (Text 144.3,436.8) verdeckt von button.rund [Box 138,442…182,486] [×2]
text-verdeckt · button.as-so @ .zug[data-art=plakat] · 1Z · 4V · s19_loese1@320x568 · „will“ (Text 135.3,447.4) verdeckt von svg [Box 148,452…172,476] [×3]
text-verdeckt · p @ .zug[data-art=plakat] · 2Z · 3V · s19_geloest@320x568 · „ist“ (Text 151.7,436.3) verdeckt von button.rund [Box 138,442…182,486] [×3]
text-verdeckt · p @ .zug[data-art=astgabel] · 2Z · 3V · s20_loese3@320x568 · „beln“ (Text 138.3,436.8) verdeckt von button.rund [Box 138,442…182,486]
text-verdeckt · b.nt-klick @ .zug[data-art=nest] · 1Z · 4V · s24_geloest@320x568 · „Klick!“ (Text 189,156) verdeckt von div.nt-zoom @ .zug[data-art=nest] [Box 56,118.9…264,254.9]
text-verdeckt · li @ .zug.fall · 3Z · 2V · kap3_fallkarte@320x568 · „woll“ (Text 124.2,448.2) verdeckt von button.rund [Box 138,442…182,486] [×4]
text-verdeckt · i @ .zug[data-art=astgabel] · 4Z · 1V · s20_loese2@844x390 · „A“ (Text 76.3,284.8) verdeckt von p @ .zug[data-art=astgabel] [Box 86,269.2…278.7,316.3] [×2]
tippflaeche-klein · button.nt-schluessel @ .zug[data-art=nest] · 2Z · 2V · s24_raetsel@320x568 · 37.8x47.8px
verdeckt · button.opt @ .zug.tipp · 2Z · 2V · s01_tippfrage@320x568 · 1/5 Punkte verdeckt (Mitte) von path; Box 291.8x58.3 @ 14.1,441.6
verdeckt · button.ub-k @ .zug[data-art=unterschiede] · 4Z · 1V · s02_raetsel@320x568 · 1/5 Punkte verdeckt (Mitte) von button.rund; Box 84x83.6 @ 118,468.6
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 3Z · 1V · s06_loese2@390x844 · „Os“ (Text 172.7,714.5) verdeckt von button.rund [Box 173,718…217,762] [×2]
text-verdeckt · span.bt-t @ .zug.fall · 3Z · 1V · kap1_fallkarte_stempel@1280x800 · „ben“ (Text 609,663) verdeckt von svg [Box 625,655…655,685] [×2]
tippflaeche-klein · button.pg-fleck @ .zug[data-art=passtgenau] · 1Z · 3V · s15_raetsel@320x568 · 27.2x27.2px [×2]
tippflaeche-klein · button.pg-loch @ .zug[data-art=passtgenau] · 1Z · 3V · s15_raetsel@320x568 · 27.9x27.9px
tippflaeche-klein · button.pg-loch.zu @ .zug[data-art=passtgenau] · 1Z · 3V · s15_geloest@320x568 · 27.9x27.9px
tippflaeche-klein · div.pk-platz.voll @ .zug[data-art=plakat] · 3Z · 1V · s19_fehler_voll@844x390 · 23.3x20.8px [×6]
verdeckt · button.as-k @ .zug[data-art=ausschluss] · 3Z · 1V · s06_raetsel@320x568 · 1/5 Punkte verdeckt (Mitte) von path; Box 84x125 @ 118,439.5
verdeckt · div.pk-st @ .zug[data-art=plakat] · 2Z · 3V · s19_raetsel@320x568 · 3/5 Punkte verdeckt (Mitte) von button.rund; Box 42.3x37.9 @ 138.8,469.5
verdeckt · button.as-so @ .zug[data-art=plakat] · 1Z · 3V · s19_loese1@320x568 · 1/5 Punkte verdeckt (Mitte) von svg; Box 267.8x80.8 @ 26.1,429.4
bild-winzig · img @ .zug[data-art=sortieren] · 2Z · 1V · s07_raetsel@844x390 · 145x17px [×6]
schrift-klein · p.dt @ .dipl · 2Z · 1V · finale_2_start@844x390 · 5.2px: „Meis“
schrift-klein · p.df @ .dipl · 2Z · 1V · finale_2_start@844x390 · 4.3px: „Der“
schrift-klein · b @ .dipl · 2Z · 1V · finale_2_start@844x390 · 4.1px: „49“
text-verdeckt · span @ .zug.tipp · 2Z · 1V · s01_tippfrage@320x568 · „stück“ (Text 140.5,459.6) verdeckt von svg [Box 148,452…172,476]
text-verdeckt · p @ .zug[data-art=wort] · 1Z · 2V · s03_geloest@320x568 · „den“ (Text 144.9,436.6) verdeckt von button.rund [Box 138,442…182,486] [×2]
text-verdeckt · span @ .zug[data-art=merkmale] · 1Z · 2V · s04_geloest@320x568 · „Zeit“ (Text 123.5,120.8) verdeckt von span.s-r [Box 135,129.6…154.8,149.6] [×4]
text-verdeckt · span @ .zug[data-art=reihe] · 1Z · 2V · s05_geloest@320x568 · „Zeit“ (Text 123.5,120.8) verdeckt von span.s-r [Box 135,129.6…154.8,149.6] [×4]
text-verdeckt · span @ .zug[data-art=spiegel] · 1Z · 2V · s10_geloest@320x568 · „Le“ (Text 123.5,120.8) verdeckt von span.s-b [Box 106.3,129.6…133.4,149.6] [×3]
text-verdeckt · p @ .zug[data-art=lupe] · 2Z · 1V · s13_geloest@320x568 · „nen“ (Text 149.4,436.9) verdeckt von button.rund [Box 138,442…182,486] [×3]
text-verdeckt · span @ .zug[data-art=schatten] · 1Z · 2V · s14_geloest@320x568 · „Zeit“ (Text 123.5,120.8) verdeckt von span.s-r [Box 133.7,129.6…153.6,149.6] [×4]
text-verdeckt · span.basis @ .zug[data-art=kreise] · 1Z · 2V · s16_loese2@320x568 · „MILAS MOND“ (Text 113,449.9) verdeckt von svg [Box 148,452…172,476]
text-verdeckt · button.ag-t @ .zug[data-art=agentencode] · 1Z · 2V · s17_geloest@320x568 · „T“ (Text 54,118.6) verdeckt von img [Box 32.4,114…70.4,152] [×3]
text-verdeckt · button.ag-t.weg @ .zug[data-art=agentencode] · 1Z · 2V · s17_geloest@320x568 · „B“ (Text 93.2,118.6) verdeckt von span.s-b [Box 78.4,129.6…102.8,149.6] [×3]
text-verdeckt · p.ww-wunsch @ .zug[data-art=waage] · 1Z · 2V · s18_raetsel@320x568 · „Nichts“ (Text 121.6,467.8) verdeckt von button.rund [Box 138,442…182,486]
text-verdeckt · p @ .zug[data-art=waage] · 1Z · 2V · s18_geloest@320x568 · „von“ (Text 135.7,437.3) verdeckt von button.rund [Box 138,442…182,486] [×2]
text-verdeckt · span.flk-t @ .zug.fall[data-art=flunker] · 1Z · 2V · kap4_fallkarte@320x568 · „mei“ (Text 140.8,451) verdeckt von path [Box 153,461…167,468] [×2]
text-verdeckt · span @ .zug[data-art=ausschluss] · 2Z · 1V · s06_geloest@390x844 · „Le“ (Text 126.6,130.8) verdeckt von button.neuhaus.am-knopf [Box 81.4,116…324.8,170] [×3]
text-verdeckt · p @ .zug[data-art=ausschluss] · 2Z · 2V · s12_fehler_falsch@390x844 · „ein“ (Text 193.2,736.9) verdeckt von svg [Box 183,728…207,752]
text-verdeckt · span @ .zug[data-art=lupe] · 2Z · 1V · s13_geloest@390x844 · „Tau“ (Text 126.6,130.8) verdeckt von span.s-b [Box 135.4,139.6…164.9,159.6] [×5]
text-verdeckt · p.zt1 @ .zug[data-art=nest] · 1Z · 2V · s24_geloest@390x844 · „die“ (Text 76.2,123.8) verdeckt von img [Box 89.4,124…127.4,162] [×15]
text-verdeckt · em @ .zug[data-art=ausschluss] · 1Z · 2V · s12_geloest@1280x800 · „dacht“ (Text 597.9,682.9) verdeckt von button.rund [Box 612.5,642.5…667.5,697.5]
text-verdeckt · i.vor @ .zug[data-art=wort] · 2Z · 1V · s03_loese2@844x390 · „K“ (Text 32.3,285.1) verdeckt von img @ .zug[data-art=wort] [Box 24,262.1…78,316.1] [×3]
text-verdeckt · i @ .zug[data-art=wort] · 2Z · 1V · s03_loese2@844x390 · „L“ (Text 77.8,285.1) verdeckt von p @ .zug[data-art=wort] [Box 86,269…278.7,316.1] [×2]
tippflaeche-klein · div.pk-st.neu @ .zug[data-art=plakat] · 1Z · 2V · s19_fehler_voll@320x568 · 42.7x37.3px
tippflaeche-klein · button.nt-schluessel.aufrecht @ .zug[data-art=nest] · 1Z · 2V · s24_loese3@320x568 · 34x46.4px
tippflaeche-klein · div.pk-platz @ .zug[data-art=plakat] · 2Z · 1V · s19_raetsel@844x390 · 23.3x20.8px [×6]
… 56 weitere in audit.json

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 30Z · 5V · s03_brett_fertig@320x568 · Breite 11.4px zu viel, line-clamp 3: „cken“ in p
brett-rollt · section.brett · 55Z · 3V · s01_brett_neu@320x568 · vertikal +61px (scrollHeight 455, clientHeight 394)
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.8px zu viel, line-clamp 3: „Mi“ in p [×3]
rollt · div.fundov @ .brett · 22Z · 2V · s01_brett_neu@320x568 · vertikal +16px (scrollHeight 410, clientHeight 394)
rollt-doppelt · div.fundov @ .brett · 22Z · 2V · s01_brett_neu@320x568 · rollt innerhalb eines ebenfalls rollenden Elements (+16px)
zug-rollt · section.zug[data-art=ausschluss] · 15Z · 5V · s06_moment@320x568 · vertikal +246px (scrollHeight 644, clientHeight 398)
zug-rollt · section.zug[data-art=astgabel] · 8Z · 5V · s20_moment@320x568 · vertikal +264px (scrollHeight 662, clientHeight 398)
zug-rollt · section.zug[data-art=nest] · 6Z · 4V · s24_moment@320x568 · vertikal +320px (scrollHeight 718, clientHeight 398)
rollt · section.haken · 23Z · 1V · s01_haken@844x390 · vertikal +170px (scrollHeight 390, clientHeight 220)
zug-rollt · section.zug[data-art=plakat] · 6Z · 5V · s19_moment@320x568 · vertikal +101px (scrollHeight 499, clientHeight 398)
… 33 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
8 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s03_fehler (wort), s04_fehler (merkmale), s11_fehler (laubspur), s15_fehler (passtgenau)
1 Zustände/5V · Weiter wurde nach 6 loese()-Aufrufen nicht aktiv · z. B. s11_geloest (laubspur)
1 Zustände/5V · Stempeln misslungen: page.click: Timeout 2500ms exceeded. · z. B. kap4_fallkarte_stempel
1 Zustände/5V · Finale abgebrochen: page.click: Timeout 2500ms exceeded. · z. B. finale_*
