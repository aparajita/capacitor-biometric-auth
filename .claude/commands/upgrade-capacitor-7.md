# Capacitor 7 + Demo Integration Upgrade Plan

This document provides a step-by-step plan for upgrading Capacitor plugins from version 6 to 7, including ESLint 9 migration, ESM conversion, demo integration, and modern tooling setup.

## Files to Copy from Reference Project

Copy these files/directories from this project to the target project:

### Configuration Files

- `eslint.config.mjs`
- `eslint/` (entire directory)
- `oxlint.config.jsonc`
- `pnpm-workspace.yaml`
- `simple-git-hooks.mjs`
- `prettier.config.mjs`
- `commitlint.config.mjs`
- `rollup.config.mjs`

### Scripts

- `scripts/release.sh`
- `scripts/ensure-clean.sh`
- Make executable: `chmod +x scripts/*.sh`

### Reference Files for Manual Updates

- `package.json` (for scripts and dependencies)
- `demo/package.json` (for demo structure)
- `demo/eslint.config.js` (for demo ESLint config)
- `CLAUDE.md` (for documentation updates)

## Phase 1: ESLint 9 Migration & Modern Config

### 1.1 Remove old files

- Delete `.eslintrc.js` and `.eslintignore`

### 1.2 Copy new config files

- Copy `eslint.config.mjs` and `eslint/` directory
- Copy `oxlint.config.jsonc`

### 1.3 Update package.json dependencies

Remove old TypeScript ESLint packages:

```json
// Remove these
"@typescript-eslint/eslint-plugin": "...",
"@typescript-eslint/parser": "..."
```

Add new dependencies (copy from reference package.json):

```json
{
  "eslint": "^9.30.0",
  "eslint-config-prettier": "^10.1.0",
  "eslint-plugin-import": "^2.31.0",
  "eslint-plugin-oxlint": "^1.3.0",
  "eslint-plugin-unicorn": "^59.0.0",
  "@eslint-community/eslint-plugin-eslint-comments": "^4.5.0",
  "neostandard": "^0.12.0",
  "typescript-eslint": "^8.18.0",
  "oxlint": "^1.3.0"
}
```

### 1.4 Update npm scripts

Replace lint-related scripts with these:

```json
{
  "format": "prettier --write --log-level error .",
  "lint.oxlint": "oxlint --config oxlint.config.jsonc --deny-warnings --fix",
  "lint.eslint": "eslint . --ext .js,.mjs,.ts --cache --fix",
  "lint.tsc": "tsc --noEmit --skipLibCheck",
  "lint": "pnpm format && pnpm lint.oxlint && pnpm lint.eslint && pnpm lint.tsc"
}
```

## Phase 2: ESM Migration

### 2.1 Copy ESM config files

- Copy `prettier.config.mjs`
- Copy `commitlint.config.mjs`
- Copy `rollup.config.mjs`
- Copy `simple-git-hooks.mjs`

### 2.2 Update package.json

- Add `"type": "module"`
- Delete old config files (`.prettierrc.js`, etc.)

### 2.3 Install git hooks

```bash
pnpm simple-git-hooks
```

## Phase 3: Core Capacitor 7 Upgrade

### 3.1 Update Capacitor dependencies

```json
{
  "dependencies": {
    "@capacitor/core": "^7.0.0",
    "@capacitor/android": "^7.0.0",
    "@capacitor/ios": "^7.0.0",
    "@capacitor/app": "^7.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0"
  }
}
```

### 3.2 Update package.json metadata

- Change description from "Capacitor 5+" to "Capacitor 7+"
- Update version to 7.0.0

### 3.3 Update native files (if needed)

- Check `android/build.gradle` for version updates
- Check `ios/Podfile` for iOS version updates

## Phase 4: Demo Integration

### 4.1 Create workspace

- Copy `pnpm-workspace.yaml`

### 4.2 Update demo

- Update demo `package.json` to match reference
- Copy demo `eslint.config.js`
- Update demo dependencies to Capacitor 7

### 4.3 Add demo scripts to main package.json

Copy these scripts (adjust package names):

```json
{
  "demo.dev": "pnpm --filter @your-scope/your-plugin-demo dev",
  "demo.build": "pnpm --filter @your-scope/your-plugin-demo build",
  "demo.lint": "pnpm --filter @your-scope/your-plugin-demo lint",
  "demo.ios": "pnpm build && pnpm --filter @your-scope/your-plugin-demo ios",
  "demo.ios.dev": "pnpm --filter @your-scope/your-plugin-demo ios.dev",
  "demo.android": "pnpm build && pnpm --filter @your-scope/your-plugin-demo android",
  "demo.android.dev": "pnpm --filter @your-scope/your-plugin-demo android.dev"
}
```

## Phase 5: Release Process & Git Flow

### 5.1 Copy release scripts

- Copy `scripts/release.sh` and `scripts/ensure-clean.sh`
- Make executable: `chmod +x scripts/*.sh`

### 5.2 Update release scripts

Update these scripts (adjust package names):

```json
{
  "prerelease": "pnpm build",
  "tag": "commit-and-tag-version --bumpFiles package.json --bumpFiles demo/package.json",
  "tag.preview": "pnpm tag --dry-run",
  "release": "./scripts/release.sh"
}
```

### 5.3 Update commit-and-tag-version config

```json
{
  "commit-and-tag-version": {
    "scripts": {
      "postbump": "pnpm builder"
    }
  }
}
```

## Phase 6: Documentation Updates

### 6.1 Update CLAUDE.md

Copy relevant sections from reference CLAUDE.md:

- Development Commands
- Demo Commands
- Linting and Code Quality
- Git Workflow
- Release Process

## Testing After Each Phase

1. `pnpm install` - Update dependencies
2. `pnpm lint` - Verify linting works
3. `pnpm build` - Verify build process
4. `pnpm demo.dev` - Test demo integration

## Key Project-Specific Changes

When copying files, update these project-specific values:

- Package names in demo scripts
- Plugin names in workspace config
- Scope names in package.json
- Repository URLs in package.json

## Verification Checklist

- [ ] ESLint flat config working
- [ ] Oxlint running without errors
- [ ] Build process working
- [ ] Demo workspace integrated
- [ ] Release scripts working
- [ ] Git Flow documented
- [ ] All tests passing
