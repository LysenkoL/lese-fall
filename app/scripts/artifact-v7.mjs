/**
 * Bereitet die Vorschau v7 für die Veröffentlichung als Artifact vor (nach `npm run build`):
 *   dist/artifact_v7.html  – Einstiegsseite (Fragment)
 *   dist/artifact_v7.json  – Liste der Dateien, die v7 wirklich braucht (JS, CSS, Bilder, Schriften)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const html = readFileSync('dist/v7.html', 'utf8');
const js = html.match(/assets\/v7-[\w-]+\.js/)[0], css = html.match(/assets\/v7-[\w-]+\.css/)[0];
const seen = new Set([js, css]);
const queue = [js, css, ...[...html.matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0])];
while (queue.length) {
  const f = queue.pop();
  if (!existsSync('dist/' + f)) continue;
  seen.add(f);
  if (!/\.(js|css)$/.test(f)) continue;
  const t = readFileSync('dist/' + f, 'utf8');
  for (const m of t.matchAll(/[\w.-]+-[\w-]{8}\.(?:webp|woff2|js|css|png|svg)/g)) { const g = 'assets/' + m[0]; if (!seen.has(g) && existsSync('dist/' + g)) { seen.add(g); queue.push(g); } }
}
writeFileSync('dist/artifact_v7.html', `<title>Lese-Fall Vorschau</title>
<link rel="stylesheet" href="./${css}">
<style>
  :root { --safe-area-inset-top: 0px; --safe-area-inset-bottom: 0px; }
  html, body { height: 100%; margin: 0; background: #141F3F; }
</style>
<div id="app"></div>
<script type="module" src="./${js}"></script>
`);
const files = Object.fromEntries([...seen].sort().map((f) => [f, 'dist/' + f]));
writeFileSync('dist/artifact_v7.json', JSON.stringify(files, null, 1));
console.log(`✓ artifact_v7.html, ${Object.keys(files).length} Dateien`);
