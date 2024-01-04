import { BiometricAuthBase } from './base'
import type { AuthenticateOptions, CheckBiometryResult } from './definitions'
import { BiometryError, BiometryErrorType, BiometryType } from './definitions'
import { getBiometryName } from './web-utils'

// eslint-disable-next-line import/prefer-default-export
export class BiometricAuthWeb extends BiometricAuthBase {
  private biometryType = BiometryType.none
  private biometryTypes: BiometryType[] = []
  private biometryIsEnrolled = false
  private deviceIsSecure = false

  // On the web, return the fake biometry set by setBiometryType().
  override async checkBiometry(): Promise<CheckBiometryResult> {
    const hasBiometry = this.biometryType !== BiometryType.none
    const available = hasBiometry && this.biometryIsEnrolled
    let reason = ''
    let code = BiometryErrorType.none

    if (!hasBiometry) {
      reason = 'No biometry is available'
      code = BiometryErrorType.biometryNotAvailable
    } else if (!this.biometryIsEnrolled) {
      reason = 'Biometry is not enrolled'
      code = BiometryErrorType.biometryNotEnrolled
    }

    return Promise.resolve({
      isAvailable: available,
      strongBiometryIsAvailable:
        this.biometryIsEnrolled && this.hasStrongBiometry(),
      biometryType: this.biometryType,
      biometryTypes: this.biometryTypes,
      deviceIsSecure: this.deviceIsSecure,
      reason,
      code,
    })
  }

  private hasStrongBiometry(): boolean {
    return this.biometryTypes.some(
      (type) =>
        type === BiometryType.faceId ||
        type === BiometryType.touchId ||
        type === BiometryType.fingerprintAuthentication,
    )
  }

  /* eslint-disable no-alert */

  // On the web, fake authentication with a confirm dialog.
  override async internalAuthenticate(
    options?: AuthenticateOptions,
  ): Promise<void> {
    const result = await this.checkBiometry()

    // First try biometry if available.
    if (result.isAvailable) {
      if (
        confirm(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to use the default value if options?.reason is an empty string
          options?.reason ||
            `Authenticate with ${result.biometryTypes
              .map((type) => getBiometryName(type))
              .join(' or ')}?`,
        )
      ) {
        return
      }
    }

    if (options?.allowDeviceCredential) {
      // Either biometry is not available, or the user declined to use it
      // and device security is allowed.
      if (result.deviceIsSecure) {
        if (confirm('Authenticate with device security?')) {
          return
        } else {
          throw new BiometryError(
            'User cancelled',
            BiometryErrorType.userCancel,
          )
        }
      } else if (result.isAvailable) {
        throw new BiometryError(
          'Device is not secure',
          BiometryErrorType.noDeviceCredential,
        )
      }
    } else if (!result.isAvailable) {
      // Biometry is not available and device security is not allowed.
      if (result.biometryType === BiometryType.none) {
        throw new BiometryError(
          'Biometry is not available',
          BiometryErrorType.biometryNotAvailable,
        )
      } else {
        throw new BiometryError(
          'Biometry is not enrolled',
          BiometryErrorType.biometryNotEnrolled,
        )
      }
    }

    // The user declined to use biometry and device credentials not allowed.
    throw new BiometryError('User cancelled', BiometryErrorType.userCancel)
  }

  // Web only, used for simulating biometric authentication.
  override async setBiometryType(
    type: BiometryType | string | Array<BiometryType | string> | undefined,
  ): Promise<void> {
    if (type === undefined) {
      return Promise.resolve()
    }

    const types = Array.isArray(type) ? type : [type]
    this.biometryTypes = []
    this.biometryType = BiometryType.none

    if (types.length === 0) {
      return Promise.resolve()
    }

    if (isBiometryTypes(types)) {
      this.biometryType = types[0]

      if (this.biometryType !== BiometryType.none) {
        this.biometryTypes = types
      }
    } else {
      for (let i = 0; i < types.length; i++) {
        // eslint-disable-next-line no-prototype-builtins
        if (BiometryType.hasOwnProperty(types[i])) {
          const biometryType =
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            BiometryType[types[i] as keyof typeof BiometryType]

          if (this.biometryType === BiometryType.none) {
            this.biometryTypes = []
          } else {
            this.biometryTypes.push(biometryType)
          }

          if (i === 0) {
            this.biometryType = biometryType
          }
        }
      }
    }

    return Promise.resolve()
  }

  // Web only, used for simulating device unlock security.
  override async setBiometryIsEnrolled(enrolled: boolean): Promise<void> {
    this.biometryIsEnrolled = enrolled
    return Promise.resolve()
  }

  // Web only, used for simulating device unlock security.
  override async setDeviceIsSecure(isSecure: boolean): Promise<void> {
    this.deviceIsSecure = isSecure
    return Promise.resolve()
  }
}

function isBiometryTypes(
  value: Array<string | BiometryType>,
): value is BiometryType[] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.values(BiometryType).includes(value[0] as BiometryType)
}
