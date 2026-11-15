# UI-Audit „vorher“ · 2026-11-15 10:38 · 10:23 min
Build: Ordner /tmp/claude-0/-home-user-lese-fall/fd757463-8baa-5c47-acda-d337fcfd592d/scratchpad/dist-vorher · Viewports: 320x568 360x620 360x640 360x800 390x844 412x915 430x932 480x854 600x960 768x1024 820x1180 1024x768 1280x800 844x390 1024x600 · fs=20 · dpr=1
Zustände×Viewport: 5158 · mit Problemen: 4088 · NOT TESTED: 30 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
kopf-ueberlappt 4·3855 | text-abgeschnitten 5·2068 | schrift-klein 12·1881 | text-verdeckt 7·1761 | zug-rollt(i) 21·1102 | text-gekuerzt(i) 4·1052 | tippflaeche-klein 10·407 | brett-rollt(i) 2·388 | ragt-raus 22·306 | text-ragt-raus 4·217 | blatt-rollt(i) 1·66 | unerreichbar 4·58 | bild-winzig 1·45 | bild-verzerrt 4·37 | ueber-rollt(i) 1·10

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
kopf-ueberlappt · span#kT2(Text) x img#kWegR · 236Z · 15V · s02_geloest@320x568 · span#kT2(Text) ↔ img#kWegR: 25.3x13px
text-abgeschnitten · span#kT2 @ .kopf · 312Z · 8V · s01_lesen_1@320x568 · Breite 16.8px zu viel, ellipsis: „Wo“ in span#kT2 [×5]
text-verdeckt · span#kT2 @ .kopf · 215Z · 15V · s02_geloest@320x568 · „Ka“ (Text 105.7,49.4) verdeckt von img#kWegR @ .kopf [Box 97,49.6…131,83.6] [×2]
schrift-klein · span#kT2 @ .kopf · 312Z · 6V · s01_lesen_1@320x568 · 11.5px: „Ka“
kopf-ueberlappt · button#bBrett.kb.brettb x img#kWegR · 106Z · 15V · s01_lesen_1@320x568 · button#bBrett.kb.brettb ↔ img#kWegR: 27x14px
kopf-ueberlappt · span#kMond.mondp x img#kWegR · 109Z · 10V · s04_geloest@360x620 · span#kMond.mondp ↔ img#kWegR: 25.4x8px
kopf-ueberlappt · button#bAa.kb.aa x img#kWegR · 19Z · 15V · s06_geloest@320x568 · button#bAa.kb.aa ↔ img#kWegR: 27x7.7px
tippflaeche-klein · button[data-s] @ .zug[data-art=unterschiede] · 11Z · 15V · s02_raetsel@320x568 · 110x36px [×2]
schrift-klein · em.neu @ .brett · 8Z · 15V · s01_brett_fertig@320x568 · 10px: „neu“
ragt-raus · span.plus @ .brett · 26Z · 4V · s01_brett_fertig@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett · 26Z · 4V · s01_brett_fertig@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett [×3]
text-ragt-raus · span @ .brett · 26Z · 4V · s01_brett_fertig@320x568 · „mer-“ 2.6px über #app hinaus [×3]
ragt-raus · span.plus @ .brett.fragt · 22Z · 4V · s06_brett_frage@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett.fragt · 22Z · 4V · s06_brett_frage@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett.fragt [×3]
text-ragt-raus · span @ .brett.fragt · 22Z · 4V · s06_brett_frage@320x568 · „mer-“ 2.6px über #app hinaus [×3]
schrift-klein · span @ .zug[data-art=reihe] · 4Z · 15V · s22_raetsel@320x568 · 11.5px: „Os“ [×6]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 15V · s01_fehler_falsch@320x568 · 38x42px [×4]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 3Z · 15V · s21_raetsel@320x568 · 15x19px [×8]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 15V · s17_raetsel@320x568 · 36x46px [×20]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 13V · s23_loese1@360x620 · „Am“ (Text 264.4,488.1) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 256.6,426.4…311.4,506.2] [×2]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 15V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 15V · s17_fehler_falsch@320x568 · 36x46px
ragt-raus · button.bsk @ .zug[data-art=buchstaben] · 7Z · 4V · s01_raetsel@320x568 · seitlich: rechts 43.5px über #app (x 28…363.5, App 0…320)
unerreichbar · button.bsk @ .zug[data-art=buchstaben] · 7Z · 4V · s01_raetsel@320x568 · rechts 43.5px beschnitten von section.zug[data-art=buchstaben]; Box 335.5x64 @ 28,584.1
tippflaeche-klein · input#dname @ .dipl · 3Z · 9V · finale_3@320x568 · 130.7x19.1px
ragt-raus · p.wzm-t @ .wzm · 24Z · 1V · s01_moment@844x390 · unten 24.3px abgeschnitten von main#buehne
text-verdeckt · p @ .brett · 6Z · 12V · s11_brett_fertig@320x568 · „I“ (Text 120.9,159.8) verdeckt von span.s-r @ .brett [Box 124.4,159.9…140.3,175.2]
text-verdeckt · p @ .brett.fragt · 6Z · 8V · s11_brett_frage@320x568 · „I“ (Text 120.9,337.8) verdeckt von span.s-r @ .brett.fragt [Box 124.4,337.9…140.3,353.2]
unerreichbar · button.bkarte.fundk @ .fundov · 22Z · 1V · s01_brett_neu@844x390 · außerhalb des Scrollbereichs von section.brett (-34…235.1 von 599); Box 258.9x269.1 @ 297,41
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 6V · s21_raetsel@360x620 · Seitenverhältnis 1.6 statt 1.5 (6% daneben), Box 16x10, Original 332x220
text-ragt-raus · span @ .zug[data-art=reihe] · 4Z · 5V · s05_raetsel@320x568 · „men“ 18.6px über span hinaus [×3]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 3Z · 15V · s08_geloest@320x568 · 15.1x23.1px
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 15V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (21% daneben), Box 109x41, Original 412x188 [×2]
schrift-klein · span @ .zug[data-art=sortieren] · 1Z · 15V · s07_geloest@320x568 · 11px: „Fuchs-“ [×6]
schrift-klein · span @ .zug[data-art=unterschiede] · 1Z · 15V · s21_geloest@320x568 · 11px: „Pa“ [×7]
schrift-klein · p.dh @ .dipl · 3Z · 5V · finale_3@320x568 · 9.1px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 5V · finale_3@320x568 · 8.5px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 5V · finale_3@320x568 · 9.1px: „Schim“
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 15V · finale_1@320x568 · 16.6x15.3px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 15V · finale_1_falsch@320x568 · 16.6x15.3px [×4]
text-abgeschnitten · span @ #fuss · 11Z · 1V · s01_lesen_6@320x568 · Breite 2.5px zu viel: „sel“ in button.kn.haupt.zugk
text-verdeckt · p.wischz @ .brett · 2Z · 6V · s02_brett_neu@320x568 · „den“ (Text 194.7,142.4) verdeckt von div.bgrid @ .brett [Box 16,147.6…304,403.6] [×3]
text-verdeckt · span @ .brett · 2Z · 6V · s02_brett_neu@320x568 · „Leucht-“ (Text 48.4,145) verdeckt von div.bkarte @ .brett [Box 14.5,146.5…106.8,271.7] [×2]
ragt-raus · p @ .kapk · 4Z · 2V · kap1_karte@320x568 · unten 2px abgeschnitten von main#buehne
text-abgeschnitten · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · Breite 22.5px zu viel: „nicht“ in section.zug[data-art=buchstaben]
text-ragt-raus · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · „nicht“ 22.5px über #app hinaus
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 7V · s16_loese1@320x568 · unten 8px beschnitten von div.kr-bild; Box 44x44 @ 95.2,254.5 [×2]
ragt-raus · img.hr @ .haken · 5Z · 2V · s14_haken@320x568 · oben 48.8px abgeschnitten von main#buehne
ragt-raus · p @ .haken · 5Z · 2V · s14_haken@320x568 · unten 49.2px abgeschnitten von main#buehne
ragt-raus · p.tu @ .titel · 2Z · 4V · titel_weiter@320x568 · unten 12.5px abgeschnitten von main#buehne
ragt-raus · img @ .intro · 4Z · 2V · intro_5@320x568 · oben 20.8px abgeschnitten von main#buehne
ragt-raus · p @ .intro · 4Z · 2V · intro_5@320x568 · unten 4.8px abgeschnitten von main#buehne
ragt-raus · span.tab.hell @ .kapk · 4Z · 1V · kap1_karte@844x390 · oben 85px abgeschnitten von main#buehne
ragt-raus · img.vig @ .kapk · 4Z · 1V · kap1_karte@844x390 · unten 18.1px abgeschnitten von main#buehne
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 4V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
bild-verzerrt · img @ .zug[data-art=nest] · 3Z · 1V · s24_raetsel@844x390 · Seitenverhältnis 1.6 statt 1.5 (5% daneben), Box 82x52, Original 1536x1024
ragt-raus · p.tl @ .titel · 2Z · 2V · titel_weiter@320x568 · oben 2.5px abgeschnitten von main#buehne
ragt-raus · span.s-b @ .kapk · 3Z · 1V · kap2_karte@844x390 · oben 44px abgeschnitten von main#buehne [×4]
schrift-klein · p.dt @ .dipl · 3Z · 1V · finale_3@844x390 · 5.4px: „Meis“
schrift-klein · p.df @ .dipl · 3Z · 1V · finale_3@844x390 · 4.2px: „Der“
schrift-klein · b @ .dipl · 3Z · 1V · finale_3@844x390 · 4.1px: „49“
tippflaeche-klein · div.pk-st @ .zug[data-art=plakat] · 3Z · 1V · s18_raetsel@844x390 · 41.9x37.7px [×6]
ragt-raus · span.s-b @ .titel · 2Z · 1V · titel@844x390 · oben 50.7px abgeschnitten von main#buehne [×4]
ragt-raus · span.s-r @ .titel · 2Z · 1V · titel@844x390 · oben 50.7px abgeschnitten von main#buehne [×2]
ragt-raus · img @ .titel · 2Z · 1V · titel@844x390 · unten 39.3px abgeschnitten von main#buehne
ragt-raus · span.s-r @ .kapk · 2Z · 1V · kap2_karte@844x390 · oben 44px abgeschnitten von main#buehne [×2]
ragt-raus · img.hr @ .haken.aufl · 2Z · 1V · s02_tippaufl@844x390 · oben 16.2px abgeschnitten von main#buehne
ragt-raus · p @ .haken.aufl · 2Z · 1V · s02_tippaufl@844x390 · unten 16.2px abgeschnitten von main#buehne
bild-verzerrt · img @ .haken.mitbild · 1Z · 1V · kap3_ausblick@844x390 · Seitenverhältnis 3.9 statt 1.5 (158% daneben), Box 445x115, Original 1536x1024
ragt-raus · h1 @ .kapk · 1Z · 1V · kap1_karte@844x390 · oben 42px abgeschnitten von main#buehne
ragt-raus · img.rw-bild @ .fin.raupe-wort · 1Z · 1V · finale_4@844x390 · oben 19.3px abgeschnitten von main#buehne
text-verdeckt · p @ #ueber .brett.ueberl · 1Z · 1V · ueber_brett_k1@480x854 · „e“ (Text 286,601.5) verdeckt von span.s-b @ #ueber .brett.ueberl [Box 259.2,600.6…298.4,616.9]
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@844x390 · höher (258.3px) als der Scrollbereich section.zug[data-art=sortieren] (241px); Box 247x258.3 @ 170,-56 [×2]

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 15V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
text-gekuerzt · p @ .fundov · 22Z · 15V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 15V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
brett-rollt · section.brett · 48Z · 6V · s01_brett_neu@320x568 · vertikal +104px (scrollHeight 519, clientHeight 415)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 13V · s06_moment@320x568 · vertikal +223px (scrollHeight 629, clientHeight 406)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 13V · s02_moment@320x568 · vertikal +146px (scrollHeight 552, clientHeight 406)
brett-rollt · section.brett.fragt · 22Z · 9V · s06_brett_frage@320x568 · vertikal +260px (scrollHeight 650, clientHeight 390)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 13V · s19_moment@320x568 · vertikal +300px (scrollHeight 706, clientHeight 406)
zug-rollt · section.zug[data-art=plakat] · 6Z · 15V · s18_moment@320x568 · vertikal +206px (scrollHeight 612, clientHeight 406)
blatt-rollt · div.blatt[data-art=lesen] · 36Z · 5V · s20_lesen_3@360x620 · vertikal +7px (scrollHeight 466, clientHeight 459)
… 19 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/15V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
