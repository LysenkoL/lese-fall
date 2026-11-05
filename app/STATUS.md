# Статус: Глава 1 как приложение (ветка `app/kapitel1`) — WIP, пауза

## Готово
- `app/`: Vite + TypeScript + Capacitor 8 (appId `app.lesefall`, SystemBars `insetsHandling: css`). Офлайн, без SDK, прогресс только в localStorage.
- Данные: `04_data/kapitel1.json` генерируется `npm run data` (скрипт `app/scripts/build-data.ts`) из текста v6 + `04_data/kapitel1_spiele.json` (игры) + `04_data/silben_kapitel1.txt` (слоги всех слов). Автопроверка «текст без разметки = v6» проходит (Vorgeschichte + Spur 1–6, 1237 слов).
- Слоги: алгоритм Leseraupe + 16 ручных исправлений (Blei|stift, ge|stellt, ge|streif|te, Tab|lett, wirk|lich, Lieb|lings|blatt, The|a|ter|stück, wie|der|er|ken|ne …).
- Экраны: обложка → Vorgeschichte → Spur 1–6, постраничное чтение (кнопки + свайп, A-13 скролл только при переполнении), шапка «Kapitel 1 · Spur N» с луной-прогрессом и жемчужинами, настройки Aa / Silben farbig / Bewegung reduzieren / сброс.
- Движки игр (`src/engines.ts`): Zielfeld, Slots, Faden, Reihe, Urteil; игры Spur 1–6 по SPIELE.md.
- Цикл: ошибка → «Zeig den Beweis!» (поиск с 1-го листа, наводка после 2 промахов) → повтор с цитатой → Weitere Hilfe → объяснение; жемчужины 2/2/1/1 один раз; Spuren abpinseln (буква KLEBER), Spurenwand (переигровка без жемчужин), картинка «после», Mondtresor.
- Playwright-прогон `app/scripts/e2e.mjs` (телефон 390×844 + планшет 820×1180): Spur 1–3 проходят.

## В процессе
- e2e падает на Spur 4, шаг 1 (Steckbrief, выбор 4 примет): кнопка «Prüfen» остаётся неактивной после 4 тапов по `[data-m]`. Проверить `Urteil` (mode `mehrere`) / обновление кнопки после rerender.

## Следующие шаги
1. Починить Spur 4, догнать e2e до конца (телефон и планшет), скриншоты → `03_screens/kapitel1/`.
2. Визуально проверить зоны театра (Spur 1) и стол (Spur 6) на скриншотах.
3. `04_data/SILBEN_PRUEFEN.md` — список исправленных и спорных слогов (he|raus, da|ran, wa|rum, Iiiiih, перенос цвета после дефиса).
4. Опубликовать веб-версию Artifact'ом (загрузить skill artifact-design; многофайловая сборка `app/dist`).
5. Android: `npx cap add android`, targetSdk 36, попытка собрать debug-APK (JDK 21 и gradle есть, Android SDK — проверить).
6. Отчёт владелице.

Запуск: `cd app && npm install && npm run build && npx vite preview --port 4173`, затем `node scripts/e2e.mjs`.
