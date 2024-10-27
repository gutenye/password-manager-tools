import type zod from 'zod'
import type { args, options } from './options'

export type Props = {
  options: CLIConvertOptions
  args: zod.infer<typeof args>
}

export type ConvertOptions = {
  includeUris?: string[]
  outputRemaining?: string
}

type CLIConvertOptions = zod.infer<typeof options>
