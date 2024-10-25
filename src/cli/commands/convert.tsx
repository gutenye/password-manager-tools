import { Box, Text } from 'ink'
import { omit } from 'lodash-es'
import { argument } from 'pastel'
import React, { useState, useEffect } from 'react'
import zod from 'zod'
import { useInput } from '#/cli/hooks'
import { getConverter } from '#/converter'
import { AppError } from '#/errors'
import type { InputFn } from '#/types'

export const options = zod.object({
  includeUris: zod.string().optional().describe('Include domains (example: a.com,b.com)'),
})

export type ConvertOptions = {
  includeUris?: string[]
  input: InputFn
}

export type CLIConvertOptions = zod.infer<typeof options>

export const args = zod.tuple([
  zod
    .enum(['bitwarden-to-apple'])
    .describe(argument({ name: 'app1-to-app2', description: 'From one password manager to another' })),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod.string().describe(argument({ name: 'output', description: 'Output file' })),
])

type Props = {
  options: CLIConvertOptions
  args: zod.infer<typeof args>
}

export default function Convert({ options, args }: Props) {
  const [name, inputPath, outputPath] = args
  const [result, setResult] = useState<string | Error>('converting')
  const { input, inputElement } = useInput()

  useEffect(() => {
    ;(async () => {
      try {
        const newOptions: ConvertOptions = {
          ...omit(options, 'includeUris'),
          includeUris: options.includeUris?.split(','),
          input,
        }
        await getConverter(name)(inputPath, outputPath, newOptions)
        setResult(' ')
      } catch (error) {
        if (error instanceof AppError) {
          setResult(error)
          process.exit(1)
        }
        throw error
      }
    })()
  }, [options, inputPath, outputPath, name, input])

  return (
    <>
      {result instanceof Error ? <Text color="red">Error: {result.message}</Text> : <Text>{result || 'loading'}</Text>}
      {inputElement}
    </>
  )
}
