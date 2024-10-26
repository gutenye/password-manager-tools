import { omit } from 'lodash-es'
import { useEffect, useState } from 'react'
import { useInput } from '#/cli/hooks'
import { getConverter } from '#/converter'
import { AppError } from '#/errors'
import type { ConvertOptions, InputFn } from '#/types'
import type { Props } from './types'

export function useConvert({ args, options }: Props) {
  const [name, inputPath, outputPath] = args
  const [result, setResult] = useState<ResultType>('converting')
  const { input, inputElement } = useInput()
  useRunConvert({ options, name, input, inputPath, outputPath, setResult })
  return { inputElement, result }
}

function useRunConvert({ options, name, input, inputPath, outputPath, setResult }: UseRunConvert) {
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
  }, [options, inputPath, outputPath, name, input, setResult])
}

type ResultType = string | Error

type UseRunConvert = {
  options: Props['options']
  name: string
  input: ReturnType<typeof useInput>['input']
  inputPath: string
  outputPath: string
  setResult: React.Dispatch<React.SetStateAction<ResultType>>
}
