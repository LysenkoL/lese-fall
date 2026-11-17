import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android-App „Lese-Fall: Spur im Text“. Alles offline, ohne SDK, ohne Analyse.
 * appId nie ändern – Google Play erkennt die App daran (D-03).
 * Randlos (targetSdk 36): SystemBars gibt die Ränder als --safe-area-inset-* an das CSS weiter.
 */
const config: CapacitorConfig = {
  appId: 'app.lesefall',
  appName: 'Lese-Fall',
  webDir: 'dist',
  plugins: {
    SystemBars: { insetsHandling: 'css', style: 'DARK' },
  },
};

export default config;
