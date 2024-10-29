import chalk from 'chalk'
import { AppError } from '#/errors'
import type { Data, Key, SetReportData } from './types/TReport'

export const initialReport: Data = {
  outputPath: '',
  command: '',
  isRemainingFileEncrypted: false,
  isInputFileOverwritten: false,
  processedCount: 0,
  remainingCount: 0,
  afterImportedCheckCount: 0,
  requireFixCount: 0,
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
    if (typeof arg === 'string' && arg.length === 0) {
      throw new AppError('[Report#exit] is called with an empty string')
    }
    this.set('result', arg)
    if (arg instanceof AppError) {
      const message =
        arg instanceof AppError ? chalk.red(`Error: ${arg.message}`) : arg
      console.error(message)
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
