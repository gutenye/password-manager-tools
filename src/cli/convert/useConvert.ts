import { useEffect } from 'react'
import { useInput, useLogger, useReport } from '#/cli/hooks'
import { runConvert } from '#/converter'
import type { Context, ConvertOptions } from '#/types'
import type { Props } from './types'

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
