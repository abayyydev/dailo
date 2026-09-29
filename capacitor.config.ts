import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailo',
  appName: 'Dailo',
  webDir: 'out',
  server: {
    url: 'https://dailo-amber.vercel.app/',
    cleartext: true,
  },
};

export default config;
