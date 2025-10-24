// This config only defines the rules for the import plugin that are either
// not defined or are different from the base neostandard config.
const config = {
  name: 'import-x/override',
  files: ['**/*.{mjs,ts,vue}'],
  settings: {
    // Tell eslint-plugin-import to treat @ws/ as an internal package
    // for grouping
    'import-x/internal-regex': '^@ws/',

    // Use the TypeScript resolver to understand tsconfig path mappings
    'import-x/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['tsconfig.json', 'demo/tsconfig.json'],
      },
      node: true,
    },
  },
  rules: {
    'import-x/export': 'error',
    'import-x/exports-last': 'off',
    'import-x/extensions': [
      'error',
      {
        js: 'never',
        cjs: 'always',
        mjs: 'ignorePackages',
        json: 'always',
        vue: 'always',
        svg: 'always',
        css: 'always',
      },
    ],
    'import-x/group-exports': 'off',
    'import-x/max-dependencies': 'off',
    'import-x/named': 'off',
    'import-x/newline-after-import': [
      'error',
      {
        count: 1,
        exactCount: true,
        considerComments: true,
      },
    ],
    'import-x/no-anonymous-default-export': 'error',
    'import-x/no-default-export': 'off',
    'import-x/no-deprecated': 'error',
    'import-x/no-dynamic-require': 'off',
    'import-x/no-extraneous-dependencies': 'off',
    'import-x/no-import-module-exports': 'error',
    'import-x/no-internal-modules': 'off',
    'import-x/no-named-default': 'off',
    'import-x/no-named-export': 'off',
    'import-x/no-namespace': ['off', { ignore: ['package.json'] }],
    'import-x/no-nodejs-modules': 'off',
    'import-x/no-require': 'off',
    'import-x/no-relative-packages': 'error',
    'import-x/no-relative-parent-imports': 'off',
    'import-x/no-restricted-paths': 'off',
    'import-x/no-unresolved': 'error',
    'import-x/no-unused-modules': 'off',
    'import-x/no-useless-path-segments': [
      'off',
      {
        noUselessIndex: false,
        commonjs: false,
      },
    ],
    'import-x/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        pathGroups: [
          {
            pattern: '@ws/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        distinctGroup: true,
        'newlines-between': 'always-and-inside-groups',
        named: true,
        alphabetize: { order: 'asc', caseInsensitive: true },
        warnOnUnassignedImports: true,
      },
    ],
    'import-x/prefer-default-export': 'off',
    'import-x/unambiguous': 'off',
  },
}

export default config
