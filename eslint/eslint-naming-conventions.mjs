/**
 * Our naming conventions for various types of identifiers.
 */
const namingConventions = [
  { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid' },
  {
    selector: 'import',
    format: ['camelCase', 'PascalCase'],
  },
  { selector: 'variable', format: ['camelCase'] },
  { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
  {
    selector: ['objectLiteralProperty', 'typeProperty'],
    format: null,
    leadingUnderscore: 'allowSingleOrDouble',
  },
  {
    selector: 'objectLiteralMethod',
    format: null,
  },
  {
    selector: 'memberLike',
    modifiers: ['private'],
    format: ['camelCase'],
  },
  { selector: 'typeLike', format: ['PascalCase'] },
  {
    selector: 'enum',
    format: ['PascalCase'],
  },
]

export default namingConventions
