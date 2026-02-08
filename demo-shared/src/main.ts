/* eslint-disable import-x/order */
import { Capacitor } from '@capacitor/core'
import { IonicVue } from '@ionic/vue'
import { createApp } from 'vue'
import App from './app.vue'

// Core CSS required for Ionic components to work properly
// oxlint-disable no-unassigned-import
import '@ionic/vue/css/core.css'

// Basic CSS for apps built with Ionic
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/padding.css'

// Dark mode support
import '@ionic/vue/css/palettes/dark.system.css'

/* Custom CSS */
import './assets/css/styles.pcss'

// oxlint-enable no-unassigned-import
/* eslint-enable import-x/order */

import router from './router'

const config: Record<string, unknown> = {}

if (Capacitor.getPlatform() === 'web') {
  config.mode = 'ios'
}

const app = createApp(App).use(IonicVue, config).use(router)

;(async (): Promise<void> => {
  try {
    await router.isReady()
    app.mount('#app')
  } catch (error) {
    console.error(error)
  }
})()
