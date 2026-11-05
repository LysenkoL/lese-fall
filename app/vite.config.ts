import { defineConfig } from 'vite';

// base './': gleiche Dateien für Android (Capacitor) und die Web-Vorschau
export default defineConfig({
  base: './',
  server: { fs: { allow: ['..'] } },
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 900 },
});
