export function readVersion(contents) {
  const versionMatch = contents.match(/versionName\s+"([\d.]+)"/u)

  if (versionMatch) {
    return versionMatch[1]
  }

  throw new Error('Version not found in the provided contents.')
}

export function writeVersion(contents, version) {
  return contents
    .replace(/versionName\s+"[\d.]+"/u, `versionName "${version}"`)
    .replace(/versionCode\s+\d+/u, (match) => {
      const currentCode = Number.parseInt(match.match(/\d+/u)[0], 10)
      return `versionCode ${currentCode + 1}`
    })
}
