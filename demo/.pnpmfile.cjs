function readPackage(pkg, context) {
  if (pkg.name === 'jsdom' && pkg.version.startsWith('23.2')) {
    // Replace tough-cookie v4 with v5
    pkg.dependencies = {
      ...pkg.dependencies,
      'tough-cookie': '^5.0.0-rc.3',
    }
    context.log('tough-cookie@4 => tough-cookie@5 in dependencies of jsdom')
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
