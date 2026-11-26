import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android-App „Spuren-Raupe“ (bis 26.11.2026 „Lese-Fall“, D-21). Alles offline, ohne SDK, ohne Analyse.
 * appId nach der ersten Veröffentlichung nie mehr ändern – Google Play erkennt die App daran (D-03, D-21).
 * Randlos (targetSdk 36): SystemBars gibt die Ränder als --safe-area-inset-* an das CSS weiter.
 */
const config: CapacitorConfig = {
  appId: 'app.spurenraupe',
  appName: 'Spuren-Raupe',
  webDir: 'dist',
  plugins: {
    SystemBars: { insetsHandling: 'css', style: 'DARK' },
  },
};

export default config;
