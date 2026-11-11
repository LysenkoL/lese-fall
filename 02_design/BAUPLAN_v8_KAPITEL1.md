# Bauplan v8 · Kapitel 1 (Auftrag für die Umsetzung)

Ziel: Kapitel 1 nach `02_design/KONZEPT_v8.md` als eigene spielbare Vorschau bauen. **Alle Inhalte sind fertig** – Text und Rätseldaten werden nicht neu erfunden, nur umgesetzt.

- Text: `01_text/LESE-FALL_BUCH_1_TEXT_v8_KAPITEL1.md`
- Rätsel, Brett, Fallkarte, Oberflächentexte: `04_data/kapitel1_v8_raetsel.json`
- Vorlage für Technik und Aussehen: die Vorschau v7 (`app/v7.html`, `app/src/v7/main.ts`, `app/src/v7/v7.css`, `app/scripts/build-v7.ts`, `app/scripts/e2e-v7.mjs`). **v7 und die alte App (`index.html`, `src/main.ts`) bleiben unverändert.**

## 0. Feste Regeln

- Vite + TypeScript ohne Framework, wie v7. Keine neuen Abhängigkeiten. Offline, kein Netz, nur `localStorage` (Schlüssel `lesefall.v8`).
- Schrift Inter lokal (wie v7), keine Google Fonts. Silbenfarben wie v7 (`T()` aus `src/text.ts`).
- Kein Grün/Rot und keine Häkchen für richtig/falsch. Rückmeldung über Senf-Gelb (`--senf`), Wackeln, die Lese-Raupe, Stempel.
- Keine Sterne als Deko. Kein Ton. `prefers-reduced-motion` beachten (wie v7).
- Kein Zeitdruck, keine Leben, nichts geht verloren. **Nach einem Fehler gibt es einen zweiten Versuch; nach dem zweiten Fehler löst die Lese-Raupe die Stelle sichtbar selbst, und es geht weiter.** Niemand bleibt hängen.
- Alles muss mit **Maus und Finger** gehen: Pointer Events (`pointerdown/move/up`, `setPointerCapture`), `touch-action: none` auf Zieh-Flächen. Jede Zieh-Aktion hat auch einen Tipp-Weg (siehe Rätsel).
- Keine waagerechte Bildlaufleiste, bei keiner Breite von 360 bis 1600 px. Die App ist eine Spalte mit `max-width: 560px`, mittig (wie v7); `overflow-x: hidden` auf allen rollenden Flächen.
- Deutsche Kindertexte kommen nur aus den Daten. Keine eigenen Texte erfinden. Fehlt ein Text: in den Bericht schreiben.

## 1. Dateien

| Neu | Inhalt |
|---|---|
| `app/v8.html` | Einstieg, wie `v7.html` |
| `app/src/v8/main.ts` | Ablauf, Lesen, Brett, Fallkarte |
| `app/src/v8/raetsel.ts` | die sechs Rätsel (je eine Funktion) |
| `app/src/v8/staub.ts` | Staub wegwischen auf einem Canvas |
| `app/src/v8/zeichnen.ts` | SVG: Pullis, versteckter Buchstabe |
| `app/src/v8/v8.css` | Stil; Farben und Schriften aus `v7.css` übernehmen |
| `app/scripts/build-v8.ts` | baut `04_data/buch1_v8.json` |
| `app/scripts/e2e-v8.mjs` | Durchlauf mit Bildern nach `03_screens/v8/<name>/` |

`vite.config.ts`: Eingang `v8: 'v8.html'` ergänzen. `package.json`: im Skript `data` zusätzlich `node scripts/build-v8.ts`.
`src/data.ts` → `img()` weiterbenutzen. Fehlende Bilder in der Glob-Liste ergänzen: `k1_s5_karten/*` ist schon da; neu nötig: nichts für Kapitel 1.
Freigestellte Figuren: `fig('raupe/lob')` wie in v7 (`src/gen/frei/…`).

