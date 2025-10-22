const config = {
  name: 'override/vue/no-useless-assignment',
  files: ['**/*.vue'],
  rules: {
    // This rule is broken in Vue SFCs and causes many false positives.
    // See https://github.com/vuejs/eslint-plugin-vue/issues/2660
    'no-useless-assignment': 'off',

    // Ionic uses a `slot` attribute on its components, which vue thinks is
    // the deprecated `slot` attribute for slots. This causes false positives.
    'vue/no-deprecated-slot-attribute': 'off',
  },
}

export default config
