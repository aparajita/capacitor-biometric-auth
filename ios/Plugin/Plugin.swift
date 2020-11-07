import Foundation
import Capacitor
import LocalAuthentication

private let kUsername = "username"
private let kPassword = "password"
private let kDomain = "domain"
private let kReason = "reason"
private let kMissingFaceIDUsageEntry = "The device supports Face ID, but NSFaceIDUsageDescription is not in Info.plist."

@objc(WSBiometricAuth)
public class WSBiometricAuth: CAPPlugin {
  struct Credentials {
    var username: String
    var password: String
  }

  let noServerProvided = "noServerProvided"

  let biometryErrorCodeMap: [LAError.Code: String] = [
    .appCancel: "appCancel",
    .authenticationFailed: "authenticationFailed",
    .invalidContext: "invalidContext",
    .notInteractive: "notInteractive",
    .passcodeNotSet: "passcodeNotSet",
    .systemCancel: "systemCancel",
    .userCancel: "userCancel",
    .userFallback: "userFallback",
    .biometryLockout: "biometryLockout",
    .biometryNotAvailable: "biometryNotAvailable",
    .biometryNotEnrolled: "biometryNotEnrolled"
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

    if available && context.biometryType == .faceID {
      // The system may report that biometry is available, but if the type is Face ID
      // and the developer forgot to add NSFaceIDUsageDescription to Info.plist,
      // calls to evaluatePolicy() will crash.
      let entry = Bundle.main.infoDictionary?["NSFaceIDUsageDescription"] as? String

      if entry == nil {
        available = false
        canEvaluatePolicy = false
        reason = kMissingFaceIDUsageEntry
      }
    } else if !available,
       let error = error {
      // If we get a reason from the system, return it
      reason = error.localizedDescription

      if let failureReason = error.localizedFailureReason {
        reason = "\(reason): \(failureReason)"
      }
    }

    call.resolve([
      "isAvailable": available,
      "biometryType": context.biometryType.rawValue,
      "reason": reason
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
        biometryErrorCodeMap[.biometryNotAvailable]
      )

      return
    }

    let reason = call.getString(kReason) ?? "Access requires authentication"
    let context = LAContext()
    context.localizedFallbackTitle = call.getString("iosFallbackTitle")
    context.localizedCancelTitle = call.getString("cancelTitle")
    context.touchIDAuthenticationAllowableReuseDuration = 0

    let allowDeviceCredential = call.getBool("allowDeviceCredential") ?? false
    let policy: LAPolicy = allowDeviceCredential ? .deviceOwnerAuthentication : .deviceOwnerAuthenticationWithBiometrics

    context.evaluatePolicy(policy, localizedReason: reason) { (success, error) in
      if success {
        call.resolve()
      } else {
        if let policyError = error as? LAError {
          let code = self.biometryErrorCodeMap[policyError.code]
          call.reject(policyError.localizedDescription, code)
        } else {
          call.reject("An unknown error occurred.", self.biometryErrorCodeMap[.authenticationFailed])
        }
      }
    }
  }

  @objc func setCredentials(_ call: CAPPluginCall) {
    guard let domain = getDomainParam(call) else {
      return
    }

    var err: KeychainError?
    var params: [String: String] = [:]

    for param in [kUsername, kPassword] {
      guard let value = call.getString(param) else {
        err = KeychainError(.missingParameter, param: param)
        break
      }

      params[param] = value
    }

    if let err = err {
      err.rejectCall(call)
      return
    }

    guard let username = params[kUsername],
          let password = params[kPassword] else {
      KeychainError.reject(call: call, kind: .unknownError)
      return
    }

    let credentials = Credentials(username: username, password: password)

    tryKeychainOp(call, {
      try storeCredentialsInKeychain(credentials, domain)
      call.resolve()
    })
  }

  @objc func getCredentials(_ call: CAPPluginCall) {
    guard let domain = getDomainParam(call) else {
      KeychainError(.missingParameter, param: kDomain).rejectCall(call)
      return
    }

    tryKeychainOp(call, {
      let credentials = try getCredentialsFromKeychain(domain)
      call.resolve([
        kUsername: credentials.username,
        kPassword: credentials.password
      ])
    })
  }

  @objc func deleteCredentials(_ call: CAPPluginCall) {
    guard let domain = getDomainParam(call) else {
      return
    }

    tryKeychainOp(call, {
      try deleteCredentialsFromKeychain(domain)
      call.resolve()
    })
  }

  func getDomainParam(_ call: CAPPluginCall) -> String? {
    if let domain = call.getString(kDomain),
       !domain.isEmpty {
      return domain
    } else {
      // If the user does not supply a domain, get the app's appId,
      // which on iOS is the CFBundleIdentifier.
      if let appId = Bundle.main.infoDictionary?["CFBundleIdentifier"] as? String {
        return appId
      }

      KeychainError.reject(call: call, kind: .missingParameter, param: kDomain)
      return nil
    }
  }

  func tryKeychainOp(_ call: CAPPluginCall, _ operation: () throws -> Void) {
    var err: KeychainError

    do {
      try operation()
      return
    } catch let error as KeychainError {
      err = error
    } catch {
      err = KeychainError(.unknownError)
    }

    err.rejectCall(call)
  }

  func getCredentialsFromKeychain(_ domain: String) throws -> Credentials {
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: domain,
      kSecMatchLimit as String: kSecMatchLimitOne,
      kSecReturnAttributes as String: true,
      kSecReturnData as String: true
    ] as CFDictionary

    var itemRef: CFTypeRef?
    let status = SecItemCopyMatching(query, &itemRef)
    try checkStatus(status, domain)

    guard let item = itemRef as? [String: Any],
      let passwordData = item[kSecValueData as String] as? Data,
      let password = String(data: passwordData, encoding: .utf8),
      let username = item[kSecAttrAccount as String] as? String
      else {
        throw KeychainError(.invalidData)
    }

    return Credentials(username: username, password: password)
  }

  func storeCredentialsInKeychain(_ credentials: Credentials, _ domain: String) throws {
    // If the credentials already exist, update them
    if (try? getCredentialsFromKeychain(domain)) != nil {
      try updateCredentialsInKeychain(credentials, domain)
    } else {
      guard let passwordData = credentials.password.data(using: .utf8) else {
        throw KeychainError(.osError)
      }

      let query = [
        kSecClass as String: kSecClassInternetPassword,
        kSecAttrAccount as String: credentials.username,
        kSecAttrServer as String: domain,
        kSecValueData as String: passwordData
      ] as CFDictionary

      let status = SecItemAdd(query, nil)
      try checkStatus(status, domain)
    }
  }

  func updateCredentialsInKeychain(_ credentials: Credentials, _ domain: String) throws {
    guard let passwordData = credentials.password.data(using: .utf8) else {
      throw KeychainError(.osError)
    }

    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: domain
    ] as CFDictionary

    let attributes = [
      kSecAttrAccount as String: credentials.username,
      kSecValueData as String: passwordData
    ] as CFDictionary

    let status = SecItemUpdate(query, attributes)
    try checkStatus(status, domain)
  }

  func deleteCredentialsFromKeychain(_ domain: String)throws {
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: domain
    ] as CFDictionary

    let status = SecItemDelete(query)

    guard status == errSecSuccess || status == errSecItemNotFound else {
      throw KeychainError(.osError, status: status)
    }
  }

  func checkStatus(_ status: OSStatus, _ domain: String) throws {
    guard status != errSecItemNotFound else {
      throw KeychainError(.notFound, param: domain)
    }

    guard status == errSecSuccess else {
      throw KeychainError(.osError, status: status)
    }
  }
}
