import { BiometricAuthBase } from './base'
import type { AuthenticateOptions, CheckBiometryResult } from './definitions'
import { BiometryError, BiometryErrorType, BiometryType } from './definitions'
import { getBiometryName } from './web-utils'

// eslint-disable-next-line import/prefer-default-export
export class BiometricAuthWeb extends BiometricAuthBase {
  private biometryType = BiometryType.none

  async checkBiometry(): Promise<CheckBiometryResult> {
    return Promise.resolve({
      isAvailable: this.biometryType !== BiometryType.none,
      biometryType: this.biometryType,
      biometryTypes: [],
      reason: '',
      code: BiometryErrorType.none,
    })
  }

  async authenticate(options?: AuthenticateOptions): Promise<void> {
    return this.checkBiometry().then(({ isAvailable, biometryType }) => {
      if (isAvailable) {
        if (
          // eslint-disable-next-line no-alert
          confirm(
            options?.reason ??
              `Authenticate with ${getBiometryName(biometryType)}?`,
          )
        ) {
          return
        }

        throw new BiometryError('User cancelled', BiometryErrorType.userCancel)
      }

      throw new BiometryError(
        'Biometry not available',
        BiometryErrorType.biometryNotAvailable,
      )
    })
  }

  async setBiometryType(
    type: BiometryType | string | undefined,
  ): Promise<void> {
    if (typeof type === 'undefined') {
      return Promise.resolve()
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

    return Promise.resolve()
  }
}
