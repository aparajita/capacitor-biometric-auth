import { registerWebPlugin, WebPlugin } from '@capacitor/core';
import {
  CheckBiometryResult,
  VerifyOptions,
  BiometryError,
  BiometryErrorType,
  BiometryType,
  Credentials,
  CredentialsError,
  CredentialsErrorType,
  DeleteCredentialsOptions,
  GetCredentialsOptions,
  SetCredentialsOptions,
  WSBiometricAuthPlugin,
} from './definitions';
import { Blowfish } from 'javascript-blowfish';

const kBiometryTypeNameMap = {
  [BiometryType.none]: '',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.fingerprint]: 'Fingerprint Authentication',
  [BiometryType.faceAuthentication]: 'Face Authentication',
  [BiometryType.irisAuthentication]: 'Iris Authentication',
};

const kStoragePrefix = 'ws-capacitor-biometric-auth__';

export class WSBiometricAuthWeb
  extends WebPlugin
  implements WSBiometricAuthPlugin {
  private blowfish: Blowfish;
  private readonly encryptionKey: string;

  constructor() {
    super({
      name: 'WSBiometricAuth',
      platforms: ['web'],
    });

    if (process.env.WS_BIOMETRIC_AUTH_PASSPHRASE) {
      this.encryptionKey = process.env.WS_BIOMETRIC_AUTH_PASSPHRASE;
    } else {
      this.encryptionKey = 'Please specify this in an environment variable!';
      console.warn(
        '[ws-capacitor-biometric-auth] If you are interested in security, you should provide a passphrase in the environment variable WS_BIOMETRIC_AUTH_PASSPHRASE',
      );
    }

    this.blowfish = new Blowfish(this.encryptionKey);
  }

  checkBiometry(): Promise<CheckBiometryResult> {
    let type = BiometryType.none;
    const envType = process.env.WS_BIOMETRY_TYPE;

    if (envType && BiometryType.hasOwnProperty(envType)) {
      // @ts-ignore  Ignore 'any' type warning here
      type = BiometryType[envType] as BiometryType;
    }

    return Promise.resolve({
      isAvailable: type !== BiometryType.none,
      biometryType: type,
    });
  }

  biometryIsAvailable(): Promise<boolean> {
    return this.checkBiometry().then(result => result.isAvailable);
  }

  verifyIdentity(_options?: VerifyOptions): Promise<void> {
    return this.checkBiometry().then(({ isAvailable, biometryType }) => {
      if (isAvailable) {
        if (
          confirm(`Authenticate with ${kBiometryTypeNameMap[biometryType]}?`)
        ) {
          return;
        }

        throw new BiometryError('User cancelled', BiometryErrorType.userCancel);
      }

      throw new BiometryError(
        'Biometry not available',
        BiometryErrorType.biometryNotAvailable,
      );
    });
  }

  getCredentials({ domain }: GetCredentialsOptions): Promise<Credentials> {
    if (domain) {
      const credentials = sessionStorage.getItem(kStoragePrefix + domain);

      if (credentials) {
        let json;

        try {
          json = this.decryptCredentials(credentials);
        } catch (e) {
          throw new CredentialsError(
            e.message,
            CredentialsErrorType.invalidData,
          );
        }

        if (json.username && json.password) {
          return Promise.resolve(json);
        }

        throw new CredentialsError(
          'Missing property in credentials',
          CredentialsErrorType.invalidData,
        );
      } else {
        throw new CredentialsError(
          `Credentials not found for server: ${domain}`,
          CredentialsErrorType.notFound,
        );
      }
    } else {
      throw new CredentialsError(
        'No server provided',
        CredentialsErrorType.missingParameter,
      );
    }
  }

  setCredentials({
    domain,
    username,
    password,
  }: SetCredentialsOptions): Promise<void> {
    if (domain) {
      const encoded = this.encryptCredentials({ username, password });
      sessionStorage.setItem(kStoragePrefix + domain, encoded);
      return Promise.resolve();
    } else {
      throw new CredentialsError(
        'No server provided',
        CredentialsErrorType.missingParameter,
      );
    }
  }

  deleteCredentials({ domain }: DeleteCredentialsOptions): Promise<void> {
    if (domain) {
      sessionStorage.removeItem(kStoragePrefix + domain);
      return Promise.resolve();
    } else {
      throw new CredentialsError(
        'No server provided',
        CredentialsErrorType.missingParameter,
      );
    }
  }

  private encryptCredentials(credentials: Credentials): string {
    const json = JSON.stringify(credentials);
    return this.blowfish.base64Encode(this.blowfish.encryptECB(json));
  }

  private decryptCredentials(ciphertext: string): Credentials {
    const json = this.blowfish.trimZeros(
      this.blowfish.decryptECB(this.blowfish.base64Decode(ciphertext)),
    );
    let credentials: Credentials;

    try {
      credentials = JSON.parse(json) as Credentials;
    } catch (e) {
      throw new CredentialsError(
        'Could not parse credentials object',
        CredentialsErrorType.invalidData,
      );
    }

    if (!credentials.username || !credentials.password) {
      throw new CredentialsError(
        'username or password field is missing from the decoded credentials',
        CredentialsErrorType.invalidData,
      );
    }

    return credentials;
  }
}

/**
 * Return a human-readable name for a BiometryType.
 *
 * @param {BiometryType} type
 * @returns {string}
 */
export function getBiometryName(type: BiometryType): string {
  return kBiometryTypeNameMap[type] || '';
}

const WSBiometricAuth = new WSBiometricAuthWeb();

export { WSBiometricAuth };

registerWebPlugin(WSBiometricAuth);
