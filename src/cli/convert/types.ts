import type zod from 'zod'
import type { args, options } from './options'
import type { CLI_INCLUDE_TYPES } from './options'

export type Props = {
  options: zod.infer<typeof options>
  args: zod.infer<typeof args>
}

export type ProcessedOptions = {
  includeUris?: string[]
  includeFirst?: number
  includeNames?: string[]
  includeTypes?: IncludeType[]
  outputRemaining?: string
}

export type IncludeType = (typeof CLI_INCLUDE_TYPES)[number]
