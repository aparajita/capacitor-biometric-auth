import { BiometricAuthBase } from './base'
import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  CheckBiometryResult,
} from './definitions'
import { BiometryErrorType, BiometryType } from './definitions'

// eslint-disable-next-line import/prefer-default-export
export class BiometricAuthNative extends BiometricAuthBase {
  constructor(capProxy: BiometricAuthPlugin) {
    super()

    /*
      In order to call native methods and maintain the ability to
      call pure Javascript methods as well, we have to bind the native methods
      to the proxy.

      capProxy is a proxy of an instance of this class, so it is safe
      to cast it to this class.
    */
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const proxy = capProxy as BiometricAuthNative

    /* eslint-disable @typescript-eslint/unbound-method */
    this.checkBiometry = proxy.checkBiometry
    this.internalAuthenticate = proxy.internalAuthenticate
    /* eslint-enable */
  }

  // @native
  override async checkBiometry(): Promise<CheckBiometryResult> {
    // Never used, but we have to satisfy the compiler.
    return Promise.resolve({
      isAvailable: true,
      biometryType: BiometryType.none,
      biometryTypes: [],
      deviceIsSecure: false,
      reason: '',
      code: BiometryErrorType.none,
    })
  }

  // @native
  // On native platforms, this will present the native authentication UI.
  override async internalAuthenticate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: AuthenticateOptions,
  ): Promise<void> {}

  // Web only, used for simulating biometric authentication.
  // eslint-disable-next-line @typescript-eslint/require-await
  override async setBiometryType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: BiometryType | string | undefined,
  ): Promise<void> {
    throw this.unimplemented('setBiometryType() is web only')
  }

  // Web only, used for simulating biometry enrollment.
  // eslint-disable-next-line @typescript-eslint/require-await
  override async setBiometryIsEnrolled(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enrolled: boolean,
  ): Promise<void> {
    throw this.unimplemented('setBiometryEnrolled() is web only')
  }

  // Web only, used for simulating device security.
  // eslint-disable-next-line @typescript-eslint/require-await
  override async setDeviceIsSecure(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSecure: boolean,
  ): Promise<void> {
    throw this.unimplemented('setDeviceIsSecure() is web only')
  }
}
