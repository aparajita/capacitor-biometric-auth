import { registerPlugin } from '@capacitor/core'
import { kPluginName } from './definitions'
import type { BiometricAuthPlugin } from './definitions'
import { name } from './package.json'
import { BiometricAuth } from './web'

console.log(`loaded ${name}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new BiometricAuth()

// eslint-disable-next-line @typescript-eslint/naming-convention
const biometricAuth = registerPlugin<BiometricAuthPlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

export * from './definitions'
export { biometricAuth as BiometricAuth }
export { getBiometryName } from './web'
