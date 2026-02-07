# Context Layer Reorganization

**Description:** Reorganize CLAUDE.md documentation using progressive disclosure with distributed platform-specific context files  <br>
**Created:** 2026-02-06

---

## Overview

Restructure the flat single-file CLAUDE.md into a distributed hierarchy where platform-specific context (iOS, Android, TypeScript) is only loaded when working in those directories. This implements progressive disclosure to reduce token cost and noise while improving maintainability.

## Status Dashboard

| Phase | Description | Status | Sub-plan |
|-------|-------------|--------|----------|
| 1 | [Create Platform-Specific Files](#phase-1-create-platform-specific-files) | ⏳ Pending | — |
| 2 | [Update Root CLAUDE.md](#phase-2-update-root-claudemd) | ⏳ Pending | — |
| 3 | [Validate and Test](#phase-3-validate-and-test) | ⏳ Pending | — |

---

## Phase 1: ⏳ Create Platform-Specific Files

**Status:** Pending  <br>
**BlockedBy:** —  <br>
**Priority:** High  <br>
**Estimated Lines:** 210 total (70 + 60 + 80 lines)

### Objective

Create three new CLAUDE.md files in platform-specific directories containing only relevant context for each platform.

### Tasks

#### 1.1 Create src/CLAUDE.md (TypeScript Core)

**Target:** 70-90 lines (~600 tokens)

**Content:**
- Proxy-based architecture pattern
  - Constructor binding with circular reference
  - `@native` comment markers as documentation convention
  - Stub implementations that are never executed
  - Platform routing via `registerPlugin()`
- ESM import conventions
  - Why .js extensions are used in .ts files
  - TypeScript node16 module resolution
  - Never "fix" extensions to .ts
- Three-layer inheritance pattern
  - WebPlugin → BiometricAuthBase → Native/Web
  - Error transformation (CapacitorException → BiometryError)
  - Public vs protected method separation
- Strict return type requirement
  - oxlint enforces explicit return types
  - No relying on type inference
- Error handling
  - BiometryError custom class with prototype setting
  - String-based error code enum for cross-platform consistency
- Web simulation methods
  - `setBiometryType()`, `setBiometryIsEnrolled()`, `setDeviceIsSecure()`
- Module exports pattern
  - Named export of proxy as `BiometricAuth`
  - Not a default export

**Agent Safety Notes:**
- Never simplify the proxy constructor pattern
- Never remove stub implementations marked with @native
- Never change .js to .ts in imports
- Never remove `Object.setPrototypeOf()` from BiometryError

#### 1.2 Create ios/CLAUDE.md (iOS Native)

**Target:** 50-70 lines (~450 tokens)

**Content:**
- iOS crash prevention guards (from Apple documentation)
  - Face ID Info.plist requirement (`NSFaceIDUsageDescription`)
  - Non-empty reason string requirement
  - Empty fallback title behavior with device credentials
  - Main thread requirement for callbacks
- LocalAuthentication API patterns
  - LAContext usage
  - LAPolicy selection
  - LAError mapping to plugin error codes
- Swift implementation notes
  - How native methods are bound to TypeScript
  - Error code mapping dictionary

**Agent Safety Notes:**
- Never remove crash prevention guards
- These are documented Apple API requirements, not defensive programming

#### 1.3 Create android/CLAUDE.md (Android Native)

**Target:** 60-80 lines (~525 tokens)

**Content:**
- Android API limitations
  - **CRITICAL:** API 28-29 (Android 9/10) biometry strength limitation
    - Cannot combine BIOMETRIC_STRONG + DEVICE_CREDENTIAL
    - Automatic fallback to BIOMETRIC_WEAK
    - Still significant user base, do not remove
  - Negative button restriction when device credentials allowed
  - Non-empty title requirement
- Separate Activity pattern
  - Why AuthActivity is needed (BiometricPrompt requires FragmentActivity)
  - Intent extras for passing options
  - ActivityCallback for results
- NPE guard in error code mapping
  - Added via commit 3f6a956 to fix production crash
  - Some error codes not in mapping need fallback
- BiometricPrompt usage patterns
  - BiometricManager for capability checks
  - Authenticator types (BIOMETRIC_STRONG, BIOMETRIC_WEAK, DEVICE_CREDENTIAL)

**Agent Safety Notes:**
- Never remove API 28-29 workaround (confirmed still critical)
- Never remove NPE guard (fixes real production crash)
- Never remove crash prevention guards

---

## Phase 2: ⏳ Update Root CLAUDE.md

**Status:** Pending  <br>
**BlockedBy:** Phase 1  <br>
**Priority:** High  <br>
**Estimated Lines:** 80-100 lines (~670 tokens)

### Objective

Streamline root CLAUDE.md to focus on cross-cutting concerns and add links to platform-specific context.

### Tasks

#### 2.1 Fix Stale Script References

**Remove:**
- Line 17: `pnpm lint.prettier` (script doesn't exist)
- Line 33: `pnpm docgen` (script doesn't exist)

**Replace with:**
- Correct script: `pnpm format` for Prettier
- Document multi-linter order dependency

#### 2.2 Reorganize Content

**Keep in root:**
- Development commands (build, lint, verify, platform, release)
- Multi-linter order dependency (affects all platforms)
  - Prettier → oxlint → ESLint → TypeScript → SwiftLint
  - Why order matters (rule conflicts)
  - Never run individual linters out of order
- High-level architecture overview
  - Proxy-based platform routing (summary)
  - Three-layer inheritance (summary)
  - Reference platform-specific files for details
- Release process
  - Version synchronization across files
  - Custom Gradle updater
  - Always use `pnpm release`, never manual updates
- Testing strategy
  - No unit tests by design
  - Platform verification via native builds
  - Web simulation for integration testing
  - Real device testing via demo app
- Cross-platform concerns
  - Error codes must match across platforms
  - Reference to src/definitions.ts

**Remove from root (moved to platform files):**
- Proxy architecture details → src/CLAUDE.md
- ESM import conventions → src/CLAUDE.md
- iOS crash guards → ios/CLAUDE.md
- Android API limitations → android/CLAUDE.md

#### 2.3 Add Cross-References

Add section at top:

```markdown
## Platform-Specific Context

For platform-specific patterns and gotchas, see:
- [src/CLAUDE.md](../src/CLAUDE.md) - TypeScript core patterns
- [ios/CLAUDE.md](../ios/CLAUDE.md) - iOS native implementation
- [android/CLAUDE.md](../android/CLAUDE.md) - Android native implementation
```

Add references at bottom:

```markdown
## Related Documentation

- [README.md](../README.md) - API documentation and usage examples
- [demo/README.md](../demo/README.md) - Demo app setup and testing
- [CHANGELOG.md](../CHANGELOG.md) - Version history
```

---

## Phase 3: ⏳ Validate and Test

**Status:** Pending  <br>
**BlockedBy:** Phase 2  <br>
**Priority:** Medium  <br>
**Estimated Lines:** N/A (verification phase)

### Objective

Ensure the reorganized context layer is accurate, complete, and provides correct progressive disclosure.

### Tasks

#### 3.1 Verify Token Budgets

Calculate actual token costs:
- Root CLAUDE.md alone
- Root + src/CLAUDE.md (TypeScript work)
- Root + ios/CLAUDE.md (iOS work)
- Root + android/CLAUDE.md (Android work)

**Success criteria:**
- Root alone: 600-700 tokens
- Root + platform: 1,100-1,300 tokens
- Savings vs single file: 150-350 tokens per session

#### 3.2 Check Cross-References

Verify all links work:
- Root → platform files
- Root → related documentation
- Platform files → src/definitions.ts references

#### 3.3 Validate Content Separation

Ensure no duplication:
- Each fact appears in exactly one file
- Shared knowledge (error codes) properly referenced, not duplicated
- Platform-specific content isolated to platform files

#### 3.4 Review with Agent Simulation

Test scenarios:
- "Fix TypeScript build error" - Should load root + src/CLAUDE.md
- "Fix iOS crash" - Should load root + ios/CLAUDE.md
- "Update Android authentication" - Should load root + android/CLAUDE.md
- "Add new command to package.json" - Should load root only

---

## Token Efficiency Analysis

### Before (Single File)
- 195 lines (~1,450 tokens)
- Loaded for every task regardless of relevance

### After (Distributed)
- Root: 90 lines (~670 tokens) - Always loaded
- TypeScript work: +80 lines (~600 tokens) = 1,270 tokens total
- iOS work: +60 lines (~450 tokens) = 1,120 tokens total
- Android work: +70 lines (~525 tokens) = 1,195 tokens total

### Savings
- TypeScript: 180 tokens (12% reduction)
- iOS: 330 tokens (23% reduction)
- Android: 255 tokens (18% reduction)
- Average: 255 tokens (18% reduction) per platform-specific session

---

## Success Criteria

- [ ] Three platform-specific CLAUDE.md files created
- [ ] Root CLAUDE.md streamlined to 80-100 lines
- [ ] All stale script references fixed
- [ ] Cross-references added and verified
- [ ] No content duplication
- [ ] Token budgets meet targets
- [ ] Agent safety notes documented in each file
