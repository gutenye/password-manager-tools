import type zod from 'zod'
import type { Context } from '#/types'
import type { args, options } from './options'
import type { CLI_INCLUDE_TYPES } from './options'

export type RunConvertCommandOptions = {
  options: Options
  args: Args
  context: Context
}

export type Options = zod.infer<typeof options>
type Args = zod.infer<typeof args>

export type ProcessedOptions = {
  includeUris?: string[]
  includeFirst?: number
  includeNames?: string[]
  includeTypes?: IncludeType[]
  skipFields?: string[]
  outputRemaining?: string
}

export type IncludeType = (typeof CLI_INCLUDE_TYPES)[number]
