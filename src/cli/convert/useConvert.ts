import { useEffect } from 'react'
import { useInput, useLogger, useReport } from '#/cli/hooks'
import { getConverter } from '#/converter'
import { AppError } from '#/errors'
import type { Context, ConvertOptions } from '#/types'
import type { Props } from './types'

export function useConvert({ args, options }: Props) {
  const [name, inputPath, outputPath] = args
  const { input, inputElement } = useInput()
  const { logger, loggerElement } = useLogger()
  const { report, reportElement } = useReport()
  useRunConvert({
    options,
    name,
    input,
    logger,
    inputPath,
    outputPath,
    report,
  })
  return { inputElement, loggerElement, reportElement }
}

function useRunConvert({
  options,
  name,
  input,
  logger,
  inputPath,
  outputPath,
  report,
}: UseRunConvert) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ;(async () => {
      try {
        const newOptions: ConvertOptions = {
          ...options,
          includeUris: options.includeUris?.split(','),
        }
        const context: Context = {
          input,
          logger,
          report,
        }
        await getConverter(name)(inputPath, outputPath, newOptions, context)
        report.done()
      } catch (error) {
        if (error instanceof AppError) {
          report.exit(error)
        }
        throw error
      }
    })()
  }, [])
}

type UseRunConvert = {
  options: Props['options']
  name: string
  input: ReturnType<typeof useInput>['input']
  inputPath: string
  outputPath: string
  logger: ReturnType<typeof useLogger>['logger']
  report: ReturnType<typeof useReport>['report']
}
