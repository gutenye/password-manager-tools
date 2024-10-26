import fs from 'node:fs/promises'
import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { Context, ConvertOptions } from '#/types'

export async function bitwardenToApplePasswords(
  inputPath: string,
  outputPath: string,
  options: ConvertOptions,
  context: Context,
) {
  const { report } = context
  const { bitwarden, password } = await Bitwarden.import(inputPath, context)
  let found: Bitwarden | null = bitwarden
  let rest: Bitwarden = new Bitwarden({ ...bitwarden.root, items: [] }, context)
  if (options.includeUris) {
    const parts = bitwarden.includeUris(options.includeUris)
    found = parts[0]
    rest = parts[1]
    report.set('skippedCount', rest.root.items.length)
  }
  const applePasswords = await ApplePasswords.from(found, context)
  await applePasswords.export(outputPath)
  report.set('outputPath', outputPath)
  if (options.overwrite) {
    if (rest) {
      await rest.export(inputPath, { password })
    } else {
      await fs.writeFile(inputPath, '')
    }
    report.set('overwritePath', inputPath)
  }
}
