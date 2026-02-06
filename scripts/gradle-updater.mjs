const versionNameRegex = /versionName\s*=\s*"([\d.]+)"/u
const versionCodeRegex = /versionCode\s*=\s*(\d+)/u

export function readVersion(contents) {
  const versionNameMatch = contents.match(versionNameRegex)
  const versionCodeMatch = contents.match(versionCodeRegex)

  if (versionNameMatch && versionCodeMatch) {
    return versionNameMatch[1]
  }

  throw new Error(
    'versionName and/or versionCode not found in the provided contents.',
  )
}

export function writeVersion(contents, version) {
  return contents
    .replace(versionNameRegex, `versionName = "${version}"`)
    .replace(
      versionCodeRegex,
      (match, versionCode) =>
        `versionCode = ${Number.parseInt(versionCode, 10) + 1}`,
    )
}
