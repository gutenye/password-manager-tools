import type { BITWARDEN, BitwardenExport } from '#/types'

export type Item = null | {
  type?: BITWARDEN.ItemType
  name?: string
  uris?: Uri[]
  fields?: Partial<BitwardenExport.Field>[]
  passwordHistory?: Partial<BitwardenExport.PasswordHistory>[]
  notes?: string
  __output__?:
    | false // skip output
    | {
        name?: string
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
