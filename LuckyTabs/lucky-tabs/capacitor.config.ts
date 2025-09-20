// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabsy.app',
  appName: 'Tabsy',
  webDir: 'build',
  server: {
    // Keep this false for production builds.
    // For live-reload dev you can point to a local dev server later.
    androidScheme: 'https'
  }
};

export default config;