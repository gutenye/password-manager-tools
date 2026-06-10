import React, { useRef } from 'react'
import type { Report } from '#/types'

export type Stats = {
  incProcessed: () => void
  incRemaining: () => void
  incRequiresFix: () => void
  incAfterImportCheck: () => void
  applyToReport: (report: Report) => void
}

export function useStats() {
  const processed = useRef(0)
  const remaining = useRef(0)
  const requiresFix = useRef(0)
  const afterImportCheck = useRef(0)

  const incProcessed = (): void => {
    processed.current++
  }

  const incRemaining = (): void => {
    remaining.current++
  }

  const incRequiresFix = (): void => {
    requiresFix.current++
  }

  const incAfterImportCheck = (): void => {
    afterImportCheck.current++
  }

  const applyToReport = (report: Report): void => {
    report.set('processedCount', processed.current)
    report.set('remainingCount', report.data.remainingCount + remaining.current)
    report.set('requireFixCount', requiresFix.current)
    report.set('afterImportedCheckCount', afterImportCheck.current)
  }

  return {
    incProcessed,
    incRemaining,
    incRequiresFix,
    incAfterImportCheck,
    applyToReport,
  }
}
