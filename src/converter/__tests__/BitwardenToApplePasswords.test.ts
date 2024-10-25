import { describe, expect, it } from 'bun:test'
import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { Item } from '#/__tests__/types'
import type { ApplePasswordsExport, BitwardenExport, ConvertOptions } from '#/types'

import { bitwardenToApplePasswords } from '../BitwardenToApplePasswords'

const fs = memfs.fs.promises

it.only('encrypted: false', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.applePasswords.data)
  expect(rest).toEqual({ ...fixtures.bitwarden.data, items: [] })
})

it('encrypted: true', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwarden.data, { password: '1' })
  expect(output).toEqual([])
  // expect(result).toEqual({})
})

it('items: empty', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest([])
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

it('option: includeUris', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest(
    [
      {
        uris: ['https://1.a.com'],
      },
      {
        uris: ['https://c.com'],
        output: false,
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
  const outputExpected = createApplePasswords(items.filter((item) => item?.output !== false))
  const restExpected = createBitwarden(items.map((item) => (item?.output === false ? item : null)))
  return { output, rest, outputExpected, restExpected }
}

async function runConvert(input: any, options: ConvertOptions = {}) {
  await fs.writeFile('/input.json', JSON.stringify(input))
  await bitwardenToApplePasswords('/input.json', '/output.csv', options)

  const outputText = (await fs.readFile('/output.csv', 'utf8')) as string
  const output = Papa.parse(outputText, { header: true }).data as ApplePasswordsExport.Root

  const restText = (await fs.readFile('/input.json', 'utf8')) as string
  const rest = restText ? (JSON.parse(restText) as BitwardenExport.Root) : null

  return { output, rest }
}
