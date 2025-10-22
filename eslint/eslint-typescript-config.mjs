import baseConfigs from './eslint-base-config.mjs'
import namingConventions from './eslint-naming-conventions.mjs'

/**
 * Many @typescript-eslint rules shadow base ESLint rules. This function
 * converts a base rule into a @typescript-eslint rule, while preserving
 * the options from and disabling the base rule.
 */
function fromBaseRule(rule, options) {
  const { rules } =
    baseConfigs.find((config) => config.name === 'eslint/override') || {}
  const newRule = {
    [rule]: 'off',
  }

  if (rules[rule]) {
    const baseRule = rules[rule]
    const newRuleName = `@typescript-eslint/${rule}`
    newRule[newRuleName] = options ?? baseRule
    return newRule
  }

  return {}
}

// This config only includes rules that are not included or are overrides
// of the neostandard recommended config.
// See https://typescript-eslint.io/rules/ for info on each rule
const config = {
  name: '@typescript-eslint/override',
  files: ['**/*.{ts,vue}'],
  rules: {
    '@typescript-eslint/await-thenable': 'error',
    ...fromBaseRule('class-methods-use-this', [
      'error',
      {
        ignoreClassesThatImplementAnInterface: true,
      },
    ]),
    '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
    '@typescript-eslint/consistent-generic-constructors': [
      'error',
      'constructor',
    ],
    '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
    ...fromBaseRule('consistent-return', 'off'), // Docs recommend using tsconfig noImplicitReturns instead
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'separate-type-imports',
      },
    ],
    ...fromBaseRule('default-param-last'),
    ...fromBaseRule('dot-notation'),
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    ...fromBaseRule('init-declarations'),
    ...fromBaseRule('max-params'),
    '@typescript-eslint/member-ordering': 'off', // Off for this project
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    '@typescript-eslint/naming-convention': ['error', ...namingConventions],
    '@typescript-eslint/no-array-delete': 'error',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-deprecated': 'error',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-duplicate-type-constituents': 'error',
    ...fromBaseRule('no-empty-function'),
    '@typescript-eslint/no-explicit-any': 'off', // Sometimes you need `any`
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-implied-eval': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    ...fromBaseRule('no-invalid-this', 'off'), // Docs recommend using tsconfig noImplicitThis instead
    '@typescript-eslint/no-invalid-void-type': 'error',
    ...fromBaseRule('no-loop-func'),
    ...fromBaseRule('no-magic-numbers', 'off'), // Too many false positives
    '@typescript-eslint/no-meaningless-void-operator': [
      'error',
      {
        checkNever: false,
      },
    ],
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-misused-spread': 'error',
    ...fromBaseRule('no-redeclare'),
    '@typescript-eslint/no-mixed-enums': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-redundant-type-constituents': 'error',
    '@typescript-eslint/no-require-imports': 'off', // oxlint handles this
    ...fromBaseRule('no-restricted-imports'),
    ...fromBaseRule('no-shadow', ['error', { ignoreTypeValueShadow: true }]),
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'off', // False positives
    '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-template-expression': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-conversion': 'error',
    '@typescript-eslint/no-unnecessary-type-parameters': 'off', // Too many false positives
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/no-unsafe-enum-comparison': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-type-assertion': 'error',
    '@typescript-eslint/no-unsafe-unary-minus': 'error',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/no-wrapper-object-types': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    'no-throw-literal': 'off', // Handled by next rule
    '@typescript-eslint/only-throw-error': 'error',
    '@typescript-eslint/parameter-properties': 'off',
    '@typescript-eslint/prefer-as-const': 'error',
    ...fromBaseRule('prefer-destructuring'),

    // We're fine with enums that don't have initializers
    '@typescript-eslint/prefer-enum-initializers': 'off',
    '@typescript-eslint/prefer-find': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'off', // Not using namespaces
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    ...fromBaseRule('prefer-promise-reject-errors'),
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too many false positives in this project
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-return-this-type': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/related-getter-setter-pairs': 'error',
    '@typescript-eslint/require-array-sort-compare': [
      'error',
      { ignoreStringArrays: true },
    ],
    ...fromBaseRule('require-await'),
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNumber: true,
        allowBoolean: true,
        allowAny: false,
        allowNullish: true,
        allowRegExp: false,
      },
    ],
    ...fromBaseRule('return-await', ['error', 'in-try-catch']),
    '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict
    '@typescript-eslint/switch-exhaustiveness-check': [
      'error',
      {
        allowDefaultCaseForExhaustiveSwitch: true,
        considerDefaultExhaustiveForUnions: true,
        requireDefaultForNonUnion: false,
      },
    ],
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/typedef': 'off', // Docs recommend using tsconfig instead
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
  },
}

export default config
