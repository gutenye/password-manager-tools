import { expect, it } from 'bun:test'
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

it('encrypted: false', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.bitwardenToApplePasswords.data)
  expect(rest).toEqual({ ...fixtures.bitwarden.data, items: [] })
})

it('encrypted: true', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwardenEncrypted.data, {
    password: '1',
  })
  expect(output).toEqual(fixtures.bitwardenEncryptedToApplePasswords.data)
  expect(rest).toEqual({
    data: expect.any(String),
    encKeyValidation_DO_NOT_EDIT: '',
    encrypted: true,
    kdfIterations: 600000,
    kdfType: 0,
    passwordProtected: true,
    salt: expect.any(String),
  })
})

it('encrypted: wrong password', async () => {
  const { fixtures } = globalThis.__TEST__
  await expect(
    runConvert(fixtures.bitwardenEncrypted.data, {
      password: 'incorrect',
    }),
  ).rejects.toThrow('Incorrect password')
})

it('overwrite: false', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest(
    [
      {
        uris: [{ uri: 'a.com' }],
      },
    ],
    { overwrite: false },
  )
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('items: empty', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('uris: empty', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([{}])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('uris: hasMore', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      uris: [{ uri: 'a.com' }, { uri: 'b.com', __output__: false }],
      __output__: {
        notes: '[URIS]\nDefault = a.com\nDefault = b.com',
        title: 'name1 FIXWEBSITE',
      },
    },
  ])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('uri: a.com', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      uris: [{ uri: 'a.com' }],
    },
  ])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('uri: invalid', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      uris: [{ uri: 'http-invalid' }],
      __output__: {
        title: 'name1 FIXWEBSITE',
        notes: '[URIS]\nDefault = http-invalid',
      },
    },
  ])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('option: includeUris', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest(
    [
      {
        uris: [{ uri: 'https://1.a.com' }],
      },
      {
        uris: [{ uri: 'https://c.com' }],
        __output__: false,
      },
    ],
    {
      includeUris: ['a.com'],
    },
  )
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('escape: title, field', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      fields: [{ name: '=name', value: '=value' }],
      __output__: {
        notes: '[FIELDS]\n=name = =value',
      },
    },
  ])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

async function runTest(items: Item[], rawOptions: RunConvertOptions = {}) {
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

async function runConvert(input: any, rawOptions: RunConvertOptions = {}) {
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
