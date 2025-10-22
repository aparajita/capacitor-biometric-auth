import path from 'node:path'

import js from '@eslint/js'
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import prettier from 'eslint-config-prettier/flat'

import oxlint from 'eslint-plugin-oxlint'
import unicorn from 'eslint-plugin-unicorn'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import neostandard from 'neostandard'

import baseConfig from './eslint-base-config.mjs'
import importConfig from './eslint-import-config.mjs'
import stylisticConfig from './eslint-stylistic-config.mjs'
import typescriptConfig from './eslint-typescript-config.mjs'
import unicornConfig from './eslint-unicorn-config.mjs'
import vueConfig from './eslint-vue-config.mjs'

const defaultExport = defineConfigWithVueTs(
  {
    name: 'eslint/recommended',
    ...js.configs.recommended,
  },
  eslintComments.recommended,
  neostandard({
    files: ['**/*.{js,cjs,mjs}'],
    ts: false,
  }),
  unicorn.configs['flat/recommended'],

  // Node.js Configuration
  {
    name: 'node/globals',
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript Configuration (for all .ts/.vue files)
  vueTsConfigs.recommendedTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  ...pluginVue.configs['flat/recommended'],

  // Shared custom configs
  baseConfig,
  {
    name: 'comments/override',
    rules: {
      '@eslint-community/eslint-comments/no-unlimited-disable': 'off', // oxlint unicorn/no-abusive-eslint-disable handles this
    },
  },
  importConfig,
  oxlint.buildFromOxlintConfigFile(
    path.resolve(import.meta.dirname, '../oxlint.config.jsonc'),
  ),
  stylisticConfig,
  typescriptConfig,
  unicornConfig,

  // Vue-specific configuration, must come last before Prettier
  vueConfig,

  // Prettier must be last
  prettier,
)

export default defaultExport
