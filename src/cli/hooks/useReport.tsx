import chalk from 'chalk'
import { Text } from 'ink'
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
    outputPath,
    overwritePath,
    processedCount,
    skippedCount,
    requireFixCount,
  } = reportData
  return (
    <>
      <Markdown strong={chalk.red.bold}>
        {`
# 📋 Final Report 📋

## 1.  ✅ Exported Passwords

\`${processedCount}\` items have been exported without issues. Saved in \`${outputPath}\`. Open \`Passwords\` app, use \`File - Import password\` to import them.

**Note:** After it's used, please remove this file for saftely**

## 2. ⚠️ Items Requiring Manual Fixes

\`${requireFixCount}\` items have multiple domains and require your attention:

1. \`Open\` the \`Passwords\` app.
2. \`Find\` items ends with \`FIXWEBSITE\`
3. \`Add\` the corresponding website information from the notes field.

## 3. 🚫 Skipped Items

\`${skippedCount}\` remaining items have been overwritten in \`${overwritePath}\`, password encrypted **yes/no**, can be used next for incremential export

**Note:** Press keep this file secure and password protected**

# 📊 Summary 📊

|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | ${processedCount}  |
| ✅ Exported Items Saved In      | ${markdownEscape(outputPath)}      |
| ⚠ Items Requiring Manual Fixes  | ${requireFixCount} |
| 🚫 Skipped Items                | ${skippedCount}    |
| 🚫 Skipped Items Overwritten In | ${markdownEscape(overwritePath || '')}   |


Thank you for using our CLI app! Please [star the project](https://github.com/gutenye/password-manager-tools) on the Github if you like it. If you have any questions, please refer to the documentation or report an issue on the github.
`}
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
  done: false,
  error: undefined,
  outputPath: '',
  overwritePath: undefined,
  processedCount: 0,
  skippedCount: 0,
  requireFixCount: 0,
}

type ReportData = {
  done: boolean
  error?: Error
  outputPath: string
  overwritePath?: string
  processedCount: number
  skippedCount: number
  requireFixCount: number
}

type Key = keyof ReportData

type Props = {
  reportData: ReportData
}

type SetReportData = React.Dispatch<React.SetStateAction<ReportData>>

function markdownEscape(text: string) {
  return text.replaceAll('__', '\\_\\_')
}
