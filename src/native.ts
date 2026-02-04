import { BiometricAuthBase } from './base.js'
import type {
  AuthenticateOptions,
  BiometricAuthPlugin,
  CheckBiometryResult,
} from './definitions.js'
import { BiometryErrorType, BiometryType } from './definitions.js'

/* eslint-disable @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await */

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const proxy = capProxy as BiometricAuthNative

    /* eslint-disable @typescript-eslint/unbound-method */
    this.checkBiometry = proxy.checkBiometry
    this.internalAuthenticate = proxy.internalAuthenticate
    /* eslint-enable @typescript-eslint/unbound-method */
  }

  // @native
  override async checkBiometry(): Promise<CheckBiometryResult> {
    // Never used, but we have to satisfy the compiler.
    return {
      isAvailable: false,
      strongBiometryIsAvailable: false,
      biometryType: BiometryType.none,
      biometryTypes: [],
      deviceIsSecure: false,
      reason: '',
      code: BiometryErrorType.none,
      strongReason: '',
      strongCode: BiometryErrorType.none,
    }
  }

  // @native
  // On native platforms, this will present the native authentication UI.
  override async internalAuthenticate(
    _options?: AuthenticateOptions,
  ): Promise<void> {
    // This method is implemented natively
  }

  // Web only, used for simulating biometric authentication.
  override async setBiometryType(
    _type: BiometryType | string | Array<BiometryType | string> | undefined,
  ): Promise<void> {
    console.warn('setBiometryType() is web only')
  }

  // Web only, used for simulating biometry enrollment.
  override async setBiometryIsEnrolled(_enrolled: boolean): Promise<void> {
    console.warn('setBiometryEnrolled() is web only')
  }

  // Web only, used for simulating device security.
  override async setDeviceIsSecure(_isSecure: boolean): Promise<void> {
    console.warn('setDeviceIsSecure() is web only')
  }
}
/* eslint-enable @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await */
