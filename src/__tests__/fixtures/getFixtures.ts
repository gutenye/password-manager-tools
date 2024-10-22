import fs from 'node:fs/promises'
import nodePath from 'node:path'
import Papa from 'papaparse'

export async function getFixtures() {
  const fixtures: Fixtures = {}
  const filenames = (await fs.readdir(__dirname)).filter((v) => ['.json', '.csv'].includes(nodePath.parse(v).ext))
  for (const filename of filenames) {
    const { name, ext } = nodePath.parse(filename)
    const path = `${__dirname}/${filename}`
    const text = await fs.readFile(path, 'utf8')
    const data = ext === '.json' ? JSON.parse(text) : ext === '.csv' ? Papa.parse(text, { header: true }).data : text
    fixtures[name] = { text, data }
  }
  return fixtures
}

export type Fixtures = Record<string, Fixture>

type Fixture = { text: string; data: any }
