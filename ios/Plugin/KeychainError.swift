//
//  KeychainError.swift
//  WsCapacitorBiometricAuth
//
//  Created by Aparajita on 11/5/20.
//

import Capacitor

public class KeychainError: Error {
  enum ErrorKind {
    case notFound
    case missingParameter
    case invalidData
    case osError
    case unknownError
  }

  static let keychainErrorMap: [KeychainError.ErrorKind: [String]] = [
    .notFound: ["Credentials for the domain '%@' not found", "notFound"],
    .missingParameter: ["Missing or empty \"%@\" parameter", "missingParameter"],
    .invalidData: ["The data in the store is an invalid format", "invalidData"],
    .osError: ["An OS error occurred (%d)", "osError"],
    .unknownError: ["An unknown error occurred", "unknownError"]
  ]

  let kind: ErrorKind
  var message: String = ""
  var code: String = ""

  init(_ kind: ErrorKind, param: String = "", status: OSStatus = 0) {
    self.kind = kind

    if let message = KeychainError.keychainErrorMap[kind] {
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

  public func rejectCall(_ call: CAPPluginCall) {
    call.reject(message, code)
  }

  static func reject(call: CAPPluginCall, kind: ErrorKind, param: String = "", status: OSStatus = 0) {
    let err = KeychainError(kind, param: param, status: status)
    err.rejectCall(call)
  }
}
