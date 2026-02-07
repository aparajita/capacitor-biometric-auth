# Android Native — BiometricPrompt Implementation

## Code Style

Java indent is 2 spaces (not the typical 4).

## Separate Activity Pattern

`BiometricPrompt` requires a `FragmentActivity`, but Capacitor's plugin context is not one. The plugin launches a separate `AuthActivity` (extends `AppCompatActivity`) with a transparent theme so only the biometric prompt is visible.

**Flow:** Plugin → `startActivityForResult()` → `AuthActivity` → BiometricPrompt → result via Intent extras → `@ActivityCallback authenticateResult()`

## CRITICAL: API 28-29 Biometry Strength Limitation

On Android 9-10 (API 28-29), combining `BIOMETRIC_STRONG` with `DEVICE_CREDENTIAL` causes crashes. The plugin automatically falls back to `BIOMETRIC_WEAK` on these API levels.

**NEVER remove the API 28-29 workaround. It prevents crashes on a significant portion of Android devices.**

## Negative Button Restriction

When `allowDeviceCredential` is true, Android's BiometricPrompt provides its own cancel mechanism. Setting a negative button in this scenario violates Android's requirements and causes the prompt to fail. The cancel button is only set for biometry-only authentication.

## Non-Empty Title Requirement

BiometricPrompt's builder requires a non-null, non-empty title. The plugin falls back to "Authenticate" if none is provided. Similarly, the negative button text defaults to "Cancel" when empty.

## NPE Guard in Error Code Mapping

If Android returns an error code not in `biometryErrorCodeMap`, `HashMap.get()` returns `null`. The plugin guards against this with a fallback to "systemCancel" (in `authenticateResult`) or "biometryNotAvailable" (in `checkBiometry`).

**NEVER remove the NPE guards. They fix a real production crash (commit 3f6a956).**

## Crash Prevention Guards

All guards prevent real crashes from Android API requirements:

- **Missing activity result data**: Returns `invalidContext` error if Intent data is null
- **Invalid result type**: Catches `IllegalArgumentException` from enum parsing
- **System cancellation**: Handles `RESULT_CANCELED` from the system
- **KeyguardManager null check**: Falls back to `deviceIsSecure = false`
- **Empty biometryTypes check**: Guards `biometryNameMap.get()` call
