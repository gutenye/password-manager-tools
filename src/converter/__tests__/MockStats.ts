export default class MockStats {
  processed = 0
  requiresFix = 0
  remaining = 0
  afterImportCheck = 0
  incProcessed = () => this.processed++
  incRequiresFix = () => this.requiresFix++
  incRemaining = () => this.remaining++
  incAfterImportCheck = () => this.afterImportCheck++
  applyToReport = (report) => {
    report.set('processedCount', this.processed)
    report.set('remainingCount', report.data.remainingCount + this.remaining)
    report.set('requireFixCount', this.requiresFix)
    report.set('afterImportedCheckCount', this.afterImportCheck)
  }
}
