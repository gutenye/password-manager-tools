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
  let remaining: Bitwarden = new Bitwarden(
    { ...bitwarden.root, items: [] },
    context,
  )
  if (options.includeUris) {
    const parts = bitwarden.includeUris(options.includeUris)
    found = parts[0]
    remaining = parts[1]
    report.set('remainingCount', remaining.count)
  }
  const applePasswords = await ApplePasswords.from(found, context)
  await applePasswords.export(outputPath)
  report.set('outputPath', outputPath)
  let outputRemainingPath: string | undefined
  if (options.outputRemaining === 'overwrite-input-file') {
    outputRemainingPath = inputPath
  } else if (options.outputRemaining) {
    outputRemainingPath = options.outputRemaining
  }
  if (outputRemainingPath) {
    await remaining.export(outputRemainingPath, { password })
  }
  report.set('outputRemainingPath', outputRemainingPath)
}
