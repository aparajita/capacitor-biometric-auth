const exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always', 0],
    'footer-max-line-length': [0, 'always', 0],
  },
}

export default exports
