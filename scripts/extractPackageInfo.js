const fs = require('fs')
const pkg = require('../package.json')

/*
  This script extracts fields in package.json to a separate JSON file.
  Why? Because if we import package.json in a TypeScript file, it will
  insert the entire package.json object into the global scope and we
  only want the properties we care about.
 */
const keysToExport = ['name', 'version']
const exportLines = keysToExport
  .map((key) => `"${key}": "${pkg[key]}"`)
  .join(',\n  ')
const info = '{\n  _exports_\n}\n'.replace('_exports_', exportLines)

fs.writeFileSync('src/info.json', info)
