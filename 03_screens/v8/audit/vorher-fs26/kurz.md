# UI-Audit „vorher-fs26“ · 2026-11-15 10:42 · 4:03 min
Build: Ordner /tmp/claude-0/-home-user-lese-fall/fd757463-8baa-5c47-acda-d337fcfd592d/scratchpad/dist-vorher · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=26 · dpr=1
Zustände×Viewport: 1951 · mit Problemen: 1620 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
kopf-ueberlappt 4·1399 | text-abgeschnitten 6·1140 | schrift-klein 9·1097 | text-verdeckt 6·629 | ragt-raus 16·614 | zug-rollt(i) 21·398 | text-gekuerzt(i) 4·352 | unerreichbar 5·347 | text-ragt-raus 7·259 | brett-rollt(i) 2·160 | tippflaeche-klein 10·152 | bild-winzig 1·15 | bild-verzerrt 2·14 | ueber-rollt(i) 1·4 | blatt-rollt(i) 1·1

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
schrift-klein · span#kT2 @ .kopf · 406Z · 3V · s01_lesen_1@320x568 · 11.5px: „Ka“
text-abgeschnitten · span#kT2 @ .kopf · 406Z · 3V · s01_lesen_1@320x568 · Breite 16.8px zu viel, ellipsis: „Wo“ in span#kT2 [×5]
kopf-ueberlappt · span#kT2(Text) x img#kWegR · 230Z · 5V · s02_geloest@320x568 · span#kT2(Text) ↔ img#kWegR: 25.3x13px
text-verdeckt · span#kT2 @ .kopf · 214Z · 5V · s02_geloest@320x568 · „Ka“ (Text 105.7,49.4) verdeckt von img#kWegR @ .kopf [Box 97,49.6…131,83.6] [×2]
kopf-ueberlappt · button#bBrett.kb.brettb x img#kWegR · 132Z · 5V · s01_lesen_1@320x568 · button#bBrett.kb.brettb ↔ img#kWegR: 27x14px
kopf-ueberlappt · span#kMond.mondp x img#kWegR · 118Z · 3V · s04_geloest@360x640 · span#kMond.mondp ↔ img#kWegR: 25.4x8px
ragt-raus · header.kopf · 156Z · 1V · s01_lesen_2@320x568 · seitlich: links 62px über #app (x -62…258, App 0…320)
ragt-raus · main#buehne · 156Z · 1V · s01_lesen_2@320x568 · seitlich: links 62px über #app (x -62…258, App 0…320)
ragt-raus · footer#fuss · 156Z · 1V · s01_lesen_2@320x568 · seitlich: links 62px über #app (x -62…258, App 0…320)
unerreichbar · button#bBrett.kb.brettb @ .kopf · 156Z · 1V · s01_lesen_2@320x568 · links 50px beschnitten von div#app[data-m]; Box 81.7x42 @ -50,9
unerreichbar · button.rund @ #fuss · 156Z · 1V · s01_lesen_2@320x568 · links 48px beschnitten von div#app[data-m]; Box 54x54 @ -48,502 [×2]
kopf-ueberlappt · button#bAa.kb.aa x img#kWegR · 19Z · 5V · s06_geloest@320x568 · button#bAa.kb.aa ↔ img#kWegR: 27x7.7px
text-ragt-raus · p @ .blatt[data-art=lesen] · 73Z · 1V · s01_lesen_3@320x568 · „Mi“ 42px über #app hinaus [×11]
text-ragt-raus · span @ .kopf · 58Z · 1V · s01_lesen_2@320x568 · „Brett“ 14px über #app hinaus
tippflaeche-klein · button[data-s] @ .zug[data-art=unterschiede] · 11Z · 5V · s02_raetsel@320x568 · 110x36px [×2]
ragt-raus · span.plus @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett [×3]
text-ragt-raus · span @ .brett · 26Z · 2V · s01_brett_fertig@320x568 · „mer-“ 2.6px über #app hinaus [×3]
ragt-raus · span.plus @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · seitlich: rechts 52.8px über #app (x 205…372.8, App 0…320)
text-abgeschnitten · span @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · Breite 2.6px zu viel: „mer-“ in section.brett.fragt [×3]
text-ragt-raus · span @ .brett.fragt · 22Z · 2V · s06_brett_frage@320x568 · „mer-“ 2.6px über #app hinaus [×3]
schrift-klein · em.neu @ .brett · 8Z · 5V · s01_brett_fertig@320x568 · 10px: „neu“
text-abgeschnitten · span @ #fuss · 29Z · 2V · s01_lesen_11@320x568 · Breite 3.5px zu viel: „Rät“ in button.kn.haupt.zugk [×2]
ragt-raus · button.rund.gold @ #fuss · 24Z · 1V · s01_lesen_1@320x568 · seitlich: rechts 62px über #app (x 328…382, App 0…320)
schrift-klein · span @ .zug[data-art=reihe] · 4Z · 5V · s22_raetsel@320x568 · 11.5px: „Os“ [×6]
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 5V · s01_fehler_falsch@320x568 · 38x42px [×4]
tippflaeche-klein · button.kn.haupt.zugk @ #fuss · 18Z · 1V · s01_lesen_11@320x568 · 32x62px
unerreichbar · button.rund.gold @ #fuss · 18Z · 1V · s01_lesen_1@320x568 · rechts 62px beschnitten von div#app[data-m]; Box 54x54 @ 328,502 [×2]
text-ragt-raus · p @ .blatt.kurz[data-art=lesen] · 17Z · 1V · s01_lesen_2@320x568 · „In“ 42px über #app hinaus [×5]
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 3Z · 5V · s21_raetsel@320x568 · 15x19px [×8]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 5V · s17_raetsel@320x568 · 36x46px [×20]
ragt-raus · button.bsk @ .zug[data-art=buchstaben] · 7Z · 2V · s01_raetsel@320x568 · seitlich: rechts 43.5px über #app (x 28…363.5, App 0…320)
unerreichbar · button.bsk @ .zug[data-art=buchstaben] · 7Z · 2V · s01_raetsel@320x568 · rechts 43.5px beschnitten von section.zug[data-art=buchstaben]; Box 335.5x64 @ 28,584.1
text-verdeckt · p @ .brett · 4Z · 5V · s11_brett_fertig@320x568 · „I“ (Text 120.9,159.8) verdeckt von span.s-r @ .brett [Box 124.4,159.9…140.3,175.2]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 4Z · 4V · s23_loese1@360x640 · „Am“ (Text 264.4,488.1) verdeckt von svg.kreuz @ .zug[data-art=ausschluss] [Box 256.6,426.4…311.4,506.2] [×2]
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 5V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 5V · s17_fehler_falsch@320x568 · 36x46px
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 3V · s21_raetsel@360x640 · Seitenverhältnis 0.8 statt 0.8 (5% daneben), Box 18x22, Original 200x256 [×3]
tippflaeche-klein · input#dname @ .dipl · 3Z · 3V · finale_3@320x568 · 130.7x19.1px
text-ragt-raus · span @ .zug[data-art=reihe] · 4Z · 2V · s05_raetsel@320x568 · „men“ 18.6px über span hinaus [×3]
text-abgeschnitten · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · Breite 22.5px zu viel: „nicht“ in section.zug[data-art=buchstaben]
text-ragt-raus · span @ .zug[data-art=buchstaben] · 7Z · 1V · s01_raetsel@320x568 · „nicht“ 22.5px über #app hinaus
text-verdeckt · p @ .brett.fragt · 3Z · 3V · s11_brett_frage@320x568 · „I“ (Text 120.9,337.8) verdeckt von span.s-r @ .brett.fragt [Box 124.4,337.9…140.3,353.2]
schrift-klein · p.dh @ .dipl · 3Z · 2V · finale_3@320x568 · 9.1px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 2V · finale_3@320x568 · 8.5px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 2V · finale_3@320x568 · 9.1px: „Schim“
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (21% daneben), Box 109x41, Original 412x188 [×2]
schrift-klein · span @ .zug[data-art=sortieren] · 1Z · 5V · s07_geloest@320x568 · 11px: „Fuchs-“ [×6]
schrift-klein · span @ .zug[data-art=unterschiede] · 1Z · 5V · s21_geloest@320x568 · 11px: „Pa“ [×7]
text-verdeckt · span @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „Leucht-“ (Text 48.4,145) verdeckt von div.bkarte @ .brett [Box 14.5,146.5…106.8,271.7] [×2]
text-verdeckt · p.wischz @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „den“ (Text 194.7,142.4) verdeckt von div.bgrid @ .brett [Box 16,147.6…304,403.6] [×3]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · 15.1x23.1px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.6x15.3px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.6x15.3px [×4]
ragt-raus · p @ .kapk · 3Z · 1V · kap1_karte@320x568 · unten 2px abgeschnitten von main#buehne
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8px beschnitten von div.kr-bild; Box 44x44 @ 95.2,254.5 [×2]
ragt-raus · div.pkt @ #fuss · 2Z · 1V · s09_lesen_1@320x568 · seitlich: rechts 20px über #app (x 78…340, App 0…320)
schrift-klein · b.stempel.abdruck @ .zug[data-art=astgabel] · 1Z · 2V · s19_geloest@320x568 · 11px: „HIER HÄNGT ER“
ragt-raus · p.tl @ .titel · 1Z · 1V · titel_weiter@320x568 · oben 2.5px abgeschnitten von main#buehne
ragt-raus · p.tu @ .titel · 1Z · 1V · titel_weiter@320x568 · unten 12.5px abgeschnitten von main#buehne
ragt-raus · img @ .intro · 1Z · 1V · intro_5@320x568 · oben 20.8px abgeschnitten von main#buehne
ragt-raus · p @ .intro · 1Z · 1V · intro_5@320x568 · unten 4.8px abgeschnitten von main#buehne
ragt-raus · img.hr @ .haken · 1Z · 1V · s14_haken@320x568 · oben 48.8px abgeschnitten von main#buehne
ragt-raus · p @ .haken · 1Z · 1V · s14_haken@320x568 · unten 49.2px abgeschnitten von main#buehne
ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · seitlich: rechts 14.5px über #app (x 96…334.5, App 0…320)
text-abgeschnitten · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · Breite 13.6px zu viel: „se-“ in div.blatt[data-art=lesen] [×3]

## Info (Rollen/Kürzen, kein Fehler)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×10]
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 4.9px zu viel, line-clamp 5: „blau“ in p [×4]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 15.3px zu viel, line-clamp 3: „Fa“ in p [×54]
brett-rollt · section.brett · 48Z · 3V · s01_brett_neu@320x568 · vertikal +104px (scrollHeight 519, clientHeight 415)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 4V · s06_moment@320x568 · vertikal +223px (scrollHeight 629, clientHeight 406)
brett-rollt · section.brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · vertikal +260px (scrollHeight 650, clientHeight 390)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 4V · s02_moment@320x568 · vertikal +146px (scrollHeight 552, clientHeight 406)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 4V · s19_moment@320x568 · vertikal +300px (scrollHeight 706, clientHeight 406)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +276px (scrollHeight 682, clientHeight 406)
zug-rollt · section.zug[data-art=plakat] · 6Z · 5V · s18_moment@320x568 · vertikal +206px (scrollHeight 612, clientHeight 406)
… 19 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
