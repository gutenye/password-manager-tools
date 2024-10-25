import fs from 'node:fs/promises'
import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { ConvertOptions } from '#/types'

export async function bitwardenToApplePasswords(inputPath: string, outputPath: string, options: ConvertOptions) {
  const { bitwarden, password } = await Bitwarden.import(inputPath, options)
  let found: Bitwarden | null = bitwarden
  let rest: Bitwarden = new Bitwarden({ ...bitwarden.root, items: [] })
  if (options.includeUris) {
    const parts = bitwarden.includeUris(options.includeUris)
    found = parts[0]
    rest = parts[1]
  }
  if (!found) {
    console.log('error: no items found')
    return
  }
  const applePasswords = await ApplePasswords.from(found)
  await applePasswords.export(outputPath)
  console.log(`output: '${outputPath}'`)
  if (rest) {
    await rest.export(inputPath, { password })
  } else {
    await fs.writeFile(inputPath, '')
  }
  console.log(`overwrite: '${inputPath}'`)
}
