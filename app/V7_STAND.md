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
- Собрана Глава 1 (6 головоломок, доска, карточка дела). Главы 3–4 — после оценки владелицы.
- Глава 2 (Spur 7–12, код: буква T на позиции 3 слова NEST): `01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL2.md`, `04_data/kapitel2_v8_raetsel.json`. `build-v8.ts` читает все `kapitelN_v8_raetsel.json` и `..._KAPITELN.md`; новая глава = два новых файла.
- Новые виды: `sortieren` (два ящика), `umdrehen` (как лежала Луна и почему), `suchbild`, `spiegel` (зеркальная надпись), `versteckt` с `muster: "laub"`, `ausschluss` с картинками предметов.
- Картинки, которых ещё нет, подменяет `app/src/v8/bilder.ts` (таблица `ERSATZ`, рисованные SVG в `app/src/v8/ersatz/`). Настоящая картинка: положить `assets/illustrationen/objekte/<имя>.webp` (затем `python3 scripts/freistellen.py`) или `assets/illustrationen/kinder/<имя>.webp`; для `mond_hinten_feucht` в данных Спур 8 поставить `kleber.zeichnen: false`.

## Ссылки

- Артефакт v8, Глава 1: https://claude.ai/artifact/NejzAvfd2FxeZJJYRJUpc9

- Артефакт превью v7: https://claude.ai/artifact/6q5UsxszhqaLAGEQ3qw2rC
  Обновление: `npm run build && node scripts/artifact-v7.mjs`, затем Artifact с `file_path` = `app/dist/artifact_v7.html`, `root` = `app/dist`, `files` = новые `assets/v7-*.js`, `assets/v7-*.css`, `assets/text-*.js` и новые картинки.
- Старая версия: https://claude.ai/artifact/JJwRcyUdYKSvTaU28qHtFW
