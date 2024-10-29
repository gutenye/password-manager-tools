import { spyOn } from 'bun:test'
import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { Item } from '#/__tests__/types'
import { runConvertCommand } from '#/cli/ConvertCommand/ConvertCommand'
import { Report, initialReport } from '#/cli/report'
import type {
  ApplePasswordsExport,
  BitwardenExport,
  CliConvert,
  Context,
} from '#/types'

const fs = memfs.fs.promises

const CONTEXT: Partial<Context> = {
  logger: {
    log: () => null,
    warn: () => null,
    error: () => null,
  },
  input: () => '',
}

// For report.exit
spyOn(process, 'exit').mockImplementation(() => {
  while (true) {}
})

export async function runTest(
  items: Item[],
  rawOptions: RunConvertOptions = {},
) {
  const options = {
    outputRemaining: '/remaining.json',
    ...rawOptions,
  }
  const input = createBitwarden(items)
  const { output, remaining, remainingPath, inputFileData, context } =
    await runTestConvert(input, options)
  const outputExpected = createApplePasswords(items)
  let remainingExpected: BitwardenExport.Root | undefined
  if (options.outputRemaining) {
    remainingExpected = createBitwarden(
      items.map((item) => (item?.__output__ === false ? item : null)),
    )
  }
  return {
    output,
    remaining,
    remainingPath,
    inputFileData,
    context,
    input,
    outputExpected,
    remainingExpected,
  }
}

export async function runTestConvert(
  input: BitwardenExport.Root,
  rawOptions: RunConvertOptions = {},
) {
  const { password, ...restOptions } = rawOptions
  const options = {
    outputRemaining: '/remaining.json',
    ...restOptions,
  }
  const context: Context = {
    ...CONTEXT,
    report: createReport(),
    input: () => password || '',
  }
  await fs.writeFile('/input.json', JSON.stringify(input))
  await runConvertCommand({
    args: ['bitwarden-to-apple', '/input.json', '/output.csv'],
    options,
    context,
  })
  const outputText = (await fs.readFile('/output.csv', 'utf8')) as string
  const output = Papa.parse(outputText, { header: true })
    .data as ApplePasswordsExport.Root
  let remaining: BitwardenExport.Root | undefined
  const remainingPath =
    options.outputRemaining === 'overwrite-input-file'
      ? '/input.json'
      : options.outputRemaining
  if (remainingPath) {
    const remainingText = (await fs.readFile(remainingPath, 'utf8')) as string
    remaining = JSON.parse(remainingText) as BitwardenExport.Root
  }
  const inputFileData = JSON.parse(
    (await fs.readFile('/input.json', 'utf8')) as string,
  )
  return { output, remaining, remainingPath, inputFileData, context }
}

interface RunConvertOptions extends Partial<CliConvert.Options> {
  password?: string
}

function createReport() {
  const state = {
    ...initialReport,
  }
  const setState = <T>(stateFn: (value: T) => void) => {
    const prevState = { ...state }
    const nextState = stateFn(prevState)
    Object.assign(state, nextState)
  }
  return new Report(state, setState)
}
