import { expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { initialReport } from '#/cli/report'
import type { TReport } from '#/types'
import { ReportComponent } from '../ReportComponent'

it('command: convert, result: undefined', () => {
  expect(runTest({ result: undefined, command: 'convert' })).toEqual('')
})

it('command: convert, result: string', () => {
  expect(runTest({ result: 'success', command: 'convert' })).toEqual('')
})

it('command: convert, result: true', () => {
  expect(runTest({ result: true, command: 'convert' })).toContain(
    'Final Report',
  )
})

it('command: other, result: true', () => {
  expect(runTest({ result: true, command: 'other' })).toEqual('')
})

function runTest(reportData: Partial<TReport.Data>) {
  const newReportData = { ...initialReport, ...reportData }
  const { lastFrame } = render(<ReportComponent reportData={newReportData} />)
  return lastFrame()
}
