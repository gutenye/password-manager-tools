import { describe, expect, it } from 'bun:test'
import { BITWARDEN } from '#/bitwarden'
import { runTest, runTestConvert } from './runTests'

it('file: encrypted false', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, remaining } = await runTestConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.bitwardenToApplePasswords.data)
  expect(remaining).toEqual({ ...fixtures.bitwarden.data, items: [] })
})

it('file: encrypted true', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, remaining } = await runTestConvert(
    fixtures.bitwardenEncrypted.data,
    {
      password: '1',
    },
  )
  expect(output).toEqual(fixtures.bitwardenEncryptedToApplePasswords.data)
  expect(remaining).toEqual({
    data: expect.any(String),
    encKeyValidation_DO_NOT_EDIT: '',
    encrypted: true,
    kdfIterations: 600000,
    kdfType: 0,
    passwordProtected: true,
    salt: expect.any(String),
  })
})

it('file: encrypted wrong password', async () => {
  const { fixtures } = globalThis.__TEST__
  await expect(
    runTestConvert(fixtures.bitwardenEncrypted.data, {
      password: 'incorrect',
    }),
  ).rejects.toThrow('Incorrect password')
})

it('all: null case', () => {})

describe('options', () => {
  it('includeUris: a.com,b.com', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest(
        [
          {
            uris: [{ uri: 'https://1.a.com' }],
          },
          {
            uris: [{ uri: 'https://b.com' }],
          },
          {
            uris: [{ uri: 'https://c.com' }],
            __output__: false,
          },
        ],
        {
          includeUris: 'a.com,b.com,z.com',
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('includeFirst: 1', async () => {
    const { output, outputExpected, remaining, remainingExpected } =
      await runTest(
        [
          {
            uris: [{ uri: 'a.com' }],
          },
          {
            uris: [{ uri: 'b.com' }],
            __output__: false,
          },
        ],
        {
          includeFirst: 1,
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('incldueNames: a,b', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest(
        [
          {
            name: 'name1',
          },
          {
            name: 'name2',
          },
          {
            name: 'name3',
            __output__: false,
          },
        ],
        {
          includeNames: '1,2,9',
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('includeTypes: login,note', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest(
        [
          {
            type: BITWARDEN.ItemType.Login,
            __output__: false,
          },
          {
            type: BITWARDEN.ItemType.SecureNote,
            __output__: {
              name: 'name2 (SecureNote)',
            },
          },
          {
            type: BITWARDEN.ItemType.Card,
            __output__: {
              name: 'name3 (Card)',
            },
          },
          {
            type: BITWARDEN.ItemType.Identity,
            __output__: {
              name: 'name4 (Identity)',
            },
          },
        ],
        {
          includeTypes: 'note,card,identity',
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('skipFields: a,b', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest(
        [
          {
            fields: [{ name: 'name1' }, { name: 'name2' }, { name: null }],
            __output__: {
              notes: '[FIELDS]\nname1 = value1\nEMPTY = value3',
            },
          },
        ],
        {
          skipFields: '2,9',
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('skipFields: and includeXX', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest(
        [
          {
            name: 'name1',
            fields: [{ name: 'name1' }, { name: 'name2' }],
            __output__: {
              notes: '[FIELDS]\nname2 = value2',
            },
          },
          {
            name: 'name2',
            fields: [{ name: 'name1' }, { name: 'name2' }],
            __output__: false,
          },
        ],
        {
          skipFields: '1',
          includeNames: 'name1',
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
    // skipFields should not apply to remaining items
    expect(remaining?.items[0].fields).toEqual([
      {
        name: 'name1',
        value: 'value1',
        type: 0,
      },
      {
        name: 'name2',
        value: 'value2',
        type: 0,
      },
    ])
  })

  it('outputRemaining: overwrite-input-file', async () => {
    const {
      output,
      remaining,
      outputExpected,
      remainingExpected,
      remainingPath,
    } = await runTest(
      [
        {
          uris: [{ uri: 'a.com' }],
        },
      ],
      { outputRemaining: 'overwrite-input-file' },
    )
    expect(output).toEqual(outputExpected)
    expect(remainingPath).toEqual('/input.json')
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('outputRemaining: /remaining.json', async () => {
    const {
      output,
      remaining,
      outputExpected,
      remainingExpected,
      remainingPath,
    } = await runTest(
      [
        {
          uris: [{ uri: 'a.com' }],
        },
      ],
      { outputRemaining: '/remaining.json' },
    )
    expect(output).toEqual(outputExpected)
    expect(remainingPath).toEqual('/remaining.json')
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('outputRemaining: undefined', async () => {
    const {
      output,
      remaining,
      outputExpected,
      remainingPath,
      input,
      inputFileData,
    } = await runTest(
      [
        {
          uris: [{ uri: 'a.com' }],
        },
      ],
      { outputRemaining: undefined },
    )
    expect(output).toEqual(outputExpected)
    expect(remainingPath).toBeUndefined()
    expect(remaining).toBeUndefined()
    expect(inputFileData).toEqual(input)
  })
})

it('items: empty', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})

describe('uri', () => {
  it('uri: works', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([
        {
          uris: [
            {
              uri: 'example',
              match: BITWARDEN.URI_MATCH.Default,
              __output__: false,
            },
            {
              uri: '2.example.com',
              match: BITWARDEN.URI_MATCH.Default,
            },
            {
              uri: 'https://3.example.com',
              match: BITWARDEN.URI_MATCH.Default,
            },
            {
              uri: 'app://4.example.com',
              match: BITWARDEN.URI_MATCH.Default,
              __output__: false,
            },
            {
              uri: 'domain.example.com',
              match: BITWARDEN.URI_MATCH.BaseDomain,
            },
            {
              uri: 'host.example.com',
              match: BITWARDEN.URI_MATCH.Host,
            },
            {
              uri: 'exact.example.com',
              match: BITWARDEN.URI_MATCH.Exact,
            },
            {
              uri: 'starts.example.com',
              match: BITWARDEN.URI_MATCH.StartsWith,
              __output__: false,
            },
            {
              uri: 'regular.example.com',
              match: BITWARDEN.URI_MATCH.RegularExpression,
              __output__: false,
            },
            {
              uri: 'never.example.com',
              match: BITWARDEN.URI_MATCH.Never,
              __output__: false,
            },
          ],
          __output__: {
            notes:
              '[URIS]\nDefault = example\nDefault = 2.example.com\nDefault = https://3.example.com\nDefault = app://4.example.com\nBaseDomain = domain.example.com\nHost = host.example.com\nExact = exact.example.com\nStartsWith = starts.example.com\nRegularExpression = regular.example.com\nNever = never.example.com',
          },
        },
      ])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('uri: empty', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([{}])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('uri: needsFix with vaild uri', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([
        {
          uris: [{ uri: 'a.com' }, { uri: 'b.com', __output__: false }],
          __output__: {
            notes: '[URIS]\nDefault = a.com\nDefault = b.com',
            name: 'name1 FIXWEBSITE',
          },
        },
      ])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('uri: needsFix with invalid uri', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([
        {
          uris: [{ uri: 'a.com' }, { uri: 'http-invalid', __output__: false }],
          __output__: {
            notes: '[URIS]\nDefault = a.com\nDefault = http-invalid',
            name: 'name1',
          },
        },
      ])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('uri: a.com', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([
        {
          uris: [{ uri: 'a.com' }],
        },
      ])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('uri: invalid', async () => {
    const { output, remaining, outputExpected, remainingExpected } =
      await runTest([
        {
          uris: [{ uri: 'http-invalid' }],
          __output__: {
            name: 'name1',
            notes: '[URIS]\nDefault = http-invalid',
          },
        },
      ])
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })
})

it('escape: title, field', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        fields: [{ name: '=name', value: '=value' }],
        __output__: {
          notes: '[FIELDS]\n=name = =value',
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})

it('report: works', async () => {
  const {
    context: { report },
  } = await runTest([
    { uris: [{ uri: 'a.com' }] },
    { type: BITWARDEN.ItemType.SecureNote },
    { type: BITWARDEN.ItemType.Card },
    { type: BITWARDEN.ItemType.Identity },
  ])
  expect(report.data).toEqual({
    command: '',
    outputPath: '/output.csv',
    remainingPath: '/remaining.json',
    isRemainingFileEncrypted: false,
    isInputFileOverwritten: false,
    processedCount: 4,
    remainingCount: 0,
    requireFixCount: 0,
  })
})

it('empty newlines', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        uris: [
          { uri: 'example1.com' },
          { uri: 'example2.com', __output__: false },
        ],
        fields: [{}],
        notes: 'a\nb\n  \n\n',
        passwordHistory: [{}],
        __output__: {
          name: 'name1 FIXWEBSITE',
          notes: `
[FIELDS]
name1 = value1

[NOTES]
a
b

[PASSWORD_HISTORY]
2001-01-01T00:00:00.001Z = password1

[URIS]
Default = example1.com
Default = example2.com
`.trim(),
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})

it('field: empty name', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        fields: [{ name: null, value: null }, {}],
        __output__: {
          notes: '[FIELDS]\nEMPTY =\nname2 = value2',
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})
