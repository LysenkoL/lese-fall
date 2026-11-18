# Lese-Fall: Debug-APK auf Windows bauen (PowerShell).
# Holt den neuesten Stand von main, baut die Web-Teile (v8), synchronisiert Android und baut die APK.
# Die fertige APK liegt danach auf dem Desktop: Lese-Fall-debug.apk
#
# Aufruf im Projektordner (dort, wo README.md liegt), vorher einmal: git pull origin main
#   powershell -ExecutionPolicy Bypass -File app\scripts\apk-bauen.ps1
#
# Braucht: Git, Node.js (18+), Android Studio (bringt Android SDK und Java mit).

$ErrorActionPreference = 'Stop'
function Schritt($t) { Write-Host "`n==> $t" -ForegroundColor Yellow }
function Fehler($t) { Write-Host "`nFEHLER: $t" -ForegroundColor Red; exit 1 }

# Projektordner = zwei Ebenen ueber diesem Skript
$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $Root

# ---------- 1. Werkzeuge pruefen ----------
Schritt 'Werkzeuge pruefen'
foreach ($cmd in 'git', 'node', 'npm') {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Fehler "$cmd nicht gefunden. Bitte installieren und PowerShell neu oeffnen." }
}
Write-Host "node $(node -v)"

# Java: zuerst JAVA_HOME, sonst das Java aus Android Studio
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  $kandidaten = @(
    "$env:ProgramFiles\Android\Android Studio\jbr",
    "$env:ProgramFiles\Android\Android Studio\jre",
    "$env:LOCALAPPDATA\Programs\Android Studio\jbr"
  )
  $jbr = $kandidaten | Where-Object { Test-Path "$_\bin\java.exe" } | Select-Object -First 1
  if (-not $jbr) { Fehler 'Kein Java gefunden. Android Studio installieren (oder JAVA_HOME auf ein JDK 21 setzen).' }
  $env:JAVA_HOME = $jbr
}
Write-Host "JAVA_HOME = $env:JAVA_HOME"

# Android SDK: ANDROID_HOME, sonst der Standardordner von Android Studio
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path "$sdk\platforms")) { Fehler "Android SDK nicht gefunden ($sdk). In Android Studio einmal oeffnen: More Actions > SDK Manager, Android 16 (API 36) installieren." }
$env:ANDROID_HOME = $sdk
Write-Host "ANDROID_HOME = $sdk"

# ---------- 2. Neuesten Stand holen ----------
Schritt 'Neuesten Stand von main holen'
# Diese Dateien erzeugt der Build selbst neu (npm run data) - lokale Kopien verwerfen, sonst blockieren sie git pull
foreach ($gen in '04_data/buch1_v8.json', '04_data/buch1_v7.json', '04_data/kapitel1.json') { git checkout -q -- $gen }
$aenderungen = git status --porcelain
if ($aenderungen) { Write-Host 'Achtung: lokale Aenderungen vorhanden - sie bleiben unberuehrt:' -ForegroundColor Yellow; $aenderungen | Select-Object -First 10 }
git fetch origin main; if ($LASTEXITCODE) { Fehler 'git fetch fehlgeschlagen.' }
git checkout main; if ($LASTEXITCODE) { Fehler 'git checkout main fehlgeschlagen (lokale Aenderungen? erst sichern).' }
git pull --ff-only origin main; if ($LASTEXITCODE) { Fehler 'git pull fehlgeschlagen.' }
git log --oneline -1

# ---------- 3. Web-Teil bauen, Android synchronisieren ----------
Set-Location "$Root\app"
Schritt 'npm install'
npm install; if ($LASTEXITCODE) { Fehler 'npm install fehlgeschlagen.' }
Schritt 'Web bauen und Android synchronisieren (npm run android)'
npm run android; if ($LASTEXITCODE) { Fehler 'npm run android fehlgeschlagen.' }

# local.properties mit dem SDK-Pfad (Gradle braucht ihn)
$lp = "$Root\app\android\local.properties"
"sdk.dir=$($sdk -replace '\\', '\\')" | Set-Content -Encoding ASCII $lp

# ---------- 4. APK bauen ----------
Schritt 'APK bauen (gradlew assembleDebug) - beim ersten Mal dauert das einige Minuten'
Set-Location "$Root\app\android"
.\gradlew.bat assembleDebug; if ($LASTEXITCODE) { Fehler 'Gradle-Build fehlgeschlagen. Die Meldung oben zeigt den Grund.' }

$apk = "$Root\app\android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { Fehler "APK nicht gefunden: $apk" }
$desktop = [Environment]::GetFolderPath('Desktop')
$ziel = Join-Path $desktop 'Lese-Fall-debug.apk'
Copy-Item $apk $ziel -Force

Schritt 'Fertig'
Write-Host "APK: $ziel" -ForegroundColor Green
Write-Host "Aufs Handy: per USB-Kabel kopieren oder an dich selbst schicken, dann antippen und 'Aus unbekannten Quellen installieren' erlauben."
Write-Host ("Mit Kabel und USB-Debugging geht auch: adb install -r `"$ziel`"")
Set-Location $Root
