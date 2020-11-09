import { Plugins, registerWebPlugin, WebPlugin } from '@capacitor/core';
import {
  CheckBiometryResult,
  AuthenticateOptions,
  BiometryError,
  BiometryErrorType,
  BiometryType,
  WSBiometricAuthPlugin,
  ResumeListener,
} from './definitions';

const kBiometryTypeNameMap = {
  [BiometryType.none]: '',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.fingerprintAuthentication]: 'Fingerprint Authentication',
  [BiometryType.faceAuthentication]: 'Face Authentication',
  [BiometryType.irisAuthentication]: 'Iris Authentication',
};

export class WSBiometricAuthWeb
  extends WebPlugin
  implements WSBiometricAuthPlugin {
  private biometryType: BiometryType = BiometryType.none;

  constructor() {
    super({
      name: 'WSBiometricAuth',
      platforms: ['web'],
    });

    this.setBiometryType(process.env.WS_BIOMETRY_TYPE);
  }

  setBiometryType(type: BiometryType | string | undefined) {
    if (typeof type === 'undefined') {
      return;
    }

    if (typeof type === 'string') {
      if (type && BiometryType.hasOwnProperty(type)) {
        this.biometryType = BiometryType[type as keyof typeof BiometryType];
      }
    } else {
      this.biometryType = type;
    }
  }

  checkBiometry(): Promise<CheckBiometryResult> {
    return Promise.resolve({
      isAvailable: this.biometryType !== BiometryType.none,
      biometryType: this.biometryType,
      reason: '',
    });
  }

  authenticate(options?: AuthenticateOptions): Promise<void> {
    return this.checkBiometry().then(({ isAvailable, biometryType }) => {
      if (isAvailable) {
        if (
          confirm(
            options.reason ||
              `Authenticate with ${kBiometryTypeNameMap[biometryType]}?`,
          )
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

export function addResumeListener(
  auth: WSBiometricAuthPlugin,
  listener: ResumeListener,
): void {
  const app = Plugins.App;

  if (app) {
    app.addListener('appStateChange', async state => {
      if (state.isActive) {
        const info = await auth.checkBiometry();
        listener(info);
      }
    });
  }
}

const WSBiometricAuth = new WSBiometricAuthWeb();

export { WSBiometricAuth };

registerWebPlugin(WSBiometricAuth);
