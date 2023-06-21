import Capacitor
import Foundation
import LocalAuthentication

private let kReason = "reason"
private let kMissingFaceIDUsageEntry = "The device supports Face ID, but NSFaceIDUsageDescription is not in Info.plist."

@objc(BiometricAuthNative)
public class BiometricAuthNative: CAPPlugin {
  let biometryErrorCodeMap: [Int: String] = [
    LAError.appCancel.rawValue: "appCancel",
    LAError.authenticationFailed.rawValue: "authenticationFailed",
    LAError.invalidContext.rawValue: "invalidContext",
    LAError.notInteractive.rawValue: "notInteractive",
    LAError.passcodeNotSet.rawValue: "passcodeNotSet",
    LAError.systemCancel.rawValue: "systemCancel",
    LAError.userCancel.rawValue: "userCancel",
    LAError.userFallback.rawValue: "userFallback",
    LAError.biometryLockout.rawValue: "biometryLockout",
    LAError.biometryNotAvailable.rawValue: "biometryNotAvailable",
    LAError.biometryNotEnrolled.rawValue: "biometryNotEnrolled"
  ]

  var canEvaluatePolicy = true

  /**
   * Check the device's availability and type of biometric authentication.
   */
  @objc func checkBiometry(_ call: CAPPluginCall) {
    let context = LAContext()
    var error: NSError?
    var available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    var reason = ""
    var errorCode = ""

    if available, context.biometryType == .faceID {
      // The system may report that biometry is available, but if the type is Face ID
      // and the developer forgot to add NSFaceIDUsageDescription to Info.plist,
      // calls to evaluatePolicy() will crash.
      let entry = Bundle.main.infoDictionary?["NSFaceIDUsageDescription"] as? String

      if entry == nil {
        available = false
        canEvaluatePolicy = false
        reason = kMissingFaceIDUsageEntry
        errorCode = biometryErrorCodeMap[LAError.biometryNotAvailable.rawValue] ?? ""
      }
    } else if !available,
              let error = error {
      // If we get a reason from the system, return it
      reason = error.localizedDescription

      if let failureReason = error.localizedFailureReason {
        reason = "\(reason): \(failureReason)"
      }

      errorCode = biometryErrorCodeMap[error.code] ?? biometryErrorCodeMap[LAError.biometryNotAvailable.rawValue] ?? ""
    }

    call.resolve([
      "isAvailable": available,
      "biometryType": context.biometryType.rawValue,
      "reason": reason,
      "code": errorCode
    ])
  }

  /**
   * Prompt the user for authentication.
   *
   * @param {BiometricOptions} options
   * @returns {Promise<void>}
   * @rejects {BiometricResultError}
   */
  @objc func authenticate(_ call: CAPPluginCall) {
    // Make sure the app can evaluate policy, otherwise evaluatePolicy() will crash
    guard canEvaluatePolicy else {
      call.reject(
        kMissingFaceIDUsageEntry,
        biometryErrorCodeMap[LAError.biometryNotAvailable.rawValue]
      )

      return
    }

    var reason: String

    // The reason must be non-nil and non-empty, otherwise evaluatePolicy() crashes.
    if let option = call.getString(kReason),
       !option.isEmpty {
      reason = option
    } else {
      reason = "Access requires authentication"
    }

    let context = LAContext()
    context.localizedFallbackTitle = call.getString("iosFallbackTitle")
    context.localizedCancelTitle = call.getString("cancelTitle")
    context.touchIDAuthenticationAllowableReuseDuration = 0

    let allowDeviceCredential = call.getBool("allowDeviceCredential") ?? false
    let policy: LAPolicy = allowDeviceCredential ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics

    // If device credentials are allowed, change an empty fallback title
    // to nil to force the system default. An empty string will suppress
    // the fallback button, and that contradicts the purpose of the allowDeviceCredential flag.

    if allowDeviceCredential,
       let fallbackTitle = context.localizedFallbackTitle,
       fallbackTitle.isEmpty {
      context.localizedFallbackTitle = nil
    }

    context.evaluatePolicy(policy, localizedReason: reason) { success, error in
      if success {
        call.resolve()
      } else {
        if let policyError = error as? LAError {
          let code = self.biometryErrorCodeMap[policyError.code.rawValue]
          call.reject(policyError.localizedDescription, code)
        } else {
          call.reject("An unknown error occurred.", self.biometryErrorCodeMap[LAError.authenticationFailed.rawValue])
        }
      }
    }
  }
}
