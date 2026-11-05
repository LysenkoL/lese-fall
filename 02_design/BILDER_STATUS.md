# Статус картинок (5.11.2026)

Все картинки книги сгенерированы и лежат в `assets/illustrationen/` (53 файла + разрезанные предметы, эмоции, карточки). Эталоны — `assets/reference/`, промты — `02_design/BILDER_PROMPTS.md`.

## Осталось поправить (через «Bearbeiten» в ChatGPT)

**k4_s20_spiel** — ✅ готово.

**Мышь** — ✅ исправлена во всех картинках (11, включая k2_s12) (плоская бумажная, эталон `assets/reference/maus_referenz.png`).

**Крыша театра** — низкая ровная дуга между шариками, как в k1_s1 (эталон `assets/reference/theater_dach_referenz.png`). Исправить: k1_s2_nachher, k4_s20_vorher, k4_s20_nachher (мышь уже исправлена — править только крышу), k4_s24, cover, k4_s22, k4_s23, finale_bild.

Оставлено сознательно: в k2_s9 скамейка со спинкой, дальше — столик со скамьями.

## Сборка приложения Главы 1
Отдельная сессия «Lese-Fall: Kapitel 1 als spielbare App», ветка `app/kapitel1`, на паузе. План продолжения — `app/STATUS.md` в той ветке (первым делом починить игру Spur 4). Перед продолжением передать ей новые картинки из `main` (vorgeschichte, kapitel_1, mondtresor_zu/auf в арочном варианте, spiel_theater_leer).
