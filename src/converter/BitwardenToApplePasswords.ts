import fs from 'node:fs/promises'
import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { ConvertOptions } from '#/types'

export async function bitwardenToApplePasswords(
  inputPath: string,
  outputPath: string,
  options: ConvertOptions,
) {
  const { logger } = options
  const { bitwarden, password } = await Bitwarden.import(inputPath, options)
  let found: Bitwarden | null = bitwarden
  let rest: Bitwarden = new Bitwarden({ ...bitwarden.root, items: [] })
  if (options.includeUris) {
    const parts = bitwarden.includeUris(options.includeUris)
    found = parts[0]
    rest = parts[1]
  }
  if (found.root.items.length === 0) {
    logger.warn('No items found')
  }
  const applePasswords = await ApplePasswords.from(found)
  await applePasswords.export(outputPath)
  logger.log(`Output '${outputPath}'`)
  if (options.overwrite) {
    if (rest) {
      await rest.export(inputPath, { password })
    } else {
      await fs.writeFile(inputPath, '')
    }
    logger.log(`Overwrite '${inputPath}'`)
  }
}
