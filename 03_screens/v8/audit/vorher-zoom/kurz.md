# UI-Audit „vorher-zoom“ · 2026-11-15 10:50 · 4:07 min
Build: Ordner /tmp/claude-0/-home-user-lese-fall/fd757463-8baa-5c47-acda-d337fcfd592d/scratchpad/dist-vorher · Viewports: 320x568 360x640 412x915 768x1024 1024x768 · fs=20 · zoom=1.3 (nativ per text-size-adjust) · dpr=1
Zustände×Viewport: 1961 · mit Problemen: 1692 · NOT TESTED: 10 · Konsolenfehler: 0

## Summen je Typ (einzigartige Probleme · Zustand×Viewport-Treffer)
kopf-ueberlappt 6·1696 | text-abgeschnitten 13·1345 | text-ragt-raus 9·779 | text-verdeckt 9·769 | ragt-raus 25·767 | zug-rollt(i) 21·507 | unerreichbar 6·384 | text-gekuerzt(i) 4·359 | brett-rollt(i) 2·222 | tippflaeche-klein 9·95 | verdeckt 1·16 | bild-winzig 1·15 | bild-verzerrt 3·15 | schrift-klein 3·9 | ueber-rollt(i) 1·4

## Probleme (Typ · Element · #Zustände · #Viewports · Beispiel · Werte), nach Zahl der betroffenen Zustände
text-abgeschnitten · span#kT2 @ .kopf · 411Z · 4V · s01_lesen_1@320x568 · Breite 5.9px zu viel, ellipsis: „tel“ in span#kT2 [×7]
kopf-ueberlappt · span#kT2(Text) x img#kWegR · 234Z · 5V · s02_geloest@320x568 · span#kT2(Text) ↔ img#kWegR: 15.2x13.8px
text-verdeckt · span#kT2 @ .kopf · 324Z · 5V · s01_lesen_1@320x568 · „tel“ (Text 147.7,61.8) verdeckt von span.s-r @ .kopf [Box 134.7,61.8…157.5,79.8]
text-ragt-raus · b#kT1 @ .kopf · 411Z · 1V · s01_lesen_1@320x568 · „Spur 1“ 12px über b#kT1 hinaus
kopf-ueberlappt · b#kT1(Text) x span#kMond.mondp · 409Z · 1V · s01_lesen_1@320x568 · b#kT1(Text) ↔ span#kMond.mondp: 4x30px
kopf-ueberlappt · button#bBrett.kb.brettb x img#kWegR · 97Z · 4V · s01_lesen_1@360x640 · button#bBrett.kb.brettb ↔ img#kWegR: 27x13px
ragt-raus · header.kopf · 170Z · 1V · s01_lesen_2@320x568 · seitlich: links 84px über #app (x -84…236, App 0…320)
ragt-raus · main#buehne · 170Z · 1V · s01_lesen_2@320x568 · seitlich: links 84px über #app (x -84…236, App 0…320)
ragt-raus · footer#fuss · 170Z · 1V · s01_lesen_2@320x568 · seitlich: links 84px über #app (x -84…236, App 0…320)
unerreichbar · button#bBrett.kb.brettb @ .kopf · 170Z · 1V · s01_lesen_2@320x568 · links 72px beschnitten von div#app[data-m]; Box 91.8x42 @ -72,23.5
unerreichbar · button.rund @ #fuss · 170Z · 1V · s01_lesen_2@320x568 · links 70px beschnitten von div#app[data-m]; Box 54x54 @ -70,502 [×2]
kopf-ueberlappt · span#kPerl.perl(Text) x img#kWegR · 59Z · 3V · s05_geloest@360x640 · span#kPerl.perl(Text) ↔ img#kWegR: 17.2x4px
text-ragt-raus · p @ .blatt[data-art=lesen] · 87Z · 1V · s01_lesen_3@320x568 · „Mi“ 64px über #app hinaus [×16]
kopf-ueberlappt · span#kMond.mondp x img#kWegR · 69Z · 3V · s04_geloest@360x640 · span#kMond.mondp ↔ img#kWegR: 22.4x7px
ragt-raus · span.plus @ .brett · 26Z · 3V · s01_brett_fertig@320x568 · seitlich: rechts 132.6px über #app (x 246.4…452.6, App 0…320)
text-abgeschnitten · span @ .brett · 26Z · 3V · s01_brett_fertig@320x568 · Breite 31.6px zu viel: „Schim“ in section.brett [×4]
text-ragt-raus · span @ .kopf · 78Z · 1V · s01_lesen_2@320x568 · „Brett“ 36px über #app hinaus
text-ragt-raus · span @ .brett · 26Z · 3V · s01_brett_fertig@320x568 · „Schim“ 31.6px über #app hinaus [×4]
ragt-raus · span.plus @ .brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · seitlich: rechts 132.6px über #app (x 246.4…452.6, App 0…320)
text-abgeschnitten · span @ .brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · Breite 31.6px zu viel: „Schim“ in section.brett.fragt [×4]
text-ragt-raus · span @ .brett.fragt · 22Z · 3V · s06_brett_frage@320x568 · „Schim“ 31.6px über #app hinaus [×4]
kopf-ueberlappt · button#bAa.kb.aa x img#kWegR · 19Z · 3V · s06_geloest@412x915 · button#bAa.kb.aa ↔ img#kWegR: 27x13px
text-abgeschnitten · span @ #fuss · 37Z · 2V · s01_lesen_12@320x568 · Breite 4px zu viel: „Rät“ in button.kn.haupt.zugk [×2]
ragt-raus · button.rund.gold @ #fuss · 25Z · 1V · s01_lesen_1@320x568 · seitlich: rechts 84px über #app (x 350…404, App 0…320)
text-ragt-raus · p @ .blatt.kurz[data-art=lesen] · 22Z · 1V · s01_lesen_2@320x568 · „Heu“ 64px über #app hinaus [×6]
ragt-raus · button.bsk @ .zug[data-art=buchstaben] · 7Z · 3V · s01_raetsel@320x568 · seitlich: rechts 116.9px über #app (x 28…436.9, App 0…320)
text-abgeschnitten · span @ .zug[data-art=buchstaben] · 7Z · 3V · s01_raetsel@320x568 · Breite 35.1px zu viel: „sen“ in section.zug[data-art=buchstaben] [×2]
text-ragt-raus · span @ .zug[data-art=buchstaben] · 7Z · 3V · s01_raetsel@320x568 · „sen“ 35.1px über #app hinaus [×2]
unerreichbar · button.bsk @ .zug[data-art=buchstaben] · 7Z · 3V · s01_raetsel@320x568 · rechts 116.9px beschnitten von section.zug[data-art=buchstaben]; Box 408.9x64 @ 28,758.4
tippflaeche-klein · span.bk @ .zug[data-art=buchstaben] · 4Z · 5V · s01_fehler_falsch@320x568 · 38x42px [×4]
tippflaeche-klein · button.kn.haupt.zugk @ #fuss · 19Z · 1V · s01_lesen_12@320x568 · 32x62px
unerreichbar · button.rund.gold @ #fuss · 19Z · 1V · s01_lesen_1@320x568 · rechts 84px beschnitten von div#app[data-m]; Box 54x54 @ 350,502 [×2]
verdeckt · div.zettel.fr @ .brett · 16Z · 1V · s01_brett_fertig@320x568 · 3/5 Punkte verdeckt von div.fragen @ .brett; Box 142.2x116.2 @ 14.9,487.4
bild-winzig · img.ding @ .zug[data-art=unterschiede] · 3Z · 5V · s21_raetsel@320x568 · 15x19px [×8]
text-abgeschnitten · p.dt @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 2px zu viel: „Meis“ in div.dipl-in [×2]
text-abgeschnitten · p.dl @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 10.7px zu viel: „Al“ in div.dipl-in [×16]
text-abgeschnitten · b @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 47.4px zu viel: „49“ in div.dipl-in
text-abgeschnitten · span.dpt @ .dipl · 3Z · 5V · finale_3@320x568 · Höhe 44.4px zu viel: „Schim“ in div.dipl-in [×4]
tippflaeche-klein · button.ag-t @ .zug[data-art=agentencode] · 3Z · 5V · s17_raetsel@320x568 · 36x46px [×20]
text-ragt-raus · span @ .zug[data-art=reihe] · 6Z · 4V · s05_raetsel@320x568 · „lett“ 9.3px über span hinaus [×8]
ragt-raus · img.hr @ .haken · 9Z · 2V · s08_haken@320x568 · oben 41.2px abgeschnitten von main#buehne
ragt-raus · p @ .haken · 9Z · 2V · s08_haken@320x568 · unten 41.2px abgeschnitten von main#buehne
tippflaeche-klein · span.bk.ok @ .zug[data-art=buchstaben] · 2Z · 5V · s01_loese1@320x568 · 38x42px [×4]
tippflaeche-klein · button.ag-t.weg @ .zug[data-art=agentencode] · 2Z · 5V · s17_fehler_falsch@320x568 · 36x46px
bild-verzerrt · img.ding @ .zug[data-art=unterschiede] · 3Z · 3V · s21_raetsel@360x640 · Seitenverhältnis 0.8 statt 0.8 (5% daneben), Box 18x22, Original 200x256 [×3]
text-verdeckt · span.as-n @ .zug[data-art=ausschluss] · 5Z · 4V · s23_fehler_falsch@320x568 · „se“ (Text 97.8,186.9) verdeckt von span.s-b @ .zug[data-art=ausschluss] [Box 105.8,187…155.2,211] [×2]
ragt-raus · p @ .kapk · 4Z · 2V · kap1_karte@320x568 · unten 53.5px abgeschnitten von main#buehne
text-verdeckt · span @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „Leucht-“ (Text 65.2,163.4) verdeckt von div.bkarte @ .brett [Box 14.3,166.9…107,306.4]
text-verdeckt · p.wischz @ .brett · 2Z · 3V · s02_brett_neu@320x568 · „Wisch“ (Text 190.5,160) verdeckt von div.bkarte.leer @ .brett [Box 214.7,168…304,305.4] [×2]
tippflaeche-klein · input#dname @ .dipl · 3Z · 2V · finale_3@320x568 · 130.7x24.1px
bild-verzerrt · img.kl-tab @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · Seitenverhältnis 2.7 statt 2.2 (21% daneben), Box 109x41, Original 412x188 [×2]
ragt-raus · p @ .intro · 4Z · 2V · intro_2@320x568 · unten 53.6px abgeschnitten von main#buehne
ragt-raus · span.tab.hell @ .kapk · 4Z · 2V · kap1_karte@320x568 · oben 41.5px abgeschnitten von main#buehne
text-verdeckt · p @ .brett · 4Z · 2V · s03_brett_fertig@320x568 · „ße“ (Text 275.8,267.9) verdeckt von span.s-r @ .brett [Box 248.5,267.4…291.7,288.2]
tippflaeche-klein · b.kl-zone @ .zug[data-art=klebstoff] · 1Z · 5V · s08_geloest@320x568 · 15.1x23.1px
tippflaeche-klein · button.fin-f @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1@320x568 · 16.6x15.3px [×4]
tippflaeche-klein · button.fin-f.voll @ .zug.fin[data-art=tresorcode] · 1Z · 5V · finale_1_falsch@320x568 · 16.6x20px [×4]
ragt-raus · img @ .intro · 3Z · 2V · intro_2@320x568 · oben 69.6px abgeschnitten von main#buehne
text-verdeckt · span @ .zug[data-art=reihe] · 3Z · 2V · s05_fehler_voll@320x568 · „men“ (Text 155.8,265.6) verdeckt von div.rh-karte @ .zug[data-art=reihe] [Box 167,197.1…221,312.6]
text-verdeckt · p @ .brett.fragt · 3Z · 2V · s06_brett_frage@320x568 · „ße“ (Text 275.8,267.9) verdeckt von span.s-r @ .brett.fragt [Box 248.5,267.4…291.7,288.2]
text-verdeckt · span @ .zug[data-art=unterschiede] · 1Z · 4V · s21_geloest@360x640 · „ben“ (Text 239.8,254.4) verdeckt von span.s-b @ .zug[data-art=unterschiede] [Box 248.4,254.4…272.2,271.4]
ragt-raus · p.tu @ .titel · 2Z · 2V · titel@320x568 · unten 6.4px abgeschnitten von main#buehne
ragt-raus · div.pkt @ #fuss · 3Z · 1V · s01_lesen_1@320x568 · seitlich: rechts 20px über #app (x 78…340, App 0…320)
ragt-raus · span.s-b @ .zug[data-art=reihe] · 3Z · 1V · s05_raetsel@320x568 · seitlich: rechts 2.4px über #app (x 292.7…322.4, App 0…320)
schrift-klein · p.dh @ .dipl · 3Z · 1V · finale_3@320x568 · 11.8px: „hat“
schrift-klein · p.dl @ .dipl · 3Z · 1V · finale_3@320x568 · 11px: „Al“
schrift-klein · span.dpt @ .dipl · 3Z · 1V · finale_3@320x568 · 11.8px: „Schim“
text-abgeschnitten · span @ .zug[data-art=reihe] · 3Z · 1V · s05_raetsel@320x568 · Breite 2.4px zu viel: „ben“ in section.zug[data-art=reihe]
unerreichbar · button.kr-x @ .zug[data-art=kreise] · 1Z · 3V · s16_loese1@320x568 · unten 8px beschnitten von div.kr-bild; Box 44x44 @ 95.2,180.5 [×2]
ragt-raus · h1 @ .titel · 2Z · 1V · titel@320x568 · seitlich: links 17.4px über #app (x -17.4…337.4, App 0…320)
ragt-raus · p.tl @ .titel · 1Z · 2V · titel_weiter@320x568 · oben 26.8px abgeschnitten von main#buehne
ragt-raus · span.s-b @ .kapk · 2Z · 1V · kap3_karte@320x568 · oben 22.2px abgeschnitten von main#buehne
ragt-raus · img.hr @ .haken.aufl · 2Z · 1V · s02_tippaufl@320x568 · oben 26.9px abgeschnitten von main#buehne
ragt-raus · p @ .haken.aufl · 2Z · 1V · s02_tippaufl@320x568 · unten 26.9px abgeschnitten von main#buehne
ragt-raus · img.rw-bild @ .fin.raupe-wort · 1Z · 2V · finale_4@320x568 · oben 81.6px abgeschnitten von main#buehne
text-abgeschnitten · h1 @ .titel · 2Z · 1V · titel@320x568 · Breite 17.4px zu viel: „ver“ in main#buehne [×2]
text-ragt-raus · h1 @ .titel · 2Z · 1V · titel@320x568 · „ver“ 17.4px über #app hinaus [×2]
text-verdeckt · p @ #ueber .brett.ueberl · 1Z · 2V · ueber_brett_k1@320x568 · „ße“ (Text 275.8,234.7) verdeckt von span.s-r @ #ueber .brett.ueberl [Box 248.5,234.2…291.7,255]
bild-verzerrt · img @ .haken.mitbild · 1Z · 1V · kap3_ausblick@320x568 · Seitenverhältnis 1.8 statt 1.5 (21% daneben), Box 225x124, Original 1536x1024
ragt-raus · p @ .blatt[data-art=lesen] · 1Z · 1V · s15_lesen_9@320x568 · seitlich: rechts 14.5px über #app (x 96…334.5, App 0…320)
ragt-raus · span @ .zug[data-art=kreise] · 1Z · 1V · s16_loese1@320x568 · seitlich: links 9.4px über #app (x -9.4…329.4, App 0…320)
ragt-raus · p.rw-blase @ .fin.raupe-wort · 1Z · 1V · finale_4@320x568 · unten 14.6px abgeschnitten von main#buehne
… 3 weitere in audit.json

