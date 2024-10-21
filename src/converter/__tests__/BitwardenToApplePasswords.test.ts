import { afterEach, beforeAll, expect, it, mock } from 'bun:test'
import memfs from 'memfs'
import { createBitwarden, getFixtures } from '#/__tests__/fixtures'
import type { Fixtures } from '#/__tests__/fixtures'
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
  const output = await convert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.applePasswords.text)
})

it('convert selected passwords', async () => {
  const output = await convert(createBitwarden({}), { includeUris: ['https://a.com'] })
  expect(output).toEqual('a')
})

async function convert(input: any, options = {}) {
  await fs.writeFile('/input.json', JSON.stringify(input))
  await bitwardenToApplePasswords('/input.json', '/output.csv', options)
  const output = await fs.readFile('/output.csv', 'utf8')
  return output
}
