<div class="markdown-body">

# capacitor-biometric-auth&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/@aparajita%2Fcapacitor-biometric-auth.svg)](https://badge.fury.io/js/@aparajita%2Fcapacitor-biometric-auth)

This plugin for [Capacitor 8](https://capacitorjs.com) provides access to native biometry and device credentials on iOS and Android. It supports every type of biometry and every configuration option on both platforms. In addition, biometry and device credentials are simulated on the web so you can test your logic without making any changes to your code.

🛑 **BREAKING CHANGES:**

- If you are upgrading from a version prior to 9.0.0, please note that this plugin now requires Capacitor 8+.

- If you are upgrading from a version prior to 8.0.0, please note that [`addResumeListener`](#addresumelistener) now always returns a Promise and must be awaited.

- If you are upgrading from a version prior to 7.0.0, please note that [`authenticate()`](#authenticate) will _immediately_ present a prompt for device credentials if `deviceIsSecure` is true, `allowDeviceCredentials` is true, and no biometry of the requested strength is available.

- If you are upgrading from a version prior to 6.0.0, please note that [`authenticate()`](#authenticate) now throws an instance of `BiometryError`, and `BiometryError.code` is now typed as [`BiometryErrorType`](#biometryerrortype).

## Installation

```sh
pnpm add @aparajita/capacitor-biometric-auth
npm install @aparajita/capacitor-biometric-auth
yarn add @aparajita/capacitor-biometric-auth
```

Not using [pnpm](https://pnpm.js.org/)? You owe it to yourself to give it a try. It’s faster, better with monorepos, and uses _way, way_ less disk space than the alternatives.

### iOS

This plugin can be installed via Swift Package Manager (SPM) or CocoaPods:

- **Swift Package Manager (recommended):** No additional steps required. Capacitor 7+ automatically uses SPM.
- **CocoaPods (legacy):** Still fully supported. The plugin will work with existing CocoaPods-based projects.

👉 **IMPORTANT!!** In order to use Face ID, you must add the `NSFaceIDUsageDescription` key to your `Info.plist` file. This is a string that describes why your app needs access to Face ID. If you don't add this key, the system won't allow your app to use Face ID.

1. In Xcode, open your app’s `Info.plist` file.
2. Hover your mouse over one of the existing keys, and click the `+` button that appears.
3. In the popup that appears, type `Privacy - Face ID Usage Description` and press Enter.
4. In the Value column, enter a string that describes why your app needs access to Face ID.
5. Save your changes.

## Usage

The API is extensively documented in the [TypeScript definitions file](src/definitions.ts). There is also (somewhat incomplete auto-generated) documentation [below](#api). For a complete example of how to use this plugin in practice, see the demo apps: [CocoaPods variant](https://github.com/aparajita/capacitor-biometric-auth/blob/main/demo-pods/README.md) or [SPM variant](https://github.com/aparajita/capacitor-biometric-auth/blob/main/demo-spm/README.md).

### Checking availability

Although not strictly necessary, before giving the user the option to use biometry (such as displaying a biometry icon), you will probably want to call [`checkBiometry()`](#checkbiometry) and inspect the [`CheckBiometryResult`](#checkbiometryresult) to see what (if any) biometry and/or device credentials are available on the device. Note the following:

- `isAvailable` may be `false` but `biometryType` may indicate the presence of biometry on the device. This occurs if:
  - The current user is not enrolled in biometry.
  - Biometry has been disabled for the current app.
  - On Android, biometric hardware is present but can only be used for _device_ unlock, _not_ by apps. see the [Android note](#android-note) below for more information.

  In such cases the `reason` and `code` will tell you why.

- On iOS, `isAvailable` and `strongBiometryIsAvailable` will always have the same value, because traditionally that’s the whole point of biometry — it’s supposed to be strong authentication.
- Android unfortunately supports “strong” biometry (usually fingerprint) and “weak” biometry (usually face/iris). `isAvailable` will be `true` if _any_ type of biometry is actually available for use by the app, but `strongBiometryIsAvailable` will be `true` only if strong biometry is available. For example, on a typical device, if it has hardware support for both fingerprint and face unlock, and both are available for use by apps, `isAvailable` will be `true` if either is enrolled, but `strongBiometryIsAvailable` will be `true` only if fingerprint authentication is enrolled.

#### ❗Android note

When it comes to biometry, Android is frankly a bit of a mess. Some devices may support “weak” biometry (e.g. face unlock) only for device unlock, and not by apps. But the system reports to this plugin _all_ types of biometric hardware, even if they are not available for use by apps.

👉 Therefore on Android the only thing you can rely on are the `isAvailable` and `strongBiometryAvailable` properties as simple on/off switches. Do NOT rely on `biometryType` and `biometryTypes` as an indication of what biometry you can actually use.

#### Handling app resume

Because the availability of biometry can change while your app is in the background, it’s important to check availability when your app resumes. By calling [`addResumeListener()`](#addresumelistener) you can register a callback that is passed a [`CheckBiometryResult`](#checkbiometryresult) when your app resumes.

#### Example

```typescript
import { CheckBiometryResult } from './definitions'

let appListener: PluginListenerHandle

function updateBiometryInfo(info: CheckBiometryResult): void {
  if (info.isAvailable) {
    // Biometry is available, info.biometryType will tell you the primary type.
  } else {
    // Biometry is not available, info.reason and info.code will tell you why.
  }
}

async function onComponentMounted(): Promise<void> {
  updateBiometryInfo(await BiometricAuth.checkBiometry())

  try {
    appListener = await BiometricAuth.addResumeListener(updateBiometryInfo)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
  }
}

async function onComponentUnmounted(): Promise<void> {
  await appListener?.remove()
}
```

### Authenticating

To initiate biometric authentication call [`authenticate()`](#authenticate). `authenticate` takes an [`AuthenticateOptions`](#authenticateoptions) object which you will want to use in order to control the behavior and appearance of the biometric prompt.

If authentication succeeds, the Promise resolves. If authentication fails, the Promise is rejected with an instance of [`BiometryError`](#biometryerror), which has two properties:

| Property | Type                                                                                                    | Description                                       |
| :------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| message  | string                                                                                                  | A description of the error suitable for debugging |
| code     | [BiometryErrorType](https://github.com/aparajita/capacitor-biometric-auth/blob/main/src/definitions.ts) | What caused the error                             |

#### Example

```typescript
import {
  AndroidBiometryStrength,
  BiometryError,
  BiometryErrorType,
} from './definitions'

async function authenticate(): Promise<void> {
  try {
    await BiometricAuth.authenticate({
      reason: 'Please authenticate',
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use passcode',
      androidTitle: 'Biometric login',
      androidSubtitle: 'Log in using biometric authentication',
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.weak,
    })
  } catch (error) {
    // error is always an instance of BiometryError.
    if (error instanceof BiometryError) {
      if (error.code !== BiometryErrorType.userCancel) {
        // Display the error.
        await showAlert(error.message)
      }
    }
  }
}
```

## Biometry support

### web

On the web, you can fake any of the supported biometry types by calling [`setBiometryType()`](#setbiometrytype).

### iOS

On iOS, Touch ID and Face ID are supported.

### Android

On Android, fingerprint, face, and iris authentication are supported. Note that if a device supports more than one type of biometry, the plugin will initially present the primary (most secure) available type, which is determined by the system and cannot be determined programmatically.

❗ As discussed above, Android may support multiple types of biometry, but not all of them may be available for use by apps. For example, a device may support both fingerprint and face authentication, but only fingerprint authentication may be available for use by apps. In such cases, if the user has enrolled in face authentication only, `checkBiometry()` will indicate that biometry is not available.

## API

<docgen-index>

- [`checkBiometry()`](#checkbiometry)
- [`setBiometryType(...)`](#setbiometrytype)
- [`setBiometryIsEnrolled(...)`](#setbiometryisenrolled)
- [`setDeviceIsSecure(...)`](#setdeviceissecure)
- [`authenticate(...)`](#authenticate)
- [`addResumeListener(...)`](#addresumelistener)
- [Interfaces](#interfaces)
- [Type Aliases](#type-aliases)
- [Enums](#enums)

</docgen-index>
<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

This is the public interface of the plugin.

### checkBiometry()

```typescript
checkBiometry() => Promise<CheckBiometryResult>
```

Check to see what biometry type (if any) is available.

**Returns:** Promise&lt;<a href="#checkbiometryresult">CheckBiometryResult</a>&gt;

---

### setBiometryType(...)

```typescript
setBiometryType(type: BiometryType | string | Array<BiometryType | string> | undefined) => Promise<void>
```

web only<br><br>On the web, this method allows you to dynamically simulate different types of biometry. You may either pass <a href="#biometrytype">`BiometryType`</a> enums or the string names of the <a href="#biometrytype">`BiometryType`</a> enums. If undefined or a string is passed and it isn't a valid value, nothing happens.

| Param | Type                                                                                                         |
| :---- | :----------------------------------------------------------------------------------------------------------- |
| type  | string \| <a href="#biometrytype">BiometryType</a> \| (string \| <a href="#biometrytype">BiometryType</a>)[] |

---

### setBiometryIsEnrolled(...)

```typescript
setBiometryIsEnrolled(isSecure: boolean) => Promise<void>
```

web only<br><br>On the web, this method allows you to dynamically simulate whether or not the user has enrolled in biometry.

| Param    | Type    |
| :------- | :------ |
| isSecure | boolean |

---

### setDeviceIsSecure(...)

```typescript
setDeviceIsSecure(isSecure: boolean) => Promise<void>
```

web only<br><br>On the web, this method allows you to dynamically simulate whether or not the user has secured the device with a PIN, pattern or passcode.

| Param    | Type    |
| :------- | :------ |
| isSecure | boolean |

---

### authenticate(...)

```typescript
authenticate(options?: AuthenticateOptions) => Promise<void>
```

Prompt the user for authentication. If authorization fails for any reason, the promise is rejected with a `BiometryError`.<br><br>For detailed information about the behavior on iOS, see:<br><br>https://developer.apple.com/documentation/localauthentication/lapolicy/deviceownerauthenticationwithbiometrics<br><br>Some versions of Android impose a limit on the number of failed attempts. If `allowDeviceCredential` is `true`, when the limit is reached the user will then be presented with a device credential prompt. If `allowDeviceCredential` is `false`, when the limit is reached `authenticate()` will reject with a <a href="#biometryerrortype">`BiometryErrorType`</a> of `biometryLockout`, after which the user will have to wait the system-defined length of time before being allowed to authenticate again.

| Param   | Type                                                   |
| :------ | :----------------------------------------------------- |
| options | <a href="#authenticateoptions">AuthenticateOptions</a> |

---

### addResumeListener(...)

```typescript
addResumeListener(listener: ResumeListener) => Promise<PluginListenerHandle>
```

Register a function that will be called when the app resumes. The function will be passed the result of `checkBiometry()`.<br><br>👉 **NOTE:** checkBiometry() must be called at least once before calling this method.

| Param    | Type                                         |
| :------- | :------------------------------------------- |
| listener | <a href="#resumelistener">ResumeListener</a> |

**Returns:** Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;

---

### Interfaces

#### CheckBiometryResult

| Property                  | Type                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :------------------------ | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| isAvailable               | boolean                                            | True if the device supports _at least_ weak biometric authentication _by apps_ and the current user has enrolled in some form of biometry. Note that if `strongBiometryIsAvailable` is true, this will also be true.                                                                                                                                                                                                                                                                                                                         |
| strongBiometryIsAvailable | boolean                                            | True if the device has strong biometric authentication capability and the current user has enrolled in that strong biometry.<br><br>On iOS this value and `isAvailable` will always be the same, since iOS only supports strong biometry.<br><br>On Android, for example, if the device supports both fingerprint and face authentication by apps, and the user has enrolled only in face authentication, and Android considers face authentication on that device to be weak, then `isAvailable` will be true but this value will be false. |
| biometryType              | <a href="#biometrytype">BiometryType</a>           | The primary (most secure) type of biometry supported by the device. Note that _supported_ is not the same as _available_, which requires the biometry to be enrolled.                                                                                                                                                                                                                                                                                                                                                                        |
| biometryTypes             | BiometryType[]                                     | All of the biometry types supported by the hardware on the device, _whether or not it is actually available for use by apps_. If no biometry is supported, i.e. `biometryType === <a href="#biometrytype">BiometryType.none`</a>, this will be an empty array.<br><br>Note that _supported_ is not the same as _available_, which requires the biometry to be enrolled.                                                                                                                                                                      |
| deviceIsSecure            | boolean                                            | Returns true if the device is secure. On iOS, this means that the device has a passcode set. On Android, this means that the device has a PIN, pattern, or password set.                                                                                                                                                                                                                                                                                                                                                                     |
| reason                    | string                                             | If weak or better biometry is not available and the system gives a reason why, it will be returned here. Otherwise it's an empty string.                                                                                                                                                                                                                                                                                                                                                                                                     |
| code                      | <a href="#biometryerrortype">BiometryErrorType</a> | If weak or better biometry is not available, the error code will be returned here. Otherwise it's an empty string. The error code will be one of the <a href="#biometryerrortype">`BiometryErrorType`</a> enum values, and is consistent across platforms.                                                                                                                                                                                                                                                                                   |
| strongReason              | string                                             | If strong biometry is not available and the system gives a reason why, it will be returned here. Otherwise it's an empty string.<br><br>On iOS, this will always be the same as `reason`, since all biometry on iOS is strong.                                                                                                                                                                                                                                                                                                               |
| strongCode                | <a href="#biometryerrortype">BiometryErrorType</a> | If strong biometry is not available, the error code will be returned here. Otherwise it's an empty string. The error code will be one of the <a href="#biometryerrortype">`BiometryErrorType`</a> enum values, and is consistent across platforms.<br><br>On iOS, this will always be the same as `code`, since all biometry on iOS is strong.                                                                                                                                                                                               |

#### AuthenticateOptions

| Prop                        | Type                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :-------------------------- | :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reason                      | string                                                         | Displays the reason for requesting authentication in the authentication dialog presented to the user.<br><br>Default: System default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| cancelTitle                 | string                                                         | iOS: The system presents a cancel button during biometric authentication to let the user abort the authentication attempt. The button appears every time the system asks the user to present a finger registered with Touch ID. For Face ID, the button only appears if authentication fails and the user is prompted to try again. Either way, the user can stop trying to authenticate by tapping the button.<br><br>Android: The text for the negative button. This would typically be used as a "Cancel" button, but may be also used to show an alternative method for authentication, such as a screen that asks for a backup password.<br><br>Default: "Cancel"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| allowDeviceCredential       | boolean                                                        | If true, allows for authentication using device unlock credentials.<br><br>Default: false.<br><br>iOS: If biometry is available, enrolled, and not disabled, the system uses that first. After the first Touch ID failure or second Face ID failure, if `iosFallbackTitle` is not an empty string, a fallback button appears in the authentication dialog. If the user taps the fallback button, the system prompts the user for the device passcode or the user’s password. If `iosFallbackTitle` is an empty string, no fallback button will appear.<br><br>If no biometry is enrolled and enabled, and a passcode is set, the system immediately prompts the user for the device passcode or user’s password. Authentication fails with the error code `passcodeNotSet` if the device passcode isn’t enabled.<br><br>If a passcode is not set on the device, a `passcodeNotSet` error is returned.<br><br>The system disables passcode authentication after 6 unsuccessful attempts, with progressively increasing delays between attempts.<br><br>The title of the fallback button may be customized by setting `iosFallbackTitle` to a non-empty string.<br><br>Android: The user will first be prompted to authenticate with biometrics, but also given the option to authenticate with their device PIN, pattern, or password by tapping a button in the authentication dialog. The title of the button is supplied by the system. |
| iosFallbackTitle            | string                                                         | The system presents a fallback button when biometric authentication fails — for example, because the system doesn’t recognize the presented finger, or after several failed attempts to recognize the user’s face.<br><br>If `allowDeviceCredential` is false, tapping this button dismisses the authentication dialog and returns the error code userFallback. If undefined, the localized system default title is used. Passing an empty string hides the fallback button completely.<br><br>If `allowDeviceCredential` is true and this is undefined, the localized system default title is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| androidTitle                | string                                                         | Title for the Android dialog. If not supplied, the system default is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| androidSubtitle             | string                                                         | Subtitle for the Android dialog. If not supplied, the system default is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| androidConfirmationRequired | boolean                                                        | Determines if successful weak biometric authentication must be confirmed.<br><br>For information on this setting, see https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt.Builder#setConfirmationRequired(boolean).<br><br>Default: `true`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| androidBiometryStrength     | <a href="#androidbiometrystrength">AndroidBiometryStrength</a> | Set the strength of Android biometric authentication that will be accepted.<br><br>👉 **NOTE:** On Android 9 & 10 (API 28-29), this will effectively always be `.weak` if `allowDeviceCredential` is true. This is a known limitation of the Android API. 🤯<br><br>Default: <a href="#androidbiometrystrength">`AndroidBiometryStrength.weak`</a>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

#### PluginListenerHandle

| Method     | Signature                    |
| :--------- | :--------------------------- |
| **remove** | () =&gt; Promise&lt;void&gt; |

### Type Aliases

#### ResumeListener

The signature of the callback passed to `addResumeListener()`.

<code>(info: <a href="#checkbiometryresult">CheckBiometryResult</a>): void</code>

### Enums

#### BiometryType

| Members                   | Description                        |
| :------------------------ | :--------------------------------- |
| none                      |                                    |
| touchId                   | iOS Touch ID                       |
| faceId                    | iOS Face ID                        |
| fingerprintAuthentication | Android fingerprint authentication |
| faceAuthentication        | Android face authentication        |
| irisAuthentication        | Android iris authentication        |

#### BiometryErrorType

| Members              | Value                  |
| :------------------- | :--------------------- |
| none                 | ''                     |
| appCancel            | 'appCancel'            |
| authenticationFailed | 'authenticationFailed' |
| invalidContext       | 'invalidContext'       |
| notInteractive       | 'notInteractive'       |
| passcodeNotSet       | 'passcodeNotSet'       |
| systemCancel         | 'systemCancel'         |
| userCancel           | 'userCancel'           |
| userFallback         | 'userFallback'         |
| biometryLockout      | 'biometryLockout'      |
| biometryNotAvailable | 'biometryNotAvailable' |
| biometryNotEnrolled  | 'biometryNotEnrolled'  |
| noDeviceCredential   | 'noDeviceCredential'   |

#### AndroidBiometryStrength

| Members | Description                                           |
| :------ | :---------------------------------------------------- |
| weak    | `authenticate()` will present any available biometry. |
| strong  | `authenticate()` will only present strong biometry.   |

</docgen-api>
</div>
