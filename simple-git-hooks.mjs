/*
  IMPORTANT!

  Be sure to run `simple-git-hooks` after modifying this file.
*/
const hooks = {
  'commit-msg': 'cat "$@" | "$PWD"/node_modules/.bin/commitlint',
  'pre-commit': 'pnpm lint',
}

export default hooks
