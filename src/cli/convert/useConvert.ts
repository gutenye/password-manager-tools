import { useEffect } from 'react'
import { useInput, useLogger, useReport } from '#/cli/hooks'
import { runConvert } from '#/converter'
import type { Context, ConvertOptions } from '#/types'
import { CLI_INCLUDE_TYPES } from './options'
import type { IncludeType, Props } from './types'

export function useConvert({ args, options: rawOptions }: Props) {
  const [name, inputPath, outputPath] = args

  const { input, inputElement } = useInput()
  const { logger, loggerElement } = useLogger()
  const { report, reportElement } = useReport()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ;(async () => {
      const options: ConvertOptions = {
        ...rawOptions,
        includeUris: rawOptions.includeUris?.split(','),
        includeNames: rawOptions.includeNames?.split(','),
        includeTypes: parseIncludeTypes(rawOptions.includeTypes),
      }
      const context: Context = {
        input,
        logger,
        report,
      }
      await runConvert(name, inputPath, outputPath, options, context)
    })()
  }, [])

  return { inputElement, loggerElement, reportElement }
}

function parseIncludeTypes(includeTypes?: string) {
  if (!includeTypes) {
    return
  }
  const types = includeTypes.split(',')
  for (const type of types) {
    if (!CLI_INCLUDE_TYPES.includes(type as any)) {
      throw new Error(
        `--include-types '${type}' must be one of ${CLI_INCLUDE_TYPES.join(', ')}`,
      )
    }
  }
  return types as IncludeType[]
}
