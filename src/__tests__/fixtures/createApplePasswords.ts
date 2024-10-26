import invariant from 'invariant'
import type { Item } from '#/__tests__/types'
import type { ApplePasswordsExport } from '#/types'
import { prefixHttps } from '#/utils'

export function createApplePasswords(items: Item[] = []) {
  return items
    .flatMap((item, index) => createItem(index, item))
    .filter((v) => v !== undefined)
}

function createItem(
  index: number,
  item: Item,
): ApplePasswordsExport.Item[] | undefined {
  if (item === null) {
    return
  }
  const { uris = [undefined], __output__ } = item
  invariant(__output__ !== false, '__output__ false shows up in createItem')
  const suffix = index + 1
  return uris
    .map((uriInfo) => {
      if (uriInfo?.__output__ === false) {
        return
      }
      return {
        Title: __output__?.title ?? `name${suffix}`,
        Username: `username${suffix}`,
        Password: `password${suffix}`,
        OTPAuth: `totp${suffix}`,
        URL: getHostname(uriInfo?.uri),
        Notes: __output__?.notes || '',
      }
    })
    .filter((v) => v !== undefined)
}

function getHostname(uri: string | undefined) {
  if (!uri) {
    return ''
  }
  try {
    return new URL(prefixHttps(uri)).hostname
  } catch {
    return ''
  }
}
