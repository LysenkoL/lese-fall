# Android-сборка (APK / AAB)

Проект Capacitor уже создан в `app/android` (appId `app.lesefall`, minSdk 24, targetSdk/compileSdk 36, иконки и заставка из `assets/icon`).
В облачном окружении Claude Android SDK скачать нельзя, поэтому APK собирается у тебя на компьютере.

## Один раз
1. Установить Android Studio (в нём есть Android SDK и JDK 21).
2. `cd app && npm install`

## Каждый раз
```bash
cd app
npm run android          # данные главы + сборка веб-части + cap sync android
cd android
./gradlew assembleDebug  # APK для своего телефона: android/app/build/outputs/apk/debug/app-debug.apk
```
Либо `npx cap open android` и в Android Studio: Run ▶ на подключённом телефоне.

## Для Google Play
- Подпись — как в Leseraupe (`docs/ANDROID.md` там): `android/key.properties` (не коммитить) и `./gradlew bundleRelease` → `.aab`.
- Перед загрузкой увеличивать `versionCode` в `android/app/build.gradle`.

## Что проверить на телефоне (A-06)
- Шапка и кнопки внизу не залезают под часы и под полосу жестов (edge-to-edge, targetSdk 36; отступы приходят в CSS как `--safe-area-inset-*` от SystemBars).
- То же с трёхкнопочной навигацией и в альбомной ориентации на планшете.
