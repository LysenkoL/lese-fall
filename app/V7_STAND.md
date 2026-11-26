# Превью v7: состояние и что дальше

Задача владелицы (ночь 9→10.11.2026): довести превью до вида, который можно показать дочке и другим детям. Заморозка снята, менять можно всё; жёсткие правила — `MASTERPLAN.md`, раздел 4.

## Где что лежит

- Код: `app/src/v7/main.ts`, `app/src/v7/v7.css`, вход `app/v7.html`. Старая версия (`index.html`) не тронута — для сравнения.
- Текст: `01_text/LESE-FALL_BUCH_1_TEXT_v7_KAPITEL{k}.md` (пометки `<!-- Blatt -->`, `<!-- Ermittlung -->`).
- Задания и доска: `04_data/kapitel{k}_v7_zuege.json`. Сборка: `node scripts/build-v7.ts` → `04_data/buch1_v7.json`.
- Новые слова: `node scripts/build-v7.ts --neue-woerter`, потом проверить слоги в конце `04_data/silben_kapitel1.txt`.
- Проверка: `npm run build`, `npx vite preview --port 4173 &`, `node scripts/e2e-v7.mjs [ширина высота имя]` → `03_screens/v7/<имя>/`.
- Картинки персонажей без фона: `python3 scripts/freistellen.py` → `app/src/gen/frei/`.

## Сделано

- [x] Текст v7, Глава 1 (6 сцен) + 20 заданий + доска дела.
- [x] Движок: чтение с отметками, блокнот, 7 видов заданий, путь ошибки «блокнот → текст», доска, крючок, сейф.
- [x] Вступление (3 карточки), заставка главы, многоглавная структура данных.
- [x] Глава 2 (Spur 7–12) и Глава 3 (Spur 13–18): текст, 42 задания, сейфы TELLER и BEWEIS. Автотест проходит 18 сцен.
- [x] Глава 4 (Spur 19–24) + диплом: вся книга играбельна, 24 сцены, 82 задания. Автотест проходит всё на 390×844; главы 1–3 — и на 360×740.
- [x] Артефакт опубликован (вся книга, версия 2).

## Дальше (по порядку)

1. [ ] Проверить: планшет 800×1280 (`node scripts/e2e-v7.mjs 800 1280 tablet`) и крупный шрифт (`node scripts/e2e-v7.mjs 360 740 gross 1 26`). Телефон 390×844 и 360×740 пройдены.
2. [x] Опубликовать превью артефактом.
3. [ ] Сравнение «было → стало» для владелицы: `03_screens/v7/VERGLEICH.md` + пары картинок.
4. [x] Глава 2.
5. [x] Глава 3.
6. [x] Глава 4. Для Spur 19 взят вид сверху с подоконника (`k2_s11_spiel`); птицы на картинках нет — желательны 1–2 новые картинки (птица с белой полоской; Луна на нитке в развилке).
8. [ ] Сделать v7 входом по умолчанию (`index.html`), старую версию — `alt.html`; кнопка «назад» Android.
9. [ ] Полный прогон телефона и `python3 app/scripts/galerie-v7.py` → `03_screens/v7/galerie`, `03_screens/v7/vergleich`.
7. [ ] Вычитка немецкого (самопроверка), обновить `MASTERPLAN.md`, `app/STATUS.md`, итоговый отчёт на русском.

## v8 (после отзыва владелицы на v7)

- Концепция: `02_design/KONZEPT_v8.md`. План сборки Главы 1: `02_design/BAUPLAN_v8_KAPITEL1.md`.
- Код: `app/src/v8/`, вход `app/v8.html`, данные `04_data/kapitel1_v8_raetsel.json` → `node scripts/build-v8.ts` → `04_data/buch1_v8.json`.
- Проверка: `npm run test:v8` (телефон и компьютер, мышью) и `node scripts/e2e-v8-finger.mjs` (настоящие касания: буквы, свайп на доске, сброс с подтверждением, крупный шрифт 320×568).
- Публикация: `npm run build && node scripts/artifact-v8.mjs`, затем Artifact с `app/dist/artifact_v8.html`.
- Собраны Главы 1–4 и финал (сейф, диплом).
- Глава 2 (Spur 7–12, код: буква T на позиции 3 слова NEST): `01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL2.md`, `04_data/kapitel2_v8_raetsel.json`. `build-v8.ts` читает все `kapitelN_v8_raetsel.json` и `..._KAPITELN.md`; новая глава = два новых файла.
- Новые виды: `sortieren` (два ящика), `umdrehen` (как лежала Луна и почему), `suchbild`, `spiegel` (зеркальная надпись), `versteckt` с `muster: "laub"`, `ausschluss` с картинками предметов.
- Картинки, которых ещё нет, подменяет `app/src/v8/bilder.ts` (таблица `ERSATZ`, рисованные SVG в `app/src/v8/ersatz/`). Настоящая картинка: положить `assets/illustrationen/objekte/<имя>.webp` (затем `python3 scripts/freistellen.py`) или `assets/illustrationen/kinder/<имя>.webp`; для `mond_hinten_feucht` в данных Спур 8 поставить `kleber.zeichnen: false`.

