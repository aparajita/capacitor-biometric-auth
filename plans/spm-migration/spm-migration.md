<div class="markdown-body">

# SPM Migration Plan

## Context

This plugin currently supports only CocoaPods for iOS. Capacitor 8 provides first-class SPM support via the `capacitor-swift-pm` binary xcframework package. This migration adds SPM support while preserving full CocoaPods backward compatibility.

The plugin's Swift code already conforms to `CAPBridgedPlugin` (with `identifier`, `jsName`, `pluginMethods`), so no Swift source changes are needed — only layout and packaging.

---

## Status Dashboard

| Phase | Description                                                                                               | Status     | Sub-plan |
| ----- | --------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| 1     | [Relocate iOS source to SPM-conventional layout](#phase-1-relocate-ios-source-to-spm-conventional-layout) | ⏳ Pending | —        |
| 2     | [Add `Package.swift`](#phase-2-add-packageswift)                                                          | ⏳ Pending | —        |
| 3     | [Update podspec](#phase-3-update-podspec)                                                                 | ⏳ Pending | —        |
| 4     | [Update `package.json`](#phase-4-update-packagejson)                                                      | ⏳ Pending | —        |
| 5     | [Update local Xcode project](#phase-5-update-local-xcode-project)                                         | ⏳ Pending | —        |
| 6     | [Add `demo-spm` workspace package](#phase-6-add-demo-spm-workspace-package)                               | ⏳ Pending | —        |
| 7     | [Update Swift lint paths](#phase-7-update-swift-lint-paths)                                               | ⏳ Pending | —        |

---

## Phase 1: ⏳ Relocate iOS source to SPM-conventional layout

**Status:** Pending <br>
**BlockedBy:** — <br>
**Testing:** Manual verification via `pnpm verify.ios` <br>
**Priority:** High <br>
**Estimated Lines:** ~20

Move source from `ios/Plugin/` to `ios/Sources/BiometricAuthNative/`. Target name `BiometricAuthNative` matches the plugin class name and `jsName`.

### Tasks

1. Create `ios/Sources/BiometricAuthNative/`.
2. Move `ios/Plugin/Plugin.swift` → `ios/Sources/BiometricAuthNative/BiometricAuthNative.swift`.
3. Keep `ios/Plugin/Info.plist` in place (needed by the local Xcode project).
4. Delete `ios/Plugin/` directory once empty of source files (keep `Info.plist` if under `ios/Plugin/`).
   - Actually: move `Info.plist` to `ios/` directly so `ios/Plugin/` can be removed entirely as a source directory.

### Files affected

- `ios/Plugin/Plugin.swift` → `ios/Sources/BiometricAuthNative/BiometricAuthNative.swift`
- `ios/Plugin/Info.plist` → `ios/Info.plist`

---

## Phase 2: ⏳ Add `Package.swift`

**Status:** Pending <br>
**BlockedBy:** 1 <br>
**Testing:** Manual verification via Xcode <br>
**Priority:** High <br>
**Estimated Lines:** ~30

Create `Package.swift` at `ios/` for SPM consumers.

### Tasks

1. Create `ios/Package.swift` with proper package configuration

### `ios/Package.swift` contents

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AparajitaCapacitorBiometricAuth",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "BiometricAuthNative",
            targets: ["BiometricAuthNative"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "BiometricAuthNative",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "Sources/BiometricAuthNative")
    ]
)
```

### Files affected

- `ios/Package.swift` (new)

---

## Phase 3: ⏳ Update podspec

**Status:** Pending <br>
**BlockedBy:** 1 <br>
**Testing:** `pnpm verify.ios` <br>
**Priority:** High <br>
**Estimated Lines:** 1

Point podspec at new source location.

### Tasks

1. Update `source_files` path in podspec to point at `ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}`

### Change in `AparajitaCapacitorBiometricAuth.podspec`

```ruby
# Before:
s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'

# After:
s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
```

Everything else in the podspec stays the same.

### Files affected

- `AparajitaCapacitorBiometricAuth.podspec`

---

## Phase 4: ⏳ Update `package.json`

**Status:** Pending <br>
**BlockedBy:** 1, 2 <br>
**Testing:** `pnpm pack --dry-run` <br>
**Priority:** High <br>
**Estimated Lines:** ~5

Update `package.json` to include new file paths and update lint script.

### Tasks

1. Update `files` array to include `ios/Sources/` and `ios/Package.swift`
2. Update `lint.swift` script to use new path `ios/Sources/**/*.swift`

### 4a. `files` array

```jsonc
// Before:
"ios/Plugin/"

// After:
"ios/Sources/",
"ios/Package.swift"
```

Keep `*.podspec` (already included).

### 4b. Script updates

- `lint.swift`: change `ios/Plugin/**/*.swift` → `ios/Sources/**/*.swift`
- `verify.ios`: no change needed (it runs `pod install` + xcodebuild on the workspace, which uses the podspec's `source_files`)

### Files affected

- `package.json`

---

## Phase 5: ⏳ Update local Xcode project

**Status:** Pending <br>
**BlockedBy:** 1 <br>
**Testing:** `pnpm verify.ios` <br>
**Priority:** High <br>
**Estimated Lines:** Manual Xcode update

Keep `ios/Plugin.xcodeproj` / `Plugin.xcworkspace` working for local dev.

### Tasks

1. In `ios/Plugin.xcodeproj`, update the file reference for `Plugin.swift` to point at `Sources/BiometricAuthNative/BiometricAuthNative.swift`.
2. Update the `Info.plist` reference if it moved to `ios/Info.plist`.
3. Verify the workspace still builds: `pnpm verify.ios`.

### Files affected

- `ios/Plugin.xcodeproj/project.pbxproj`

---

## Phase 6: Add `demo-spm` workspace package

**Goal**: A minimal Capacitor demo app that uses the plugin via SPM instead of CocoaPods, reusing the existing demo's web build output.

### 6a. Structure

```
demo-spm/
├── package.json
├── capacitor.config.ts
├── ionic.config.json
└── ios/
    └── App/
        ├── App/
        │   ├── AppDelegate.swift
        │   ├── Info.plist
        │   ├── Assets.xcassets/
        │   └── ... (standard Capacitor app files)
        ├── App.xcodeproj/
        └── App.xcworkspace/  (no Podfile)
```

### 6b. `demo-spm/package.json`

Minimal — just enough for Capacitor CLI:

```jsonc
{
  "name": "@aparajita/capacitor-biometric-auth-demo-spm",
  "version": "9.1.2",
  "private": true,
  "scripts": {
    "build.web": "pnpm --filter @aparajita/capacitor-biometric-auth-demo build",
    "sync": "pnpm build.web && cap sync ios",
    "ios": "ionic cap run ios --open",
    "ios.dev": "ionic cap run ios --open --livereload --external",
  },
  "dependencies": {
    "@aparajita/capacitor-biometric-auth": "workspace:*",
    "@capacitor/app": "^8.0.0",
    "@capacitor/core": "^8.0.2",
    "@capacitor/haptics": "^8.0.0",
    "@capacitor/ios": "^8.0.2",
    "@capacitor/keyboard": "^8.0.0",
    "@capacitor/splash-screen": "^8.0.0",
  },
  "devDependencies": {
    "@capacitor/cli": "^8.0.2",
    "@ionic/cli": "^7.2.1",
  },
}
```

### 6c. `demo-spm/capacitor.config.ts`

Same as `demo/capacitor.config.ts` but with `webDir: '../demo/dist'`.

### 6d. Xcode project setup

The `demo-spm/ios/App` Xcode project must:

1. **Not** have a Podfile — no CocoaPods.
2. Add the plugin as a local Swift package dependency pointing to `../../../ios` (the plugin's `Package.swift`).
3. Add Capacitor and other dependencies via SPM (from `capacitor-swift-pm`).
4. Link the `BiometricAuthNative` library product to the App target.

This Xcode project will be created via `cap add ios` and then manually converted from CocoaPods to SPM.

### 6e. Workspace updates

`pnpm-workspace.yaml`:

```yaml
packages:
  - demo
  - demo-spm
```

### 6f. Root script additions in `package.json`

```jsonc
"demo.ios.spm": "pnpm build && pnpm --filter @aparajita/capacitor-biometric-auth-demo-spm ios",
"demo.open.ios.spm": "pnpm --filter @aparajita/capacitor-biometric-auth-demo-spm ios",
"demo.ios.spm.dev": "pnpm --filter @aparajita/capacitor-biometric-auth-demo-spm ios.dev"
```

### Files affected

- `demo-spm/` (new directory)
- `pnpm-workspace.yaml`
- `package.json` (root scripts)

---

## Phase 7: Update Swift lint paths

The `lint.swift` script also lints demo Swift files. Add the SPM demo path:

```jsonc
// Before:
"lint.swift": "swiftly --fix ios/Plugin/**/*.swift && swiftly --fix demo/ios/App/App/**/*.swift"

// After:
"lint.swift": "swiftly --fix ios/Sources/**/*.swift && swiftly --fix demo/ios/App/App/**/*.swift && swiftly --fix demo-spm/ios/App/App/**/*.swift"
```

### Files affected

- `package.json`

---

## Verification

### CocoaPods path (existing)

1. `pnpm verify.ios` — plugin builds via CocoaPods workspace
2. `pnpm demo.ios` — demo app runs on device/simulator via Pods

### SPM path (new)

1. Open `ios/` as a Swift package in Xcode — confirm it resolves dependencies and builds
2. `pnpm demo.ios.spm` — SPM demo app runs on device/simulator
3. Confirm runtime behavior parity: `checkBiometry()` and `internalAuthenticate()` work identically in both demos

### npm package

1. `pnpm pack --dry-run` — verify `ios/Sources/`, `ios/Package.swift`, and `*.podspec` are all included
2. Verify `ios/Plugin/` is no longer referenced

</div>
