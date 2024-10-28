import chalk from 'chalk'
import { Text } from 'ink'
import { useRef } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Report, createMarkdown, initialReport } from '#/cli/report'
import type { TReport } from '#/types'

const { default: Markdown } = await import('ink-markdown')

export function useReport() {
  const [reportData, setReportData] = useState<TReport.Data>(initialReport)
  const report = useRef(new Report(reportData, setReportData))
  report.current.data = reportData

  const reportElement = useMemo(
    () => <ReportComponent reportData={reportData} />,
    [reportData],
  )

  useEffect(() => {
    if (reportData.error) {
      process.exit(1)
    }
  }, [reportData])

  return {
    report: report.current,
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
  return (
    <>
      <Markdown strong={chalk.red.bold}>{createMarkdown(reportData)}</Markdown>
    </>
  )
}

type Props = {
  reportData: TReport.Data
}
