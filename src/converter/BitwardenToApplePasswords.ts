import fs from 'node:fs/promises'
import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { ConvertOptions } from '#/types'

export async function bitwardenToApplePasswords(input: string, output: string, options: ConvertOptions = {}) {
  const bitwarden = await Bitwarden.import(input)
  let found: Bitwarden | null = bitwarden
  let rest: Bitwarden | null = null
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
  await applePasswords.export(output)
  console.log(`output: '${output}'`)
  if (rest) {
    await rest.export(input)
  } else {
    await fs.writeFile(input, '')
  }
  console.log(`overwrite: '${input}'`)
}
