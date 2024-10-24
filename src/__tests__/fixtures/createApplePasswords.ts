import type { Item } from './types'

export function createApplePasswords(items: Item[] = []) {
  return items.flatMap((item, index) => createItem(index, item)).filter(Boolean)
}

function createItem(index: number, item: Item) {
  if (!item) {
    return
  }
  const { uris = [] } = item
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