## 2. Daten bauen (`build-v8.ts`)

Wie `build-v7.ts`, aber einfacher:

- Text einlesen: `## Kapitel 1 — Titel`, `### Spur N — Titel`, Absätze bis `---`. `<!-- Blatt -->` setzt `umbruch: true` am nächsten Block. Es gibt **kein** `<!-- Ermittlung -->` mehr: jede Spur hat genau eine Blockliste `blocks`.
- Sätze teilen und Silben setzen wie in v7 (`saetze`, `mark`, Wörterbuch `04_data/silben_kapitel1.txt`, Schalter `--neue-woerter`).
- Aus `kapitel1_v8_raetsel.json` alles übernehmen. Silben setzen (`mark`) in allen Zeichenketten unter den Schlüsseln: `text`, `titel`, `haken`, `frage`, `aufloesung`, `warum`, `tipp`, `erfolg`, `unklarTipp`, `vorspann`, `ausblick`, `name`, in `ui.*`, in `fallkarte.saetze[]` und in `hinweise[].text`. **Nicht** markieren: `wort`, `buchstaben`, `buchstabe`, `optionen` beim Rätsel `versteckt`, `stempel`, Farben, IDs, Bildnamen.
- Ausgabe `04_data/buch1_v8.json`: `{ fall:{titel}, kapitel:[{nr,titel,bild,vorspann,code,fallkarte,ausblick}], intro, ui, spuren:[{nr,kap,spur,titel,bild,haken,blocks,karte,fragenNeu,fragenWeg,tipp,raetsel}] }`.
- Neue Wörter: Lauf mit `--neue-woerter`, die angehängten Silben in den Bericht kopieren (werden von Hand geprüft).

## 3. Ablauf

```
Titel → Vorgeschichte (3 Karten, wie v7) → Kapitelkarte →
für jede Spur:  Lesen → [Tipp-Auflösung] → Rätsel → Brett → [Tipp-Frage] → Haken →
nach Spur 6:    Fallkarte → Ausblick („Fortsetzung folgt …“)
```

- **Lesen:** wie v7 (`blaetter()` mit ausgewogener Verteilung, Bild auf dem ersten Blatt, Punkte und runde Knöpfe unten, Wischen). **Ohne Markieren**: Sätze sind nicht antippbar. Auf dem letzten Blatt heißt der Knopf „Rätsel“ mit Lupen-Symbol.
- **Tipp-Frage** (nur Spur 1, Feld `tipp`): nach dem Brett eine dunkle Karte mit der Frage und drei Antwortkarten. Antippen = gemerkt (`stand.tipps[nr] = id`), kein richtig/falsch. Dann Haken.
- **Tipp-Auflösung:** nach dem Lesen der **nächsten** Spur (Spur 2), vor dem Rätsel: Karte mit der Lese-Raupe. War der Tipp gleich `tipp.richtig`: `ui.tippRichtig` + `tipp.aufloesung` und +1 Perle. Sonst: `ui.tippFalsch` + `tipp.aufloesung`. Ein Knopf „Weiter“.
- **Haken:** wie v7 (dunkel, Raupe, Satz `haken`, Knopf „Weiterlesen ›“).
- Speichern nach jedem Schritt; beim Öffnen immer der Titel mit „Weiter ermitteln“ (wie v7).
- Kopfzeile wie v7, aber: links Knopf „Brett“ (öffnet das Brett als Überlagerung, nur ansehen), Mitte „Spur N / Kapitel 1 · Titel“, rechts Perlen und „Aa“ (Schrift, Silben, Von vorn beginnen). **Kein Notizbuch.**

## 4. Die sechs Rätsel

