import { registerPlugin } from '@capacitor/core'

import type { BiometricAuthPlugin } from './definitions'

const proxy = registerPlugin<BiometricAuthPlugin>('BiometricAuthNative', {
  web: async () => {
    const module = await import('./web')
    return new module.BiometricAuthWeb()
  },
  ios: async () => {
    const module = await import('./native')
    return new module.BiometricAuthNative(proxy)
  },
  android: async () => {
    const module = await import('./native')
    return new module.BiometricAuthNative(proxy)
  },
})

export * from './definitions'
export * from './web-utils'
export { proxy as BiometricAuth }
