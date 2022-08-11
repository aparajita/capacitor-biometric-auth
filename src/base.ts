import { App } from '@capacitor/app'
import { WebPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  CheckBiometryResult,
  ResumeListener,
  BiometryType
} from './definitions'

// eslint-disable-next-line import/prefer-default-export
export abstract class BiometricAuthBase
  extends WebPlugin
  implements BiometricAuthPlugin
{
  private readonly proxy: BiometricAuthPlugin

  constructor(plugin: BiometricAuthPlugin) {
    super()
    this.proxy = plugin
  }

  abstract setBiometryType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: BiometryType | string | undefined
  ): Promise<void>

  abstract checkBiometry(): Promise<CheckBiometryResult>

  abstract authenticate(options?: AuthenticateOptions): Promise<void>

  addResumeListener(
    listener: ResumeListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    return App.addListener('appStateChange', ({ isActive }): void => {
      if (isActive) {
        this.proxy
          .checkBiometry()
          .then((info: CheckBiometryResult) => {
            listener(info)
          })
          .catch(console.error)
      }
    })
  }
}
