import { BiometryType } from './definitions'

const kBiometryTypeNameMap = {
  [BiometryType.none]: '',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.fingerprintAuthentication]: 'Fingerprint Authentication',
  [BiometryType.faceAuthentication]: 'Face Authentication',
  [BiometryType.irisAuthentication]: 'Iris Authentication',
}

/**
 * Return a human-readable name for a BiometryType.
 */
// eslint-disable-next-line import/prefer-default-export
export function getBiometryName(type: BiometryType): string {
  return kBiometryTypeNameMap[type] || ''
}
