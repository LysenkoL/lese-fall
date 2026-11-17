# Скриншоты для Google Play

8 экранов × 3 формата: `telefon/` 1080×1920, `tablet_7/` 1200×1920, `tablet_10/` 1600×2560. Сняты с приложения v8 (ветка `ccr-df1be5c7-gwvgon`, 17.11.2026), подписи на немецком.

## Как пересобрать (после изменений в приложении)

```bash
cd app && npm run build && (npx vite preview --port 4173 &)
R=../05_play_store/screenshots/werkzeug; T=/tmp/roh
node $R/auswahl.mjs 390 694  2.25 $T/phone
node $R/auswahl.mjs 600 840  2    $T/tab7
node $R/auswahl.mjs 800 1118 2    $T/tab10
node $R/rahmen.mjs $T ../05_play_store/screenshots
```

`auswahl.mjs` кладёт сохранённое состояние в `localStorage` (`lesefall.v8`) и снимает нужный экран; `rahmen.mjs` рисует фон «Nachthimmel», заголовок и рамку (шрифт Inter из `assets/fonts/`). Папки `$T/phone|tab7|tab10` создать заранее. Подписи — массив `BILDER` в `rahmen.mjs`.

Правила: на скриншотах только настоящие экраны приложения; без «Nr. 1», «kostenlos», рейтингов и призывов купить (политика Google и Families Policy); не показывать экран сейфа — он выдаёт разгадку.
