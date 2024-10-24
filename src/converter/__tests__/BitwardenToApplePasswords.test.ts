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

it('uris empty', async () => {})

it('uris a.com', async () => {})

it('convert selected passwords', async () => {
  const { output, rest, outputExpected, restExpected } = await runTest({
    inputItems: [
      {
        uris: ['https://1.a.com'],
      },
      {
        uris: ['https://c.com'],
      },
    ],
    options: {
      includeUris: ['a.com'],
    },
    outputItems: [
      {
        uris: ['https://1.a.com'],
      },
    ],
    restItems: [
      undefined, // preserve index
      {
        uris: ['https://c.com'],
      },
    ],
  })
  expect(output).toEqual(outputExpected)
  expect(rest).toEqual(restExpected)
})

async function runTest({ inputItems, options, outputItems, restItems }) {
  const input = createBitwarden(inputItems)
  const { output, rest } = await runConvert(input, options)
  const outputExpected = createApplePasswords(outputItems)
  const restExpected = createBitwarden(restItems)
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
