<script setup lang="ts">
import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryErrorType,
  BiometryType,
  getBiometryName,
} from '@aparajita/capacitor-biometric-auth'
import type {
  AuthenticateOptions,
  BiometryError,
  CheckBiometryResult,
} from '@aparajita/capacitor-biometric-auth'
import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import type { SelectCustomEvent } from '@ionic/core'
import {
  alertController,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
} from 'vue'

interface BiometryTypeEntry {
  title: string
  type: number
}

const biometryTypes: BiometryTypeEntry[] = [
  {
    title: 'None',
    type: BiometryType.none,
  },
  {
    title: 'Touch ID',
    type: BiometryType.touchId,
  },
  {
    title: 'Face ID',
    type: BiometryType.faceId,
  },
  {
    title: 'Fingerprint',
    type: BiometryType.fingerprintAuthentication,
  },
  {
    title: 'Fingerprint + face',
    type:
      BiometryType.fingerprintAuthentication * 10 +
      BiometryType.faceAuthentication,
  },
  {
    title: 'Fingerprint + iris',
    type:
      BiometryType.fingerprintAuthentication * 10 +
      BiometryType.irisAuthentication,
  },
]
/*
 * ref
 */
const biometry = ref<CheckBiometryResult>({
  isAvailable: false,
  strongBiometryIsAvailable: false,
  biometryType: BiometryType.none,
  biometryTypes: [],
  deviceIsSecure: false,
  reason: '',
  code: BiometryErrorType.none,
  strongReason: '',
  strongCode: BiometryErrorType.none,
})

const options = reactive<AuthenticateOptions>({
  reason: '',
  cancelTitle: '',
  iosFallbackTitle: '',
  androidTitle: '',
  androidSubtitle: '',
  allowDeviceCredential: false,
  androidConfirmationRequired: false,
  androidBiometryStrength: AndroidBiometryStrength.weak,
})

const biometryType = ref(BiometryType.none)
const onlyUseStrongBiometry = ref(false)
const isEnrolled = ref(false)
const deviceIsSecure = ref(false)
let appListener: PluginListenerHandle

const isNative = Capacitor.isNativePlatform()
const isIOS = Capacitor.getPlatform() === 'ios'
const isAndroid = Capacitor.getPlatform() === 'android'

/*
 * computed
 */
const biometryName = computed(() => {
  if (biometry.value.biometryTypes.length === 0) {
    return 'No biometry'
  }

  if (biometry.value.biometryTypes.length === 1) {
    return getBiometryName(biometry.value.biometryType)
  }

  return 'Biometry'
})

const biometryNames = computed(() => {
  if (biometry.value.biometryTypes.length === 0) {
    return 'None'
  }

  return biometry.value.biometryTypes
    .map((type) => getBiometryName(type))
    .join('<br>')
})

const availableBiometry = computed(() => {
  if (biometry.value.isAvailable) {
    return biometry.value.biometryTypes.length > 1 ? 'One or more' : 'Yes'
  }

  return 'None'
})

/*
 * methods
 */
function updateBiometryInfo(info: CheckBiometryResult): void {
  console.log('updateBiometryInfo', info)
  biometry.value = info
}

onBeforeMount(async () => {
  updateBiometryInfo(await BiometricAuth.checkBiometry())

  try {
    appListener = await BiometricAuth.addResumeListener(updateBiometryInfo)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
  }
})

onMounted(async () => {
  await SplashScreen.hide()
})

onBeforeUnmount(async () => {
  await appListener?.remove()
})

async function showAlert(message: string): Promise<void> {
  const alert = await alertController.create({
    header: `${biometryName.value} says:`,
    subHeader: '',
    message,
    buttons: ['OK'],
  })
  await alert.present()
}

async function showErrorAlert(error: BiometryError): Promise<void> {
  await showAlert(`${error.message} [${error.code}].`)
}

async function onAuthenticate(): Promise<void> {
  try {
    // options is a reactive proxy, we can't pass it directly to a plugin.
    // so pass the underlying object.
    await BiometricAuth.authenticate(toRaw(options))
    await showAlert('Authorization successful!')
  } catch (error) {
    // Someday TypeScript will let us type catch clauses...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    await showErrorAlert(error as BiometryError)
  }
}

async function onSelectBiometry(
  event: SelectCustomEvent<string>,
): Promise<void> {
  const type = Number(event.detail.value)

  if (type > 10) {
    const primary = Math.floor(type / 10) as BiometryType
    const secondary = (type % 10) as BiometryType
    await BiometricAuth.setBiometryType([primary, secondary])
  } else {
    await BiometricAuth.setBiometryType(type === 0 ? BiometryType.none : type)
  }

  updateBiometryInfo(await BiometricAuth.checkBiometry())
}

