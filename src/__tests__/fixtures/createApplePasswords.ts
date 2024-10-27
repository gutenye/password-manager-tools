import type { Item } from '#/__tests__/types'
import { BITWARDEN } from '#/bitwarden'
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
):
  | (ApplePasswordsExport.Item | undefined)[]
  | ApplePasswordsExport.Item
  | undefined {
  if (item === null || item.__output__ === false) {
    return
  }
  const suffix = index + 1
  const { type = BITWARDEN.ItemType.Login, __output__ } = item
  const output = {
    Title: __output__?.name ?? `name${suffix}`,
    Notes: __output__?.notes || '',
    Username: '',
    Password: '',
    OTPAuth: '',
    URL: '',
  }

  switch (type) {
    case BITWARDEN.ItemType.Login: {
      const { uris = [undefined] } = item
      return uris.map((uriInfo) => {
        if (uriInfo?.__output__ === false) {
          return
        }
        return {
          ...output,
          Username: `username${suffix}`,
          Password: `password${suffix}`,
          OTPAuth: `totp${suffix}`,
          URL: getHostname(uriInfo?.uri),
        }
      })
    }
    case BITWARDEN.ItemType.SecureNote: {
      return output
    }
    case BITWARDEN.ItemType.Card: {
      return {
        ...output,
        Notes: `cardholderName = cardholderName${suffix}`,
      }
    }
    case BITWARDEN.ItemType.Identity: {
      return {
        ...output,
        Notes: `title = title${suffix}`,
      }
    }
    default: {
      throw new Error(
        `[crateApplePasswords.createItem] invalid type '${BITWARDEN.ItemType[type]}'`,
      )
    }
  }
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