Gemeinsamer Rahmen (wie der „Zug“-Bildschirm in v7): dunkler Hintergrund mit Lampe, gelber Reiter „Rätsel“, Titel, Aufgabentext, Spielfläche, darunter Sprechblase der Lese-Raupe, unten der Knopf. Ist das Rätsel gelöst: Raupe sagt `erfolg`, Knopf „Weiter“. Jede Funktion bekommt `(rahmen: HTMLElement, daten, fertig: () => void)`.

Zähle Fehler **pro Teilaufgabe**: 1. Fehler → Wackeln + Raupe sagt `ui.nochmal`; 2. Fehler → Raupe sagt `ui.hilfe` und die richtige Lösung wird gezeigt (kurz hervorgehoben), dann weiter.

### 4.1 `buchstaben` (Spur 1)
Runde für Runde: großes Bild, darunter die Buchstaben aus `buchstaben` als lose Kärtchen (leicht gedreht, in der gegebenen Reihenfolge), darunter leere Felder in der Länge von `wort`. Zwei große Knöpfe mit Raupen-Gesicht: **„Das Wort passt“** (`fig('raupe/lacht')`) und **„Das Wort passt nicht“** (`fig('raupe/traurig')`).
- Richtig beantwortet und `passt: true`: die Kärtchen fliegen in die Felder und bilden das Wort.
- Richtig beantwortet und `passt: false`: die Kärtchen fliegen, ein Feld bleibt leer oder ein Kärtchen bleibt übrig und wackelt; Raupe sagt `warum`.
- Falsch beantwortet: Regel „zweiter Versuch“ (bei zwei Knöpfen heißt das: nach dem ersten Fehler zeigt die Raupe gleich die Auflösung wie oben).
Fortschritt als Punkte (4 Runden).

### 4.2 `unterschiede` (Spur 2)
Zwei Bilder: oben „Vorhin“, unten „Jetzt“ (ab 900 px Breite nebeneinander). Beide: `img(basis)` als Hintergrund im Seitenverhältnis 3:2, darüber die `dinge` als absolut gesetzte `<img>` (Mitte bei `x`/`y` Prozent, Breite `w` Prozent), sichtbar je nach `vorhin`/`jetzt`.
Antippen in **einem der beiden Bilder**: Treffer, wenn der Punkt im Rechteck eines noch nicht gefundenen Dings liegt (Rechteck = Bildfläche des Dings, an jeder Seite um 4 % der Bildbreite vergrößert). Treffer: gelber Ring an derselben Stelle in beiden Bildern, Zähler „2 / 4 gefunden“. Daneben: kleiner grauer Ring, der verschwindet. Nach 3 Fehltipps in Folge sagt die Raupe den `tipp` eines noch offenen Dings. Nach 3 weiteren zeigt sie es (Ring blinkt, zählt als gefunden).

### 4.3 `versteckt` (Spur 3)
Ein quadratisches SVG (`zeichnen.ts → versteckterBuchstabe`, Code unten): Fläche voller schräger Linien, im Umriss des Buchstabens laufen die Linien in einem anderen Winkel. Darunter vier Buchstaben-Kacheln (`optionen`). Antippen: richtig → der Buchstabe im Bild wird mit Senf-Gelb gefüllt; falsch → Regel „zweiter Versuch“ (danach zeigt die Raupe den Buchstaben).
Zusatz für die Hand: mit Finger oder Maus über das Bild fahren zeichnet eine helle Spur (einfaches Canvas darüber, `globalAlpha .5`), damit das Kind den Umriss nachfahren kann. Rein zum Spielen, wird nicht geprüft.

