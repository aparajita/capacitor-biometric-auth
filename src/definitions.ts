declare module '@capacitor/core' {
  interface PluginRegistry {
    WSBiometricAuth: WSBiometricAuthPlugin
  }
}

import { PluginResultError } from '@capacitor/core'

export enum BiometryType {
  /**
   * No biometry is available
   */
  NONE,

  /**
   * iOS Touch ID is available
   */
  TOUCH_ID,

  /**
   * iOS Face ID is available
   */
  FACE_ID,

  /**
   * Android fingerprint authentication is available
   */
  FINGERPRINT,

  /**
   * Android face authentication is available
   */
  FACE_AUTHENTICATION,

  /**
   * Android iris authentication is available
   */
  IRIS_AUTHENTICATION
}

export const biometryTypeNameMap = {
  [BiometryType.NONE]: '',
  [BiometryType.TOUCH_ID]: 'Touch ID',
  [BiometryType.FACE_ID]: 'Face ID',
  [BiometryType.FINGERPRINT]: 'Fingerprint Authentication',
  [BiometryType.FACE_AUTHENTICATION]: 'Face Authentication',
  [BiometryType.IRIS_AUTHENTICATION]: 'Iris Authentication'
}

export interface BiometricOptions {
  /**
   * iOS only
   *
   * The reason for requesting authentication. Displays in the authentication dialog presented to the user. Default: "Access requires authentication"
   */
  reason?: string

  /**
   * iOS only
   *
   * The system presents a fallback button when biometric authentication fails
   * — for example, because the system doesn’t recognize the presented finger,
   * or after several failed attempts to recognize the user’s face. Tapping
   * the button lets the user revert to authentication using the device passcode
   * or password instead.
   *
   * If undefined, the localized system default title is used. Pass an empty
   * string to hide the fallback button.
   */
  fallbackTitle?: string

  /**
   * iOS only
   *
   * The system presents a cancel button during biometric authentication
   * to let the user abort the authentication attempt. The button appears
   * every time the system asks the user to present a finger registered with
   * Touch ID. For Face ID, the button only appears if authentication fails
   * and the user is prompted to try again. Either way, the user can stop
   * trying to authenticate by tapping the button.
   */
  cancelTitle?: string

  /**
   * Android only
   *
   * Title for the Android prompt. If not supplied, the system default is used.
   */
  title?: string

  /**
   * Android only
   *
   * Subtitle for the Android prompt. If not supplied, the system default is used.
   */
  subtitle?: string

  /**
   * Android only
   *
   * Description for the Android prompt. If not supplied, the system default is used.
   */
  description?: string
}

/**
 * If the verifyIdentity() function throws an exception, the error object
 * contains a .code property which will contain one of these strings,
 * indicating what the error was.
 *
 * See https://developer.apple.com/documentation/localauthentication/laerror
 * for a description of each error code.
 */
export enum BiometryErrorType {
  appCancel = 'appCancel',
  authenticationFailed = 'authenticationFailed',
  invalidContext = 'invalidContext',
  notInteractive = 'notInteractive',
  passcodeNotSet = 'passcodeNotSet',
  systemCancel = 'systemCancel',
  userCancel = 'userCancel',
  userFallback = 'userFallback',
  biometryLockout = 'biometryLockout',
  biometryNotAvailable = 'biometryNotAvailable',
  biometryNotEnrolled = 'biometryNotEnrolled'
}

export interface BiometricResultError extends PluginResultError {
  code: BiometryErrorType
}

export class BiometryError implements BiometricResultError {
  message: string
  code: BiometryErrorType

  constructor(message: string, code: BiometryErrorType) {
    this.message = message
    this.code = code
  }
}

/**
 * If one of the credentials functions throws, the error object will
 * have a .code property that contains one of these values, and the
 * .message will have a message suitable for debug purposes.
 */
export enum CredentialsErrorType {
  notFound = 'notFound',
  missingParameter = 'missingParameter',
  invalidData = 'invalidData',
  osError = 'osError',
  unknownError = 'unknownError'
}

export interface CredentialsResultError extends PluginResultError {
  code: CredentialsErrorType
}

export class CredentialsError implements CredentialsResultError {
  message: string
  code: CredentialsErrorType

  constructor(message: string, code: CredentialsErrorType) {
    this.message = message
    this.code = code
  }
}

export interface Credentials {
  username: string
  password: string
}

export interface CredentialsServer {
  /**
   * The domain name under which the credentials are stored.
   */
  server: string
}

export type GetCredentialsOptions = CredentialsServer
export type SetCredentialsOptions = Credentials & CredentialsServer
export type DeleteCredentialsOptions = CredentialsServer

export interface AvailableResult {
  /**
   * True if the device has biometric authentication capability
   * and the current user has enrolled.
   */
  isAvailable: boolean

  /**
   * The type of biometry available on the device.
   */
  biometryType: BiometryType
}

export interface WSBiometricAuthPlugin {
  /**
   * Check the device's availability and type of biometric authentication.
   */
  isAvailable(): Promise<AvailableResult>

  /**
   * Prompt the user for biometric authorization.
   *
   * @param {BiometricOptions} options
   * @returns {Promise<void>}
   * @rejects {BiometryError}
   */
  verifyIdentity(options?: BiometricOptions): Promise<void>

  /**
   * Retrieve username/password for a given domain name from the secure system store.
   *
   * @param {GetCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  getCredentials(options: GetCredentialsOptions): Promise<Credentials>

  /**
   * Store username/password under a given domain name in the secure system store.
   *
   * @param {SetCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  setCredentials(options: SetCredentialsOptions): Promise<void>

  /**
   * Delete username/password for a given domain name from the secure system store.
   *
   * @param {DeleteCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  deleteCredentials(options: DeleteCredentialsOptions): Promise<void>
}
