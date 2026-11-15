# UI-Audit „vorher-insets“ · 2026-11-15 10:45 · 3:48 min
Build: Ordner /tmp/claude-0/-home-user-lese-fall/fd757463-8baa-5c47-acda-d337fcfd592d/scratchpad/dist-vorher · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=20 · insets=40,48 · dpr=1
Zustände×Viewport: 1824 · mit Problemen: 1512 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
kopf-ueberlappt 4·1305 | text-abgeschnitten 5·1028 | schrift-klein 9·993 | text-verdeckt 6·580 | zug-rollt(i) 21·495 | text-gekuerzt(i) 4·351 | ragt-raus 16·298 | brett-rollt(i) 2·209 | tippflaeche-klein 10·141 | unerreichbar 6·123 | text-ragt-raus 4·111 | safe-area 5·17 | bild-winzig 1·15 | bild-verzerrt 2·14 | ueber-rollt(i) 1·4 | blatt-rollt(i) 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
schrift-klein · span#kT2 @ .kopf · 360Z · 3V · s01_lesen_1@320x568 · 11.5px: „Ka“
text-abgeschnitten · span#kT2 @ .kopf · 360Z · 3V · s01_lesen_1@320x568 · Breite 16.8px zu viel, ellipsis: „Wo“ in span#kT2 [×5]
kopf-ueberlappt · span#kT2(Text) x img#kWegR · 214Z · 5V · s02_geloest@320x568 · span#kT2(Text) ↔ img#kWegR: 25.3x13px
text-verdeckt · span#kT2 @ .kopf · 195Z · 5V · s02_geloest@320x568 · „Ka“ (Text 105.7,89.4) verdeckt von img#kWegR @ .kopf [Box 97,89.6…131,123.6] [×2]
kopf-ueberlappt · button#bBrett.kb.brettb x img#kWegR · 118Z · 5V · s01_lesen_1@320x568 · button#bBrett.kb.brettb ↔ img#kWegR: 27x14px
kopf-ueberlappt · span#kMond.mondp x img#kWegR · 110Z · 3V · s04_geloest@360x640 · span#kMond.mondp ↔ img#kWegR: 25.4x8px
kopf-ueberlappt · button#bAa.kb.aa x img#kWegR · 19Z · 5V · s06_geloest@320x568 · button#bAa.kb.aa ↔ img#kWegR: 27x7.7px
tippflaeche-klein · button[data-s] @ .zug[data-art=unterschiede] · 11Z · 5V · s02_raetsel@320x568 · 110x36px [×2]
ragt-raus · span.plus @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett [×3]
text-ragt-raus · span @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · „mer-“ 2.6px über #app hinaus [×3]
ragt-raus · header.kopf · 49Z · 1V · s01_lesen_2@320x568 · seitlich: links 18px über #app (x -18…302, App 0…320)
ragt-raus · main#buehne · 49Z · 1V · s01_lesen_2@320x568 · seitlich: links 18px über #app (x -18…302, App 0…320)
ragt-raus · footer#fuss · 49Z · 1V · s01_lesen_2@320x568 · seitlich: links 18px über #app (x -18…302, App 0…320)
unerreichbar · button#bBrett.kb.brettb @ .kopf · 49Z · 1V · s01_lesen_2@320x568 · links 6px beschnitten von div#app[data-m]; Box 81.7x42 @ -6,49
unerreichbar · button.rund @ #fuss · 49Z · 1V · s01_lesen_2@320x568 · links 4px beschnitten von div#app[data-m]; Box 54x54 @ -4,454 [×2]
ragt-raus · span.plus @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett.fragt [×3]
text-ragt-raus · span @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · „mer-“ 2.6px über #app hinaus [×3]
schrift-klein · em.neu @ .brett · 8Z · 5V · s01_brett_fertig@320x568 · 10px: „neu“
text-abgeschnitten · span @ #fuss · 22Z · 1V · s01_lesen_9@320x568 · Breite 3.5px zu viel: „Rät“ in button.kn.haupt.zugk [×2]
schrift-klein · span @ .zug[data-art=reihe] · 4Z · 5V · s22_raetsel@320x568 · 11.5px: „Os“ [×6]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 5V · s01_fehler_falsch@320x568 · 38x42px [×4]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 3Z · 5V · s21_raetsel@320x568 · 15x19px [×8]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 5V · s17_raetsel@320x568 · 36x46px [×20]
ragt-raus · button.bsk @ .zug[data-art=buchstaben] · 7Z · 2V · s01_raetsel@320x568 · seitlich: rechts 43.5px über #app (x 28…363.5, App 0…320)
unerreichbar · button.bsk @ .zug[data-art=buchstaben] · 7Z · 2V · s01_raetsel@320x568 · rechts 43.5px beschnitten von section.zug[data-art=buchstaben]; Box 335.5x64 @ 28,624.1
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 5V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 5V · s17_fehler_falsch@320x568 · 36x46px
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 3V · s21_raetsel@360x640 · Seitenverhältnis 0.8 statt 0.8 (5% daneben), Box 18x22, Original 200x256 [×3]
ragt-raus · button.rund.gold @ #fuss · 9Z · 1V · s01_lesen_1@320x568 · seitlich: rechts 18px über #app (x 284…338, App 0…320)
text-verdeckt · p @ .brett · 4Z · 5V · s12_brett_fertig@320x568 · „I“ (Text 120.9,377.8) verdeckt von span.s-r @ .brett [Box 124.4,377.9…140.3,393.2]
tippflaeche-klein · input#dname @ .dipl · 3Z · 3V · finale_3@320x568 · 130.7x19.1px
text-ragt-raus · span @ .zug[data-art=reihe] · 4Z · 2V · s05_raetsel@320x568 · „men“ 18.6px über span hinaus [×3]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 3V · s12_loese1@412x915 · „Scho“ (Text 301.7,723.2) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 294.5,626.4…360.1,738.6] [×2]
ragt-raus · img.hr @ .haken · 6Z · 2V · s08_haken@320x568 · oben 5.1px abgeschnitten von main#buehne
ragt-raus · p @ .haken · 6Z · 2V · s08_haken@320x568 · unten 5.5px abgeschnitten von main#buehne
text-abgeschnitten · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · Breite 22.5px zu viel: „nicht“ in section.zug[data-art=buchstaben]
text-ragt-raus · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · „nicht“ 22.5px über #app hinaus
text-verdeckt · p @ .brett.fragt · 3Z · 3V · s11_brett_frage@320x568 · „I“ (Text 120.9,377.8) verdeckt von span.s-r @ .brett.fragt [Box 124.4,377.9…140.3,393.2]
tippflaeche-klein · button.kn.haupt.zugk @ #fuss · 7Z · 1V · s01_lesen_9@320x568 · 32x62px
unerreichbar · button.rund.gold @ #fuss · 7Z · 1V · s01_lesen_1@320x568 · rechts 18px beschnitten von div#app[data-m]; Box 54x54 @ 284,454 [×2]
ragt-raus · p @ .kapk · 4Z · 2V · kap1_karte@320x568 · unten 46px abgeschnitten von main#buehne
schrift-klein · p.dh @ .dipl · 3Z · 2V · finale_3@320x568 · 9.1px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 2V · finale_3@320x568 · 8.5px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 2V · finale_3@320x568 · 9.1px: „Schim“
text-verdeckt · p.wischz @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „den“ (Text 194.7,182.4) verdeckt von div.bgrid @ .brett [Box 16,187.6…304,443.6] [×3]
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (21% daneben), Box 109x41, Original 412x188 [×2]
schrift-klein · span @ .zug[data-art=sortieren] · 1Z · 5V · s07_geloest@320x568 · 11px: „Fuchs-“ [×6]
schrift-klein · span @ .zug[data-art=unterschiede] · 1Z · 5V · s21_geloest@320x568 · 11px: „Pa“ [×7]
text-verdeckt · span @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „Leucht-“ (Text 48.4,185) verdeckt von div.bkarte @ .brett [Box 14.5,186.5…106.8,311.7] [×2]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · 15.1x23.1px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.6x15.3px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.6x15.3px [×4]
ragt-raus · p.tu @ .titel · 2Z · 2V · titel@320x568 · unten 28.5px abgeschnitten von main#buehne
ragt-raus · p @ .intro · 3Z · 2V · intro_2@320x568 · unten 10.3px abgeschnitten von main#buehne
safe-area · span.tab.hell @ .kapk · 4Z · 1V · kap1_karte@320x568 · Inhalt oben im Sicherheitsrand: 6 (Grenze 40)
safe-area · span.s-b @ .kapk · 4Z · 1V · kap1_karte@320x568 · Inhalt oben im Sicherheitsrand: 11 (Grenze 40) [×2]
safe-area · span.s-r @ .kapk · 4Z · 1V · kap1_karte@320x568 · Inhalt oben im Sicherheitsrand: 11 (Grenze 40)
safe-area · p.tl @ .titel · 2Z · 2V · titel@320x568 · Inhalt oben im Sicherheitsrand: 21.5 (Grenze 40)
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8px beschnitten von div.kr-bild; Box 44x44 @ 95.2,206.5 [×2]
safe-area · span.s-b @ .titel · 1Z · 2V · titel_weiter@320x568 · Inhalt oben im Sicherheitsrand: 17.5 (Grenze 40)
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 2V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
ragt-raus · p.tl @ .titel · 1Z · 1V · titel_weiter@320x568 · oben 6.5px abgeschnitten von main#buehne
ragt-raus · img @ .titel · 1Z · 1V · titel_weiter@320x568 · unten 9.5px abgeschnitten von main#buehne
ragt-raus · img @ .intro · 1Z · 1V · intro_5@320x568 · oben 24.8px abgeschnitten von main#buehne
ragt-raus · img.rw-bild @ .fin.raupe-wort · 1Z · 1V · finale_4@320x568 · oben 14.1px abgeschnitten von main#buehne
unerreichbar · div.so-ziel @ .zug[data-art=sortieren] · 1Z · 1V · s07_geloest@320x568 · höher (401.5px) als der Scrollbereich section.zug[data-art=sortieren] (318px); Box 127x401.5 @ 28,-139.1 [×2]

## Info (Rollen/Kürzen, kein Fehler)
brett-rollt · section.brett · 48Z · 3V · s01_brett_neu@320x568 · vertikal +192px (scrollHeight 519, clientHeight 327)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 5V · s06_moment@320x568 · vertikal +311px (scrollHeight 629, clientHeight 318)
brett-rollt · section.brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · vertikal +348px (scrollHeight 650, clientHeight 302)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 5V · s02_moment@320x568 · vertikal +234px (scrollHeight 552, clientHeight 318)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 5V · s19_moment@320x568 · vertikal +388px (scrollHeight 706, clientHeight 318)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +364px (scrollHeight 682, clientHeight 318)
zug-rollt · section.zug[data-art=plakat] · 6Z · 5V · s18_moment@320x568 · vertikal +294px (scrollHeight 612, clientHeight 318)
… 19 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
