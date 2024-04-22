import { App } from '@capacitor/app'
import { CapacitorException, WebPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  CheckBiometryResult,
  ResumeListener,
  BiometryType,
  BiometryErrorType,
} from './definitions'
import { BiometryError } from './definitions'

export abstract class BiometricAuthBase
  extends WebPlugin
  implements BiometricAuthPlugin
{
  // Web only, used for simulating biometric authentication.
  abstract setBiometryType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: BiometryType | string | Array<BiometryType | string> | undefined,
  ): Promise<void>

  abstract checkBiometry(): Promise<CheckBiometryResult>

  // Web only, used for simulating biometry enrollment.
  abstract setBiometryIsEnrolled(enrolled: boolean): Promise<void>

  // Web only, used for simulating device security.
  abstract setDeviceIsSecure(isSecure: boolean): Promise<void>

  async authenticate(options?: AuthenticateOptions): Promise<void> {
    try {
      await this.internalAuthenticate(options)
    } catch (error) {
      // error will be an instance of CapacitorException on native platforms,
      // an instance of BiometryError on the web.
      if (error instanceof CapacitorException) {
        throw new BiometryError(
          error.message,
          error.code as unknown as BiometryErrorType,
        )
      } else {
        throw error
      }
    }
  }

  protected abstract internalAuthenticate(
    options?: AuthenticateOptions,
  ): Promise<void>

  async addResumeListener(
    listener: ResumeListener,
  ): Promise<PluginListenerHandle> {
    return App.addListener('appStateChange', ({ isActive }): void => {
      if (isActive) {
        this.checkBiometry()
          .then((info: CheckBiometryResult) => {
            listener(info)
          })
          .catch(console.error)
      }
    })
  }
}
