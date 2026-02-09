import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharedConfig from 'demo-shared/vite.config.mjs'
import { mergeConfig } from 'vite'

export default mergeConfig(sharedConfig, {
  root: path.dirname(
    fileURLToPath(import.meta.resolve('demo-shared/vite.config.mjs')),
  ),
  define: {
    BUILD_VARIANT: JSON.stringify('CocoaPods'),
  },
})
