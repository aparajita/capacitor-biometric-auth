import { registerPlugin } from '@capacitor/core'
import { kPluginName } from './definitions'
import type { BiometricAuthPlugin } from './definitions'
import info from './info.json'
import { BiometricAuth } from './web'

console.log(`loaded ${info.name} v${info.version}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new BiometricAuth()

registerPlugin<BiometricAuthPlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

export * from './definitions'
export { plugin as BiometricAuth }
export { getBiometryName } from './web'
