import { afterEach, beforeAll, expect, it, mock } from 'bun:test'
import { partition } from 'lodash-es'
import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden, getFixtures } from '#/__tests__/fixtures'
import type { ApplePasswordsExport, BitwardenExport, ConvertOptions, Fixtures } from '#/types'
import { bitwardenToApplePasswords } from '../BitwardenToApplePasswords'

const fs = memfs.fs.promises
let fixtures: Fixtures

beforeAll(async () => {
  fixtures = await getFixtures()
  mock.module('node:fs/promises', () => ({ default: fs }))
})

afterEach(() => {
  memfs.vol.reset()
})

it('convert all passwords', async () => {
  const output = await runConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.applePasswords.text)
})

it.only('convert selected passwords', async () => {
  const data = {
    items: [
      {
        uris: ['https://1.a.com'],
      },
      {
        uris: ['https://c.com'],
      },
    ],
  }
  const options: ConvertOptions = {
    includeUris: ['a.com'],
  }
  const [outputItems, restItems] = partition(data.items, (item) =>
    item.uris.some((uri) => options.includeUris?.some((includeUri) => uri.includes(includeUri))),
  )
  const input = createBitwarden(data)
  const { output, rest } = await runConvert(input, options)
  const outputExpected = createApplePasswords({
    ...data,
    items: outputItems,
  })
  expect(output).toEqual(outputExpected)
  const restExpected = createBitwarden(data)
  restExpected.items = restExpected.items.filter((item) =>
    item.login.uris?.some((uriItem) => options.includeUris?.some((includeUri) => !uriItem.uri.includes(includeUri))),
  )
  expect(rest).toEqual(restExpected)
})

async function runConvert(input: any, options: ConvertOptions = {}) {
  await fs.writeFile('/input.json', JSON.stringify(input))
  await bitwardenToApplePasswords('/input.json', '/output.csv', options)

  const outputText = (await fs.readFile('/output.csv', 'utf8')) as string
  const output = Papa.parse(outputText, { header: true }).data as ApplePasswordsExport.Root

  const restText = (await fs.readFile('/input.json', 'utf8')) as string
  const rest = JSON.parse(restText) as BitwardenExport.Root

  return { output, rest }
}
