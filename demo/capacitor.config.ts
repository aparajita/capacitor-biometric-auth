// / <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.aparajita.capacitor.biometricauthdemo',
  appName: 'Biometry',
  loggingBehavior: 'debug',
  server: {
    androidScheme: 'http',
  },
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None,
    },
    SplashScreen: {
      launchAutoHide: false,
    },
  },
}

export default config
