export type Data = {
  result?: true | string | Error // true is success, string | Error is error
  isInputFileOverwritten: boolean
  outputPath: string
  remainingCount: number
  remainingPath?: string
  isRemainingFileEncrypted: boolean
  afterImportedCheckPath?: string
  afterImportedCheckCount: number
  processedCount: number
  requireFixCount: number
  command: string
}

export type Key = keyof Data

export type SetReportData = React.Dispatch<React.SetStateAction<Data>>
