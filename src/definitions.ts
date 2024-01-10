// noinspection JSUnusedGlobalSymbols

import type { PluginListenerHandle, WebPlugin } from '@capacitor/core'

/**
 * The type of biometry supported by the device.
 */
export enum BiometryType {
  none,

  /**
   * iOS Touch ID
   */
  touchId,

  /**
   * iOS Face ID
   */
  faceId,

  /**
   * Android fingerprint authentication
   */
  fingerprintAuthentication,

  /**
   * Android face authentication
   */
  faceAuthentication,

  /**
   * Android iris authentication
   */
  irisAuthentication,
}

export enum AndroidBiometryStrength {
  /**
   * `authenticate()` will present any available biometry.
   */
  weak,

  /**
   * `authenticate()` will only present strong biometry.
   */
  strong,
}

export interface AuthenticateOptions {
  /**
   * Displays the reason for requesting authentication in the authentication
   * dialog presented to the user.
   *
   * Default: System default
   */
  reason?: string

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
   * The text for the negative button. This would typically be used as a
   * "Cancel" button, but may be also used to show an alternative method
   * for authentication, such as a screen that asks for a backup password.
   *
   * Default: "Cancel"
   */
  cancelTitle?: string

  /**
   * If true, allows for authentication using device unlock credentials.
   *
   * Default: false.
   *
   * iOS:
   * If biometry is available, enrolled, and not disabled, the system uses that
   * first. After the first Touch ID failure or second Face ID failure, if
   * `iosFallbackTitle` is not an empty string, a fallback button appears in
   * the authentication dialog. If the user taps the fallback button, the
   * system prompts the user for the device passcode or the user’s password.
   * If `iosFallbackTitle` is an empty string, no fallback button will appear.
   *
   * If no biometry is enrolled and enabled, and a passcode is set, the system
   * immediately prompts the user for the device passcode or user’s password.
   * Authentication fails with the error code `passcodeNotSet` if the device
   * passcode isn’t enabled.
   *
   * If a passcode is not set on the device, a `passcodeNotSet` error is
   * returned.
   *
   * The system disables passcode authentication after 6 unsuccessful attempts,
   * with progressively increasing delays between attempts.
   *
   * The title of the fallback button may be customized by setting
   * `iosFallbackTitle` to a non-empty string.
   *
   * Android:
   * The user will first be prompted to authenticate with biometrics, but also given
   * the option to authenticate with their device PIN, pattern, or password by tapping
   * a button in the authentication dialog. The title of the button is supplied by
   * the system.
   */
  allowDeviceCredential?: boolean

  /**
   * The system presents a fallback button when biometric authentication fails
   * — for example, because the system doesn’t recognize the presented finger,
   * or after several failed attempts to recognize the user’s face.
   *
   * If `allowDeviceCredential` is false, tapping this button dismisses the
   * authentication dialog and returns the error code userFallback. If undefined,
   * the localized system default title is used. Passing an empty string
   * hides the fallback button completely.
   *
   * If `allowDeviceCredential` is true and this is undefined,
   * the localized system default title is used.
   */
  iosFallbackTitle?: string

  /**
   * Title for the Android dialog. If not supplied, the system default is used.
   */
  androidTitle?: string

  /**
   * Subtitle for the Android dialog. If not supplied, the system default is used.
   */
  androidSubtitle?: string

  /**
   * Determines if successful weak biometric authentication must be confirmed.
   *
   * For information on this setting, see https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt.Builder#setConfirmationRequired(boolean).
   *
   * Default: `true`
   */
  androidConfirmationRequired?: boolean

  /**
   * Set the strength of Android biometric authentication that will be accepted.
   *
   * 👉 **NOTE:** On Android 9 & 10 (API 28-29), this will effectively always
   * be `.weak` if `allowDeviceCredential` is true. This is a known limitation
   * of the Android API. 🤯
   *
   * Default: `AndroidBiometryStrength.weak`
   */
  androidBiometryStrength?: AndroidBiometryStrength
}

/**
 * If the `authenticate()` method throws an exception, the `BiometryError`
 * instance contains a `.code` property which will contain one of these strings,
 * indicating what the error was.
 *
 * See https://developer.apple.com/documentation/localauthentication/laerror
 * for a description of each error code.
 */
export enum BiometryErrorType {
  none = '',
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

/**
 * `authenticate()` throws instances of this class.
 */
export class BiometryError {
  constructor(
    public message: string,
    public code: BiometryErrorType,
  ) {}
}

export interface CheckBiometryResult {
  /**
   * True if the device supports *at least* weak biometric authentication
   * and the current user has enrolled in some form of biometry. Note that
   * if `strongBiometryIsAvailable` is true, this will also be true.
   */
  isAvailable: boolean

