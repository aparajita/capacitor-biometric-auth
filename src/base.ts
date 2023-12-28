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

// eslint-disable-next-line import/prefer-default-export
export abstract class BiometricAuthBase
  extends WebPlugin
  implements BiometricAuthPlugin
{
  // Web only, used for simulating biometric authentication.
  abstract setBiometryType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: BiometryType | string | undefined,
  ): Promise<void>

  abstract checkBiometry(): Promise<CheckBiometryResult>

  async authenticate(options?: AuthenticateOptions): Promise<void> {
    try {
      await this.internalAuthenticate(options)
    } catch (error) {
      // error will be an instance of CapacitorException on native platforms,
      // an instance of BiometryError on the web.
      if (error instanceof CapacitorException) {
        throw new BiometryError(
          error.message,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- we are converting from ExceptionCode to BiometryErrorType
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

  addResumeListener(
    listener: ResumeListener,
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
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