- **Nachbesserung Kapitel 2 (12.11.2026):** Spur 8 neu als Art `klebstoff` (a: Mond umdrehen, nassen Kleberfleck mit Tropfnase antippen, Klebeflasche `objekte/kleber` daneben; b: gelbe/weiße Seite oben; c: drei Gründe; „Prüfen“ prüft b+c zusammen; 1. Fehler Hinweis, 2. Fehler zeigt die Raupe). Spur 11 Laub-Buchstabe mit 4 Störflecken, Winkel 45. Die alte Art `umdrehen` bleibt im Code, wird aber nicht mehr benutzt.
- **Kapitel 3 (Spur 13–18, Code: N an Position 0 von NEST):** `01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL3.md`, `04_data/kapitel3_v8_raetsel.json`. Neue Arten in `raetsel.ts`: `lupe` (Faden am Käse), `schatten` (fünf Vögel, 5 gleich breite Spalten im Bild `voegel`, Schatten wird per CSS `brightness(0)` aus dem richtigen Vogel gemacht), `kreise` (Schlüsselmoment 2: Kreise umdrehen, Stern, aufgerollter Faden, Stempel), `agentencode` (Geheimagenten-Code: Buchstaben durchstreichen; Regel `doppelt`, Daten `woerter[{echt, code}]`, Regel/Beispiel `demo`), `plakat` (6 Stücke 3×2 programmatisch geschnitten, danach Schlussfrage „Was wissen wir jetzt sicher?“). `unterschiede` kann jetzt `deko` (Bilder pro Seite) und bildlose Zonen (`h`). Neue Styles: `app/src/v8/k3.css` (v8.css unverändert).
- Tausch gegenüber der Tabelle: „Reihe / Weg des Mondes“ (Spur 17) ersetzt durch den Geheimagenten-Code (Oskars Entschuldigung als Code); Reihe gab es schon in Kapitel 1 und die Fallkarte fasst den Weg zusammen. Für die fünf Kreise bringen Ida, Nele, Tom, Emil eigene Käse (zwei mit Stern hinten, nur Milas Kreis mit aufgerolltem Faden).
- Platzhalter (siehe `ERSATZ` in `bilder.ts`): `objekte/voegel`, `vogelschatten`, `gelbe_kreise_vorne`, `gelbe_kreise_hinten`, `plakat`, `tisch_leer`, dazu `mond_hinten_feucht` (Kleber wird gezeichnet). Fehlen als echte Bilder auch: Mond-Rückseite mit aufgerolltem Faden (`mond_hinten` hat den Faden noch hängend).

