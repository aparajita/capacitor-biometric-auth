import { App } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { CapacitorException, WebPlugin } from '@capacitor/core'

import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  BiometryType,
  CheckBiometryResult,
  ResumeListener,
} from './definitions'
import { BiometryError, isBiometryErrorType } from './definitions'

export abstract class BiometricAuthBase
  extends WebPlugin
  implements BiometricAuthPlugin
{
  // Web only, used for simulating biometric authentication.
  abstract setBiometryType(
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
      throw error instanceof CapacitorException &&
        isBiometryErrorType(error.code)
        ? new BiometryError(error.message, error.code)
        : error
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
        ;(async (): Promise<void> => {
          try {
            const info = await this.checkBiometry()
            listener(info)
          } catch (error: unknown) {
            console.error(error)
          }
        })()
      }
    })
  }
}
