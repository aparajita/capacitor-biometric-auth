<div class="markdown-body">

# capacitor-biometric-auth-demo&nbsp;&nbsp;[![GitHub version](https://badge.fury.io/gh/aparajita%2Fcapacitor-biometric-auth-demo.svg)](https://badge.fury.io/gh/aparajita%2Fcapacitor-biometric-auth-demo)

This [Ionic 8](https://ionicframework.com) application provides a demo of all of the capabilities of the [capacitor-biometric-auth](https://github.com/aparajita/capacitor-biometric-auth) Capacitor plugin.

It’s also a good example of:

- How to use [Vite](https://vitejs.dev) as the code packager and dev server, with live reload even when running on native platforms. Big thanks to [Aaron Saunders](https://www.youtube.com/c/AaronSaundersCI) for figuring that out.
- How to integrate [Tailwind CSS](https://tailwindcss.com) with Ionic.
- How to use Tailwind to set specific component CSS variables right where they are in the html — look at the `IonSelect` classes in [`BiometryView.vue`](src/components/biometry-view.vue).

Here is this app running on both iOS and Android.

| iOS                                                                                                                            | Android                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| <video src="https://user-images.githubusercontent.com/22218/177023147-1f9abce4-2dc3-4157-8bf1-d8d9fdba3977.mp4" width="352" /> | <video src="https://user-images.githubusercontent.com/22218/177023168-d7c18a4b-a2f9-49f9-ae39-40884219c128.mp4" width="365" /> |

## Installation

```shell
git clone https://github.com/aparajita/capacitor-biometric-auth-demo.git
cd capacitor-biometric-auth-demo
pnpm install  # npm install
pnpm build  # npm run build
```

## Usage

### Web

To launch the demo in a browser:

```shell
pnpm dev  # npm run dev
```

Once the demo is open, select a biometry type from the menu and click `Authenticate`. A browser confirm will appear with a prompt set to the `Reason` field. Clicking OK simulates successful authentication, clicking Cancel simulates user cancellation.

### Native

To launch the demo in Xcode or Android Studio:

```shell
pnpm ios.dev  # npm run ios.dev
pnpm android.dev  # npm run ios.dev
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
