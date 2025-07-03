# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Build the plugin:**

- `pnpm build` - Full production build with linting
- `pnpm build.dev` - Development build with source maps
- `pnpm watch` - Watch mode for continuous development builds

**Linting and Type Checking:**

- `pnpm lint` - Run all linters (ESLint, Prettier, TypeScript, SwiftLint)
- `pnpm lint.eslint .` - ESLint only
- `pnpm lint.prettier '**/*.{js,mjs,ts,json,md,java}'` - Prettier only
- `pnpm lint.tsc` - TypeScript type checking only

**Platform Verification:**

- `pnpm verify` - Verify both iOS and Android builds
- `pnpm verify.ios` - Verify iOS build only
- `pnpm verify.android` - Verify Android build only

**Platform Development:**

- `pnpm open.ios` - Open iOS project in Xcode
- `pnpm open.android` - Open Android project in Android Studio

**Documentation:**

- `pnpm docgen` - Generate API documentation from JSDoc comments

**Release:**

- `pnpm prerelease` - Prepare for release (builds, generates docs, ensures clean git)
- `pnpm release` - Create release with commit-and-tag-version

## Project Architecture

This is a **Capacitor plugin** that provides biometric authentication capabilities across web, iOS, and Android platforms.

### Core Architecture Pattern

The plugin uses a **proxy-based architecture** with platform-specific implementations:

1. **Plugin Registration** (`src/index.ts`): Uses Capacitor's `registerPlugin()` to create a proxy that dynamically loads platform-specific implementations
2. **Base Class** (`src/base.ts`): Abstract `BiometricAuthBase` class that extends `WebPlugin` and provides common functionality
3. **Native Implementation** (`src/native.ts`): `BiometricAuthNative` class for iOS/Android with method binding to native code
4. **Web Implementation** (`src/web.ts`): Web-specific implementation for browser testing/simulation
5. **Type Definitions** (`src/definitions.ts`): Comprehensive TypeScript interfaces and enums

### Key Components

- **BiometricAuthPlugin Interface**: Main plugin contract defining all available methods
- **CheckBiometryResult**: Comprehensive biometry capability detection results
- **AuthenticateOptions**: Cross-platform authentication configuration
- **BiometryError**: Standardized error handling with platform-consistent error codes
- **Platform Bridge**: Native methods marked with `@native` comments are bound to platform implementations

### Native Platform Structure

- **iOS**: `ios/Plugin/` contains Swift/Objective-C implementation
- **Android**: `android/src/main/java/com/aparajita/capacitor/biometricauth/` contains Java implementation
- **Native Methods**: `checkBiometry()` and `internalAuthenticate()` are the core native methods

### Build System

- **TypeScript Compilation**: `tsc` compiles to `dist/esm/`
- **Rollup Bundling**: Creates multiple output formats (IIFE, CJS) in `dist/`
- **Platform Files**: iOS `.podspec` and Android `build.gradle` for native dependencies

### Development Workflow

1. TypeScript source in `src/` → compiled to `dist/esm/`
2. Rollup bundles ESM output → `dist/plugin.js` (IIFE) and `dist/plugin.cjs.js` (CommonJS)
3. Native platforms consume the plugin via Capacitor's bridge
4. Web platform uses simulation capabilities for testing

### Testing Strategy

- **Web Simulation**: Use `setBiometryType()`, `setBiometryIsEnrolled()`, `setDeviceIsSecure()` for web testing
- **Platform Verification**: `verify.ios` and `verify.android` commands test native builds
- **No Unit Tests**: This project relies on platform verification rather than traditional unit tests

### Error Handling

All authentication failures throw `BiometryError` instances with:

- `message`: Human-readable error description
- `code`: Platform-consistent `BiometryErrorType` enum value

### Development Notes

- Always run `pnpm lint` before committing - it includes TypeScript, ESLint, Prettier, and SwiftLint
- Use `pnpm watch` for continuous development
- Platform-specific code is handled by the native implementations, not the TypeScript layer
- The plugin supports comprehensive biometry detection across all major biometric types
