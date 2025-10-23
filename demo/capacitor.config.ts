// / <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.aparajita.capacitor.biometricauthdemo',
  appName: 'Biometry',
  loggingBehavior: 'debug',
  server: {
    androidScheme: 'http',
  },
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
    StatusBar: {
      backgroundColor: '#ffffff', // or your app's primary color
      style: 'DARK', // or 'LIGHT' depending on your app theme
      overlaysWebView: false, // ensures content doesn't go under status bar
    },
  },
}

export default config
