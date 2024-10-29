import { useEffect } from 'react'
import { useInput, useLogger, useReport } from '#/cli/hooks'
import { AppError } from '#/errors'
import type { Context } from '#/types'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useBaseCommand(props: any) {
  const { input, inputElement } = useInput()
  const { logger, loggerElement } = useLogger()
  const { report, reportElement } = useReport()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const context: Context = {
      input,
      logger,
      report,
    }
    ;(async () => {
      await runAndCatchError({ ...props, context })
    })()
  }, [])

  return { inputElement, loggerElement, reportElement }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function runAndCatchError({ runCommand, ...rest }: any) {
  const { report } = rest.context
  try {
    report.set('command', rest.name)
    await runCommand(rest)
  } catch (error) {
    if (error instanceof AppError) {
      report.exit(error)
    }
    throw error
  }
}
