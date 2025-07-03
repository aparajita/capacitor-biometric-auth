import path from 'node:path'

import js from '@eslint/js'
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import prettier from 'eslint-config-prettier/flat'
import oxlint from 'eslint-plugin-oxlint'
import unicorn from 'eslint-plugin-unicorn'
import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'

import importConfig from './eslint/eslint-import-config.mjs'
import stylisticConfig from './eslint/eslint-stylistic-config.mjs'
import typescriptConfig from './eslint/eslint-typescript-config.mjs'
import unicornConfig from './eslint/eslint-unicorn-config.mjs'

const config = [
  // Global ignores
  {
    ignores: ['.claude/**', 'dist/**', 'ios/**', 'android/**', 'demo/**', '.idea/**', 'node_modules/**'],
  },

  js.configs.recommended,

  // We use StandardJS style (with a few exceptions). This config loads
  // plugins and config for eslint, @stylisitc, promise, n, and import-x.
  ...neostandard({
    files: ['**/*.{js,cjs,mjs}'],
    ts: true,
  }),
  ...tseslint.configs.recommended,
  eslintComments.recommended,
  importConfig,
  stylisticConfig,
  typescriptConfig,
  unicorn.configs['recommended'],
  unicornConfig,
  prettier,
  ...oxlint.buildFromOxlintConfigFile(
    path.resolve(import.meta.dirname, './oxlint.config.jsonc'),
  ),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project-specific overrides (from original .eslintrc.js)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
]

export default config