- **Nachbesserung Kapitel 3 (12.11.2026):** Spur 15 jetzt mit **sechs** kleinen Unterschieden (braune Flecken als einer, Faden nur noch als kurzes Ende, winziger Riss am Rand, Klebefleck, roter Streifen verschoben, gelbe Krümel), ohne Markierung vor dem Fund; zweiter Schritt: die Funde in drei Felder sortieren (Hat Oskar gemacht: Flecken, Krümel · Hat Ben gemacht: Faden eingerollt, Klebefleck · Liegt nur herum: Streifen, Riss). `unterschiede` kann dafür `zonen` (mehrere Trefferflächen je Unterschied), pro Seite eigene Lage/Drehung/Bild (`vorhin`/`jetzt` als Objekt), `clip` und `sortieren`. Spur 16 (`kreise`) in drei Schritten: a) 6 Merkmal-Karten (3 richtig, 3 Ablenker), b) fünf Kreise, **immer nur einer umgedreht**, das Kind streicht selbst aus (Kreuz-Knopf unter dem Kreis oder langes Drücken), c) Stempel „MILAS MOND“. Sprechblase „Von vorn sieht man das nicht“ verschwindet nach dem ersten Umdrehen. Brettfragen `k3faden` und `k3ganz` gelten nach Spur 16 als geklärt. Text: Kapitel 1 Spur 1 nennt jetzt das kleine Loch für den Faden, Kapitel 3 Spur 15 den kleinen Riss. Ablenker „Gelbe Rückseite“ statt „gelber Rand hinten“ (der Text sagt: Die Rückseite ist weiß). Die Rückseiten: Kreis 1 nur Stern, 2 Faden hängend mit Knoten, 3 Loch und rotes Herz, 4 (richtig) Stern + aufgerollter Faden + Loch, 5 nur Loch. Neue Bildbeschreibung `gelbe_kreise_vorne/_hinten` (3 oben, 2 unten, Platz unter jedem Kreis) in `02_design/bilder_prompts_v8.py`. Reihenfolge der Vögel in `voegel` jetzt wie im Prompt (1 Elster, 2 Bachstelze, 3 Buntspecht, 4 Amsel, 5 Kohlmeise); Spur 14 (Schatten) hat deshalb `richtig: 0`.
- **Kapitel 4 (Spur 19–24, Code: S an Position 2 von NEST) und Finale:** `01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL4.md`, `04_data/kapitel4_v8_raetsel.json` (enthält auch `finale`). Neue Arten in `raetsel.ts`: `astgabel` (Spur 19, Schlüsselmoment 3: drei versteckte Buchstaben A-S-T in Laub/Rinde → Wort AST, dann fünf Astgabeln auf `baum`, Gabel 3 richtig, Stempel), `lupe` erweitert (Spur 20: Ablenker `fehlFunde`, danach Schlussfrage „Was ist jetzt sicher?“), `unterschiede` + `sortieren` (Spur 21: fünf Dinge, wer hat aufgeräumt), `faden` (Spur 22: Spiel ohne Verlieren, Knopf gedrückt halten, wenn die Maus springt; nach zwei Fehlversuchen zieht die Raupe mit), `ausschluss` mit `crop` aus dem Vogelstreifen (Spur 23: schwarz-weiß, langer Schwanz, groß wie eine Taube → Elster), `nest` (Spur 24: Laub wegwischen bis die Astgabel frei ist, dann Nest, Band, Schlüssel antippen). Code-Buchstabe S wird wie bei den anderen Kapiteln auf der Fallkarte frei.
- **Finale** (`app/src/v8/finale.ts`, Ansicht `finale`, Schritte in `stand.fin`): 0 Szene (Bild `nest_finale`), 1 das Kind legt die vier Buchstaben selbst in die Felder (Antippen, Ziehen, zurücknehmen; 1. Fehler Hinweis, 2. Fehler legt die Raupe NEST), 2 Tresor öffnet sich (Tür schwingt auf, goldenes Licht, drinnen `finale_bild`), 3 Urkunde „Meister-Detektiv“ (`diplom`, Name zum Eintippen, Perlen). Neu starten über „Von vorn beginnen“.
- Platzhalter Kapitel 4 (siehe `ERSATZ` in `bilder.ts`): `baum`, `baum_nest` (gezeichnet, Gabel 3 unter dem Fenster), `nest_finale` (vorhandenes `k4_s24`), `objekte/kinder_hinten` (Lupe, Spur 20), `objekte/raum_leer` (Spur 21), `objekte/voegel` (neu gezeichnet), dazu kleine Zeichnungen `u_*` (Faden, Riss, Klebefleck, Zufall). Echte Bilder: Datei nach `assets/illustrationen/` (Szenenbilder `baum`, `baum_nest`, `nest_finale`) oder `.../objekte/` legen; die Platzhalter treten dann zurück.
- Neue Textschlüssel müssen in **beiden** Mengen stehen: `TEXT` in `app/scripts/build-v8.ts` und in `app/src/v8/main.ts`. Dieses Mal neu: `liste, zuViel, nochMehr, falsch, ok, fund, knapp, frueh, hilfe, wortText`. Aria-Beschriftungen nie aus `name` bauen (das ist HTML mit Silben).
- **Nachbesserung Kapitel 4 (12.11.2026):** Spur 19 `astgabel`: erst Erinnerungskarten (`erinnern`: 2 von 4, Ablenker „Ganz oben“, „Beim Vogelhaus“), dann Baum ohne Kreise und Nummern; unsichtbare Gabel-Zonen (`gabeln[].x/y/r` in Prozent der Bildbreite, `nicht` = Satz der Raupe bei falscher Gabel); nach dem 1. Fehler Knopf „Im Text nachsehen“ (zeigt `erinnerung.absatz` unter dem Bild), nach dem 2. Fehler zeigt die Raupe die Gabel; `stempeln(…, pos)` setzt den Stempel auf die Gabel. Baum-Platzhalter `ersatz/baum.svg` und `baum_nest.svg` neu (ruhiger, Bilderbuchstil; Gabel 1 Vogelhaus, 2 Schaukel, 3 dünne V-Zweige, 4 trockene Blätter, 5 Astloch). Spur 21: sieben kleine Unterschiede (Mond, Papier, Schere, Puppen, Faden, Kleber, Bleistift), Sortier-Frage „Wer hat es an seinen Platz gebracht?“, viertes Feld „Liegt noch herum“ (Kleber, Bleistift); Text Kapitel 4 um den Satz zu Kleber und Bleistift ergänzt. Spur 22 `faden` neu: Vorführrunde der Raupe, Maus duckt sich und zittert („Gleich springt sie!“), Faden ziehen per Wischen nach unten am roten Griff oder Knopf; Fenster ca. 3,8 s; nach zwei verpassten Runden zieht die Raupe mit. Spur 24 `nest`: Ringe erst nach dem Antippen, freie Reihenfolge, je Fund ein Satz (`ziele[].ok` + `bedeutung`), Schluss-Sprechblase nach 3,6 s, danach „Weiter“. Urkunde: Maße in `cqw`, Text kürzer, nichts überlappt das Medaillon (Telefon, Rechner, 320×568 geprüft). Neue Textschlüssel (beide Mengen): `nicht, nachsehen, absatz, demo, jetzt, bedeutung`.

