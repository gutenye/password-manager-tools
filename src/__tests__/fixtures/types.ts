export type Item = null | {
  uris?: Uri[]
  fields?: any[]
  passwordHistory?: any[]
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

export type Uri = {
  uri: string
  __output__?: false
}
