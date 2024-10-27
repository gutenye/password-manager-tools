import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { Item } from '#/__tests__/types'
import { Bitwarden } from '#/bitwarden'
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
    outputRemaining: '/remaining.json',
    ...rawOptions,
  }
  const input = createBitwarden(items)
  const result = await runConvert(input, options)
  const outputExpected = createApplePasswords(
    items.filter((item) => item?.__output__ !== false),
  )
  let remainingExpected: BitwardenExport.Root | undefined
  if (options.outputRemaining) {
    remainingExpected = createBitwarden(
      items.map((item) => (item?.__output__ === false ? item : null)),
    )
  }
  return {
    ...result,
    input,
    outputExpected,
    remainingExpected,
  }
}

export async function runConvert(
  input: any,
  rawOptions: RunConvertOptions = {},
) {
  const { password, ...restOptions } = rawOptions
  const options = {
    outputRemaining: '/remaining.json',
    ...restOptions,
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
  let remaining: BitwardenExport.File | undefined
  const outputRemainingPath =
    options.outputRemaining === 'overwrite-input-file'
      ? '/input.json'
      : options.outputRemaining
  if (outputRemainingPath) {
    const remainingText = (await fs.readFile(
      outputRemainingPath,
      'utf8',
    )) as string
    remaining = JSON.parse(remainingText) as BitwardenExport.File
  }
  const inputFileData = JSON.parse(
    (await fs.readFile('/input.json', 'utf8')) as string,
  )
  return { output, remaining, outputRemainingPath, inputFileData }
}

interface RunConvertOptions extends Partial<ConvertOptions> {
  password?: string
}