## Werkzeuge der Raupe und Politur (13.11.2026)

- **Werkzeuge** (`raetsel.werkzeug` = fuehler | lupe | zeit | lesen): Icons `werkzeugIcon()` in `zeichnen.ts`; Werkzeug-Moment beim Rätselstart, Chip im Rätselkopf, Belohnung (Perlen/Sterne, Perlen fliegen zum Zähler, Mond pulsiert) in `effekte.ts`; Einbindung in `raetsel()`/`fertig` in `main.ts`. Der Moment hat `pointer-events: none`; der erste Tipp irgendwo schließt ihn (Capture-Listener) und wirkt normal weiter, `__v8.loese()` schließt ihn auch. Hilfe der Raupe (Text enthält `ui.hilfe`, erkannt in `sag()` in `raetsel.ts`) lässt den Chip aufleuchten. Effekte je Werkzeug: `.wzfx` und `[data-wz]` in `politur.css`.
- **Intro-Karte** `werkzeuge: true` (2x2-Raster), **Brett** (Raupe neben „Offene Fragen“, Chip „Leucht-Fühler“ beim Staubwischen), **Finale** (`finale.ts`: Urkunde mit `teamZeile`, danach neuer Schritt `fin = 4` mit `finale.raupeSagt` und vier Icons).
- **Politur** (`app/src/v8/politur.css`, zuletzt geladen): Hineingleiten beim Ansichtswechsel (`wechsel()` in `main.ts`), Blattwechsel mit Richtung, Druck-/Fokus-/Disabled-Stile, Kartenneigung (`--n`), Etikett „SPUR N“ als Klebeband-Streifen (17.11.2026, vorher Reißzwecke mit Faden; `ui/komponenten.css`), Himmel mit Sternen und Mond (`himmel()`), Detektiv-Tisch (Holz hinter `.zi`), Sprechblase mit Raupenkopf, freundliches Fehler-Wackeln (`--weich`), Rechner ab 900 px: Buch auf Nachthimmel. Bei „weniger Bewegung“ ist alles still.
- Neue Textschlüssel `raupeSagt` (beide TEXT-Mengen), ui `teamZeile`. Bilder: `node scripts/politur-shots.mjs [b h name]` → `03_screens/v8/politur/`.

## Runden 3–4 nach dem Durchspielen (13.11.2026)

