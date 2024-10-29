import chalk from 'chalk'
import { AppError } from '#/errors'
import type { Data, Key, SetReportData } from './types/TReport'

export const initialReport: Data = {
  outputPath: '',
  outputRemainingPath: undefined,
  itOutputRemainingFileEncrypted: false,
  isInputFileOverwritten: false,
  processedCount: 0,
  remainingCount: 0,
  requireFixCount: 0,
  command: '',
}

export class Report {
  data: Data
  #setReportData: SetReportData

  constructor(data: Data, setReportData: SetReportData) {
    this.data = data
    this.#setReportData = setReportData
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  set(key: Key, value: any) {
    this.#setReportData((prev) => ({ ...prev, [key]: value }))
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  add(key: Key, value: any) {
    this.#setReportData((prev) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let nextValue: any
      const prevValue = prev[key]
      if (prevValue instanceof Set) {
        nextValue = prevValue.add(value)
      } else if (Array.isArray(prevValue)) {
        nextValue = [...prevValue, value]
      } else {
        throw new AppError(
          `[report.add] the value of the key '${key}' is not Set or Array`,
        )
      }
      return { ...prev, [key]: nextValue }
    })
  }

  async exit(arg?: string | Error) {
    if (arg instanceof AppError) {
      console.error(chalk.red(`Error: ${arg.message}`))
      process.exit(1)
    } else if (arg instanceof Error) {
      console.error(chalk.red(arg))
      process.exit(1)
    } else {
      console.log(arg)
      process.exit(0)
    }
  }

  #update(report: Partial<Data>) {
    this.#setReportData((prev) => ({ ...prev, ...report }))
  }
}

export function mdEscape(text: string) {
  return text.replaceAll('__', '\\_\\_')
}
