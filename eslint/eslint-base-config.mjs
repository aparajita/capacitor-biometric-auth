/*
  We use the recommended config from eslint and from neostandard. Only rules
  that are not covered by the recommended configs or are overridden are included
  in this file.
  https://eslint.org/docs/latest/rules/
 */

const configs = [
  {
    name: 'eslint/extra/ignores',
    ignores: [
      '.claude/**',
      '**/dist/**',
      '**/ios/**',
      '**/android/**',
      '**/**.d.ts',
      '.idea/**',
    ],
  },
  {
    name: 'eslint/override',
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',
      camelcase: 'off', // Handled by @typescript-eslint/naming-convention
      'capitalized-comments': [
        'off',
        'always',
        {
          ignoreConsecutiveComments: true,
          ignorePattern: 'noinspection .+',
        },
      ],
      'class-methods-use-this': 'error',
      'consistent-return': 'error',
      'consistent-this': ['error', 'self'],
      'func-name-matching': 'error',
      'grouped-accessor-pairs': 'error',
      'max-statements': ['error', 31],
      'n/handle-callback-err': 'off',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'error',
      'no-invalid-this': 'error',
      'no-loop-func': 'error',
      'no-param-reassign': 'error',
      'no-promise-executor-return': 'error',
      'no-undefined': 'off', // We have no problem using undefined
      'no-use-before-define': 'off',
      'no-useless-assignment': 'error',
      'no-void': 'off', // We use void to ignore Promise results
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': 'off', // Too many false positives

      // Don't need named groups when using with function callbacks,
      // and named groups are useless when there is only one capture.
      'prefer-named-capture-group': 'off',
      'prefer-template': 'error',
      'require-atomic-updates': 'off', // Too many false positives
      'require-unicode-regexp': 'error',
    },
  },
]

export default configs
