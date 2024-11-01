import chalk from 'chalk'
import { createMarkdown } from '#/cli/report'
import type { TReport } from '#/types'

const inkMarkdown = await import('ink-markdown')

export const ReportComponent = ({ reportData }: Props) => {
  const Markdown = inkMarkdown.default
  const { command, result } = reportData
  if (result === true && command === 'convert') {
    return (
      <Markdown strong={chalk.red.bold}>{createMarkdown(reportData)}</Markdown>
    )
  }
  // result is exit error or exit message, log is handled in Report#exit
  return null
}

type Props = {
  reportData: TReport.Data
}