  /**
   * True if the device has strong biometric authentication capability
   * and the current user has enrolled in that strong biometry.
   *
   * On iOS this value and `isAvailable` will always be the same, since iOS
   * only supports strong biometry.
   *
   * On Android, for example, if the device supports both fingerprint
   * and face authentication, and the user has enrolled only in face
   * authentication, and Android considers face authentication on that
   * device to be weak, then `isAvailable` will be true but this value
   * will be false.
   */
  strongBiometryIsAvailable: boolean

  /**
   * The primary (most secure) type of biometry supported by the device.
   * Note that _supported_ is not the same as _available_, which requires
   * the biometry to be enrolled.
   */
  biometryType: BiometryType

  /**
   * All of the biometry types supported by the hardware on the device
   * (currently only Android devices support multiple biometry types).
   * If no biometry is supported, i.e. `biometryType === BiometryType.none`,
   * this will be an empty array.
   *
   * Note that _supported_ is not the same as _available_, which requires
   * the biometry to be enrolled.
   */
  biometryTypes: BiometryType[]

  /**
   * Returns true if the device is secure. On iOS, this means that the
   * device has a passcode set. On Android, this means that the device
   * has a PIN, pattern, or password set.
   */
  deviceIsSecure: boolean

  /**
   * If weak or better biometry is not available and the system gives
   * a reason why, it will be returned here. Otherwise it's an empty string.
   */
  reason: string

  /**
   * If weak or better biometry is not available, the error code will be
   * returned here. Otherwise it's an empty string. The error code will be
   * one of the `BiometryErrorType` enum values, and is consistent across
   * platforms.
   */
  code: BiometryErrorType

  /**
   * If strong biometry is not available and the system gives
   * a reason why, it will be returned here. Otherwise it's an empty string.
   *
   * On iOS, this will always be the same as `reason`, since all biometry
   * on iOS is strong.
   */
  strongReason?: string

  /**
   * If strong biometry is not available, the error code will be
   * returned here. Otherwise it's an empty string. The error code will be
   * one of the `BiometryErrorType` enum values, and is consistent across
   * platforms.
   *
   * On iOS, this will always be the same as `code`, since all biometry
   * on iOS is strong.
   */
  strongCode?: BiometryErrorType
}

/**
 * The signature of the callback passed to `addResumeListener()`.
 */
export type ResumeListener = (info: CheckBiometryResult) => void

/**
 * This is the public interface of the plugin.
 */
export interface BiometricAuthPlugin extends WebPlugin {
  /**
   * Check to see what biometry type (if any) is available.
   */
  checkBiometry: () => Promise<CheckBiometryResult>

  /**
   * web only
   *
   * On the web, this method allows you to dynamically simulate
   * different types of biometry. You may either pass `BiometryType` enums
   * or the string names of the `BiometryType` enums. If undefined or a string
   * is passed and it isn't a valid value, nothing happens.
   */
  setBiometryType: (
    type: BiometryType | string | Array<BiometryType | string> | undefined,
  ) => Promise<void>

  /**
   * web only
   *
   * On the web, this method allows you to dynamically simulate whether or not
   * the user has enrolled in biometry.
   */
  setBiometryIsEnrolled: (isSecure: boolean) => Promise<void>

  /**
   * web only
   *
   * On the web, this method allows you to dynamically simulate whether or not
   * the user has secured the device with a PIN, pattern or passcode.
   */
  setDeviceIsSecure: (isSecure: boolean) => Promise<void>

  /**
   * Prompt the user for authentication. If authorization fails for any reason,
   * the promise is rejected with a `BiometryError`.
   *
   * For detailed information about the behavior on iOS, see:
   *
   * https://developer.apple.com/documentation/localauthentication/lapolicy/deviceownerauthenticationwithbiometrics
   *
   * Some versions of Android impose a limit on the number of failed attempts.
   * If `allowDeviceCredential` is `true`, when the limit is reached
   * the user will then be presented with a device credential prompt.
   * If `allowDeviceCredential` is `false`, when the limit is reached
   * `authenticate()` will reject with a `BiometryErrorType` of `biometryLockout`,
   * after which the user will have to wait the system-defined length of time
   * before being allowed to authenticate again.
   *
   * @rejects {BiometryError}
   */
  authenticate: (options?: AuthenticateOptions) => Promise<void>

  /**
   * Register a function that will be called when the app resumes.
   * The function will be passed the result of `checkBiometry()`.
   *
   * 👉 **NOTE:** checkBiometry() must be called at least once
   * before calling this method.
   */
  addResumeListener: (listener: ResumeListener) => Promise<PluginListenerHandle>
}
