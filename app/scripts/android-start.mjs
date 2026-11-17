/**
 * Android startet dist/index.html. Für die App soll die aktuelle Fassung v8 starten:
 * dist/v8.html wird zu dist/index.html (die alte Fassung bleibt im Web-Build unter index.html, nur nicht in der App).
 * Aufruf: npm run android
 */
import { copyFileSync, readFileSync } from 'node:fs';
copyFileSync('dist/v8.html', 'dist/index.html');
const t = readFileSync('dist/index.html', 'utf8').match(/<title>[^<]*<\/title>/)?.[0];
console.log(`✓ dist/index.html = v8 (${t})`);
