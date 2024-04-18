module.exports = {
  root: true,
  extends: ['@aparajita/base'],
  rules: {
    '@typescript-eslint/consistent-type-assertions': 'off',
    'import/prefer-default-export': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        tsconfigRootDir: './',
        project: ['./tsconfig.json'],
      },
    },
  ],
}
