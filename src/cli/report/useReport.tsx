import { useRef } from 'react'
import { useMemo, useState } from 'react'
import { Report, initialReport } from '#/cli/report'
import type { TReport } from '#/types'
import { ReportComponent } from './ReportComponent'

export function useReport() {
  const [reportData, setReportData] = useState<TReport.Data>(initialReport)
  const report = useRef(new Report(reportData, setReportData))
  report.current.data = reportData

  const reportElement = useMemo(
    () => <ReportComponent reportData={reportData} />,
    [reportData],
  )

  return {
    report: report.current,
    reportElement,
  }
}
