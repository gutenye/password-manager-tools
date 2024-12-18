import invariant from 'invariant'
import type { CliConvert, Context } from '#/types'
import { bitwardenToApplePasswords } from './BitwardenToApplePasswords'

const converters: Record<string, convert | undefined> = {
  'bitwarden-to-apple': bitwardenToApplePasswords,
}

export function getConverter(name: string) {
  const converter = converters[name]
  invariant(converter, `app1-to-app2 '${name}' is not supported.`)
  return converter
}

export type convert = (
  input: string,
  output: string,
  options: CliConvert.ProcessedOptions,
  context: Context,
) => Promise<void>
