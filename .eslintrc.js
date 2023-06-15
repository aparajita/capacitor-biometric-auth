module.exports = {
  root: true,
  extends: ['@aparajita/base'],

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
