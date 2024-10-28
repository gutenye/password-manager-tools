import type { Item, Uri } from '#/__tests__/types'
import { BITWARDEN } from '#/bitwarden'
import type { BitwardenExport } from '#/types'

export function createBitwarden(items: Item[] = []): BitwardenExport.Root {
  return {
    encrypted: false,
    folders: [],
    collections: [],
    items: items.map(createItem).filter((v) => v !== undefined),
  }
}

function createItem(
  item: Item,
  index: number,
): BitwardenExport.Item | undefined {
  if (item === null) {
    return
  }

  const suffix = index + 1
  const {
    type = BITWARDEN.ItemType.Login,
    name = `name${suffix}`,
    notes = '',
    fields = [],
    passwordHistory = [],
  } = item

  const output: BitwardenExport.Item = {
    type,
    name,
    notes,
    fields: (fields || []).map(createField),
    passwordHistory: (passwordHistory || []).map(createPasswordHistory),
    id: `id${suffix}`,
    favorite: true,
    reprompt: 0,
    revisionDate: '2001-01-01T00:00:00.000000000Z',
    creationDate: '2001-01-01T00:00:00.000000000Z',
    deletedDate: null,
    folderId: null,
    organizationId: null,
    collectionIds: null,
  }

  switch (type) {
    case BITWARDEN.ItemType.Login: {
      const { uris = [] } = item
      return {
        ...output,
        login: {
          username: `username${suffix}`,
          password: `password${suffix}`,
          uris: uris.map(createUri),
          totp: `totp${suffix}`,
          fido2Credentials: [],
        },
      }
    }
    case BITWARDEN.ItemType.Card: {
      return {
        ...output,
        card: {
          cardholderName: `cardholderName${suffix}`,
        },
      }
    }
    case BITWARDEN.ItemType.Identity: {
      return {
        ...output,
        identity: {
          title: `title${suffix}`,
        },
      }
    }
    case BITWARDEN.ItemType.SecureNote: {
      return {
        ...output,
        secureNote: {
          type: 0,
        },
      }
    }
    default: {
      throw new Error(
        `[createBitwarden.createItem] invalid type '${BITWARDEN.ItemType[type]}'`,
      )
    }
  }
}

function createUri(uriInfo: Uri, index: number) {
  const suffix = index + 1
  const { uri = `${suffix}.example.com`, match = null } = uriInfo
  return {
    uri,
    match,
  }
}

function createField(field: Partial<BitwardenExport.Field>, index: number) {
  const suffix = index + 1
  const {
    name = `name${suffix}`,
    value = `value${suffix}`,
    type = 0,
    linkedId = undefined,
  } = field
  return {
    name,
    value,
    type,
    linkedId,
  }
}

function createPasswordHistory(
  passwordHistory: Partial<BitwardenExport.PasswordHistory>,
  index: number,
) {
  const suffix = index + 1
  const {
    lastUsedDate = `2001-01-01T00:00:00.00${suffix}Z`,
    password = `password${suffix}`,
  } = passwordHistory
  return {
    lastUsedDate,
    password,
  }
}
