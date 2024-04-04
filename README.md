<div class="markdown-body">

# capacitor-biometric-auth&nbsp;&nbsp;[![npm version](https://badge.fury.io/js/@aparajita%2Fcapacitor-biometric-auth.svg)](https://badge.fury.io/js/@aparajita%2Fcapacitor-biometric-auth)

This plugin for [Capacitor 5](https://capacitorjs.com) provides access to native biometry and device credentials on iOS and Android. It supports every type of biometry and every configuration option on both platforms. In addition, biometry and device credentials are simulated on the web so you can test your logic without making any changes to your code.

🛑 **BREAKING CHANGES:**

- If you are upgrading from a version prior to 6.0.0, please note that [`authenticate()`](#authenticate) now throws an instance of `BiometryError`, and `BiometryError.code` is now typed as [`BiometryErrorType`](#biometryerrortype).
- If you are upgrading from a version prior to 7.0.0, please note that [`authenticate()`](#authenticate) will _immediately_ present a prompt for device credentials if `deviceIsSecure` is true, `allowDeviceCredentials` is true, and no biometry of the requested strength is available.

## Installation

```sh
pnpm add @aparajita/capacitor-biometric-auth
npm install @aparajita/capacitor-biometric-auth
yarn add @aparajita/capacitor-biometric-auth
```

Not using [pnpm](https://pnpm.js.org/)? You owe it to yourself to give it a try. It’s faster, better with monorepos, and uses _way, way_ less disk space than the alternatives.

### iOS

👉 **IMPORTANT!!** In order to use Face ID, you must add the `NSFaceIDUsageDescription` key to your `Info.plist` file. This is a string that describes why your app needs access to Face ID. If you don’t add this key, the system won’t allow your app to use Face ID.

1. In Xcode, open your app’s `Info.plist` file.
2. Hover your mouse over one of the existing keys, and click the `+` button that appears.
3. In the popup that appears, type `Privacy - Face ID Usage Description` and press Enter.
4. In the Value column, enter a string that describes why your app needs access to Face ID.
5. Save your changes.

## Usage

The API is extensively documented in the [TypeScript definitions file](src/definitions.ts). There is also (somewhat incomplete auto-generated) documentation [below](#api). For a complete example of how to use this plugin in practice, see the [demo app](https://github.com/aparajita/capacitor-biometric-auth-demo).

### Checking availability

Although not strictly necessary, before giving the user the option to use biometry (such as displaying a biometry icon), you will probably want to call [`checkBiometry()`](#checkbiometry) and inspect the [`CheckBiometryResult`](#checkbiometryresult) to see what (if any) biometry and/or device credentials are available on the device. Note the following:

- `isAvailable` may be `false` but `biometryType` may indicate the presence of biometry on the device. This occurs if the current user is not enrolled in biometry, or if biometry has been disabled for the current app. In such cases the `reason` and `code` will tell you why.

- On iOS, `isAvailable` and `strongBiometryIsAvailable` will always have the same value. On Android, `isAvailable` will be `true` if _any_ type of biometry is available, but `strongBiometryIsAvailable` will be `true` only if strong biometry is available. For example, on a typical device, if the device supports both fingerprint and face authentication, `isAvailable` will be `true` if either is enrolled, but `strongBiometryIsAvailable` will be `true` only if fingerprint authentication is enrolled.

- `biometryTypes` may contain more than one type of biometry. This occurs on Android devices that support multiple types of biometry. In such cases `biometryType` will indicate the primary (most secure) type of biometry, and the `biometryTypes` array will contain all of the biometry types supported by the device. Note that Android only guarantees that one of the types is actually available.

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

On Android, fingerprint, face, and iris authentication are supported. Note that if a device supports more than one type of biometry, the plugin will initially present the primary (most secure) available type, which is determined by the system.

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

| Prop                      | Type                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :------------------------ | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| isAvailable               | boolean                                            | True if the device supports _at least_ weak biometric authentication and the current user has enrolled in some form of biometry. Note that if `strongBiometryIsAvailable` is true, this will also be true.                                                                                                                                                                                                                                                                                                                           |
| strongBiometryIsAvailable | boolean                                            | True if the device has strong biometric authentication capability and the current user has enrolled in that strong biometry.<br><br>On iOS this value and `isAvailable` will always be the same, since iOS only supports strong biometry.<br><br>On Android, for example, if the device supports both fingerprint and face authentication, and the user has enrolled only in face authentication, and Android considers face authentication on that device to be weak, then `isAvailable` will be true but this value will be false. |
| biometryType              | <a href="#biometrytype">BiometryType</a>           | The primary (most secure) type of biometry supported by the device. Note that _supported_ is not the same as _available_, which requires the biometry to be enrolled.                                                                                                                                                                                                                                                                                                                                                                |
| biometryTypes             | BiometryType[]                                     | All of the biometry types supported by the hardware on the device (currently only Android devices support multiple biometry types). If no biometry is supported, i.e. `biometryType === <a href="#biometrytype">BiometryType.none`</a>, this will be an empty array.<br><br>Note that _supported_ is not the same as _available_, which requires the biometry to be enrolled.                                                                                                                                                        |
| deviceIsSecure            | boolean                                            | Returns true if the device is secure. On iOS, this means that the device has a passcode set. On Android, this means that the device has a PIN, pattern, or password set.                                                                                                                                                                                                                                                                                                                                                             |
| reason                    | string                                             | If weak or better biometry is not available and the system gives a reason why, it will be returned here. Otherwise it's an empty string.                                                                                                                                                                                                                                                                                                                                                                                             |
| code                      | <a href="#biometryerrortype">BiometryErrorType</a> | If weak or better biometry is not available, the error code will be returned here. Otherwise it's an empty string. The error code will be one of the <a href="#biometryerrortype">`BiometryErrorType`</a> enum values, and is consistent across platforms.                                                                                                                                                                                                                                                                           |
| strongReason              | string                                             | If strong biometry is not available and the system gives a reason why, it will be returned here. Otherwise it's an empty string.<br><br>On iOS, this will always be the same as `reason`, since all biometry on iOS is strong.                                                                                                                                                                                                                                                                                                       |
| strongCode                | <a href="#biometryerrortype">BiometryErrorType</a> | If strong biometry is not available, the error code will be returned here. Otherwise it's an empty string. The error code will be one of the <a href="#biometryerrortype">`BiometryErrorType`</a> enum values, and is consistent across platforms.<br><br>On iOS, this will always be the same as `code`, since all biometry on iOS is strong.                                                                                                                                                                                       |

#### Array

| Prop   | Type   | Description                                                                                            |
| :----- | :----- | :----------------------------------------------------------------------------------------------------- |
| length | number | Gets or sets the length of the array. This is a number one higher than the highest index in the array. |

| Method                                                                      | Signature                                                                      | Description                                                                                                           |
| :-------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **toString**                                                                | () =&gt; string                                                                | Returns a string representation of an array.                                                                          |
| **toLocaleString**                                                          | () =&gt; string                                                                | Returns a string representation of an array. The elements are converted to string using their toLocaleString methods. |
| **pop**                                                                     | () =&gt; T \| undefined                                                        | Removes the last element from an array and returns it.                                                                |
| If the array is empty, undefined is returned and the array is not modified. |
| **push**                                                                    | (...items: T[]) =&gt; number                                                   | Appends new elements to the end of an array, and returns the new length of the array.                                 |
| **concat**                                                                  | (...items: <a href="#concatarray">ConcatArray</a>&lt;T&gt;[]) =&gt; T[]        | Combines two or more arrays.                                                                                          |
| This method returns a new array without modifying any existing arrays.      |
| **concat**                                                                  | (...items: (T \| <a href="#concatarray">ConcatArray</a>&lt;T&gt;)[]) =&gt; T[] | Combines two or more arrays.                                                                                          |
| This method returns a new array without modifying any existing arrays.      |
| **join**                                                                    | (separator?: string) =&gt; string                                              | Adds all the elements of an array into a string, separated by the specified separator string.                         |
| **reverse**                                                                 | () =&gt; T[]                                                                   | Reverses the elements in an array in place.                                                                           |
| This method mutates the array and returns a reference to the same array.    |
| **shift**                                                                   | () =&gt; T \| undefined                                                        | Removes the first element from an array and returns it.                                                               |
| If the array is empty, undefined is returned and the array is not modified. |
| **slice**                                                                   | (start?: number, end?: number) =&gt; T[]                                       | Returns a copy of a section of an array.                                                                              |

For both start and end, a negative index can be used to indicate an offset from the end of the array.
For example, -2 refers to the second to last element of the array. |
| **sort** | (compareFn?: ((a: T, b: T) =&gt; number) \| undefined) =&gt; this | Sorts an array in place.
This method mutates the array and returns a reference to the same array. |
| **splice** | (start: number, deleteCount?: number) =&gt; T[] | Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements. |
| **splice** | (start: number, deleteCount: number, ...items: T[]) =&gt; T[] | Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements. |
| **unshift** | (...items: T[]) =&gt; number | Inserts new elements at the start of an array, and returns the new length of the array. |
| **indexOf** | (searchElement: T, fromIndex?: number) =&gt; number | Returns the index of the first occurrence of a value in an array, or -1 if it is not present. |
| **lastIndexOf** | (searchElement: T, fromIndex?: number) =&gt; number | Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present. |
| **every** | &lt;S extends T&gt;(predicate: (value: T, index: number, array: T[]) =&gt; value is S, thisArg?: any) =&gt; this is S[] | Determines whether all the members of an array satisfy the specified test. |
| **every** | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; boolean | Determines whether all the members of an array satisfy the specified test. |
| **some** | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; boolean | Determines whether the specified callback function returns true for any element of an array. |
| **forEach** | (callbackfn: (value: T, index: number, array: T[]) =&gt; void, thisArg?: any) =&gt; void | Performs the specified action for each element in an array. |
| **map** | &lt;U&gt;(callbackfn: (value: T, index: number, array: T[]) =&gt; U, thisArg?: any) =&gt; U[] | Calls a defined callback function on each element of an array, and returns an array that contains the results. |
| **filter** | &lt;S extends T&gt;(predicate: (value: T, index: number, array: T[]) =&gt; value is S, thisArg?: any) =&gt; S[] | Returns the elements of an array that meet the condition specified in a callback function. |
| **filter** | (predicate: (value: T, index: number, array: T[]) =&gt; unknown, thisArg?: any) =&gt; T[] | Returns the elements of an array that meet the condition specified in a callback function. |
| **reduce** | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T) =&gt; T | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reduce** | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T, initialValue: T) =&gt; T | |
| **reduce** | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) =&gt; U, initialValue: U) =&gt; U | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reduceRight** | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T) =&gt; T | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reduceRight** | (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) =&gt; T, initialValue: T) =&gt; T | |
| **reduceRight** | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) =&gt; U, initialValue: U) =&gt; U | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |

#### ConcatArray

| Prop   | Type   |
| :----- | :----- |
| length | number |

| Method    | Signature                                |
| :-------- | :--------------------------------------- |
| **join**  | (separator?: string) =&gt; string        |
| **slice** | (start?: number, end?: number) =&gt; T[] |

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
