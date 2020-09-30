import Foundation
import Capacitor
import LocalAuthentication

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
      .notFound: ["Credentials for the server '%@' not found", "notFound"],
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
  @objc func isAvailable(_ call: CAPPluginCall) {
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
    let reason = call.getString("reason") ?? "Access requires authentication"
    let context = LAContext()
    context.localizedFallbackTitle = call.getString("fallbackTitle")
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

  @objc func getCredentials(_ call: CAPPluginCall) {
    guard let server = getServerParam(call) else {
      let err = KeychainError(.missingParameter, param: "server")
      return call.reject(err.message, err.code)
    }

    tryKeychainOp(call, {
      let credentials = try getCredentialsFromKeychain(server)
      call.resolve([
        "username": credentials.username,
        "password": credentials.password
      ])
    })
  }

  @objc func setCredentials(_ call: CAPPluginCall) {
    guard let server = getServerParam(call) else {
      return
    }

    var err: KeychainError?
    var params: [String:String] = [:]

    for param in ["username", "password"] {
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

    let credentials = Credentials(username: params["username"]!, password: params["password"]!)

    tryKeychainOp(call, {
      try storeCredentialsInKeychain(credentials, server)
      call.resolve()
    })
  }

  @objc func deleteCredentials(_ call: CAPPluginCall){
    guard let server = getServerParam(call) else {
      return
    }

    tryKeychainOp(call, {
      try deleteCredentialsFromKeychain(server)
      call.resolve()
    })
  }

  func getServerParam(_ call: CAPPluginCall) -> String? {
    guard let server = call.getString("server") else {
      let err = KeychainError(.missingParameter, param: "server")
      call.reject(err.message, err.code)
      return nil
    }

    return server
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

  func getCredentialsFromKeychain(_ server: String) throws -> Credentials {
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: server,
      kSecMatchLimit as String: kSecMatchLimitOne,
      kSecReturnAttributes as String: true,
      kSecReturnData as String: true
    ] as CFDictionary

    var itemRef: CFTypeRef?
    let status = SecItemCopyMatching(query, &itemRef)
    try checkStatus(status, server)

    guard let item = itemRef as? [String: Any],
      let passwordData = item[kSecValueData as String] as? Data,
      let password = String(data: passwordData, encoding: .utf8),
      let username = item[kSecAttrAccount as String] as? String
      else {
        throw KeychainError(.invalidData)
    }

    return Credentials(username: username, password: password)
  }

  func storeCredentialsInKeychain(_ credentials: Credentials, _ server: String) throws {
    // If the credentials already exist, update them
    if let _ = try? getCredentialsFromKeychain(server) {
      try updateCredentialsInKeychain(credentials, server)
    } else {
      let query = [
        kSecClass as String: kSecClassInternetPassword,
        kSecAttrAccount as String: credentials.username,
        kSecAttrServer as String: server,
        kSecValueData as String: credentials.password.data(using: .utf8)!
      ] as CFDictionary

      let status = SecItemAdd(query, nil)
      try checkStatus(status, server)
    }
  }

  func updateCredentialsInKeychain(_ credentials: Credentials, _ server: String) throws {
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: server
    ] as CFDictionary

    let account = credentials.username
    let password = credentials.password.data(using: String.Encoding.utf8)!
    let attributes = [
      kSecAttrAccount as String: account,
      kSecValueData as String: password
    ] as CFDictionary

    let status = SecItemUpdate(query, attributes)
    try checkStatus(status, server)
  }

  func deleteCredentialsFromKeychain(_ server: String)throws{
    let query = [
      kSecClass as String: kSecClassInternetPassword,
      kSecAttrServer as String: server
    ] as CFDictionary

    let status = SecItemDelete(query)

    guard status == errSecSuccess || status == errSecItemNotFound else {
      throw KeychainError(.osError, status: status)
    }
  }

  func checkStatus(_ status: OSStatus, _ server: String) throws {
    guard status != errSecItemNotFound else {
      throw KeychainError(.notFound, param: server)
    }

    guard status == errSecSuccess else {
      throw KeychainError(.osError, status: status)
    }
  }
}
