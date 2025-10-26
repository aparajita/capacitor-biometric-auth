import { defineConfig } from 'rollup'

export default defineConfig({
  plugins: [],
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorBiometricAuth',
      globals: {
        '@capacitor/core': 'capacitorExports',
        '@capacitor/app': 'app',
        tslib: 'tslib',
      },
      sourcemap: Boolean(process.env.SOURCE_MAP),
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: Boolean(process.env.SOURCE_MAP),
      inlineDynamicImports: true,
    },
  ],
  external: ['@capacitor/app', '@capacitor/core', 'tslib'],
})
