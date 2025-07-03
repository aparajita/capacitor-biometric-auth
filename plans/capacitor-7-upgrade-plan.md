# Capacitor 7 Upgrade Plan

## @aparajita/capacitor-biometric-auth

This document provides a comprehensive step-by-step plan for upgrading the Capacitor Biometric Auth plugin from version 6 to 7, including ESLint 9 migration, ESM conversion, and modern tooling setup.

## Current Status Overview

### ✅ Already Completed

- `.eslintrc.js` removed
- `eslint.config.mjs` and `eslint/` directory added
- `oxlint.config.jsonc` added
- `scripts/release.sh` added
- Basic file structure prepared

### 🔄 In Progress

- ESLint 9 migration (dependencies and scripts need updating)

### ⏳ Remaining

- ESM configuration updates
- Capacitor 7 dependency upgrades
- Package.json script updates
- Documentation updates

---

## Phase 1: Complete ESLint 9 Migration

### Current Status: 🔄 Partially Complete

- ✅ Config files added
- ❌ Dependencies need updating
- ❌ Scripts need updating

### Steps to Complete:

#### 1.1 Update package.json dependencies

Remove old TypeScript ESLint packages:

```json
// Remove these from devDependencies
"@typescript-eslint/eslint-plugin": "^7.16.1",
"@typescript-eslint/parser": "^7.16.1",
"@aparajita/eslint-config-base": "^1.1.6",
"eslint": "^8.57.0",
"eslint-config-standard": "^17.1.0",
"eslint-plugin-n": "^16.6.2",
"eslint-plugin-promise": "^6.4.0"
```

Add new ESLint 9 dependencies:

```json
// Add these to devDependencies
"eslint": "^9.30.0",
"eslint-config-prettier": "^10.1.0",
"eslint-plugin-import": "^2.31.0",
"eslint-plugin-oxlint": "^1.3.0",
"eslint-plugin-unicorn": "^59.0.0",
"@eslint-community/eslint-plugin-eslint-comments": "^4.5.0",
"neostandard": "^0.12.0",
"typescript-eslint": "^8.18.0",
"oxlint": "^1.3.0"
```

#### 1.2 Update npm scripts

Replace current lint scripts with:

```json
{
  "format": "prettier --write --log-level error .",
  "lint.oxlint": "oxlint --config oxlint.config.jsonc --deny-warnings --fix",
  "lint.eslint": "eslint . --ext .js,.mjs,.ts --cache --fix",
  "lint.tsc": "tsc --noEmit",
  "lint": "pnpm format && pnpm lint.oxlint && pnpm lint.eslint && pnpm lint.tsc && swiftly ios"
}
```

#### 1.3 Test Phase 1

```bash
pnpm install
pnpm lint
pnpm build
```

---

## Phase 2: ESM Migration

### Current Status: ⏳ Not Started

### Steps:

#### 2.1 Update configuration files to ESM

Check and update these files:

- `prettier.config.js` → `prettier.config.mjs`
- `commitlint.config.js` → `commitlint.config.mjs`
- `simple-git-hooks.js` → `simple-git-hooks.mjs`

#### 2.2 Update package.json

- Add `"type": "module"`
- Update any CJS-style imports/exports

#### 2.3 Install git hooks

```bash
pnpm exec simple-git-hooks
```

#### 2.4 Test Phase 2

```bash
pnpm install
pnpm lint
pnpm builder
```

---

## Phase 3: Core Capacitor 7 Upgrade

### Current Status: ⏳ Not Started

### Steps:

#### 3.1 Update Capacitor dependencies

Update in package.json:

```json
{
  "devDependencies": {
    "@capacitor/cli": "^7.0.0",
    "@capacitor/android": "^7.0.0",
    "@capacitor/app": "^7.0.0",
    "@capacitor/core": "^7.0.0",
    "@capacitor/ios": "^7.0.0"
  },
  "peerDependencies": {
    "@capacitor/core": ">=7.0.0"
  }
}
```

#### 3.2 Update package.json metadata

- Change description from current to "Provides access to native biometric auth & device security APIs for Capacitor 7+ apps"
- Update version to 7.0.0

#### 3.3 Check native files

