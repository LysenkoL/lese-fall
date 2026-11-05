# Статус: Глава 1 как приложение (ветка `app/kapitel1`)

## Готово
- `app/`: Vite + TypeScript + Capacitor 8 (appId `app.lesefall`), офлайн, прогресс в localStorage.
- Данные: `npm run data` строит `04_data/kapitel1.json` из текста v6 + `04_data/kapitel1_spiele.json` + `04_data/silben_kapitel1.txt`; автопроверка «текст = v6» проходит.
- Слоги: `04_data/SILBEN_PRUEFEN.md` — исправления и спорные места.
- Вся глава играбельна: чтение, 6 игр на 5 движках, Zeig den Beweis!, жемчужины, кисточка, Spurenwand, Mondtresor.
- e2e (`node scripts/e2e.mjs`): телефон и планшет, все проверки зелёные; скриншоты в `03_screens/kapitel1/`.
- Android-проект `app/android` (targetSdk 36, иконки); сборка APK — `app/ANDROID.md` (в облаке нет Android SDK).

- Веб-версия (Artifact): https://claude.ai/artifact/JJwRcyUdYKSvTaU28qHtFW

- D-13: «Lese-Raupe» через дефис в данных и интерфейсе; слоги после дефиса продолжают чередоваться (Le|se-|Rau|pe).
- Новые иллюстрации из `main` подключены: vorgeschichte, kapitel_1 (Spurenwand), spiel_theater_leer (игра Spur 1, вырезка театра), spurenwand (пробковая доска), mondtresor_zu/auf (новые координаты ячеек), обновлённые cover и k1_s6_vorher.
- Сжатие картинок для APK не делал: вся веб-часть 5,7 МБ (webp), для APK это нормально.

- Ревью 5.11 (оркестратор): прозрачные вырезки предметов (`app/scripts/freistellen.py` → `app/src/gen/objekte/`, оригиналы не тронуты), родительский замок на «Fortschritt löschen» (пример a · b + подтверждение), Spur 4 «Vergleich» — признак строкой, кнопки под ним, Spurenwand — нижний отступ и короткие заголовки. Spur 6: логика по AUFGABEN (луна → auf dem Tablett, «где лежала по словам Бена»), формулировки уточнены; вариант «луна — ловушка» требует решения владелицы и правки AUFGABEN.

## Дальше
- Проход владелицей на телефоне, правки по замечаниям.
- APK на компьютере владелицы, проверка Safe Areas на реальном устройстве.
