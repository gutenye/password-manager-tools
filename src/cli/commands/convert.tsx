import { Text } from 'ink'
import { argument } from 'pastel'
import React, { useState, useEffect } from 'react'
import zod from 'zod'
import { getConverter } from '#/converter'

export const options = zod.object({
  name: zod.string().describe('Describe1').default('default1'),
})

export const args = zod.tuple([
  zod
    .enum(['bitwarden-to-apple'])
    .describe(argument({ name: 'app1-to-app2', description: 'From one password manager to another' })),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod.string().describe(argument({ name: 'output', description: 'Output file' })),
])

type Props = {
  options: zod.infer<typeof options>
  args: zod.infer<typeof args>
}

export default function Convert({ options, args }: Props) {
  const [name, input, output] = args
  const [result, setResult] = useState('')

  useEffect(() => {
    ;(async () => {
      await getConverter(name)(input, output)
      setResult(`\noutput '${output}'`)
    })()
  }, [input, output, name])

  return <Text>{result || 'converting'}</Text>
}