Alle Zusatz-Stile stehen in `app/src/v8/runde3.css` (wird nach `politur.css` geladen, Regeln mit `#app` davor).
- **Kopf:** Mond-Phase `#kMond` (`mondPhase()` in `main.ts`, wächst mit gelösten Spuren), Raupen-Weg `.kweg` (Anteil gelöster Spuren des Kapitels).
- **Brett:** Fragen laufen durch das ganze Buch (`fragenNeu`/`fragenWeg` je Spur, jede Frage wird irgendwo geklärt; schon beantwortete fallen auch bei altem Spielstand weg). Neue Karte erscheint groß („Neuer Fund!“) und wird angetippt; danach wählt das Kind selbst, welche Frage geklärt ist (`fragePhase` in `brett()`; Knopf „Erst die geklärte Frage antippen“). Fragen sind Klebezettel.
- **Werkzeuge:** Bilder `assets/illustrationen/objekte/kraft_*.webp` (statt gezeichneter Icons, `WZ_BILD` in `zeichnen.ts`). Der erste Tipp während des Werkzeug-Moments schließt nur die Einblendung (`effekte.ts`).
- **Rätsel neu/umgebaut:** Schatten (Spur 14) – Vogel antippen, sein Umriss legt sich blau über den Schatten, Knopf „Dieser Schatten passt genau“. Unterschiede (Spur 2, 15, 21) – ein Bild mit Schalter „Vorhin/Jetzt“. Pullis (Spur 6) als Bilder `objekte/pulli_*` (`scripts/pullis.py` stellt frei). Vögel (Spur 23) mit Größe in cm und Maßstab (`cm`, `skala`). Spur 22 mit sechs Karten. Nest (Spur 24) – „Der Schatz der Elster“: Laub wegwischen, dann in `nest_nah` alles antippen, was glänzt (`ziele`, 6), Ablenker ohne Glanz (`andere`: Knopf, Papierdreieck).
- **Geschichte:** Die Elster sammelt, was glänzt, und baut ihr Nest aus weißen Streifen; sie holte den Faden, der Mond hing daran. Bild `k3_elster` beim Ausblick von Kapitel 3 (`ausblickBild`), `k4_s19_elster` in Spur 19, `k4_s24_fenster` in Spur 24.
- **Bilder freigestellt:** Tresor (`tresor_zu`, `tresor_auf` ohne blaues Quadrat), Plakatstücke im echten Seitenverhältnis (`--pr`).
- **Tests** (`e2e-v8*.mjs`) sind noch nicht an diese Runden angepasst – nach dem Durchspielen der Besitzerin anpassen und laufen lassen.

## Ссылки

- **Артефакт v8.9 (D-20), вся книга:** https://claude.ai/artifact/LpyyxbsacqFDjQ83NgpxVu (та же ссылка, обновлено 26.11.2026) — 317 файлов, публикуется в два захода (лимит 255 файлов за раз): `npm run build && node scripts/artifact-v8.mjs`, затем Artifact с `file_path` = `app/dist/artifact_v8.html`, `root` = `app`, `files` из `dist/artifact_v8.json` (первые 250, потом остальные с тем же `url`).

- Артефакт v8, Глава 1: https://claude.ai/artifact/NejzAvfd2FxeZJJYRJUpc9

- Артефакт превью v7: https://claude.ai/artifact/6q5UsxszhqaLAGEQ3qw2rC
  Обновление: `npm run build && node scripts/artifact-v7.mjs`, затем Artifact с `file_path` = `app/dist/artifact_v7.html`, `root` = `app/dist`, `files` = новые `assets/v7-*.js`, `assets/v7-*.css`, `assets/text-*.js` и новые картинки.
- Старая версия: https://claude.ai/artifact/JJwRcyUdYKSvTaU28qHtFW

## Zurück auf jedem Bildschirm (17.11.2026)

