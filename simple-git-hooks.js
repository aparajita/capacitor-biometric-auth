/*
  IMPORTANT!

  Be sure to run `simple-git-hooks` after modifying this file.
*/
module.exports = {
  'commit-msg': 'cat "$@" | "$PWD"/node_modules/.bin/commitlint',
  'pre-commit': 'pnpm lint',
}