### 4.4 `merkmale` (Spur 4)
Drei Phasen:
1. **Staub:** Das Bild `vorne` liegt unter einer Staubschicht (`staub.ts`). Wischen, bis mehr als die Hälfte frei ist; dann verschwindet der Rest.
2. **Prüfen:** Oben das Ding (groß), daneben Knopf „Umdrehen“ (tauscht `vorne`/`hinten` mit einer Dreh-Animation; auch waagerechtes Wischen über das Ding dreht). Darunter **eine** Merkmal-Karte nach der anderen mit drei Knöpfen: `ui.mPasst`, `ui.mFehlt`, `ui.mUnklar`.
   - Richtig ist `wert`, **wenn die Seite `seite` gerade zu sehen ist**.
   - Ist die verlangte Seite nicht zu sehen und das Kind tippt „sieht man noch nicht“: das ist richtig gedacht → Raupe sagt `unklarTipp`, der Knopf „Umdrehen“ pulsiert; die Karte bleibt, bis nach dem Umdrehen `wert` gewählt ist.
   - Erledigte Merkmale stehen als kleine Zeilen mit ihrem Ergebnis unter der Karte.
3. **Stempel:** Ein Stempel (runder Griff, Text `stempel`) erscheint. Auf das Ding ziehen **oder** Knopf „Stempeln“: Abdruck mit Animation (wie `.stempel` in v7), kurze Vibration `navigator.vibrate?.(40)`.

### 4.5 `reihe` (Spur 5)
Vier Bildkarten mit Unterschrift in der gegebenen (gemischten) Reihenfolge, darüber vier nummerierte Plätze. Karte auf einen Platz ziehen; **oder** Karte antippen, dann Platz antippen. Karte von einem Platz zurücknehmen durch Antippen. Sind alle Plätze belegt: Knopf „Fertig“. Prüfung: richtige Karten bleiben, falsche wackeln und gehen zurück (zweiter Versuch); beim zweiten Fehler legt die Raupe die restlichen Karten.

### 4.6 `ausschluss` (Spur 6, großes Rätsel)
Sechs Karten in zwei Reihen: Pulli als SVG (`zeichnen.ts → pulliSvg`, Code unten) und Name. Oben eine Hinweis-Karte (`hinweise[i].text`, Zähler „Hinweis 1 von 4“) und der Satz `ui.raus`.
- Das Kind tippt alle Karten an, die **nicht** passen (Auswahl = gelber Rand, noch einmal antippen = abwählen), dann Knopf „Fertig“.
- Auswahl genau gleich `raus`: die Karten werden durchgestrichen (zwei dunkle Linien als Kreuz), verblassen und bleiben klein liegen. Nächster Hinweis.
- Sonst: Regel „zweiter Versuch“; danach streicht die Raupe die richtigen.
- Schon gestrichene Karten sind nicht mehr antippbar.
- Nach dem letzten Hinweis: die übrige Karte wächst in die Mitte, `ui.bleibt` + Name, Stempel `stempel` (wie 4.4 Phase 3).
Die Reihenfolge der Karten wird einmal beim Start gemischt (im Zustand merken), die Hinweise nicht.

## 5. Brett (nach jedem Rätsel)

Ein Bildschirm ohne Rollen (bei 360×640 muss alles sichtbar sein), Kork-Hintergrund wie `.akte` in v7:

- oben: Reiter „Dein Ermittlungsbrett“, rechts „+2 Schimmer-Perlen“;
- **Spurenkarten:** Raster 3×2 mit sechs Plätzen. Jede gelöste Spur hat eine Karte (`karte.bild`, optional `karte.ausschnitt` wie in v7 beim „Blick“, darunter `karte.text` in kleiner Schrift, höchstens 3 Zeilen, sonst mit `…` gekürzt; Antippen zeigt die Karte groß). Leere Plätze sind gestrichelt.
- **Die neue Karte liegt unter Staub** und `ui.wisch` steht darüber. Erst nach dem Wegwischen (`staub.ts`) erscheint der Knopf „Weiter“.
- **Offene Fragen:** höchstens vier gelbe Zettel (wie `.zettel.fr` in v7) in einer Reihe 2×2. Neue (`fragenNeu`) erscheinen nach dem Wischen mit Marke „neu“. Zettel aus `fragenWeg` muss das Kind **selbst abnehmen**: sie wackeln leicht, Antippen → Stempel „geklärt“ und der Zettel fällt weg.
- **Code:** vier Felder für `NEST`, leer bis zur Fallkarte.

