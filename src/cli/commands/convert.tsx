import { Text } from 'ink'
import { omit } from 'lodash-es'
import { argument } from 'pastel'
import React, { useState, useEffect } from 'react'
import zod from 'zod'
import { getConverter } from '#/converter'

export const options = zod.object({
  includeUris: zod.string().describe('Include domains (example: a.com,b.com)'),
})

export const args = zod.tuple([
  zod
    .enum(['bitwarden-to-apple'])
    .describe(argument({ name: 'app1-to-app2', description: 'From one password manager to another' })),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod.string().describe(argument({ name: 'output', description: 'Output file' })),
])

export type ConvertOptions = zod.infer<typeof options>

type Props = {
  options: ConvertOptions
  args: zod.infer<typeof args>
}

export default function Convert({ options, args }: Props) {
  const [name, input, output] = args
  const [result, setResult] = useState('converting')

  useEffect(() => {
    ;(async () => {
      const newOptions = {
        ...omit(options, 'includeUris'),
        includeUris: options.includeUris?.split(',') ?? [],
      }
      await getConverter(name)(input, output, newOptions)
      setResult('')
    })()
  }, [options, input, output, name])

  return <Text>{result}</Text>
}
