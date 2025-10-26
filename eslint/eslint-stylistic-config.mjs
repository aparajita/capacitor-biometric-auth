const blankLineBetweenStatements = [
  { blankLine: 'always', next: '*', prev: 'block-like' },
  { blankLine: 'always', next: '*', prev: 'break' },
  { blankLine: 'always', next: '*', prev: ['case', 'default'] },
  { blankLine: 'always', next: 'class', prev: '*' },
  { blankLine: 'always', next: 'default', prev: '*' },
  { blankLine: 'always', next: 'do', prev: '*' },
  { blankLine: 'always', next: 'for', prev: '*' },
  { blankLine: 'always', next: 'function', prev: '*' },
  { blankLine: 'always', next: 'if', prev: '*' },
  { blankLine: 'always', next: 'switch', prev: '*' },
  { blankLine: 'always', next: 'case', prev: '*' },
  { blankLine: 'always', next: 'try', prev: '*' },
  { blankLine: 'always', next: 'while', prev: '*' },
]

// This config only includes rules that are either undefined or different from
// the base neostandard config.
const config = {
  name: '@stylistic/override',
  rules: {
    '@stylistic/comma-dangle': ['error', 'only-multiline'],
    '@stylistic/implicit-arrow-linebreak': 'off',
    '@stylistic/line-comment-position': 'off',
    '@stylistic/lines-around-comment': [
      'error',
      {
        afterLineComment: false,
        allowArrayStart: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowObjectStart: true,
        allowEnumStart: true,
        allowInterfaceStart: true,
        allowModuleStart: true,
        allowTypeStart: true,
        beforeLineComment: true,
      },
    ],
    '@stylistic/lines-between-class-members': [
      'error',
      {
        enforce: [
          {
            blankLine: 'always',
            next: 'method',
            prev: '*',
          },
          {
            blankLine: 'always',
            next: '*',
            prev: 'method',
          },
        ],
      },
    ],
    '@stylistic/max-len': [
      'error',
      {
        code: 130,
        ignorePattern: String.raw`(\s+class=".+?"|^\s+/[/*]\s+eslint-disable(?:-next-line)?.+$)`,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
        ignoreUrls: true,
        tabWidth: 2,
      },
    ],
    '@stylistic/no-confusing-arrow': [
      'off',
      {
        allowParens: true,
        onlyOneSimpleParam: false,
      },
    ],

    // Base 'curly' rule is 'all', so this does not apply
    '@stylistic/nonblock-statement-body-position': 'off',
    '@stylistic/padding-line-between-statements': [
      'error',
      ...blankLineBetweenStatements,
    ],
    '@stylistic/wrap-regex': 'off',
  },
}

export default config
