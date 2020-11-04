declare module '@capacitor/core' {
  interface PluginRegistry {
    WSBiometricAuth: WSBiometricAuthPlugin;
  }
}

import { PluginResultError } from '@capacitor/core';

export enum BiometryType {
  /**
   * No biometry is available
   */
  none,

  /**
   * iOS Touch ID is available
   */
  touchId,

  /**
   * iOS Face ID is available
   */
  faceId,

  /**
   * Android fingerprint authentication is available
   */
  fingerprint,

  /**
   * Android face authentication is available
   */
  faceAuthentication,

  /**
   * Android iris authentication is available
   */
  irisAuthentication,
}

export interface VerifyOptions {
  /**
   * iOS only
   *
   * The reason for requesting authentication. Displays in the authentication dialog presented to the user. Default: "Access requires authentication"
   */
  reason?: string;

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
  fallbackTitle?: string;

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
  cancelTitle?: string;

  /**
   * Android only
   *
   * Title for the Android prompt. If not supplied, the system default is used.
   */
  title?: string;

  /**
   * Android only
   *
   * Subtitle for the Android prompt. If not supplied, the system default is used.
   */
  subtitle?: string;

  /**
   * Android only
   *
   * Description for the Android prompt. If not supplied, the system default is used.
   */
  description?: string;
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
  biometryNotEnrolled = 'biometryNotEnrolled',
}

export interface ResultError extends PluginResultError {
  code: BiometryErrorType;
}

export class BiometryError implements ResultError {
  message: string;
  code: BiometryErrorType;

  constructor(message: string, code: BiometryErrorType) {
    this.message = message;
    this.code = code;
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
  unknownError = 'unknownError',
}

export interface CredentialsResultError extends PluginResultError {
  code: CredentialsErrorType;
}

export class CredentialsError implements CredentialsResultError {
  message: string;
  code: CredentialsErrorType;

  constructor(message: string, code: CredentialsErrorType) {
    this.message = message;
    this.code = code;
  }
}

export interface Credentials {
  username: string;
  password: string;
}

export interface CredentialsDomain {
  /**
   * The domain name under which the credentials are stored.
   * You will usually want to use a dotted domain name, e.g. 'myapp.mycompany.com'.
   */
  domain: string;
}

export type GetCredentialsOptions = CredentialsDomain;
export type SetCredentialsOptions = Credentials & CredentialsDomain;
export type DeleteCredentialsOptions = CredentialsDomain;

export interface CheckBiometryResult {
  /**
   * True if the device has biometric authentication capability
   * and the current user has enrolled in biometry.
   */
  isAvailable: boolean;

  /**
   * The type of biometry available on the device.
   */
  biometryType: BiometryType;
}

export interface WSBiometricAuthPlugin {
  /**
   * Check to see what biometry type (if any) is available.
   * For testing on the web, a BiometryType name (case-insensitive)
   * may be specified as an environment variable. For example:
   *
   * WS_BIOMETRY_TYPE=touchid
   */
  checkBiometry(): Promise<CheckBiometryResult>;

  /**
   * If you just want to know if biometry is available, this is simpler to use than checkBiometry().
   */
  biometryIsAvailable(): Promise<boolean>;

  /**
   * Prompt the user for biometric authorization. If authorization fails for any reason,
   * the promise is rejected with a BiometryError.
   *
   * @param {VerifyOptions} options
   * @returns {Promise<void>}
   * @rejects {BiometryError}
   */
  verifyIdentity(options?: VerifyOptions): Promise<void>;

  /**
   * Retrieve the username/password for a given domain name from the secure system store.
   *
   * @param {GetCredentialsOptions} options
   * @returns {Promise<Credentials>}
   * @rejects {CredentialsResultError}
   */
  getCredentials(options: GetCredentialsOptions): Promise<Credentials>;

  /**
   * Store username/password under a given domain name in the secure system store.
   *
   * @param {SetCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  setCredentials(options: SetCredentialsOptions): Promise<void>;

  /**
   * Delete username/password for a given domain name from the secure system store.
   *
   * @param {DeleteCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  deleteCredentials(options: DeleteCredentialsOptions): Promise<void>;
}
