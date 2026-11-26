# UI-Audit „review-2611-fs26“ · 2026-11-26 12:21 · 1:14 min
Build: http://localhost:4173 · Viewports: 360x640 390x844 · fs=26 · dpr=1
Zustände×Viewport: 896 · mit Problemen: 198 · NOT TESTED: 22 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
text-verdeckt 67·244 | zug-rollt(i) 24·191 | text-gekuerzt(i) 3·80 | brett-rollt(i) 1·52 | tippflaeche-klein 12·39 | verdeckt 13·19 | bild-verzerrt 1·8 | bild-winzig 1·8 | text-abgeschnitten 1·7 | schrift-klein 4·7 | blatt-rollt(i) 1·5 | text-ragt-raus 1·4 | unerreichbar 1·2 | rollt(i) 2·2 | rollt-doppelt(i) 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-verdeckt · span @ .brett · 29Z · 2V · s03_brett_fertig@360x640 · „Schim“ (Text 65.1,151) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160] [×4]
text-verdeckt · span.tab.hell @ .brett · 28Z · 2V · s03_brett_fertig@360x640 · „Er“ (Text 63.8,117) verdeckt von img [Box 64.7,114…102.7,152] [×4]
text-verdeckt · p.fund-t @ .fundov · 16Z · 1V · s04_brett_neu@360x640 · „Neu“ (Text 107.3,144.9) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160] [×4]
text-verdeckt · p @ .zug[data-art=buchstaben] · 5Z · 2V · s01_fehler_knopf@360x640 · „,“ (Text 182.9,508.4) verdeckt von button.rund [Box 158,514…202,558] [×3]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 8Z · 2V · s06_raetsel@360x640 · „Tom“ (Text 163.9,535.5) verdeckt von svg [Box 168,524…192,548]
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 4Z · 2V · s02_raetsel@360x640 · Seitenverhältnis 0.9 statt 0.9 (4% daneben), Box 8x9, Original 200x234 [×2]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 4Z · 2V · s02_raetsel@360x640 · 13x17px [×4]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 2V · s01_fehler_falsch@360x640 · 38x42px [×4]
text-abgeschnitten · b.ls-b @ .zug[data-art=laubspur] · 7Z · 1V · s11_raetsel@360x640 · Höhe 10.8px zu viel: „B“ in div.ls-feld.neu.staubig
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 2V · s17_raetsel@360x640 · 36x46px [×20]
text-verdeckt · p @ .zug[data-art=lexikon] · 3Z · 2V · s23_loese1@360x640 · „Punk“ (Text 162.8,532.3) verdeckt von svg [Box 168,524…192,548]
text-verdeckt · p @ .zug[data-art=nest] · 3Z · 2V · s24_loese1@360x640 · „sel“ (Text 181.8,508.6) verdeckt von button.rund [Box 158,514…202,558] [×3]
text-ragt-raus · b.ls-b @ .zug[data-art=laubspur] · 3Z · 2V · s11_loese6@360x640 · „K“ 2px über b.ls-b hinaus
text-verdeckt · span @ .zug[data-art=unterschiede] · 4Z · 1V · s02_raetsel@360x640 · „nes“ (Text 164.9,526.8) verdeckt von path [Box 173,533…187,540]
text-verdeckt · p @ .zug[data-art=agentencode] · 2Z · 2V · s17_fehler_falsch@360x640 · „weg“ (Text 172.6,508.7) verdeckt von button.rund [Box 158,514…202,558]
text-verdeckt · p @ .brett · 2Z · 2V · s18_brett_fertig@360x640 · „I“ (Text 250,388.7) verdeckt von span.s-r @ .brett [Box 253.5,388.2…276.4,403.7]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 2V · s01_loese1@360x640 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 2V · s17_fehler_falsch@360x640 · 36x46px
tippflaeche-klein · input#dname @ .dipl · 2Z · 2V · finale_2_start@360x640 · 179.4x24.1px
verdeckt · button.ub-k @ .zug[data-art=unterschiede] · 4Z · 1V · s02_raetsel@360x640 · 1/5 Punkte verdeckt (Mitte) von button.rund; Box 96.1x69.8 @ 131.9,480.8
text-verdeckt · span @ .zug[data-art=sortieren] · 2Z · 2V · s07_raetsel@360x640 · „pier“ (Text 154.3,534.4) verdeckt von svg [Box 168,524…192,548] [×2]
text-verdeckt · p @ .zug[data-art=klebstoff] · 2Z · 2V · s08_fehler_daneben@360x640 · „noch“ (Text 147.9,509.2) verdeckt von button.rund [Box 158,514…202,558]
text-verdeckt · p @ .zug[data-art=kreise] · 2Z · 2V · s16_fehler_erinnern@360x640 · „geht“ (Text 146.6,509.2) verdeckt von button.rund [Box 158,514…202,558] [×2]
text-verdeckt · p @ .zug[data-art=astgabel] · 2Z · 2V · s20_loese3@360x640 · „ga“ (Text 156.7,508.5) verdeckt von button.rund [Box 158,514…202,558]
schrift-klein · p.dh @ .dipl · 2Z · 1V · finale_2_start@360x640 · 11.3px: „hat“
schrift-klein · p.dl @ .dipl · 2Z · 1V · finale_2_start@360x640 · 10.5px: „Al“
schrift-klein · span.dpt @ .dipl · 2Z · 1V · finale_2_start@360x640 · 11.3px: „Schim“
text-verdeckt · p @ .zug[data-art=wort] · 1Z · 2V · s03_geloest@360x640 · „Da“ (Text 164.9,508.3) verdeckt von button.rund [Box 158,514…202,558] [×3]
text-verdeckt · span @ .zug[data-art=merkmale] · 1Z · 2V · s04_geloest@360x640 · „Zeit“ (Text 125.3,120.8) verdeckt von span.s-b [Box 138.5,129.6…167.2,149.6] [×4]
text-verdeckt · span @ .zug[data-art=reihe] · 1Z · 2V · s05_geloest@360x640 · „Zeit“ (Text 125.3,120.8) verdeckt von span.s-b [Box 138.5,129.6…167.2,149.6] [×4]
text-verdeckt · span @ .zug[data-art=klebstoff] · 1Z · 2V · s08_geloest@360x640 · „Tau“ (Text 125.3,120.8) verdeckt von span.s-b [Box 137.3,115.2…151.2,130.2] [×5]
text-verdeckt · span @ .zug[data-art=suchbild] · 1Z · 2V · s09_geloest@360x640 · „Tau“ (Text 125.3,120.8) verdeckt von span.s-b [Box 137.3,115.2…151.2,130.2] [×5]
text-verdeckt · button.sp-o @ .zug[data-art=spiegel] · 2Z · 1V · s10_raetsel@360x640 · „REST FÜR MAUS“ (Text 86.8,539.6) verdeckt von button.rund [Box 158,514…202,558]
text-verdeckt · span @ .zug[data-art=spiegel] · 1Z · 2V · s10_geloest@360x640 · „Le“ (Text 125.3,120.8) verdeckt von span.s-b [Box 110.7,129.6…135,149.6] [×3]
text-verdeckt · button.as-so.offen @ .zug[data-art=ausschluss] · 1Z · 2V · s12_geloest@360x640 · „las“ (Text 157.8,523.9) verdeckt von svg [Box 168,524…192,548]
text-verdeckt · p.zt1 @ .zug[data-art=lupe] · 2Z · 1V · s13_geloest@360x640 · „mit“ (Text 70,95.8) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160] [×8]
text-verdeckt · p @ .zug[data-art=lupe] · 2Z · 1V · s13_geloest@360x640 · „nen“ (Text 151.2,508.5) verdeckt von button.rund [Box 158,514…202,558] [×2]
text-verdeckt · span @ .zug[data-art=schatten] · 1Z · 2V · s14_geloest@360x640 · „Zeit“ (Text 125.3,120.8) verdeckt von span.s-b [Box 110.7,129.6…140.3,149.6] [×4]
text-verdeckt · span.basis @ .zug[data-art=kreise] · 1Z · 2V · s16_loese2@360x640 · „MILAS MOND“ (Text 133,521.5) verdeckt von svg [Box 168,524…192,548]
text-verdeckt · p @ .zug[data-art=waage] · 1Z · 2V · s18_geloest@360x640 · „drei“ (Text 160.9,508.6) verdeckt von button.rund [Box 158,514…202,558] [×2]
text-verdeckt · p @ .zug[data-art=plakat] · 1Z · 2V · s19_geloest@360x640 · „Mi“ (Text 160.5,508.7) verdeckt von button.rund [Box 158,514…202,558] [×4]
text-verdeckt · b.nt-klick @ .zug[data-art=nest] · 1Z · 2V · s24_geloest@360x640 · „Klick!“ (Text 209,274.6) verdeckt von div.nt-zoom @ .zug[data-art=nest] [Box 76,237.5…284,373.5]
text-verdeckt · span @ .zug[data-art=ausschluss] · 2Z · 1V · s06_geloest@390x844 · „Le“ (Text 126.6,130.8) verdeckt von button.neuhaus.am-knopf [Box 81.4,116…324.8,170] [×3]
text-verdeckt · span @ .zug[data-art=lupe] · 2Z · 1V · s13_geloest@390x844 · „Tau“ (Text 126.6,130.8) verdeckt von span.s-b [Box 135.4,139.6…164.9,159.6] [×5]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 2V · s08_geloest@360x640 · 14.8x22.6px
tippflaeche-klein · button.pg-fleck @ .zug[data-art=passtgenau] · 1Z · 2V · s15_raetsel@360x640 · 27.2x27.2px [×2]
tippflaeche-klein · button.pg-loch @ .zug[data-art=passtgenau] · 1Z · 2V · s15_raetsel@360x640 · 27.9x27.9px
tippflaeche-klein · button.pg-loch.zu @ .zug[data-art=passtgenau] · 1Z · 2V · s15_geloest@360x640 · 27.9x27.9px
tippflaeche-klein · button.nt-schluessel @ .zug[data-art=nest] · 2Z · 1V · s24_raetsel@360x640 · 37.8x47.8px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 2V · finale_0@360x640 · 14.8x13.8px [×4]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 2V · s16_loese1@360x640 · unten 5.9px beschnitten von div.kr-bild; Box 44x44 @ 108.5,323.8 [×2]
verdeckt · button.sp-o @ .zug[data-art=spiegel] · 2Z · 1V · s10_raetsel@360x640 · 1/5 Punkte verdeckt (Mitte) von svg; Box 304.3x55 @ 27.8,524.6
verdeckt · div.pk-st @ .zug[data-art=plakat] · 2Z · 2V · s19_raetsel@360x640 · 3/5 Punkte verdeckt (Mitte) von button.rund; Box 51.2x45.9 @ 154.4,496.8 [×2]
verdeckt · button.as-so @ .zug[data-art=plakat] · 1Z · 2V · s19_loese1@360x640 · 1/5 Punkte verdeckt (Mitte) von svg; Box 304.3x80.8 @ 27.8,485
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 1V · s20_geloest@360x640 · 11.5px: „HIER SITZT DAS NEST“
text-verdeckt · span.tab.hell @ .zug[data-art=merkmale] · 1Z · 1V · s04_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · span.tab.hell @ .zug[data-art=reihe] · 1Z · 1V · s05_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · p.zt1 @ .zug[data-art=ausschluss] · 1Z · 1V · s06_geloest@360x640 · „weis“ (Text 45,115.9) verdeckt von img [Box 64.7,114…102.7,152] [×13]
text-verdeckt · span.tab.hell @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · span.tab.hell @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · span.tab.hell @ .zug[data-art=suchbild] · 1Z · 1V · s09_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · span.tab.hell @ .zug[data-art=spiegel] · 1Z · 1V · s10_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · span.basis @ .zug[data-art=ausschluss] · 1Z · 1V · s12_loese3@360x640 · „DIE LÖSUNG: KÄSE“ (Text 112.8,533) verdeckt von path [Box 173,533…187,540]
text-verdeckt · span.tab.hell @ .zug[data-art=schatten] · 1Z · 1V · s14_geloest@360x640 · „sel“ (Text 49,121.5) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160]
text-verdeckt · p @ .zug[data-art=passtgenau] · 1Z · 1V · s15_geloest@360x640 · „ten“ (Text 161.8,509.1) verdeckt von button.rund [Box 158,514…202,558] [×3]
text-verdeckt · p.as-raus @ .zug[data-art=kreise] · 1Z · 1V · s16_loese1@360x640 · „Kreis“ (Text 174.2,509.5) verdeckt von button.rund [Box 158,514…202,558] [×3]
text-verdeckt · p.zt1 @ .zug[data-art=kreise] · 1Z · 1V · s16_geloest@360x640 · „che“ (Text 56,102.8) verdeckt von img [Box 64.7,114…102.7,152] [×8]
text-verdeckt · span.ag-pfeil @ .zug[data-art=agentencode] · 1Z · 1V · s17_geloest@360x640 · „→“ (Text 99.5,127.5) verdeckt von span.s-b [Box 110.7,129.6…135,149.6]
text-verdeckt · i.ag-t.ok @ .zug[data-art=agentencode] · 1Z · 1V · s17_geloest@360x640 · „M“ (Text 135.6,129.5) verdeckt von span.s-b [Box 138.5,129.6…158.3,149.6] [×4]
text-verdeckt · button.as-so @ .zug[data-art=plakat] · 1Z · 1V · s19_loese1@360x640 · „un“ (Text 172.1,503) verdeckt von button.rund [Box 158,514…202,558]
text-verdeckt · button.as-so.ja @ .zug[data-art=plakat] · 1Z · 1V · s19_geloest@360x640 · „Hin“ (Text 46.8,114) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160] [×17]
text-verdeckt · i @ .zug[data-art=astgabel] · 1Z · 1V · s20_geloest@360x640 · „A“ (Text 104.1,120.2) verdeckt von span.s-b [Box 110.7,129.6…137.2,149.6] [×3]
text-verdeckt · p.zt1 @ .zug[data-art=raupenweg] · 1Z · 1V · s21_geloest@360x640 · „auf“ (Text 64.6,112.9) verdeckt von img [Box 64.7,114…102.7,152] [×7]
text-verdeckt · p @ .zug[data-art=raupenweg] · 1Z · 1V · s21_geloest@360x640 · „was“ (Text 153.4,508.8) verdeckt von button.rund [Box 158,514…202,558] [×4]
text-verdeckt · h3.lx-t @ .zug[data-art=lexikon] · 1Z · 1V · s23_raetsel@360x640 · „gel“ (Text 161.6,497.5) verdeckt von button.rund [Box 158,502…202,546]
text-verdeckt · span @ .zug[data-art=nest] · 1Z · 1V · s24_geloest@360x640 · „ßen“ (Text 256.4,88.2) verdeckt von button.neuhaus.am-knopf [Box 56.7,106…300.2,160] [×10]
text-verdeckt · span.flk-t @ .zug.fall[data-art=flunker] · 1Z · 1V · kap4_fallkarte@360x640 · „in“ (Text 154.1,524.8) verdeckt von button.rund [Box 158,514…202,558] [×2]
text-verdeckt · p @ .zug.fin[data-art=tresorcode] · 1Z · 1V · finale_0@360x640 · „.“ (Text 167.3,509.2) verdeckt von button.rund [Box 158,514…202,558] [×4]
text-verdeckt · button.kl-g.ja @ .zug[data-art=klebstoff] · 1Z · 1V · s08_geloest@390x844 · „wür“ (Text 181.4,721.1) verdeckt von svg [Box 183,728…207,752]
text-verdeckt · p @ .zug[data-art=suchbild] · 1Z · 1V · s09_geloest@390x844 · „nicht“ (Text 177.9,720.4) verdeckt von svg [Box 183,728…207,752] [×2]
text-verdeckt · p @ .zug[data-art=spiegel] · 1Z · 1V · s10_geloest@390x844 · „Maus“ (Text 159.4,714.5) verdeckt von button.rund [Box 173,718…217,762] [×3]
text-verdeckt · p @ .zug[data-art=ausschluss] · 1Z · 1V · s12_fehler_falsch@390x844 · „ein“ (Text 193.2,736.9) verdeckt von svg [Box 183,728…207,752]
… 19 weitere in audit.json

