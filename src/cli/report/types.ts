export type Data = {
  done: boolean
  error?: Error
  outputPath: string
  outputRemainingPath?: string
  isInputFileOverwritten?: boolean
  processedCount: number
  remainingCount: number
  requireFixCount: number
}

export type Key = keyof Data

export type SetReportData = React.Dispatch<React.SetStateAction<Data>>
