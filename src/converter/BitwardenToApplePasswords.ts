import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { CliConvert, Context } from '#/types'
import { pathUtils } from '#/utils'

export async function bitwardenToApplePasswords(
  inputPath: string,
  outputPath: string,
  options: CliConvert.ProcessedOptions,
  context: Context,
) {
  const { report } = context
  const input = await Bitwarden.import(inputPath, options, context)
  const output = await ApplePasswords.from(input.exported, context)
  await output.exported.export(outputPath)
  report.set('outputPath', outputPath)

  if (output.needsFix.root.length > 0) {
    const afterImportedCheckPath = pathUtils.suffix(
      outputPath,
      '-check-after-imported',
    )
    await output.needsFix.export(afterImportedCheckPath)
    report.set('afterImportedCheckPath', afterImportedCheckPath)
  }

  let remainingPath: string | undefined
  if (options.outputRemaining === 'overwrite-input-file') {
    remainingPath = inputPath
  } else if (options.outputRemaining) {
    remainingPath = options.outputRemaining
  }
  if (remainingPath) {
    const { password } = input
    await input.remaining.export(remainingPath, { password })
    report.set('isInputFileOverwritten', remainingPath === inputPath)
    report.set('isRemainingFileEncrypted', Boolean(password))
  }
  report.set('remainingPath', remainingPath)
}