- Überall außer dem Titel gibt es links im Fuß einen runden Zurück-Pfeil (`nav()` in `main.ts`, Stil `#fuss.mitnav` in `ui/basis.css`). Beim Lesen übernimmt das der vorhandene Pfeil ‹: auf dem ersten Blatt führt er zum vorigen Bildschirm.
- Kette rückwärts: Vorgeschichte (Karte für Karte) → Titel; Kapitelkarte → Ausblick des vorigen Kapitels bzw. letzte Karte der Vorgeschichte; Spur-Schritte rückwärts (Lesen öffnet auf dem letzten Blatt); erste Spur → Kapitelkarte; Fallkarte → letzter Schritt der letzten Spur; Ausblick → Fallkarte; Finale Schritt für Schritt → Fallkarte.
- `stand.weit` merkt den weitesten Schritt (`pos()`). Ist man zurückgegangen, erscheint rechts ein Vor-Pfeil auf Bildschirmen ohne sichtbaren Weiter-Knopf (Rätsel, Brett, Fallkarte, Tresor-Code): schon Gelöstes muss man nicht noch einmal lösen. Perlen werden nie doppelt vergeben.
- Android-Zurück nutzt dieselbe Kette. Die Pfeile werden per MutationObserver nachgetragen, wenn Rätsel den Fuß neu zeichnen.

## Konfetti und Rätsel auf dem Telefon (25.11.2026)

- **Konfetti/Feuerwerk hinter dem Text:** `konfetti()`/`feuerwerk()` in `haus.ts` hängen den Effekt über `effektHinten()` an `#buehne` (Klasse `.hinten`, `z-index: -1`; die Bühne ist ein Container und damit eine eigene Ebene). Nichts fällt mehr über Urkunde, Sprechblase oder Text; beim nächsten Bildschirm verschwindet der Effekt mit der Bühne. Text direkt auf dem Himmel (`.zug.fin > .zk/.zt1`, `.fest-t`, `.lg-text`, `.fin.urk .forts`) hat eine weiche Platte in Himmelsfarbe (`ende.css`). `wechsel()` überspringt Effekt-Ebenen.
- **Rätsel öffnen oben:** Der erste Satz der Raupe rollt nicht mehr nach unten (`sag()` in `raetsel.ts`, `r.dataset.gesagt`); vorher waren bei Spur 13, 16, 17, 20, 24 Titel und Aufgabe abgeschnitten.
- **Pfeil „mehr unten“:** `mehrPfeil()` in `main.ts`, Stil `#buehne > .mehr` in `ui/basis.css`. Liegt unter dem Rand noch etwas, erscheinen ein dunkler Verlauf und ein runder Senf-Pfeil; Antippen rollt weiter, ganz unten verschwindet beides.
- **Passt aufs Telefon (390×844):** „Was ist anders?“ (Spur 2, 15, 21) zeigt Vorhin/Jetzt nebeneinander; Kartenbilder „Wer passt nicht?“ `13cqh` statt `17cqh`; Zwei Kisten, Schatten (fünf Vögel in einer Reihe), Plakat kleiner nach Bühnenhöhe. Ohne Rollen auf 390×844 jetzt 21 von 24 Rätseln (vorher 11); übrig: Spur 17, 19, 22 (Pfeil zeigt es an). Auf 360×740 rollen noch mehrere, alle mit Pfeil.
- Tests: `e2e-v8-ende.mjs` grün (390×844, 360×740, 800×1280). `e2e-v8.mjs` und `e2e-v8-finger.mjs` waren schon vorher nicht an Runde 3–4 angepasst und bleiben rot. In beiden e2e-Skripten zählen Konfetti-Teile nicht mehr als „ragt seitlich hinaus“.

## Umbau Kapitel 3–4 und Rolle der Raupe (D-19, 25.11.2026)