function onSetAndroidBiometryStrength(): void {
  options.androidBiometryStrength = onlyUseStrongBiometry.value
    ? AndroidBiometryStrength.strong
    : AndroidBiometryStrength.weak
}

async function onSetIsEnrolled(): Promise<void> {
  await BiometricAuth.setBiometryIsEnrolled(isEnrolled.value)
  updateBiometryInfo(await BiometricAuth.checkBiometry())
}

async function onSetDeviceIsSecure(): Promise<void> {
  await BiometricAuth.setDeviceIsSecure(deviceIsSecure.value)
  updateBiometryInfo(await BiometricAuth.checkBiometry())
}
</script>

<template>
  <ion-page class="w-full h-full">
    <ion-header>
      <ion-toolbar>
        <ion-title>Biometry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onAuthenticate"> Authenticate</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="true">
      <ion-list lines="full">
        <ion-item>
          <ion-label>
            <h3 class="!text-sm">Supported biometry</h3>
            <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component,vue/no-v-html -->
            <div v-html="biometryNames" />
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-text class="block">Biometry available</ion-text>
            <ion-text class="block !text-sm text-neutral-400">
              {{ biometry.reason }}
            </ion-text>
          </ion-label>
          <ion-text slot="end">
            {{ availableBiometry }}
          </ion-text>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-text class="block">Strong biometry available</ion-text>
            <ion-text class="block !text-sm text-neutral-400">
              {{ biometry.strongReason }}
            </ion-text>
          </ion-label>
          <ion-text slot="end">
            {{ biometry.strongBiometryIsAvailable ? 'Yes' : 'No' }}
          </ion-text>
        </ion-item>

        <ion-item>
          <ion-label> Device is secure</ion-label>
          <ion-text slot="end">
            {{ biometry.deviceIsSecure ? 'Yes' : 'No' }}
          </ion-text>
        </ion-item>
      </ion-list>

      <ion-list
        class="mt-6"
        lines="full"
      >
        <ion-list-header>Options</ion-list-header>

        <template v-if="!isNative">
          <ion-item>
            <ion-select
              v-model="biometryType"
              label="Biometry"
              class="[--padding-start:0px] max-w-full"
              interface="action-sheet"
              :interface-options="{ header: 'Select biometry type' }"
              @ion-change="onSelectBiometry"
            >
              <ion-select-option
                v-for="entry in biometryTypes"
                :key="entry.type"
                :value="entry.type"
              >
                {{ entry.title }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-checkbox
              v-model="isEnrolled"
              :disabled="biometry.biometryType === BiometryType.none"
              @ion-change="onSetIsEnrolled"
            >
              Enrolled
            </ion-checkbox>
          </ion-item>

          <ion-item>
            <ion-checkbox
              v-model="deviceIsSecure"
              @ion-change="onSetDeviceIsSecure"
            >
              Device is secure
            </ion-checkbox>
          </ion-item>
        </template>

        <ion-item v-if="isAndroid">
          <ion-checkbox
            v-model="onlyUseStrongBiometry"
            @ion-change="onSetAndroidBiometryStrength"
          >
            Only use strong biometry
          </ion-checkbox>
        </ion-item>

        <ion-item>
          <ion-checkbox v-model="options.allowDeviceCredential">
            Allow device credential
          </ion-checkbox>
        </ion-item>

        <ion-item v-if="isAndroid">
          <ion-checkbox v-model="options.androidConfirmationRequired">
            Require confirmation
          </ion-checkbox>
        </ion-item>

        <template v-if="isAndroid">
          <ion-item>
            <ion-input
              v-model="options.androidTitle"
              label="Title:"
              type="text"
              autocapitalize="sentences"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="options.androidSubtitle"
              label="Subtitle:"
              type="text"
              autocapitalize="sentences"
            />
          </ion-item>
        </template>

        <ion-item>
          <ion-input
            v-model="options.reason"
            label="Reason:"
            type="text"
            autocapitalize="sentences"
          />
        </ion-item>

        <ion-item v-if="isNative">
          <ion-input
            v-model="options.cancelTitle"
            label="Cancel title:"
            type="text"
            autocapitalize="sentences"
          />
        </ion-item>

        <ion-item v-if="isIOS">
          <ion-input
            v-model="options.iosFallbackTitle"
            label="Fallback title:"
            type="text"
            autocapitalize="sentences"
          />
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
