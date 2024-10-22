import type { Data, Item } from './types'

export function createApplePasswords({ items = [] }: Data = {}) {
  return items.flatMap((item, index) => createItem(index, item))
}

function createItem(index: number, { uris = [] }: Item = {}) {
  const suffix = index + 1
  return uris.map((uri) => {
    return {
      Title: `name${suffix}`,
      Username: `username${suffix}`,
      Password: `password${suffix}`,
      OTPAuth: `totp${suffix}`,
      URL: new URL(uri).hostname,
      Notes: '',
    }
  })
}