- **Text v8.8:** Autorenfassung `06_review/brainstorm/BUCH1_v8_8.md`, daraus `01_text/…_v8_KAPITEL1–4.md`. Kapitel 3 hat jetzt 7 Spuren (13–19, alte Spur 18 geteilt: „Die rettende Idee“ / „Ein Mond mit Kratern“), Kapitel 4 hat 5 Spuren (20–24) und ca. 930 statt 1700 Wörter. Der Schlüssel liegt bis Spur 24 im Nest. `build-v8.ts` erlaubt beliebig viele Spuren je Kapitel (Text und Daten müssen gleich viele haben).
- **Raupe:** Mut-Linie (Spur 14 Angst vor dem Vogel → 21 „Mein Herz klopft“ → 23 „Ich mich auch“ → 24), heimliche Schubser (Spur 10 Zettel an die Scheibe, 22 Blatt auf Oskars Nacken, 24 Schlüssel über den Nestrand), „Mein Stern!“ in Spur 17. Regel in `MASTERPLAN.md` angepasst.
- **Neue Spiele:** `raetsel_weg.ts` (Raupenweg Spur 21, Passt genau Spur 15), `raetsel_lesen.ts` (Wunsch-Waage Spur 18, Vogel-Lexikon Spur 23, Flunker-Finder = Fallkarte Kapitel 4: `fallkarte.flunker`, eingebaut in `fallkarte()`/`stempeltAuf()` in `main.ts`). Datenschema jeweils oben in der Datei. Hilfen aus `raetsel.ts` sind exportiert (`kontext, sag, unten, …`).
- **Umgebaut:** Spur 3 = Wort KLEBER (Art `wort` = `astgabel` ohne Baum, `vorgabe` „K_E_E_“, `runden[].pos`), Spur 20 = AST ohne Erinnerungskarten, Spur 22 = Lupe sucht den rosa Mäuseschwanz (`k4_s20_spiel`), Spur 24 = Nest: Laub wegwischen, dann den Schlüssel unter glänzenden Dingen finden.
- **Finale (finale.ts):** 4 Schritte `fin` 0 Code · 1 Tresor mit Lupe · 2 Urkunde (Detektiv/Detektivin, `stand.titel`) · 3 Epilog; alter Speicherstand wird einmal umgerechnet (`finV`). `e2e-v8-ende.mjs` grün (390×844, 360×740, 800×1280).
- **Neue Bilder** (Platzhalter aktiv, Prompts auf der Bilder-Seite): `k3_s19` (Ersatz `k3_elster`), `k4_s21_raupe` (Ersatz `baum`), `raupenweg` (Ersatz `ersatz/weg_raupenweg.svg`, Skizze `02_design/skizzen/raupenweg_skizze.png`). Neue Szenenbilder brauchen einen Eintrag im ECHT-Glob in `bilder.ts`.
- **Silben:** neue Wörter am Ende von `04_data/silben_kapitel1.txt` (von Hand geprüft, Regeln wie Leseraupe).

## Korrekturen nach dem Durchspielen (D-20, Text v8.9, 26.11.2026)

- **Liste aller 63 Anmerkungen der Besitzerin** mit Lösung, Screenshot und ihrem „Принято / Не так“: Artifact https://claude.ai/artifact/ViLNQ4EmiHU1KKLiNDVBXn (Sammlung `pruefung` in der Artifact-DB).
- **Text:** `06_review/brainstorm/BUCH1_v8_9.md` → `01_text/…KAPITEL1–4.md`. Neue Marker: `<!-- Raupe: pose -->` (Pose für den nächsten Gedanken), `<!-- Bild -->` / `<!-- Bild: name -->` (Bild im Text), Abschnitt `### Ausklang — Titel` nach der letzten Spur eines Kapitels (Bild: `ausklangBild` im Kapitel-JSON).
- **Oberfläche:** Kopfzeile symmetrisch (Brett, Mond | Titel | Perlen, Schrift), eine Stecknadel für alle Karten, alle Karten vergrößerbar, Toast „Neu im Haus“ unter der Kopfzeile, Gedankenblasen mit Bläschen zur Raupe, Buchstaben-Beutel statt Code-Feldern, Urkunde ohne Detektiv/Detektivin. Text-Schlüssel für Silben: `app/src/v8/textschluessel.ts` (main.ts und build-v8.ts).
- **Spiele:** `ziehbar()` (raetsel.ts) für zuverlässiges Ziehen; Raupenweg neu gezeichnet (`raetsel_weg_szene.ts`); Waage, Vogelbuch, Astgabel, Nest mit Zeigestock, Flunker-Finder (`.flk`), neue Laub-Spur BANK (S11).
- **Haus der Lese-Raupe:** eigene `haus.css`, Reaktionen aufs Essen, Hicks, Kitzeln, Einschlafen, Wunsch-Wolke, kombinierbare Sachen (`stand.traegt` = Liste mit Komma), Taschenlampe.
- **Neue Bilder (Prompts auf https://claude.ai/artifact/4HSaJjwJt2jFCGTw28szJd):** `k1_s6_nachher`, `k2_s7`, `k2_s8` (Datei ersetzen), `k2_s10_fenster`, `k2_s11_hof` (neu, bis dahin Ersatz in `bilder.ts`); `k3_s19` und `k4_s21_raupe` sind auf der Seite als fertig markiert, die Dateien fehlen noch im Repo.
- **Tests:** `e2e-v8.mjs` (390×844, 24 Spuren, 281 Bildschirme) und `e2e-v8-ende.mjs` grün am 26.11.2026.
