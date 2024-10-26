import { Box, Text } from 'ink'
import type React from 'react'
import { useMemo, useState } from 'react'

const { default: Markdown } = await import('ink-markdown')

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
      {skipedItemTypes.size > 0 && (
        <Text>
          Items with type '{Array.from(skipedItemTypes).join(', ')}' are skipped
        </Text>
      )}
      {itemsHasMultipleDomains.length > 0 && (
        <Text>
          Items has multiple domains require manual fixing:{' '}
          {itemsHasMultipleDomains.join(', ')}
        </Text>
      )}
      <Text>Processed {processedCount} items </Text>
      {overwritePath && (
        <Text>The rest items are overwriten in '{overwritePath}'</Text>
      )}
      <Text>Exported passwords are saved in '{outputPath}'</Text>

      <Markdown>
        {`
# 📋 Final Report 📋

## 1. ✅ Successfully Processed Items

n items have been exported without issues. Saved in output.csv. Open Apple Passwords app, File - Import password

## 2. 🚫 Skipped Items

The following item types were skipped because they are not supported: Secure Note, Card, Identity, Please consider handling these items manually if needed.

## 3. ⚠️ Items Requiring Manual Fixes

n items have multiple domains and require your attention:

1. **Open** the **Passwords** app.
2. **Find** items ends with 'FIXDOMAIN'
3. **Add** the corresponding website information  from the notes field.

## 4. 🚫 Skipped Items

The remaining items have been overwritten in 'input.csv', password encrypted **yes/no** can be used next for incremential export

**Note:** Press keep this file secure and password protected**

## 5. ✅ Exported Passwords

passwords have been successfully exported to src/__tests__/fixtures/output.csv

**Note:** Are it's used, please remove this file for saftely**

# 📊 Summary 📊

- ⚠️️ Items Requiring Manual Fixes: n
- 🚫 Skipped Items: n logins, n secure notes/cards/identities
- 🚫 Skipped Items Overwritten In: path
- ✅ Exported Items: n 
- ✅ Exported Items Saved In: path 

Thank you for using our CLI app! Please [start the project](link) on the github if you like. If you have any questions, please refer to the documentation or report an issue on the github.
`.trim()}
      </Markdown>
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
