# Store-Eintrag Google Play (Deutsch, Standardsprache)

Stand: 17.11.2026, nach App-Stand v8 (Ветка `ccr-df1be5c7-gwvgon`). Перед публикацией сверить факты с финальной сборкой (число глав, загадок, нет ли рекламы/покупок).

Копировать в Play Console → «Store-Eintrag» → «Haupt-Store-Eintrag». Лимиты Google указаны в скобках, длина проверена скриптом.

---

## App-Name (max. 30 Zeichen)

```
Spuren-Raupe
```
12 знаков. Решение D-21 (26.11.2026, было «Lese-Fall: Spur im Text», D-03).

Варианты с пояснением (выбрать перед публикацией):
- `Spuren-Raupe: Lesekrimi` (23)
- `Spuren-Raupe: Krimi lesen` (25)

## Kurzbeschreibung (max. 80 Zeichen)

```
Ein Krimi zum Selberlesen: lesen, Rätsel lösen, den verschwundenen Mond finden
```
78 знаков.

Запасные варианты:
- `Detektivgeschichte zum Selberlesen – mit farbigen Silben und kniffligen Rätseln` (79)
- `Lesen wie ein Detektiv: eine spannende Geschichte mit 24 Rätseln` (64)

Полное описание: 1803 знака из 4000.

## Vollständige Beschreibung (max. 4000 Zeichen)

```
Heute ist Theater-Tag! Mila hat einen großen gelben Mond aus Pappe gebastelt. Doch kurz vor der Aufführung ist er weg. Und Frau Sommer sucht auch noch ihren Schlüssel mit dem Glitzer-Stern. Wer hilft beim Suchen? Die Lese-Raupe – und du!

„Spuren-Raupe“ ist ein Krimi zum Selberlesen für Kinder ab etwa 8 Jahren. Das Kind liest die Geschichte selbst, Seite für Seite. Nach jeder Spur wartet ein Rätsel, das zur Geschichte passt. So wird aus Lesen eine echte Ermittlung.

FALL 1: DER VERSCHWUNDENE MOND
• 4 Kapitel mit 24 Spuren
• Nach jeder Spur ein kurzes Rätsel: Unterschiede finden, versteckte Buchstaben entdecken, Hinweise prüfen, Schatten vergleichen und vieles mehr
• Alle Funde hängen am Ermittlungsbrett. Offene Fragen werden nach und nach geklärt.
• Für jedes Kapitel gibt es einen Buchstaben. Am Ende öffnet das Code-Wort den geheimen Tresor.
• Zum Schluss: eine Urkunde für Meister-Detektive

LESEN MIT FARBIGEN SILBEN
Die Silben sind abwechselnd blau und rot gefärbt. Das hilft beim Lesen langer Wörter. Die Farben lassen sich mit einem Tipp ausschalten. Die Schriftgröße ist einstellbar.

HILFE OHNE DRUCK
Klappt ein Rätsel nicht sofort, gibt die Lese-Raupe einen Tipp. Beim zweiten Fehler zeigt sie die Lösung. Niemand bleibt hängen, die Geschichte geht immer weiter. In jedem Bild ist eine Schimmer-Perle versteckt.

RUHIG UND SICHER
• Keine Werbung
• Keine In-App-Käufe
• Kein Konto, keine Anmeldung
• Funktioniert ohne Internet
• Keine Daten werden gesammelt. Der Lesefortschritt bleibt nur auf dem Gerät.
• Ohne Ton – gut für leise Lesezeiten

Die Lese-Raupe kennt man vielleicht schon: Sie wohnt auf einer großen grünen Pflanze im Gruppenraum der Schule. Wenn etwas Rätselhaftes passiert, leuchten ihre Fühler golden. Die Menschen können ihre Gedanken nicht hören. Du aber schon!
```

> ⚠ Проверить перед публикацией:
> - «Keine In-App-Käufe» и «Keine Werbung» — правда только пока нет премиума (A-08). При появлении покупок текст менять.
> - «Ohne Ton» — правда для v8 (в коде нет звуков). Если добавится звук — убрать строку.
> - Абзац «Die Lese-Raupe kennt man vielleicht schon» — намёк на первое приложение без названия; если не нравится, удалить.

## Was ist neu (Versionshinweise, max. 500 Zeichen)

Für версию 1.0 (versionCode 1):
```
<de-DE>
Erste Version: Fall 1 „Der verschwundene Mond“ mit 4 Kapiteln, 24 Spuren und 24 Rätseln.
</de-DE>
```

---

## Grafiken

| Что | Файл | Требование Google | Проверено |
|---|---|---|---|
| App-Symbol | `05_play_store/icon_512.png` | 512×512, PNG 32 bit (с альфа-каналом), ≤ 1 МБ | 512×512, RGBA, 273 КБ ✅ |
| Feature-Grafik | `05_play_store/feature_graphic_1024x500.png` | 1024×500, JPEG или PNG 24 bit **без** альфы, ≤ 15 МБ | 1024×500, RGB, 585 КБ ✅ |
| Telefon | `05_play_store/screenshots/telefon/01…08` | 2–8 шт., 16:9 или 9:16, стороны 320–3840 px; для рекомендаций ≥ 1080 px | 8 × 1080×1920 ✅ |
| Tablet 7″ | `05_play_store/screenshots/tablet_7/01…08` | до 8 шт., стороны 320–3840 px | 8 × 1200×1920 ✅ |
| Tablet 10″ | `05_play_store/screenshots/tablet_10/01…08` | до 8 шт., стороны 1080–7680 px | 8 × 1600×2560 ✅ |
| Video | — | только ссылка YouTube | идея в `PLAY_STORE.md`, раздел 9 |

Порядок скриншотов (первые 2–3 видны без прокрутки, они самые важные):

1. Обложка — «Ein Krimi zum Selberlesen»
2. Чтение с цветными слогами
3. Загадка «Wessen Ärmel war es?» (исключение по признакам)
4. «Was ist anders?» (найди отличия)
5. «Im Wasser versteckt» (спрятанная буква)
6. «Wessen Schatten?»
7. Ermittlungsbrett — «Neuer Fund!»
8. Urkunde «Meister-Detektiv»

Сейф намеренно **не** показан: на его экране текст выдаёт разгадку (Elster).

Как пересобрать скриншоты: `05_play_store/screenshots/README.md`.

---

## Kategorie und Kontakt

- **App oder Spiel:** App. (Альтернатива: Spiel → «Lernspiele». Для книги-приложения с чтением «App» честнее; в Leseraupe — сверить, что выбрано там, и взять то же.)
- **Kategorie:** Bildung (Education)
- **Tags:** выбрать в Console до 5: Lesen, Bücher, Rätsel, Kinder, Lernen (точные названия тегов — из списка Google)
- **E-Mail:** обязательна, публична. Тот же адрес, что у Lese-Raupe.
- **Website:** необязательно. Если будет — страница с Datenschutz.
- **Telefon:** не указывать (необязательно, пока нет статуса трейдера).
