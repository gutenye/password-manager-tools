import { expect, it } from 'bun:test'
import { runConvert, runTest } from './runTests'

it.only('encrypted: false', async () => {
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