## 6. Fallkarte (Ende des Kapitels)

Nach dem Brett von Spur 6: große helle Karte auf dunklem Grund: Reiter „Kapitel 1“, `fallkarte.titel`, Bild, die `saetze` als Liste, darunter `frage` hervorgehoben. Knopf „Stempeln“ → Stempel `fallkarte.stempel` auf die Karte. Danach fällt der Buchstabe `code.buchstabe` unter einer kleinen Staubschicht in sein Feld (`code.pos`, 0-basiert) der vier Code-Felder; Wegwischen zeigt ihn. Text „Der Code für den Mondtresor“ (`ui.code`). Dann Knopf „Weiter“ → dunkler Bildschirm mit `ausblick` und `ui.fortsetzung`, Knopf „Von vorn beginnen“ (leise).

## 7. Perlen

+2 Perlen je gelöstem Rätsel (einmal je Spur), +1 für einen richtigen Tipp. Anzeige in der Kopfzeile wie v7. Kein Laden, keine Garderobe in diesem Auftrag.

## 8. Code-Vorlagen (`zeichnen.ts`)

```ts
export type Pulli = { muster: 'einfarbig' | 'quer' | 'laengs' | 'punkte'; farbe: string; farbe2?: string; kapuze: boolean; knoepfe: boolean };

/** Pulli als Papier-Ausschnitt. id muss je Karte eindeutig sein (Muster-IDs). */
export function pulliSvg(p: Pulli, id: string): string {
  const f2 = p.farbe2 ?? '#FFFFFF';
  const streifen = (dreh: number) => `<pattern id="${id}-${dreh}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="18" height="18" fill="${f2}"/><rect width="18" height="9" fill="${p.farbe}"/></pattern>`;
  let defs = '', rumpf = p.farbe, links = p.farbe, rechts = p.farbe;
  if (p.muster === 'quer') { defs = streifen(0) + streifen(28) + streifen(-28); rumpf = `url(#${id}-0)`; links = `url(#${id}-28)`; rechts = `url(#${id}--28)`; }
  if (p.muster === 'laengs') { defs = streifen(90) + streifen(118) + streifen(62); rumpf = `url(#${id}-90)`; links = `url(#${id}-118)`; rechts = `url(#${id}-62)`; }
  if (p.muster === 'punkte') { defs = `<pattern id="${id}-p" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${p.farbe}"/><circle cx="9" cy="9" r="3.5" fill="${f2}"/></pattern>`; rumpf = links = rechts = `url(#${id}-p)`; }
  const rand = 'stroke="#3A2F25" stroke-width="3" stroke-linejoin="round"';
  const kapuze = p.kapuze ? `<path d="M66 44 Q100 -8 134 44 Q100 26 66 44 Z" fill="${rumpf}" ${rand}/>` : '';
  const knopf = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="4" fill="#FFF8E6" stroke="#3A2F25" stroke-width="2"/>`;
  const knoepfe = p.knoepfe ? knopf(30, 112) + knopf(38, 100) + knopf(46, 88) + knopf(170, 112) + knopf(162, 100) + knopf(154, 88) : '';
  return `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>
    ${kapuze}
    <path d="M60 42 L16 122 L44 136 L74 84 Z" fill="${links}" ${rand}/>
    <path d="M140 42 L184 122 L156 136 L126 84 Z" fill="${rechts}" ${rand}/>
    <path d="M60 42 L140 42 L150 176 L50 176 Z" fill="${rumpf}" ${rand}/>
    <path d="M80 42 Q100 62 120 42" fill="#FFF8E6" ${rand}/>
    <path d="M16 122 L44 136" stroke="#3A2F25" stroke-width="7" stroke-linecap="round"/>
    <path d="M184 122 L156 136" stroke="#3A2F25" stroke-width="7" stroke-linecap="round"/>
    ${knoepfe}</svg>`;
}

/** Buchstabe, der sich in Linien versteckt: außen laufen die Linien senkrecht, im Buchstaben um `winkel` Grad gedreht. */
export function versteckterBuchstabe(buchstabe: string, winkel: number, farbe: string, id: string, gefunden = false): string {
  const linien = (pid: string, dreh: number) => `<pattern id="${pid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(${dreh})"><rect width="9" height="9" fill="#EAF3FB"/><rect width="3.4" height="9" fill="${farbe}"/></pattern>`;
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Linienbild"><defs>${linien(id + '-a', 0)}${linien(id + '-b', winkel)}</defs>
    <rect width="300" height="300" rx="18" fill="url(#${id}-a)"/>
    <text x="150" y="238" text-anchor="middle" font-family="'Inter Schule', system-ui, sans-serif" font-weight="800" font-size="250" fill="${gefunden ? '#F4C243' : `url(#${id}-b)`}">${buchstabe}</text></svg>`;
}
```

Die Pulli-Zeichnung nach dem ersten Bild prüfen: Rumpf, zwei Ärmel, Kragen, bei `kapuze` eine Kapuze hinter dem Kragen, bei `knoepfe` drei Knöpfe an jedem Ärmel. Wenn etwas schief aussieht, die Pfade anpassen – die vier Muster und die zwei Schalter müssen klar unterscheidbar bleiben.

## 9. Staub (`staub.ts`)

Aus der alten App übernehmen: `app/src/main.ts`, Funktion `staub(box, fertig)` (etwa Zeilen 438–476) samt Pinsel-Symbol; als Modul mit `export function staub(box: HTMLElement, fertig: () => void)`. Die zugehörigen Stile (`.staub`, `.brush`) aus `app/src/styles.css` nach `v8.css` kopieren. Mit Maus und Finger prüfen.

## 10. Prüfen (`e2e-v8.mjs`)

Playwright wie in `e2e-v7.mjs` (kein `playwright install`; `require('playwright')`). Vorher `npm run build` und `npx vite preview --port 4173`.

- Für Tests stellt die App `window.__v8 = { stand, D, loese() }` bereit. `loese()` löst das **aktuelle** Rätsel oder die aktuelle Wisch-Fläche sofort (ruft dieselbe Abschluss-Funktion wie das echte Spiel).
- Der Durchlauf spielt Kapitel 1 vom Titel bis „Fortsetzung folgt“: echte Klicks für Knöpfe und Tipp-Rätsel (4.1, 4.3, 4.6: richtige Antworten aus den Daten; in 4.6 beim ersten Hinweis einmal absichtlich falsch → zweiter Versuch), `loese()` für Wischen, Ziehen und 4.2.
- Bilder von jedem Bildschirm; zwei Läufe: `390 844 telefon` und `1280 800 rechner`.
- Nach jedem Bild messen: `document.documentElement.scrollWidth <= innerWidth` und kein Element in `#app` ragt seitlich hinaus (wie `messen()` in v7; Lampe und Bildausschnitte ausgenommen). Konsolenfehler und Seitenfehler sammeln. Bei Befunden mit Fehlercode enden.

## 11. Abgabe

- `npm run build` läuft ohne Fehler (enthält `tsc --noEmit`), beide Durchläufe sind grün.
- **Nicht committen und nicht pushen.** Keine Dateien außerhalb der Liste in Abschnitt 1 ändern, außer `vite.config.ts`, `package.json`, `src/data.ts` (nur Glob-Liste) und `04_data/silben_kapitel1.txt` (nur durch `--neue-woerter`).
- Bericht (kurz): was gebaut ist; welche Punkte dieses Plans **nicht** oder anders umgesetzt sind und warum; die Liste der neu angehängten Silbenwörter; die Pfade von 8–10 aussagekräftigen Bildern aus `03_screens/v8/telefon/` und 3 aus `03_screens/v8/rechner/`.
