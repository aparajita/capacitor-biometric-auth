import { registerPlugin } from '@capacitor/core'

import type { BiometricAuthPlugin } from './definitions.js'

const proxy = registerPlugin<BiometricAuthPlugin>('BiometricAuthNative', {
  web: async () => {
    const module = await import('./web.js')
    return new module.BiometricAuthWeb()
  },
  ios: async () => {
    const module = await import('./native.js')
    return new module.BiometricAuthNative(proxy)
  },
  android: async () => {
    const module = await import('./native.js')
    return new module.BiometricAuthNative(proxy)
  },
})

export * from './definitions.js'
export * from './web-utils.js'
export { proxy as BiometricAuth }
