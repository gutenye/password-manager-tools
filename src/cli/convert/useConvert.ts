import { useEffect, useState } from 'react'
import { useInput, useLogger } from '#/cli/hooks'
import { getConverter } from '#/converter'
import { AppError } from '#/errors'
import type { Context, ConvertOptions } from '#/types'
import type { Props } from './types'

export function useConvert({ args, options }: Props) {
  const [name, inputPath, outputPath] = args
  const [result, setResult] = useState<ResultType>('converting')
  const { input, inputElement } = useInput()
  const { logger, loggerElement } = useLogger()
  useRunConvert({
    options,
    name,
    input,
    logger,
    inputPath,
    outputPath,
    setResult,
  })
  return { inputElement, result, loggerElement }
}

function useRunConvert({
  options,
  name,
  input,
  logger,
  inputPath,
  outputPath,
  setResult,
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
        }
        await getConverter(name)(inputPath, outputPath, newOptions, context)
        setResult(' ')
      } catch (error) {
        if (error instanceof AppError) {
          setResult(error)
          process.exit(1)
        }
        throw error
      }
    })()
  }, [])
}

type ResultType = string | Error

type UseRunConvert = {
  options: Props['options']
  name: string
  input: ReturnType<typeof useInput>['input']
  inputPath: string
  outputPath: string
  setResult: React.Dispatch<React.SetStateAction<ResultType>>
  logger: ReturnType<typeof useLogger>['logger']
}
