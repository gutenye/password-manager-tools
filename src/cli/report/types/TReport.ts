export type Data = {
  outputPath: string
  outputRemainingPath?: string
  itOutputRemainingFileEncrypted: boolean
  isInputFileOverwritten: boolean
  processedCount: number
  remainingCount: number
  requireFixCount: number
  command: string
}

export type Key = keyof Data

export type SetReportData = React.Dispatch<React.SetStateAction<Data>>