- Review `android/build.gradle` for any needed updates
- Review `ios/Podfile` for iOS version requirements

#### 3.4 Update package.json scripts

- Remove "verify\*" scripts

#### 3.5 Test Phase 3

```bash
pnpm install
pnpm build
```

---

## Phase 4: Demo Integration (Optional)

### Current Status: ⏳ Evaluate if needed

### Steps (if applicable):

#### 4.1 Evaluate demo requirement

- Check if demo integration is needed for this project
- Review if workspace configuration is appropriate

#### 4.2 Update workspace (if needed)

- Ensure `pnpm-workspace.yaml` is properly configured
- Add demo scripts if demo exists

---

## Phase 5: Release Process Updates

### Current Status: 🔄 Partially Complete

- ✅ `scripts/release.sh` added
- ❌ Package.json scripts need updating

### Steps:

#### 5.1 Update release scripts in package.json

```json
{
  "prerelease": "scripts/ensure-clean.sh && pnpm build && pnpm docgen && git add README.md",
  "release": "./scripts/release.sh"
}
```

#### 5.2 Make scripts executable

```bash
chmod +x scripts/*.sh
```

#### 5.3 Test release process

```bash
pnpm prerelease
```

---

## Phase 6: Documentation Updates

### Current Status: ⏳ Not Started

### Steps:

#### 6.1 Update CLAUDE.md

Add new development commands:

```markdown
**Linting and Type Checking:**

- `pnpm lint` - Run all linters (oxlint, ESLint, TypeScript, SwiftLint)
- `pnpm lint.oxlint` - oxlint only
- `pnpm lint.eslint .` - ESLint only
- `pnpm lint.tsc` - TypeScript type checking only
- `pnpm format` - Prettier formatting
```

#### 6.2 Update build documentation

- Document new ESM setup
- Update any references to old ESLint config

---

## Verification Checklist

After completing all phases:

- [ ] ESLint 9 flat config working without errors
- [ ] Oxlint running without warnings
- [ ] TypeScript compilation successful
- [ ] Build process working (`pnpm build`)
- [ ] SwiftLint integration working
- [ ] Release process functional
- [ ] All dependencies updated to Capacitor 7
- [ ] Documentation updated

---

## Project-Specific Notes

### Package Names

- Main package: `@aparajita/capacitor-biometric-auth`
- Repository: `https://github.com/aparajita/capacitor-biometric-auth.git`

### Current Dependencies to Update

- Capacitor: 6.x → 7.x
- ESLint: 8.x → 9.x
- TypeScript ESLint: 7.x → 8.x

### Native Platform Notes

- iOS: Swift implementation in `ios/Plugin/`
- Android: Java implementation in `android/src/main/java/com/aparajita/capacitor/biometricauth/`
- Both platforms use existing Capacitor bridge patterns

---

## Troubleshooting

### Common Issues

1. **ESLint flat config errors**: Check `eslint.config.mjs` syntax
2. **oxlint warnings**: Review `oxlint.config.jsonc` rules
3. **TypeScript errors**: Ensure `tsconfig.json` is compatible
4. **Build failures**: Check rollup configuration for ESM compatibility

### Recovery Commands

```bash
# Reset dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset build
pnpm clean && pnpm build

# Check configuration
pnpm lint --debug
```

---

## Phase Execution Commands

### Phase 1: ESLint 9 Migration

```bash
# Update dependencies in package.json manually
pnpm install
pnpm lint
pnpm build
```

### Phase 2: ESM Migration

```bash
# Update config files to .mjs
# Add "type": "module" to package.json
pnpm simple-git-hooks
pnpm install && pnpm lint && pnpm build
```

### Phase 3: Capacitor 7 Upgrade

```bash
# Update Capacitor dependencies in package.json
pnpm install
pnpm build
pnpm verify
```

### Phase 4: Demo Integration

```bash
# Evaluate and implement if needed
```

### Phase 5: Release Process

```bash
chmod +x scripts/*.sh
pnpm prerelease
```

### Phase 6: Documentation

```bash
# Update CLAUDE.md
# Update README.md if needed
pnpm docgen
```

This plan provides a complete roadmap for upgrading to Capacitor 7 while maintaining all existing functionality and improving the development experience.
