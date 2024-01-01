module.exports = {
  root: true,
  extends: ['@aparajita/base'],
  rules: {
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
