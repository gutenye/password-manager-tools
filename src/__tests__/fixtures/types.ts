export type Item = null | {
  uris?: string[]
  fields?: any[]
  passwordHistory?: any[]
  __output__?:
    | false // skip output
    | {
        notes?: string
      }
}
