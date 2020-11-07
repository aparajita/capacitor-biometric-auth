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
   * The reason for requesting authentication. Displays in the authentication dialog presented to the user.
   * If not supplied, a default message is displayed.
   */
  reason?: string;

  /**
   * iOS:
   * The system presents a cancel button during biometric authentication
   * to let the user abort the authentication attempt. The button appears
   * every time the system asks the user to present a finger registered with
   * Touch ID. For Face ID, the button only appears if authentication fails
   * and the user is prompted to try again. Either way, the user can stop
   * trying to authenticate by tapping the button.
   *
   * Android:
   * The text for the negative button. This would typically be used as a "Cancel" button,
   * but may be also used to show an alternative method for authentication, such as a
   * screen that asks for a backup password.
   *
   * Default: "Cancel"
   */
  cancelTitle?: string;

  /***
   * If true, allows for authentication using device unlock credentials. Default is false.
   *
   * iOS:
   * If biometry is available, enrolled, and not disabled, the system uses that first.
   * After the first Touch ID failure or second Face ID failure, if iosFallbackTitle
   * is not an empty string, a fallback button appears in the authentication dialog.
   * If the user taps the fallback button, the system prompts the user for the device
   * passcode or the user’s password. If iosFallbackTitle is an empty string, no
   * fallback button will appear.
   *
   * If biometry is not available, enrolled and enabled, and a passcode is set,
   * the system immediately prompts the user for the device passcode or user’s password.
   * Authentication fails with the error code passcodeNotSet if the device passcode isn’t enabled.
   *
   * If a passcode is not set on the device, a passcodeNotSet error is returned.
   *
   * The system disables passcode authentication after 6 unsuccessful attempts, with progressively
   * increasing delays between attempts.
   *
   * The title of the fallback button may be customized by setting iosFallbackTitle to
   * a non-empty string.
   *
   * Android:
   * The user will first be prompted to authenticate with biometrics, but also given
   * the option to authenticate with their device PIN, pattern, or password by tapping
   * a button in the authentication dialog. The title of the button is supplied by
   * the system.
   */
  allowDeviceCredential?: boolean;

  /**
   * The system presents a fallback button when biometric authentication fails
   * — for example, because the system doesn’t recognize the presented finger,
   * or after several failed attempts to recognize the user’s face.
   *
   * If allowDeviceCredential is false, tapping this button dismisses the
   * authentication dialog and returns the error code userFallback. If undefined,
   * the localized systetm default title is used. Passing an empty string
   * hides the fallback button completely.
   *
   * If allowDeviceCredential is true and this is undefined,
   * the localized system default title is used.
   */
  iosFallbackTitle?: string;

  /**
   * Title for the Android dialog. If not supplied, the system default is used.
   */
  androidTitle?: string;

  /**
   * Subtitle for the Android dialog. If not supplied, the system default is used.
   */
  androidSubtitle?: string;

  /**
   * The maximum number of failed biometric verification attempts before
   * returning BiometryError.authenticationFailed. The default is 3.
   */
  androidMaxAttempts?: number;
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
  noDeviceCredential = 'noDeviceCredential',
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
 * have a code property that contains one of these values, and the
 * message property will have a message suitable for debug purposes.
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
   * If not specified, it defaults to the app's appId.
   */
  domain?: string;
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

  /**
   * If biometry is not available and the system gives a reason why,
   * it will be returned here. Otherwise it's an empty string.
   */
  reason: string;
}

/**
 * The signature of the callback passed to addResumeListener().
 */
export type ResumeListener = (info: CheckBiometryResult) => void;

export interface WSBiometricAuthPlugin {
  /**
   * Check to see what biometry type (if any) is available.
   * For testing on the web, a BiometryType name (case-sensitive)
   * may be specified as an environment variable. For example:
   *
   * WS_BIOMETRY_TYPE=touchId
   */
  checkBiometry(): Promise<CheckBiometryResult>;

  /**
   * Prompt the user for authentication. If authorization fails for any reason,
   * the promise is rejected with a BiometryError.
   *
   * @param {VerifyOptions} options
   * @returns {Promise<void>}
   * @rejects {BiometryError}
   */
  authenticate(options?: VerifyOptions): Promise<void>;

  /**
   * Store username/password under a given domain name in the secure system store.
   *
   * @param {SetCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  setCredentials(options: SetCredentialsOptions): Promise<void>;

  /**
   * Retrieve the username/password for a given domain name from the secure system store.
   *
   * @param {GetCredentialsOptions} options
   * @returns {Promise<Credentials>}
   * @rejects {CredentialsResultError}
   */
  getCredentials(options?: GetCredentialsOptions): Promise<Credentials>;

  /**
   * Delete username/password for a given domain name from the secure system store.
   *
   * @param {DeleteCredentialsOptions} options
   * @returns {Promise<void>}
   * @rejects {CredentialsResultError}
   */
  deleteCredentials(options?: DeleteCredentialsOptions): Promise<void>;
}

/**
 * Return a human-readable name for a BiometryType.
 *
 * @param {BiometryType} type
 * @returns {string}
 */
declare function getBiometryName(type: BiometryType): string;

/**
 * Register a function that will be called when the app resumes.
 * The function will be passed the result of checkBiometry().
 *
 * @param {WSBiometricAuthPlugin} auth
 * @param {ResumeListener} listener
 * @returns {boolean} true if the listener is successfully added
 */
declare function addResumeListener(
  auth: WSBiometricAuthPlugin,
  listener: ResumeListener,
): boolean;
