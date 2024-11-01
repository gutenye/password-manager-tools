import { expect, it, mock } from 'bun:test'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import { initialReport } from '#/cli/report'
import type { TReport } from '#/types'

mock.module('ink-markdown', () => ({ default: () => <Text>markdown</Text> }))

it('command: convert, result: undefined', async () => {
  const text = await runTest({ result: undefined, command: 'convert' })
  expect(text).toEqual('')
})

it('command: convert, result: string', async () => {
  const text = await runTest({ result: 'success', command: 'convert' })
  expect(text).toEqual('')
})

it.only('command: convert, result: true', async () => {
  const text = await runTest({ result: true, command: 'convert' })
  expect(text).toEqual('markdown')
})

it('command: other, result: true', async () => {
  const text = await runTest({ result: true, command: 'other' })
  expect(text).toEqual('')
})

async function runTest(reportData: Partial<TReport.Data>) {
  const { ReportComponent } = await import('../ReportComponent')
  const newReportData = { ...initialReport, ...reportData }
  const { lastFrame } = render(<ReportComponent reportData={newReportData} />)
  return lastFrame()
}
