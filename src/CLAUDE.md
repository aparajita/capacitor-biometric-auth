# TypeScript Core — Plugin Architecture

## Proxy-Based Architecture

The plugin uses Capacitor's `registerPlugin()` to create a proxy that dynamically loads platform-specific implementations.

**NEVER simplify or refactor the proxy constructor pattern. It is necessary to bind native code to Typescript methods.**

## @native Comment Markers

Methods marked with `// @native` are implemented on native platforms via the Capacitor bridge. Their TypeScript bodies are stubs that satisfy the compiler but are never executed on iOS/Android.

**NEVER remove stub implementations marked with @native. They are required for compilation.**

## Three-Layer Inheritance

`authenticate()` wraps `internalAuthenticate()` and transforms errors from `CapacitorException` (native) to `BiometryError` (plugin's public error type). `internalAuthenticate()` is the platform-specific implementation detail.

## ESM Import Conventions

All local imports use `.js` extensions even though source files are `.ts`:

```typescript
import { BiometricAuthBase } from './base.js'
```

**NEVER change .js to .ts in import paths. This is correct ESM behavior, not a bug.**

## BiometryError Class

Custom error class in `definitions.ts` with `Object.setPrototypeOf(this, BiometryError.prototype)` in the constructor. This is required for `instanceof` checks to work correctly when extending built-in `Error` in TypeScript.

**NEVER remove the `Object.setPrototypeOf()` call. It ensures `instanceof BiometryError` works.**

## Code Style Conventions

- **Explicit return types**: Always annotate return types. Enforced by the linter.
- **Separate type imports**: `import type { Foo }` on its own line, not combined with value imports.
- **No `public` keyword**: Omit `public` on class members (it is the default).
- **Interface over type**: Use `interface Foo` not `type Foo = {}`.
- **Prefer async/await**: Use `async`/`await` over `.then()` chains.
- **Property signature style**: `foo: () => void` not `foo(): void` in interfaces.
- **Max line length**: 130 characters.
