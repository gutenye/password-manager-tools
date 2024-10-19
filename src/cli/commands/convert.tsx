import { Text } from 'ink'
import { argument } from 'pastel'
import React, { useState, useEffect } from 'react'
import zod from 'zod'
import { BitwardenToApplePasswords } from '#/converter'

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
  const [type, input, output] = args
  const [result, setResult] = useState('')

  useEffect(() => {
    ;(async () => {
      switch (type) {
        case 'bitwarden-to-apple': {
          await new BitwardenToApplePasswords().convert(input, output)
          setResult(`\noutput '${output}'`)
          break
        }
        default:
          throw new Error(`app1-to-app2 '${type}' is not supported`)
      }
    })()
  }, [setResult])

  return <Text>{result || 'converting'}</Text>
}
