import Foundation
import Capacitor
import LocalAuthentication

private let kUsername = "username"
private let kPassword = "password"
private let kDomain = "domain"
private let kReason = "reason"

@objc(WSBiometricAuth)
public class WSBiometricAuth: CAPPlugin {
  struct KeychainError: Error {
    enum ErrorKind {
      case notFound
      case missingParameter
      case invalidData
      case osError
      case unknownError
    }

    let keychainErrorMap: [KeychainError.ErrorKind: [String]] = [
      .notFound: ["Credentials for the domain '%@' not found", "notFound"],
      .missingParameter: ["No %@ parameter was given", "missingParameter"],
      .invalidData: ["The data in the store is an invalid format", "invalidData"],
      .osError: ["An OS error occurred (%d)", "osError"],
      .unknownError: ["An unknown error occurred", "unknownError"]
    ]

    let kind: ErrorKind
    var message: String = ""
    var code: String = ""

    init(_ kind: ErrorKind, status: OSStatus = 0, param: String = "") {
      self.kind = kind

      if let message = keychainErrorMap[kind] {
        switch kind {
          case .osError:
            self.message = String(format: message[0], status)

          case .notFound, .missingParameter:
            self.message = String(format: message[0], param)

          default:
            self.message = message[0]
        }

        self.code = message[1]
      }
    }
  }

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

  /**
   * Check the device's availability and type of biometric authentication.
   */
  @objc func checkBiometry(_ call: CAPPluginCall) {
    let context = LAContext()
    let available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)

    call.resolve([
      "isAvailable": available,
      "biometryType": context.biometryType.rawValue
    ])
  }

  /**
   * Prompt the user for biometric authorization.
   *
   * @param {BiometricOptions} options
   * @returns {Promise<void>}
   * @rejects {BiometricResultError}
   */
  @objc func verifyIdentity(_ call: CAPPluginCall) {
    let reason = call.getString(kReason) ?? "Access requires authentication"
    let context = LAContext()
    context.localizedFallbackTitle = call.getString("iosFallbackTitle")
    context.localizedCancelTitle = call.getString("cancelTitle")
    context.touchIDAuthenticationAllowableReuseDuration = 0

    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { (success, error) in
      if success {
        call.resolve()
      } else {
        let policyError = error as! LAError
        let code = self.biometryErrorCodeMap[policyError.code]
        call.reject(policyError.localizedDescription, code)
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

    if err != nil {
      call.reject(err!.message, err!.code)
      return
    }

    let credentials = Credentials(username: params[kUsername]!, password: params[kPassword]!)

    tryKeychainOp(call, {
      try storeCredentialsInKeychain(credentials, domain)
      call.resolve()
    })
  }

  @objc func getCredentials(_ call: CAPPluginCall) {
    guard let domain = getDomainParam(call) else {
      let err = KeychainError(.missingParameter, param: kDomain)
      return call.reject(err.message, err.code)
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
    guard let domain = call.getString(kDomain) else {
      let err = KeychainError(.missingParameter, param: kDomain)
      call.reject(err.message, err.code)
      return nil
    }

    return domain
  }

  func tryKeychainOp(_ call: CAPPluginCall, _ operation: () throws -> Void) {
    var err: KeychainError

    do {
      try operation()
      return
    } catch let e as KeychainError {
      err = e
    } catch {
      err = KeychainError(.unknownError)
    }

    call.reject(err.message, err.code)
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
    if let _ = try? getCredentialsFromKeychain(domain) {
      try updateCredentialsInKeychain(credentials, domain)
    } else {
      let query = [
        kSecClass as String: kSecClassInternetPassword,
        kSecAttrAccount as String: credentials.username,
        kSecAttrServer as String: domain,
        kSecValueData as String: credentials.password.data(using: .utf8)!
      ] as CFDictionary

      let status = SecItemAdd(query, nil)
      try checkStatus(status, domain)
    }
  }

  func updateCredentialsInKeychain(_ credentials: Credentials, _ domain: String) throws {
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: domain
    ] as CFDictionary

    let account = credentials.username
    let password = credentials.password.data(using: String.Encoding.utf8)!
    let attributes = [
      kSecAttrAccount as String: account,
      kSecValueData as String: password
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
