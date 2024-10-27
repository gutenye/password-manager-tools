import { describe, expect, it, spyOn } from 'bun:test'
import { runTest, runTestConvert } from './runTests'

it('encrypted: false', async () => {
  const { fixtures } = globalThis.__TEST__
  const { output, remaining } = await runTestConvert(fixtures.bitwarden.data)
  expect(output).toEqual(fixtures.bitwardenToApplePasswords.data)
  expect(remaining).toEqual({ ...fixtures.bitwarden.data, items: [] })
})

it('encrypted: true', async () => {
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

it('encrypted: wrong password', async () => {
  const { fixtures } = globalThis.__TEST__
  await expect(
    runTestConvert(fixtures.bitwardenEncrypted.data, {
      password: 'incorrect',
    }),
  ).rejects.toThrow('Incorrect password')
})

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
          includeUris: ['a.com', 'b.com', 'z.com'],
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
          includeNames: ['1', '2', '9'],
        },
      )
    expect(output).toEqual(outputExpected)
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('outputRemaining: overwrite-input-file', async () => {
    const {
      output,
      remaining,
      outputExpected,
      remainingExpected,
      outputRemainingPath,
    } = await runTest(
      [
        {
          uris: [{ uri: 'a.com' }],
        },
      ],
      { outputRemaining: 'overwrite-input-file' },
    )
    expect(output).toEqual(outputExpected)
    expect(outputRemainingPath).toEqual('/input.json')
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('outputRemaining: /remaining.json', async () => {
    const {
      output,
      remaining,
      outputExpected,
      remainingExpected,
      outputRemainingPath,
    } = await runTest(
      [
        {
          uris: [{ uri: 'a.com' }],
        },
      ],
      { outputRemaining: '/remaining.json' },
    )
    expect(output).toEqual(outputExpected)
    expect(outputRemainingPath).toEqual('/remaining.json')
    expect<typeof remaining>(remaining).toEqual(remainingExpected)
  })

  it('outputRemaining: undefined', async () => {
    const {
      output,
      remaining,
      outputExpected,
      outputRemainingPath,
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
    expect(outputRemainingPath).toBeUndefined()
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

it('uris: empty', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([{}])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})

it('uris: needsFix with vaild uri', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        uris: [{ uri: 'a.com' }, { uri: 'b.com', __output__: false }],
        __output__: {
          notes: '[URIS]\nDefault = a.com\nDefault = b.com',
          title: 'name1 FIXWEBSITE',
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})

it('uris: needsFix with invalid uri', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        uris: [{ uri: 'a.com' }, { uri: 'http-invalid', __output__: false }],
        __output__: {
          notes: '[URIS]\nDefault = a.com\nDefault = http-invalid',
          title: 'name1',
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
          title: 'name1',
          notes: '[URIS]\nDefault = http-invalid',
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
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
  } = await runTest([{ uris: [{ uri: 'a.com' }] }])
  expect(report.data).toEqual({
    done: true,
    error: undefined,
    outputPath: '/output.csv',
    outputRemainingPath: '/remaining.json',
    itOutputRemainingFileEncrypted: false,
    isInputFileOverwritten: false,
    processedCount: 1,
    remainingCount: 0,
    requireFixCount: 0,
  })
})

it('empty newlines', async () => {
  const { output, remaining, outputExpected, remainingExpected } =
    await runTest([
      {
        uris: [{ uri: 'a.com' }, { uri: 'b.com', __output__: false }],
        fields: [{}],
        notes: 'a\nb\n  \n\n',
        passwordHistory: [{}],
        __output__: {
          title: 'name1 FIXWEBSITE',
          notes: `
[FIELDS]
name = value

[NOTES]
a
b

[PASSWORD_HISTORY]
2001-01-01T01:00:00.000Z = password

[URIS]
Default = a.com
Default = b.com
`.trim(),
        },
      },
    ])
  expect(output).toEqual(outputExpected)
  expect<typeof remaining>(remaining).toEqual(remainingExpected)
})
