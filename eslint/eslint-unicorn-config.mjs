const config = {
  name: 'unicorn/override',
  rules: {
    'unicorn/better-regex': 'error',
    'unicorn/custom-error-definition': 'error',
    'unicorn/no-anonymous-default-export': 'off', // We like default exports,
    'unicorn/no-negated-condition': 'off', // Sometimes negated conditions are more readable
    'unicorn/no-null': 'off',
    'unicorn/no-process-exit': 'off',
    'unicorn/no-unused-properties': 'error',
    'unicorn/prefer-at': 'off', // Too many false positives

    // Avoid issues with setTimeout() and setInterval()
    'unicorn/prefer-global-this': 'off',
    'unicorn/prefer-import-meta-properties': 'error',
    'unicorn/prefer-module': 'off', // Too many .js files that are not modules
    'unicorn/prefer-set-has': 'off',
    'unicorn/prefer-top-level-await': 'off', // Not supported in commonjs
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          args: true,
          ctx: true,
          db: true,
          dest: true,
          doc: true,
          el: true,
          err: true,
          env: true,
          func: true,
          msg: true,
          opts: true,
          param: true,
          params: true,
          pkg: true,
          props: true,
          ref: true,
          refs: true,
          req: true,
          res: true,
          str: true,
        },

        ignore: [
          // Names like 'componentsDir', 'requestRefs', 'setupFunc' are allowed
          String.raw`(?:.+(Dir|Refs?|Func|Var|Env([A-Z]\w+)?)$|[ijk])`,

          // Names like 'devServerPort' and 'runDevCmd' are allowed
          String.raw`(^d|.*D)ev[A-Z]\w+$`,

          // Names like 'prodServerPort' and 'runProdCmd' are allowed
          String.raw`(^p|.*P)rod[A-Z]\w+$`,
        ],
      },
    ],
    // We prefer to use switch-case without braces unless necessary
    'unicorn/switch-case-braces': ['error', 'avoid'],
  },
}

export default config
