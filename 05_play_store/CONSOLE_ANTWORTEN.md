# Ответы для Play Console (раздел «App-Inhalte» / «App content»)

Состояние на 17.11.2026, по коду v8. Основание каждого ответа — в скобках. Формулировки вопросов Google меняет; если вопрос выглядит иначе — сверить смысл, а не слова.

Проверено в коде (`app/android/app/src/main/AndroidManifest.xml`, `app/src/v8/`):
- единственное разрешение — `INTERNET` (Capacitor по умолчанию); сетевых запросов приложение не делает, все картинки и тексты внутри;
- нет SDK аналитики, рекламы, Firebase, Crashlytics (`package.json`: только `@capacitor/core`, `/android`, `/app`);
- хранение — `localStorage`, ключ `lesefall.v8`: прогресс, настройки, имя на дипломе;
- звуков нет; `navigator.vibrate` вызывается, но разрешения `VIBRATE` нет, поэтому на Android вибрации не будет;
- `targetSdk 36`, `minSdk 24`, `versionCode 1`, `versionName 1.0`.

> ⚠ Риск: имя на дипломе — это ввод ребёнка, но оно хранится **только** на устройстве. По правилам Google данные, которые не покидают устройство, не считаются «собранными» (collected = передаётся с устройства). Поэтому ответ «не собираем» корректен. Если когда-нибудь появится облако/синхронизация/отчёты о сбоях — Data safety переписывать.

---

## 1. Datenschutzerklärung (Privacy policy)

- URL: **[вставить после публикации страницы]**.
- Файл страницы: `05_play_store/datenschutz/index.html` (DE + EN). Перед публикацией заполнить `[…]`: имя, адрес, e-mail, дата.
- Где разместить: так же, как Datenschutz у Lese-Raupe (по D-04 «страница Datenschutz по образцу»). Вариант — GitHub Pages; страница должна открываться без входа, не как PDF, быть доступной и не меняться без нужды.

## 2. App-Zugriff (App access)

- **Alle Funktionen sind ohne besondere Zugriffsrechte verfügbar.** (нет логина)

## 3. Anzeigen (Ads)

- **Nein, meine App enthält keine Anzeigen.**

## 4. Einstufung des Inhalts (Content rating, IARC)

- Kategorie: **Referenz, Nachrichten oder Bildung** (если анкета предложит «Spiel», выбрать то же, что в категории магазина).
- Ответы — всё **Nein**:
  - Gewalt, Blut, Angst/Horror — Nein (детективная загадка без угроз; мышь и птица, никто не пострадал)
  - Sexualität, Nacktheit — Nein
  - Vulgäre Sprache — Nein
  - Drogen, Alkohol, Tabak — Nein
  - Glücksspiel / simuliertes Glücksspiel — Nein
  - Nutzer interagieren / Austausch von Inhalten — Nein
  - Teilen des Standorts — Nein
  - Digitale Käufe — Nein
  - Uneingeschränkter Internetzugang (Webbrowser) — Nein
- Ожидаемый результат: USK 0 / PEGI 3 / «Everyone».

## 5. Zielgruppe und Inhalte (Target audience)

- Altersgruppen: **6–8** и **9–12** (книга для ~8 лет, 2.–3. Klasse; 6–8 нужна, т.к. 2. класс = 7–8 лет).
- Только дети, **не** «и взрослые»: тогда честно, и для смешанной аудитории нужна была бы проверка возраста.
- «Könnte die App unbeabsichtigt Kinder ansprechen?» — не спрашивают, если выбраны детские возрасты.
- Следствие: действуют **Families Policy** (см. `PLAY_STORE.md`, раздел 3). Мы их выполняем: нет рекламы, нет SDK, нет сбора данных.
- «Teacher Approved» — не подаём отдельно; Google выбирает сам.

## 6. Nachrichten-App — **Nein**

## 7. COVID-19-Kontaktverfolgung — **Meine App ist keine öffentlich…** (не такое приложение)

## 8. Datensicherheit (Data safety)

| Вопрос | Ответ |
|---|---|
| Erhebt oder teilt Ihre App erforderliche Nutzerdatentypen? | **Nein** |
| Werden alle Nutzerdaten bei der Übertragung verschlüsselt? | вопрос пропадает при «Nein» выше |
| Können Nutzer das Löschen ihrer Daten anfordern? | пропадает; при необходимости: данные удаляются в приложении («Von vorn beginnen») или удалением приложения |

Итог на странице магазина: «Keine Daten werden mit Dritten geteilt» / «Keine Daten erhoben».

## 9. Behördliche App (Government) — **Nein**

## 10. Finanzfunktionen — **Keine**

## 11. Gesundheit — **Keine**

## 12. Werbe-ID (Advertising ID)

- **Nein**, приложение не использует рекламный ID. В исходном манифесте нет `com.google.android.gms.permission.AD_ID`. ⚠ Не проверено: итоговый (merged) манифест после сборки — посмотреть в Android Studio → AndroidManifest.xml → вкладка «Merged Manifest».

## 13. Akteur nach DSA (Trader status)

- **Kein Händler** (Nicht-Händler), пока приложение бесплатное и без покупок (см. `PLAY_STORE.md`, раздел 6). Тогда адрес не публикуется.

---

## Тестирование и выпуск

- Закрытый тест: ≥ 12 тестеров × 14 дней непрерывно (D-03: та же Google Group, что у Lese-Raupe).
- Перед этим: подписанный **AAB** (не APK), Play App Signing включён. Сборка — `app/ANDROID.md` (в облаке нет Android SDK, собирается на компьютере).
- Страны: Германия, Австрия, Швейцария (немецкий текст); остальное по желанию.
- Цена: бесплатно. ⚠ Бесплатное приложение потом **нельзя** сделать платным (покупки внутри — можно).
