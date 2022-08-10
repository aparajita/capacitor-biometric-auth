import { BiometricAuthBase } from './base'
import type { AuthenticateOptions, CheckBiometryResult } from './definitions'
import { BiometryType } from './definitions'

// eslint-disable-next-line import/prefer-default-export
export class BiometricAuthNative extends BiometricAuthBase {
  async checkBiometry(): Promise<CheckBiometryResult> {
    // Never used, satisfy the compiler
    return Promise.resolve({
      isAvailable: true,
      biometryType: BiometryType.none,
      reason: ''
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async authenticate(options?: AuthenticateOptions): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async setBiometryType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: BiometryType | string | undefined
  ): Promise<void> {
    throw this.unimplemented('setBiometryType is web only')
  }
}
