import type { CapacitorConfig } from '@capacitor/cli';

const remoteAppUrl = process.env.CAP_SERVER_URL?.trim() || 'https://karaads.com';
const remoteHost = new URL(remoteAppUrl).hostname;

const config: CapacitorConfig = {
  appId: 'com.karaads.app',
  appName: 'KaraAds',
  webDir: 'public/build',
  bundledWebRuntime: false,
  server: {
    url: remoteAppUrl,
    cleartext: remoteAppUrl.startsWith('http://'),
    allowNavigation: [remoteHost, `www.${remoteHost}`],
  },
};

export default config;
