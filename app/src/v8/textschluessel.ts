/**
 * Schlüssel in den Rätsel- und Kapiteldaten (04_data/kapitelN_v8_raetsel.json), deren Texte Silben bekommen.
 * EINE Liste für beide Seiten: build-v8.ts markiert diese Texte (Sil|ben), main.ts macht daraus HTML mit Silbenfarben (T).
 * Fehlt ein Schlüssel auf einer Seite, steht im Spiel ein sichtbares „|“ oder die Silben fehlen.
 * Neuer Text-Schlüssel in den Daten → nur hier eintragen.
 */
export const TEXT_SCHLUESSEL: readonly string[] = [
  // Brett, Fallkarte, Kapitel
  'text', 'titel', 'haken', 'frage', 'aufloesung', 'warum', 'warum2', 'tipp', 'erfolg', 'unklarTipp', 'vorspann', 'ausblick',
  'name', 'saetze', 'fund', 'hilfe',
  // Raupe und Rückmeldungen in den Spielen
  'raupeSagt', 'raupeKurz', 'nein', 'nachLaub', 'liste', 'zuViel', 'nochMehr', 'falsch', 'ok', 'knapp', 'frueh',
  // Spiel-Texte
  'wortText', 'plakatFertig', 'start', 'regel', 'frageRaus', 'unklar', 'suche', 'nass', 'frage1', 'frage2', 'tipp1',
  'unter', 'sagt', 'klebt', 'nicht', 'nachsehen', 'absatz', 'demo', 'jetzt', 'bedeutung',
  'hinweisText', 'beispiel', 'botschaft', 'nachricht',
];
