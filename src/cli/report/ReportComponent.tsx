import chalk from 'chalk'
import { Text } from 'ink'
import { useEffect } from 'react'
import { createMarkdown } from '#/cli/report'
import type { TReport } from '#/types'

const { default: Markdown } = await import('ink-markdown')

export const ReportComponent = ({ reportData }: Props) => {
  const { command } = reportData
  if (command === 'convert') {
    return (
      <Markdown strong={chalk.red.bold}>{createMarkdown(reportData)}</Markdown>
    )
  }
  return null
}

type Props = {
  reportData: TReport.Data
}
