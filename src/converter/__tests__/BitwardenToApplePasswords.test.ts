import { describe, expect, it } from 'bun:test'
import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { Item } from '#/__tests__/types'
import type { ApplePasswordsExport, BitwardenExport, ConvertOptions } from '#/types'

import { bitwardenToApplePasswords } from '../BitwardenToApplePasswords'

const fs = memfs.fs.promises

it('encrypted: false', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.bitwardenToApplePasswords.data)
  expect(rest).toEqual({ ...fixtures.bitwarden.data, items: [] })
})

it('encrypted: true', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwardenEncrypted.data, { input: () => '1' })
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

it('uri: a.com', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      uris: ['a.com'],
    },
  ])
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

it('uri: invalid', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([
    {
      uris: ['http-invalid'],
      __output__: {
        notes: '# URIS #\nDefault: http-invalid',
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
        uris: ['https://1.a.com'],
      },
      {
        uris: ['https://c.com'],
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

async function runTest(items: Item[], options: ConvertOptions = {}) {
  const input = createBitwarden(items)
  const { output, rest } = await runConvert(input, options)
  const outputExpected = createApplePasswords(items.filter((item) => item?.__output__ !== false))
  const restExpected = createBitwarden(items.map((item) => (item?.__output__ === false ? item : null)))
  return { output, rest, outputExpected, restExpected }
}

async function runConvert(input: any, options: ConvertOptions = {}) {
  await fs.writeFile('/input.json', JSON.stringify(input))
  await bitwardenToApplePasswords('/input.json', '/output.csv', options)

  const outputText = (await fs.readFile('/output.csv', 'utf8')) as string
  const output = Papa.parse(outputText, { header: true }).data as ApplePasswordsExport.Root

  const restText = (await fs.readFile('/input.json', 'utf8')) as string
  const rest = restText ? (JSON.parse(restText) as BitwardenExport.File) : null

  return { output, rest }
}
