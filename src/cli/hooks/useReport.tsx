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

      <Text />
      <Text bold>📋 Final Report 📋</Text>
      <Text />

      <Text />
      <Text bold>1. ✅ Successfully Processed Items</Text>
      <Text />
      <Text>
        n items have been exported without issues. Saved in output.csv. Open
        Apple Passwords app, File - Import password
      </Text>

      <Text />
      <Text bold>2. 🚫 Skipped Items</Text>
      <Text />
      <Text>
        The following item types were skipped because they are not supported: •
        Secure Note • Card • Identity Please consider handling these items
        manually if needed.
      </Text>

      <Text />
      <Text>3. ⚠️ Items Requiring Manual Fixes</Text>
      <Text />
      <Text>n items have multiple domains and require your attention:</Text>
      <Text />
      <Text bold>Guidance:</Text>
      <Text />
      <Box>
        <Text>1. </Text>
        <Text bold>Open</Text>
        <Text> the </Text>
        <Text bold>Apple Passwords</Text>
        <Text> app.</Text>
      </Box>
      <Box>
        <Text>2. </Text>
        <Text bold>Locate</Text>
        <Text> the following items.</Text>
      </Box>
      <Box>
        <Text>3. </Text>
        <Text bold>Add</Text>
        <Text> the corresponding </Text>
        <Text>website information</Text>
        <Text> from the notes field.</Text>
        <Text />
        <Text>item1, .. </Text>
      </Box>

      <Text />
      <Text bold>4. 📂 Remaining Items</Text>
      <Text />
      <Text>
        The remaining items have been overwritten in 'input.csv', can be used
        next for incremential export
      </Text>
      <Box>
        <Text bold>Note:</Text>
        <Text>Press keep this file secure and password protected</Text>
      </Box>

      <Text />
      <Text bold>5. 💾 Exported Passwords</Text>
      <Text />
      <Text>
        passwords have been successfully exported to
        src/__tests__/fixtures/output.csv
      </Text>
      <Box>
        <Text>Note:</Text>
        <Text>Are it's used, please remove this file for saftely</Text>
      </Box>

      <Text />
      <Text bold>📊 Summary 📊</Text>
      <Text />
      <Text>⚠️️ Items Requiring Manual Fixes: n</Text>
      <Text>🚫 Skipped Items: n logins, n secure notes/cards/identities</Text>
      <Text>🚫 Skipped Items Overwritten In: path </Text>
      <Text>✅ Exported Items: n </Text>
      <Text>✅ Exported Items Saved In: path </Text>
      <Text>
        {
          '\nThank you for using our CLI app! Please [start the project](link) on the github if you like. If you have any questions, please refer to the documentation or report an issue on the github.'
        }
      </Text>
      <Markdown>{`
# hello
			`}</Markdown>
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
