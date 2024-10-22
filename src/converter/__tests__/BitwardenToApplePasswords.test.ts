import { expect, it } from 'bun:test'
import { partition } from 'lodash-es'
import memfs from 'memfs'
import Papa from 'papaparse'
import { createApplePasswords, createBitwarden } from '#/__tests__/fixtures'
import type { ApplePasswordsExport, BitwardenExport, ConvertOptions, Fixtures } from '#/types'
import { bitwardenToApplePasswords } from '../BitwardenToApplePasswords'

const fs = memfs.fs.promises

it('convert all passwords', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, rest } = await runConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.applePasswords.data)
  expect(rest).toEqual(null)
})

it('convert selected passwords', async () => {
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
  const rest = restText ? (JSON.parse(restText) as BitwardenExport.Root) : null

  return { output, rest }
}
