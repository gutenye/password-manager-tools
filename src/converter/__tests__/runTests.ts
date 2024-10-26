import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { Item } from '#/__tests__/types'
import { Report } from '#/cli/hooks/useReport'
import type {
  ApplePasswordsExport,
  BitwardenExport,
  Context,
  ConvertOptions,
} from '#/types'

import { bitwardenToApplePasswords } from '../BitwardenToApplePasswords'

const fs = memfs.fs.promises

const CONTEXT: Context = {
  logger: {
    log: () => null,
    warn: () => null,
    error: () => null,
  },
  input: () => '',
  report: new Report({}, () => null),
}

export async function runTest(
  items: Item[],
  rawOptions: RunConvertOptions = {},
) {
  const options = {
    ...rawOptions,
    overwrite: rawOptions.overwrite === undefined ? true : rawOptions.overwrite,
  }
  const input = createBitwarden(items)
  const { output, rest } = await runConvert(input, options)
  const outputExpected = createApplePasswords(
    items.filter((item) => item?.__output__ !== false),
  )
  let restExpected = input
  if (options.overwrite) {
    restExpected = createBitwarden(
      items.map((item) => (item?.__output__ === false ? item : null)),
    )
  }
  return { output, rest, outputExpected, restExpected }
}

export async function runConvert(
  input: any,
  rawOptions: RunConvertOptions = {},
) {
  const { password, ...restOptions } = rawOptions
  const options: ConvertOptions = {
    ...restOptions,
    overwrite: rawOptions.overwrite === undefined ? true : rawOptions.overwrite,
  }
  const context: Context = {
    ...CONTEXT,
    input: () => password || '',
  }
  await fs.writeFile('/input.json', JSON.stringify(input))
  await bitwardenToApplePasswords(
    '/input.json',
    '/output.csv',
    options,
    context,
  )
  const outputText = (await fs.readFile('/output.csv', 'utf8')) as string
  const output = Papa.parse(outputText, { header: true })
    .data as ApplePasswordsExport.Root
  const restText = (await fs.readFile('/input.json', 'utf8')) as string
  const rest = restText ? (JSON.parse(restText) as BitwardenExport.File) : null
  return { output, rest }
}

interface RunConvertOptions extends Partial<ConvertOptions> {
  password?: string
}
