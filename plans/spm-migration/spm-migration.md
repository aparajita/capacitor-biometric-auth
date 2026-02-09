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

**Goal**: A minimal Capacitor demo app that uses the plugin via SPM instead of CocoaPods, following the same shared-demo pattern as `demo-pods`.

The demo apps share web source code via `demo-shared/`. Each demo variant (`demo-pods`, `demo-spm`) has symlinks to `demo-shared/` for web files and its own `capacitor.config.ts` that extends the base config and sets `webDir: '../demo-shared/dist'`. Native files are synced between variants using `scripts/sync-demos.sh`.

### 6a. Structure

```
demo-spm/
├── .browserslistrc          → ../demo-shared/.browserslistrc (symlink)
├── .npmrc                   → ../demo-shared/.npmrc (symlink)
├── .prettierignore          → ../demo-shared/.prettierignore (symlink)
├── index.html               → ../demo-shared/index.html (symlink)
├── public                   → ../demo-shared/public (symlink)
├── src                      → ../demo-shared/src (symlink)
├── package.json             (real — variant-specific)
├── capacitor.config.ts      (real — extends demo-shared base config)
├── ionic.config.json        (real — variant-specific)
├── postcss.config.mjs       (real — variant-specific)
├── prettier.config.js       (real — variant-specific)
├── tailwind.config.mjs      (real — variant-specific)
├── tsconfig.json            (real — variant-specific)
├── tsconfig.config.json     (real — variant-specific)
├── vite.config.mjs          (real — variant-specific)
└── ios/
    └── App/
        ├── App/
        │   ├── AppDelegate.swift
        │   ├── Info.plist
        │   ├── Assets.xcassets/
        │   └── ... (standard Capacitor app files)
        ├── App.xcodeproj/
        └── App.xcworkspace/  (no Podfile — SPM only)
```

### 6b. `demo-spm/package.json`

Mirrors `demo-pods/package.json` but iOS-only (no Android deps) and named `demo-spm`:

```jsonc
{
  "name": "demo-spm",
  "version": "9.1.2",
  "description": "An Ionic/Vue demo of the @aparajita/capacitor-biometric-auth plugin (SPM variant)",
  "private": true,
  "author": "Aparajita Fishman",
  "scripts": {
    "dev": "pnpm --filter demo-shared dev",
    "build": "pnpm --filter demo-shared build",
    "preview": "pnpm --filter demo-shared preview",
    "ios.dev": "ionic cap run ios --open --livereload --external",
    "ios": "ionic cap run ios --open",
    "ionic:build": "pnpm build",
    "ionic:serve": "pnpm --filter demo-shared dev",
  },
  "dependencies": {
    "@aparajita/capacitor-biometric-auth": "workspace:*",
    "demo-shared": "workspace:*",
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

Extends the base config from `demo-shared`, same pattern as `demo-pods`:

```ts
import baseConfig from 'demo-shared/capacitor.config'

const config = {
  ...baseConfig,
  appId: 'com.aparajita.capacitor.biometricauthdemo',
  appName: 'Biometry',
  webDir: '../demo-shared/dist',
}

export default config
```

### 6d. Symlinks

Create the same symlinks as `demo-pods`:

```bash
cd demo-spm
ln -s ../demo-shared/.browserslistrc .browserslistrc
ln -s ../demo-shared/.npmrc .npmrc
ln -s ../demo-shared/.prettierignore .prettierignore
ln -s ../demo-shared/index.html index.html
ln -s ../demo-shared/public public
ln -s ../demo-shared/src src
```

### 6e. Xcode project setup

Create the iOS project with SPM from the start:

```bash
cd demo-spm
cap add ios --packagemanager SPM
```

Then in the Xcode project:

1. Add the plugin as a local Swift package dependency pointing to `../../../ios` (the plugin's `Package.swift`).
2. Link the `BiometricAuthNative` library product to the App target.

### 6f. Native file sync

Native iOS files (AppDelegate, Info.plist, Assets, etc.) are synced from `demo-pods` using `scripts/sync-demos.sh`. The script already includes `demo-spm` in its `VARIANTS` array, so no changes to the script are needed.

### 6g. Workspace updates

`pnpm-workspace.yaml`:

```yaml
packages:
  - demo-pods
  - demo-shared
  - demo-spm
```

### 6h. Root script additions in `package.json`

Following the existing `demo.pods.*` naming convention:

```jsonc
"demo.spm.dev": "pnpm --filter demo-spm dev",
"demo.spm.build": "pnpm --filter demo-spm build",
"demo.spm.ios": "pnpm --filter demo-spm ios",
"demo.spm.ios.dev": "pnpm --filter demo-spm ios.dev",
"demo.spm.open.ios": "pnpm --filter demo-spm open.ios"
```

### 6i. Version bump config

Add `demo-spm/package.json` to the `commit-and-tag-version.bumpFiles` array in the root `package.json`:

```jsonc
"bumpFiles": [
  "package.json",
  "demo-pods/package.json",
  "demo-spm/package.json",
  // ...existing gradle entry
]
```

### Files affected

- `demo-spm/` (new directory with symlinks and real files)
- `pnpm-workspace.yaml`
- `package.json` (root scripts and bumpFiles)

---

## Phase 7: Update Swift lint paths

The `lint.swift` script also lints demo Swift files. Add the SPM demo path:

```jsonc
// Before:
"lint.swift": "swiftly --fix ios/Sources/**/*.swift && swiftly --fix demo-pods/ios/App/App/**/*.swift"

// After:
"lint.swift": "swiftly --fix ios/Sources/**/*.swift && swiftly --fix demo-pods/ios/App/App/**/*.swift && swiftly --fix demo-spm/ios/App/App/**/*.swift"
```

### Files affected

- `package.json`

---

## Verification

### CocoaPods path (existing)

1. `pnpm verify.ios` — plugin builds via CocoaPods workspace
2. `pnpm demo.pods.ios` — demo app runs on device/simulator via Pods

### SPM path (new)

1. Open `ios/` as a Swift package in Xcode — confirm it resolves dependencies and builds
2. `pnpm demo.spm.ios` — SPM demo app runs on device/simulator
3. Confirm runtime behavior parity: `checkBiometry()` and `internalAuthenticate()` work identically in both demos

### npm package

1. `pnpm pack --dry-run` — verify `ios/Sources/`, `ios/Package.swift`, and `*.podspec` are all included
2. Verify `ios/Plugin/` is no longer referenced

</div>
