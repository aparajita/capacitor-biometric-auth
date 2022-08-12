import { registerPlugin } from '@capacitor/core'
import type { BiometricAuthPlugin } from './definitions'
import info from './info.json'

console.log(`loaded ${info.name} v${info.version}`)

const proxy = registerPlugin<BiometricAuthPlugin>('BiometricAuthNative', {
  web: async () =>
    import('./web').then((module) => new module.BiometricAuthWeb()),
  ios: async () =>
    import('./native').then((module) => new module.BiometricAuthNative(proxy)),
  android: async () =>
    import('./native').then((module) => new module.BiometricAuthNative(proxy))
})

export * from './definitions'
export * from './web-utils'
export { proxy as BiometricAuth }