## Info (Rollen/Kürzen, kein Fehler)
brett-rollt · section.brett · 52Z · 1V · s02_brett_neu@360x640 · vertikal +108px (scrollHeight 574, clientHeight 466)
text-gekuerzt · p @ .fundov · 22Z · 2V · s01_brett_neu@360x640 · Höhe 5.8px zu viel, line-clamp 3: „Mi“ in p [×3]
text-gekuerzt · p @ .brett · 19Z · 2V · s04_brett_fertig@360x640 · Höhe 1.9px zu viel, line-clamp 3: „Kreis“ in p
zug-rollt · section.zug[data-art=ausschluss] · 15Z · 2V · s06_moment@360x640 · vertikal +174px (scrollHeight 644, clientHeight 470)
zug-rollt · section.zug[data-art=astgabel] · 8Z · 2V · s20_moment@360x640 · vertikal +192px (scrollHeight 662, clientHeight 470)
zug-rollt · section.zug[data-art=buchstaben] · 8Z · 2V · s01_moment@360x640 · vertikal +137px (scrollHeight 607, clientHeight 470)
zug-rollt · section.zug[data-art=plakat] · 6Z · 2V · s19_moment@360x640 · vertikal +72px (scrollHeight 542, clientHeight 470)
zug-rollt · section.zug[data-art=nest] · 6Z · 2V · s24_moment@360x640 · vertikal +175px (scrollHeight 645, clientHeight 470)
zug-rollt · section.zug[data-art=wort] · 5Z · 2V · s03_moment@360x640 · vertikal +114px (scrollHeight 584, clientHeight 470)
zug-rollt · section.zug[data-art=kreise] · 6Z · 2V · s16_moment@360x640 · vertikal +170px (scrollHeight 640, clientHeight 470)
… 22 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
8 Zustände/2V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s03_fehler (wort), s04_fehler (merkmale), s11_fehler (laubspur), s15_fehler (passtgenau)
1 Zustände/2V · Weiter wurde nach 6 loese()-Aufrufen nicht aktiv · z. B. s11_geloest (laubspur)
1 Zustände/2V · Stempeln misslungen: page.click: Timeout 2500ms exceeded. · z. B. kap4_fallkarte_stempel
1 Zustände/2V · Finale abgebrochen: page.click: Timeout 2500ms exceeded. · z. B. finale_*
