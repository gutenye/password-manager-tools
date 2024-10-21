import fs from 'node:fs/promises'
import nodePath from 'node:path'

export async function getFixtures() {
  // const fsTree: Record<string, any> = {}
  const fixtures: Record<string, any> = {}
  const filenames = (await fs.readdir(__dirname)).filter((v) => v !== 'index.ts')
  for (const filename of filenames) {
    const { name, ext } = nodePath.parse(filename)
    const path = `${__dirname}/${filename}`
    const text = await fs.readFile(path, 'utf8')
    fixtures[filename] = text
    // fixtures[`${name}Path`] = path
    // fixtures[`${name}`] = ext === '.json' ? JSON.parse(text) : text
  }
  return fixtures
}
