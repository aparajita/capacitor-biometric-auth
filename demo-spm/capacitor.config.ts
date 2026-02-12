import type { CapacitorConfig } from '@capacitor/cli'
import baseConfig from 'demo-shared/capacitor.config'

const config: CapacitorConfig = {
  ...baseConfig,
  webDir: '../demo-shared/dist',
}

export default config
