import type zod from 'zod'
import type { InputFn } from '#/types'
import type { args, options } from './options'

export type Props = {
  options: CLIConvertOptions
  args: zod.infer<typeof args>
}

export type ConvertOptions = {
  includeUris?: string[]
  overwrite?: boolean
  input: InputFn
}

type CLIConvertOptions = zod.infer<typeof options>
