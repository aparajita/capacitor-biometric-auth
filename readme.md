# Capacitor Native Biometric

Use biometrics confirm device owner presence or authenticate users. A couple of methods are provided to handle user credentials. These are securely stored using Keychain (iOS) and Keystore (Android).

## Installation

- `npm i capacitor-native-biometric`

## Usage

```ts
import { Plugins } from "@capacitor/core";

const { NativeBiometric } = Plugins;

// Check if biometrics are available and which type is supported
Plugins.NativeBiometric.isAvailable().then(
  (result: AvailableResult) => {
    const isAvailable = result.isAvailable;
    const isFaceId = result.biometryType == BiometryType.FACE_ID;

    if (isAvailable) {
      // Get user's credentials
      Plugins.NativeBiometric.getCredentials({
        server: "www.example.com",
      }).then((credentials: Credentials) => {
        // Authenticate using biometrics before logging the user in
        Plugins.NativeBiometric.verifyIdentity({
          reason: "For easy log in",
          title: "Log in",
          subtitle: "Maybe add subtitle here?",
          description: "Maybe a description too?",
        }).then(
          () => {
            // Authentication successful
            this.login(credentials.username, credentials.password);
          },
          (error) => {
            // Failed to authenticate
          }
        );
      });
    }
  },
  (error) => {
    // Couldn't check availability
  }
);

// Save user's credentials
Plugins.NativeBiometric.setCredentials({
  username: "username",
  password: "password",
  server: "www.example.com",
}).then();

// Delete user's credentials
Plugins.NativeBiometric.deleteCredentials({
  server: "www.example.com",
}).then();
```

## Methods

| Method                                              | Default | Type                        | Description                                                                                   |
| --------------------------------------------------- | ------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| isAvailable()                                       |         | `Promise<AvailableOptions>` | Gets available biometrics                                                                     |
| verifyIdentity(options?: BiometricOptions)          |         | `Promise<any>`              | Shows biometric prompt                                                                        |
| setCredentials(options: SetCredentialOptions)       |         | `Promise<any>`              | Securely stores user's credentials in Keychain (iOS) or encypts them using Keystore (Android) |
| getCredentials(options: GetCredentialOptions)       |         | `Promise<Credentials>`      | Retrieves user's credentials if any                                                           |
| deleteCredentials(options: DeleteCredentialOptions) |         | `Promise<any>`              | Removes user's credentials if any                                                             |

## Interfaces

AvailableOptions

| Properties   | Default | Type          | Description                                                 |
| ------------ | ------- | ------------- | ----------------------------------------------------------- |
| isAvailable  |         | boolean       | Specifies if the devices has biometric enrollment           |
| biometryType |         | BiometricType | Specifies if the available biometric hardware on the device |

BiometryType - enum

| Properties          | Description                                |
| ------------------- | ------------------------------------------ |
| NONE                | There is no biometry available             |
| TOUCH_ID            | TouchID is available (iOS)                 |
| FACE_ID             | FaceID is available (iOS)                  |
| FINGERPRINT         | Fingerprint is available (Android)         |
| FACE_AUTHENTICATION | Face Authentication is available (Android) |
| IRIS_AUTHENTICATION | Iris Authentication is available (Android) |

BiometricOptions

| Properties   | Default                        | Type   | Description                                                                                               |
| ------------ | ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| reason?      | "For biometric authentication" | string | Reason for requesting authentication in iOS. Displays in the authentication dialog presented to the user. |
| title?       | "Authenticate"                 | string | Title for the Android prompt                                                                              |
| subtitle?    |                                | string | Subtitle for the Android prompt                                                                           |
| description? |                                | string | Description for the Android prompt                                                                        |

SetCredentialOptions

| Properties | Default | Type   | Description                                                                                                                                                             |
| ---------- | ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| username   |         | string | The string used as the alias at the time of loggin in. It doesn't have to be a username. For example if you're using email to log in your users then provide the email. |
| password   |         | string | The users' password                                                                                                                                                     |
| server     |         | string | Any string to identify the credentials object with                                                                                                                      |

GetCredentialOptions

| Properties | Default | Type   | Description                                                                     |
| ---------- | ------- | ------ | ------------------------------------------------------------------------------- |
| server     |         | string | The string used to identify the credentials object when setting the credentials |

DeleteCredentialOptions

| Properties | Default | Type   | Description                                                                     |
| ---------- | ------- | ------ | ------------------------------------------------------------------------------- |
| server     |         | string | The string used to identify the credentials object when setting the credentials |

## Face ID (iOS)

To use FaceID Make sure to provide a value for NSFaceIDUsageDescription, otherwise your app may crash on iOS devices with FaceID.

This value is just the reason for using FaceID. You can add something like the following example to App/info.plist:

```xml
<key>NSFaceIDUsageDescription</key>
<string>For an easier and faster log in.</string>
```

## Biometric (Android)

To use android's BiometricPrompt api you must add the following permission to your AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC">
```

And register the plugin by adding it to you MainActivity's onCreate:

```java
import com.epicshaggy.biometric.NativeBiometric;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(NativeBiometric.class);
    }});
  }
}
```

## Notes

Hasn't been tested on Android API level 22 or lower.
