export type Item = null | {
  uris?: string[]
  fields?: any[]
  passwordHistory?: any[]
  // if output is true, this item will show in the ouput, default is true
  output?: boolean
}
