import { Text } from 'ink'
import type React from 'react'
import { useMemo, useState } from 'react'

export function useReport() {
  const [reportData, setReportData] = useState<ReportData>(initialReport)

  const report = useMemo(
    () => new Report(reportData, setReportData),
    [reportData],
  )

  const reportElement = useMemo(
    () => <ReportComponent reportData={reportData} />,
    [reportData],
  )

  return {
    report,
    reportElement,
  }
}

const ReportComponent = ({ reportData }: Props) => {
  if (!reportData.done) {
    return <Text>Processing...</Text>
  }
  if (reportData.error) {
    return <Text color="red">Error: {reportData.error.message}</Text>
  }
  const {
    processedCount,
    outputPath,
    overwritePath,
    itemsHasMultipleDomains,
    skipedItemTypes,
  } = reportData
  return (
    <>
      <Text>Processed items: {processedCount}</Text>
      {skipedItemTypes.size > 0 && (
        <Text>Skiped item types: {Array.from(skipedItemTypes).join(', ')}</Text>
      )}
      {itemsHasMultipleDomains.length > 0 && (
        <Text>
          Items has multiple domains require manual fixing:{' '}
          {itemsHasMultipleDomains.join(', ')}
        </Text>
      )}
      {overwritePath && (
        <Text>The rest items are overwrite '{overwritePath}'</Text>
      )}
      <Text>Output: {outputPath}</Text>
    </>
  )
}

export class Report {
  data: ReportData
  #setReportData: SetReportData

  constructor(data: ReportData, setReportData: SetReportData) {
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

  #update(report: Partial<ReportData>) {
    this.#setReportData((prev) => ({ ...prev, ...report }))
  }
}

const initialReport: ReportData = {
  processedCount: 0,
  done: false,
  error: undefined,
  outputPath: '',
  overwritePath: undefined,
  itemsHasMultipleDomains: [],
  skipedItemTypes: new Set(),
}

type ReportData = {
  processedCount: number
  done: boolean
  error?: Error
  outputPath: string
  overwritePath?: string
  itemsHasMultipleDomains: string[]
  skipedItemTypes: Set<string>
}

type Key = keyof ReportData

type Props = {
  reportData: ReportData
}

type SetReportData = React.Dispatch<React.SetStateAction<ReportData>>
