import { registerWebPlugin, WebPlugin } from '@capacitor/core'
import {
  AvailableResult,
  BiometricOptions,
  BiometryError,
  BiometryErrorType,
  BiometryType,
  biometryTypeNameMap,
  Credentials,
  CredentialsError,
  CredentialsErrorType,
  DeleteCredentialsOptions,
  GetCredentialsOptions,
  SetCredentialsOptions,
  WSBiometricAuthPlugin
} from './definitions'

const kRot13Input = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const kRot13Output = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'
const rot13Index = (x: string) => kRot13Input.indexOf(x)
const rot13Translate = (x: string) => (rot13Index(x) > -1 ? kRot13Output[rot13Index(x)] : x)

function rot13(str: string): string {
  return str.split('').map(rot13Translate).join('')
}

function base36StringToBytes(s: string): Uint8Array {
  return new Uint8Array(s.match(/.{2}/g).map(byte => parseInt(byte, 36)))
}

function bytesToBase36String(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(36).padStart(2, '0'), '')
}

export class WSBiometricAuth extends WebPlugin implements WSBiometricAuthPlugin {
  static kStoragePrefix = 'ws-capacitor-biometric-auth__'
  encoder: TextEncoder
  decoder: TextDecoder

  constructor() {
    super({
      name: 'WSBiometricAuth',
      platforms: ['web']
    })

    this.encoder = new TextEncoder()
    this.decoder = new TextDecoder()
  }

  isAvailable(): Promise<AvailableResult> {
    let type = BiometryType.NONE

    if (process.env.WS_BIOMETRY_TYPE) {
      const typeNum = Number(process.env.WS_BIOMETRY_TYPE)

      if (typeNum in BiometryType) {
        type = typeNum
      }
    }

    return Promise.resolve({
      isAvailable: type !== BiometryType.NONE,
      biometryType: type
    })
  }

  verifyIdentity(_options?: BiometricOptions): Promise<void> {
    return this.isAvailable().then(({ isAvailable, biometryType }) => {
      if (isAvailable) {
        if (confirm(`Authenticate with ${biometryTypeNameMap[biometryType]}?`)) {
          return
        }

        throw new BiometryError('User cancelled', BiometryErrorType.userCancel)
      }

      throw new BiometryError('Biometry not available', BiometryErrorType.biometryNotAvailable)
    })
  }

  getCredentials({ server }: GetCredentialsOptions): Promise<Credentials> {
    if (server) {
      const credentials = sessionStorage.getItem(WSBiometricAuth.kStoragePrefix + server)

      if (credentials) {
        let json

        try {
          json = this.decryptCredentials(credentials)
        } catch (e) {
          throw new CredentialsError(e.message, CredentialsErrorType.invalidData)
        }

        if (json.username && json.password) {
          return Promise.resolve(json)
        }

        throw new Error('Missing property in credentials')
      } else {
        throw new CredentialsError(
          `Credentials not found for server: ${server}`,
          CredentialsErrorType.notFound
        )
      }
    } else {
      throw new CredentialsError('No server provided', CredentialsErrorType.missingParameter)
    }
  }

  setCredentials({ server, username, password }: SetCredentialsOptions): Promise<void> {
    if (server) {
      const json = this.encryptCredentials({ username, password })
      sessionStorage.setItem(WSBiometricAuth.kStoragePrefix + server, json)
      return Promise.resolve()
    } else {
      throw new CredentialsError('No server provided', CredentialsErrorType.missingParameter)
    }
  }

  private encryptCredentials(credentials: Credentials): string {
    // Do some basic obfuscation of the credentials so they aren't plain text:
    // - Convert to JSON
    // - Encode as UTF8 bytes
    // - Convert bytes to base 36 characters
    // - Reverse the order of the characters
    // - Rotate13
    const json = JSON.stringify(credentials)
    const encoded = this.encoder.encode(json)
    const hexString = bytesToBase36String(encoded)
    return rot13(hexString.split('').reverse().join(''))
  }

  private decryptCredentials(ciphertext: string): Credentials {
    const rotated = rot13(ciphertext).split('').reverse().join('')
    const bytes = base36StringToBytes(rotated)
    const decoded = this.decoder.decode(bytes)
    return JSON.parse(decoded)
  }

  deleteCredentials({ server }: DeleteCredentialsOptions): Promise<void> {
    if (server) {
      sessionStorage.removeItem(WSBiometricAuth.kStoragePrefix + server)
      return Promise.resolve()
    } else {
      throw new CredentialsError('No server provided', CredentialsErrorType.missingParameter)
    }
  }
}

const NativeBiometric = new WSBiometricAuth()

export { NativeBiometric }

registerWebPlugin(NativeBiometric)
