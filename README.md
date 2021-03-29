# capacitor-biometric-auth

This plugin for [Capacitor 2](https://capacitorjs.com) provides access to native biometry on iOS and Android. In addition, biometry is simulated on the web so you can test your logic without making any changes to your code.

👉 **NOTE:** This plugin has only been tested with Capacitor 2.

## Installation

```sh
pnpm install @aparajita/capacitor-biometric-auth # 'pnpm add' also works
npm install @aparajita/capacitor-biometric-auth
yarn add @aparajita/capacitor-biometric-auth
```

Not using [pnpm](https://pnpm.js.org/)? You owe it to yourself to give it a try. It’s faster, better with monorepos, and uses *way, way* less disk space than the alternatives.

## Usage

The API is documented [here](src/definitions.ts) and [below](#api). For a complete example of how to use this plugin in practice, see the [demo app](https://github.com/aparajita/capacitor-biometric-auth).

### Checking availability

Before giving the user the option to use biometry (such as displaying a biometry icon), call [`checkBiometry`](#checkbiometry) and inspect the [`CheckBiometryResult`](#checkbiometryresult) to see what (if any) biometry is available on the device. Note that `isAvailable` may be `false` but `biometryType` may indicate the presence of biometry  on the device. This occurs if the current user is not enrolled in biometry, or if biometry has been disabled for the current app. In such cases the `reason` will tell you why.

Because the availability of biometry can change while your app is in the background, it’s important to recheck availability when your app resumes. By calling [`addResumeListener`](#addresumelistener) you can register a callback that is passed a [`CheckBiometryResult`](#checkbiometryresult) when your app resumes.

### Authenticating

Once you have determined that biometry is available, to initiate biometric authentication call [authenticate](#authenticate). `authenticate` takes an [AuthenticateOptions](#authenticateoptions) object which you will want to use in order to control the behavior and appearance of the biometric prompt.

If authentication succeeds, the Promise resolves. If authentication fails, the Promise is rejected with a `BiometryError`, which has two properties:

| Property | Type | Description |
| :---------- | :------ | :------------- |
| message | string | A description of the error suitable for debugging |
| code | BiometryErrorType | What caused the error |

## Biometry support

### web

On the web, you can fake any of the supported biometry types by one of two methods:

- Set the environment variable `WS_BIOMETRY_TYPE` to one of the `BiometryType` enums. This value is case-sensitive; for example to simulate Touch ID on the web, set `WS_BIOMETRY_TYPE` to `touchId`.
- Call `setBiometryType()`.

### iOS

On iOS, Touch ID and Face ID are supported.

### Android

On Android, fingerprint, face, and iris authentication are supported. Note that if a device supports more than one type of biometry, the plugin will only present the primary type, which is determined by the system.

## API

<docgen-index>

**Methods**<br>
[checkBiometry()](#checkbiometry)<br>
[setBiometryType(...)](#setbiometrytype)<br>
[authenticate(...)](#authenticate)<br>
[addResumeListener(...)](#addresumelistener)


[Interfaces](#interfaces)<br>
[Enums](#enums)<br>

</docgen-index>
<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### checkBiometry()

```typescript
checkBiometry() => Promise<CheckBiometryResult>
```

Check to see what biometry type (if any) is available. For testing on the web, a <a href="#biometrytype">BiometryType</a> name (case-sensitive) may be specified as an environment variable. For example:<br><br>WS_BIOMETRY_TYPE=touchId

**Returns:** Promise&lt;<a href="#checkbiometryresult">CheckBiometryResult</a>&gt;

--------------------


### setBiometryType(...)

```typescript
setBiometryType(type: BiometryType | string | undefined) => void
```

web only<br><br>On the web, this method allows you to dynamically simulate different types of biometry. You may either pass a <a href="#biometrytype">BiometryType</a> enum or the string name of a <a href="#biometrytype">BiometryType</a>. If a string is passed and it isn't a valid

| Param | Type                                               |
| :---- | :------------------------------------------------- |
| type  | string \| <a href="#biometrytype">BiometryType</a> |

--------------------


### authenticate(...)

```typescript
authenticate(options?: AuthenticateOptions | undefined) => Promise<void>
```

Prompt the user for authentication. If authorization fails for any reason, the promise is rejected with a BiometryError.

| Param   | Type                                                   |
| :------ | :----------------------------------------------------- |
| options | <a href="#authenticateoptions">AuthenticateOptions</a> |

--------------------


### addResumeListener(...)

```typescript
addResumeListener(listener: ResumeListener) => void
```

Register a function that will be called when the app resumes. The function will be passed the result of checkBiometry().

| Param    | Type                                                                      |
| :------- | :------------------------------------------------------------------------ |
| listener | (info: <a href="#checkbiometryresult">CheckBiometryResult</a>) =&gt; void |

--------------------


### Interfaces


#### CheckBiometryResult

| Prop         | Type                                     | Description                                                                                                               |
| :----------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| isAvailable  | boolean                                  | True if the device has biometric authentication capability and the current user has enrolled in biometry.                 |
| biometryType | <a href="#biometrytype">BiometryType</a> | The type of biometry available on the device.                                                                             |
| reason       | string                                   | If biometry is not available and the system gives a reason why, it will be returned here. Otherwise it's an empty string. |

<br>

#### AuthenticateOptions

| Prop                  | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :-------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reason                | string  | The reason for requesting authentication. Displays in the authentication dialog presented to the user. If not supplied, a default message is displayed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| cancelTitle           | string  | iOS: The system presents a cancel button during biometric authentication to let the user abort the authentication attempt. The button appears every time the system asks the user to present a finger registered with Touch ID. For Face ID, the button only appears if authentication fails and the user is prompted to try again. Either way, the user can stop trying to authenticate by tapping the button.<br><br>Android: The text for the negative button. This would typically be used as a "Cancel" button, but may be also used to show an alternative method for authentication, such as a screen that asks for a backup password.<br><br>Default: "Cancel"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| allowDeviceCredential | boolean | * If true, allows for authentication using device unlock credentials. Default is false.<br><br>iOS: If biometry is available, enrolled, and not disabled, the system uses that first. After the first Touch ID failure or second Face ID failure, if iosFallbackTitle is not an empty string, a fallback button appears in the authentication dialog. If the user taps the fallback button, the system prompts the user for the device passcode or the user’s password. If iosFallbackTitle is an empty string, no fallback button will appear.<br><br>If biometry is not available, enrolled and enabled, and a passcode is set, the system immediately prompts the user for the device passcode or user’s password. Authentication fails with the error code passcodeNotSet if the device passcode isn’t enabled.<br><br>If a passcode is not set on the device, a passcodeNotSet error is returned.<br><br>The system disables passcode authentication after 6 unsuccessful attempts, with progressively increasing delays between attempts.<br><br>The title of the fallback button may be customized by setting iosFallbackTitle to a non-empty string.<br><br>Android: The user will first be prompted to authenticate with biometrics, but also given the option to authenticate with their device PIN, pattern, or password by tapping a button in the authentication dialog. The title of the button is supplied by the system. |
| iosFallbackTitle      | string  | The system presents a fallback button when biometric authentication fails — for example, because the system doesn’t recognize the presented finger, or after several failed attempts to recognize the user’s face.<br><br>If allowDeviceCredential is false, tapping this button dismisses the authentication dialog and returns the error code userFallback. If undefined, the localized systetm default title is used. Passing an empty string hides the fallback button completely.<br><br>If allowDeviceCredential is true and this is undefined, the localized system default title is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| androidTitle          | string  | Title for the Android dialog. If not supplied, the system default is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| androidSubtitle       | string  | Subtitle for the Android dialog. If not supplied, the system default is used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| androidMaxAttempts    | number  | The maximum number of failed biometric verification attempts before returning BiometryError.authenticationFailed. The default is 3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |


### Enums


#### BiometryType

| Members                   | Description                                     |
| :------------------------ | :---------------------------------------------- |
| none                      | No biometry is available                        |
| touchId                   | iOS Touch ID is available                       |
| faceId                    | iOS Face ID is available                        |
| fingerprintAuthentication | Android fingerprint authentication is available |
| faceAuthentication        | Android face authentication is available        |
| irisAuthentication        | Android iris authentication is available        |

</docgen-api>
