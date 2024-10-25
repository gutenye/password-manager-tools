import type { Item } from '#/__tests__/types'
import type { ApplePasswordsExport } from '#/types'
import { prefixHttps } from '#/utils'

export function createApplePasswords(items: Item[] = []) {
  return items.flatMap((item, index) => createItem(index, item)).filter((v) => v !== undefined)
}

function createItem(index: number, item: Item): ApplePasswordsExport.Item[] | undefined {
  if (item === null) {
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
      URL: new URL(prefixHttps(uri)).hostname,
      Notes: '',
    }
  })
}
