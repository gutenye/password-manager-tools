import type { Item } from '#/__tests__/types'
import { BITWARDEN } from '#/bitwarden'
import { AppError } from '#/errors'
import type { ApplePasswordsExport } from '#/types'
import { extractHost } from '#/utils'

export function createApplePasswords(items: Item[] = []) {
  return items.flatMap(createItem).filter((v) => v !== undefined)
}

function createItem(
  item: Item,
  index: number,
):
  | (ApplePasswordsExport.Item | undefined)[]
  | ApplePasswordsExport.Item
  | undefined {
  if (item === null || item.__output__ === false) {
    return
  }
  const suffix = index + 1
  const { type = BITWARDEN.ItemType.Login } = item
  const __output__ = item.__output__ || {}
  const { name = `name${suffix}`, notes = '' } = __output__
  const output = {
    Title: name,
    Notes: notes,
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
        const {
          username = `username${suffix}`,
          password = `password${suffix}`,
          totp = `totp${suffix}`,
        } = __output__
        return {
          ...output,
          Username: username,
          Password: password,
          OTPAuth: totp,
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
      throw new AppError(
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
    const host = extractHost(uri)
    if (!host) {
      return ''
    }
    return new URL(host).hostname
  } catch {
    return ''
  }
}
