import type zod from 'zod'
import type { Context } from '#/types'
import type { args } from './options'

export type RunEncryptDecryptCommandOptions = {
  name: string
  args: Args
  context: Context
}

export type RunEncryptCommandOptions = {
  inputPath: string
  outputPath: string
  context: Context
}

type Args = zod.infer<typeof args>
