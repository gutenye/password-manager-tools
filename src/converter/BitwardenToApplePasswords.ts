import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'
import type { CliConvert, Context } from '#/types'

export async function bitwardenToApplePasswords(
  inputPath: string,
  outputPath: string,
  options: CliConvert.ProcessedOptions,
  context: Context,
) {
  const { report } = context
  const { exported, remaining, password } = await Bitwarden.import(
    inputPath,
    options,
    context,
  )
  const applePasswords = await ApplePasswords.from(exported, context)
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
    report.set('isInputFileOverwritten', outputRemainingPath === inputPath)
    report.set('itOutputRemainingFileEncrypted', Boolean(password))
  }
  report.set('outputRemainingPath', outputRemainingPath)
}
