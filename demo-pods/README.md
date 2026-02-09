<div class="markdown-body">

# capacitor-biometric-auth demo (CocoaPods)&nbsp;&nbsp;[![GitHub version](https://badge.fury.io/gh/aparajita%2Fcapacitor-biometric-auth.svg)](https://badge.fury.io/gh/aparajita%2Fcapacitor-biometric-auth-demo)

This [Ionic 8](https://ionicframework.com) application provides a demo of all of the capabilities of the [capacitor-biometric-auth](https://github.com/aparajita/capacitor-biometric-auth) Capacitor plugin. This is the **CocoaPods variant** of the demo app. There is also an [SPM variant](../demo-spm/README.md) available.

## Installation

```shell
git clone https://github.com/aparajita/capacitor-biometric-auth.git
cd capacitor-biometric-auth
pnpm install  # npm install
```

## Usage

### Web

To launch the demo in a browser, simulating biometric authentication:

```shell
pnpm demo.dev  # npm run demo.dev
```

Once the demo is open, select a biometry type from the menu and click `Authenticate`. A browser confirm will appear with a prompt set to the `Reason` field. Clicking OK simulates successful authentication, clicking Cancel simulates user cancellation.

### Native

To launch the demo in Xcode or Android Studio:

```shell
# With live reload:
pnpm demo.ios.dev  # npm run demo.ios.dev
pnpm demo.android.dev  # npm run demo.ios.dev

# Without live reload:
pnpm demo.ios  # npm run demo.ios
pnpm demo.android  # npm run demo.android
```

Once Xcode/Android Studio opens, select the device or simulator you wish to run the demo on. When the demo app opens, the supported biometry type and status is displayed at the top.

On iOS, if biometry is supported but not available in a simulator, you have to manually enroll in biometry:

- Select via the Features > Touch/Face ID > Enrolled.
- Suspend and resume the demo app. You should see that biometry is now available.

On Android, if you have not yet enrolled fingerprints in a simulator, you have to set that up in the system settings. You can simulate fingerprints from the command line using `adb`. If you have not yet installed the Android platform tools, first do that. On macOS, use `brew`:

```shell
brew install android-platform-tools
```

Once `adb` is installed, when you are prompted for a fingerprint in the simulator, open a terminal and enter:

```shell
# <n> is the number (1, 2, etc.) of the finger
# you enrolled in the system settings. Or use
# a non-enrolled number to simulate failure.
adb -e emu finger touch <n>
```

You may set all of the available [`AuthenticateOptions`](https://github.com/aparajita/capacitor-biometric-auth/blob/main/src/definitions.ts#L36) for the current platform via the on screen inputs. I recommend reading the documentation for each option to understand what it does on each platform.

Enjoy!

</div>
