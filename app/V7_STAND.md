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

## Ссылки

- Артефакт v8, Глава 1: https://claude.ai/artifact/NejzAvfd2FxeZJJYRJUpc9

- Артефакт превью v7: https://claude.ai/artifact/6q5UsxszhqaLAGEQ3qw2rC
  Обновление: `npm run build && node scripts/artifact-v7.mjs`, затем Artifact с `file_path` = `app/dist/artifact_v7.html`, `root` = `app/dist`, `files` = новые `assets/v7-*.js`, `assets/v7-*.css`, `assets/text-*.js` и новые картинки.
- Старая версия: https://claude.ai/artifact/JJwRcyUdYKSvTaU28qHtFW
