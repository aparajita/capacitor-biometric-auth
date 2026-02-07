# CLAUDE.md

## Platform-Specific Context

For platform-specific patterns and gotchas, see:
- [src/CLAUDE.md](src/CLAUDE.md) — TypeScript core patterns
- [ios/CLAUDE.md](ios/CLAUDE.md) — iOS native implementation
- [android/CLAUDE.md](android/CLAUDE.md) — Android native implementation

## Package Manager

Always use `pnpm` (not `npm`) and `pnpm dlx` (not `npx`).

## Development Commands

**Build the plugin:**

- `pnpm build` — Full production build with linting

**Linting:**

- `pnpm lint` — Run all linters (TypeScript + Swift)
- `pnpm lint.ts` — Run TypeScript linters only (use after editing TypeScript)
- `pnpm lint.swift` — Run Swift linter only (use after editing Swift)

**Platform Verification:**

- `pnpm verify` — Verify both iOS and Android builds
- `pnpm verify.ios` — Verify iOS build only
- `pnpm verify.android` — Verify Android build only

**Plugin Platform Development:**

- `pnpm open.ios` — Open iOS project in Xcode
- `pnpm open.android` — Open Android project in Android Studio

**Release:**

- `pnpm release` — Create release (version bump, tag, update iOS and Android versions, changelog). Never manually update version numbers.

**Demo App:**

The demo app lives in `demo/` (pnpm workspace). Scripts are prefixed with `demo.` (e.g., `pnpm demo.dev`, `pnpm demo.ios`).

## Project Architecture

This is a **Capacitor plugin** providing biometric authentication across web, iOS, and Android.

### Native Platform Structure

- **iOS**: `ios/Plugin/` — Swift implementation using LocalAuthentication
- **Android**: `android/src/main/java/com/aparajita/capacitor/biometricauth/` — Java implementation using BiometricPrompt
- **Core native methods**: `checkBiometry()` and `internalAuthenticate()`

## Cross-Platform Error Consistency

Error codes must match exactly across all three platforms (TypeScript, Swift, Java). The canonical list is in `src/definitions.ts` (`BiometryErrorType` enum). When adding or modifying error codes, update all three platforms.

## Testing Strategy

- **No unit tests** — This project relies on platform verification rather than traditional unit tests
- **Platform verification**: `pnpm verify.ios` and `pnpm verify.android` test native builds
- **Web simulation**: `setBiometryType()`, `setBiometryIsEnrolled()`, `setDeviceIsSecure()` for testing without hardware
- **Real device testing**: Use the demo app for end-to-end testing
