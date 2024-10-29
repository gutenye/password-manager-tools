export type * from '#/cli/hooks/useInput'
export type * from '#/cli/hooks/useLogger'
export type * from '#/cli/report/types'

import type * as CliConvert from '#/cli/ConvertCommand/types'
export type { CliConvert }

import type { Input } from '#/cli/hooks/useInput'
import type { Logger } from '#/cli/hooks/useLogger'
import type { Report } from '#/cli/report/types'

export type Context = {
  logger: Logger
  input: Input
  report: Report
}
