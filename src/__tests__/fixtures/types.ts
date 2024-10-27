import type { BitwardenExport } from '#/types'

export type Item = null | {
  uris?: Uri[]
  fields?: Partial<BitwardenExport.Field>[]
  passwordHistory?: Partial<BitwardenExport.PasswordHistory>[]
  notes?: string
  __output__?:
    | false // skip output
    | {
        title?: string
        username?: string
        password?: string
        otpauth?: string
        url?: string
        notes?: string
      }
}

export interface Uri extends Partial<BitwardenExport.Uri> {
  __output__?: false
}
