import invariant from 'invariant'
import { AppError } from '#/errors'
import type { Context, ConvertOptions } from '#/types'
import { bitwardenToApplePasswords } from './BitwardenToApplePasswords'

const converters: Record<string, convert | undefined> = {
  'bitwarden-to-apple': bitwardenToApplePasswords,
}

function getConverter(name: string) {
  const converter = converters[name]
  invariant(converter, `app1-to-app2 '${name}' is not supported.`)
  return converter
}

export async function runConvert(
  name: string,
  inputPath: string,
  outputPath: string,
  options: ConvertOptions,
  context: Context,
) {
  const { report } = context
  try {
    await getConverter(name)(inputPath, outputPath, options, context)
    report.done()
  } catch (error) {
    if (error instanceof AppError) {
      report.exit(error)
    }
    throw error
  }
}

export type convert = (
  input: string,
  output: string,
  options: ConvertOptions,
  context: Context,
) => Promise<void>
