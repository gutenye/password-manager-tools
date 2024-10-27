import { useEffect } from 'react'
import { useInput, useLogger, useReport } from '#/cli/hooks'
import { runConvert } from '#/converter'
import { AppError } from '#/errors'
import type { Context } from '#/types'
import { processOptions } from './options'
import type { Props } from './types'

export function useConvert({ args, options: rawOptions }: Props) {
  const [name, inputPath, outputPath] = args

  const { input, inputElement } = useInput()
  const { logger, loggerElement } = useLogger()
  const { report, reportElement } = useReport()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ;(async () => {
      try {
        const options = processOptions(rawOptions)
        const context: Context = {
          input,
          logger,
          report,
        }
        await runConvert(name, inputPath, outputPath, options, context)
      } catch (error) {
        if (error instanceof AppError) {
          report.exit(error)
        }
        throw error
      }
    })()
  }, [])

  return { inputElement, loggerElement, reportElement }
}
