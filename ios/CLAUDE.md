# iOS Native — Crash Prevention Guards

These guards prevent real crashes from documented Apple API requirements. They are NOT defensive programming.

## Face ID Info.plist Requirement

If the device supports Face ID but `NSFaceIDUsageDescription` is missing from the **app's** Info.plist, calling `evaluatePolicy()` will crash. The plugin checks for this key and returns `biometryNotAvailable` if missing.

**NEVER remove this check. It prevents a hard crash on Face ID devices.**

## Non-Empty Reason String

The `reason` parameter passed to `evaluatePolicy()` must be non-nil and non-empty, otherwise it crashes. The plugin falls back to "Access requires authentication" if not provided.

**NEVER remove the empty-string guard on the reason parameter.**

## Empty Fallback Title with Device Credentials

When `allowDeviceCredential` is true, an empty `iosFallbackTitle` would suppress the fallback button, contradicting the purpose of allowing device credentials. The plugin converts empty string to `nil` to use the system default.

## Main Thread Callbacks

`evaluatePolicy()` callbacks run on a background thread. All Capacitor plugin calls (`call.resolve()`, `call.reject()`) must be on the main thread. The plugin wraps callbacks in `DispatchQueue.main.async`.

**NEVER remove the main thread dispatch. It prevents threading crashes.**
