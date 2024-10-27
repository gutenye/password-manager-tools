import type { Data, Key, SetReportData } from './types'

export const initialReport: Data = {
  done: false,
  error: undefined,
  outputPath: '',
  outputRemainingPath: undefined,
  itOutputRemainingFileEncrypted: false,
  isInputFileOverwritten: false,
  processedCount: 0,
  remainingCount: 0,
  requireFixCount: 0,
}

export class Report {
  data: Data
  #setReportData: SetReportData

  constructor(data: Data, setReportData: SetReportData) {
    this.data = data
    this.#setReportData = setReportData
  }

  set(key: Key, value: any) {
    this.#setReportData((prev) => ({ ...prev, [key]: value }))
  }

  add(key: Key, value: any) {
    this.#setReportData((prev) => {
      let nextValue: any
      const prevValue = prev[key]
      if (prevValue instanceof Set) {
        nextValue = prevValue.add(value)
      } else if (Array.isArray(prevValue)) {
        nextValue = [...prevValue, value]
      } else {
        throw new Error(
          `[report.add] the value of the key '${key}' is not Set or Array`,
        )
      }
      return { ...prev, [key]: nextValue }
    })
  }

  done() {
    this.set('done', true)
  }

  exit(error: Error) {
    this.#update({ done: true, error })
    process.exit(1)
  }

  #update(report: Partial<Data>) {
    this.#setReportData((prev) => ({ ...prev, ...report }))
  }
}

export function mdEscape(text: string) {
  return text.replaceAll('__', '\\_\\_')
}
