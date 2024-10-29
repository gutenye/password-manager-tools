import filePath from 'node:path'

// suffix name
// a.js -> a-b.js
export function suffix(path: string, suffix: string) {
  const { dir, name, ext } = filePath.parse(path)
  return filePath.join(dir, `${name}${suffix}${ext}`)
}