## Info (Rollen/Kürzen, kein Fehler)
brett-rollt · section.brett · 48Z · 3V · s01_brett_neu@320x568 · vertikal +243px (scrollHeight 629, clientHeight 386)
text-gekuerzt · p @ .brett · 26Z · 5V · s01_brett_fertig@320x568 · Höhe 20.6px zu viel, line-clamp 3: „o“ in p [×15]
text-gekuerzt · p @ .fundov · 22Z · 5V · s01_brett_neu@320x568 · Höhe 3.7px zu viel, line-clamp 5: „blau“ in p [×2]
text-gekuerzt · p @ .brett.fragt · 22Z · 5V · s06_brett_frage@320x568 · Höhe 20.6px zu viel, line-clamp 3: „o“ in p [×70]
brett-rollt · section.brett.fragt · 22Z · 4V · s06_brett_frage@320x568 · vertikal +477px (scrollHeight 835, clientHeight 358)
zug-rollt · section.zug[data-art=ausschluss] · 22Z · 5V · s06_moment@320x568 · vertikal +460px (scrollHeight 850, clientHeight 390)
zug-rollt · section.zug[data-art=unterschiede] · 18Z · 5V · s02_moment@320x568 · vertikal +267px (scrollHeight 657, clientHeight 390)
zug-rollt · section.zug[data-art=astgabel] · 9Z · 5V · s19_moment@320x568 · vertikal +435px (scrollHeight 825, clientHeight 390)
zug-rollt · section.zug[data-art=lupe] · 9Z · 5V · s13_moment@320x568 · vertikal +434px (scrollHeight 824, clientHeight 390)
zug-rollt · section.zug.fall · 12Z · 4V · kap1_fallkarte@320x568 · vertikal +94px (scrollHeight 588, clientHeight 494)
… 18 weitere

## NOT TESTED (nicht erreicht, nie als bestanden gezählt)
2 Zustände/5V · kein Fehlzug für diese Art umgesetzt (zu aufwändig) · z. B. s04_fehler (merkmale), s24_fehler (nest)
