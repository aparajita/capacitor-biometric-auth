import { native } from '@aparajita/capacitor-native-decorator'
import { App } from '@capacitor/app'
import { WebPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  CheckBiometryResult,
  ResumeListener
} from './definitions'
import {
  BiometryError,
  BiometryErrorType,
  BiometryType,
  kPluginName
} from './definitions'

const kBiometryTypeNameMap = {
  [BiometryType.none]: '',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.fingerprintAuthentication]: 'Fingerprint Authentication',
  [BiometryType.faceAuthentication]: 'Face Authentication',
  [BiometryType.irisAuthentication]: 'Iris Authentication'
}

export class BiometricAuth extends WebPlugin implements BiometricAuthPlugin {
  private biometryType: BiometryType = BiometryType.none

  getRegisteredPluginName(): string {
    return kPluginName
  }

  setBiometryType(type: BiometryType | string | undefined): void {
    if (typeof type === 'undefined') {
      return
    }

    if (typeof type === 'string') {
      // eslint-disable-next-line no-prototype-builtins
      if (BiometryType.hasOwnProperty(type)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.biometryType = BiometryType[type as keyof typeof BiometryType]
      }
    } else {
      this.biometryType = type
    }
  }

  @native()
  async checkBiometry(): Promise<CheckBiometryResult> {
    return Promise.resolve({
      isAvailable: this.biometryType !== BiometryType.none,
      biometryType: this.biometryType,
      reason: ''
    })
  }

  @native()
  async authenticate(options?: AuthenticateOptions): Promise<void> {
    return this.checkBiometry().then(({ isAvailable, biometryType }) => {
      if (isAvailable) {
        if (
          // eslint-disable-next-line no-alert
          confirm(
            options?.reason ||
              `Authenticate with ${kBiometryTypeNameMap[biometryType]}?`
          )
        ) {
          return
        }

        throw new BiometryError('User cancelled', BiometryErrorType.userCancel)
      }

      throw new BiometryError(
        'Biometry not available',
        BiometryErrorType.biometryNotAvailable
      )
    })
  }

  addResumeListener(
    listener: ResumeListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    return App.addListener('appStateChange', ({ isActive }): void => {
      if (isActive) {
        this.checkBiometry()
          .then((info: CheckBiometryResult) => {
            listener(info)
          })
          .catch((error: Error) => {
            console.error(error.message)
          })
      }
    })
  }
}

/**
 * Return a human-readable name for a BiometryType.
 *
 * @param {BiometryType} type
 * @returns {string}
 */
export function getBiometryName(type: BiometryType): string {
  return kBiometryTypeNameMap[type] || ''
}
