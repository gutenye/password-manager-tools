import type { Item, Uri } from '#/__tests__/types'
import { BITWARDEN } from '#/bitwarden'
import type { BitwardenExport } from '#/types'

export function createBitwarden(items: Item[] = []): BitwardenExport.Root {
  return {
    encrypted: false,
    folders: [],
    collections: [],
    items: items
      .map((item, index) => createItem(index, item))
      .filter((v) => v !== undefined),
  }
}

function createItem(
  index: number,
  item: Item,
): BitwardenExport.Item | undefined {
  if (item === null) {
    return
  }

  const suffix = index + 1
  const {
    type = BITWARDEN.ItemType.Login,
    name,
    fields = [],
    passwordHistory = [],
    notes = '',
  } = item

  const output: BitwardenExport.Item = {
    id: '',
    type,
    name: name || `name${suffix}`,
    notes,
    favorite: true,
    reprompt: 0,
    fields: fields.map(createField),
    passwordHistory: passwordHistory.map(createPasswordHistory),
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

function createUri({ uri = 'uri.com', match = null }: Uri = {}) {
  return {
    uri,
    match,
  }
}

function createField({
  name = 'name',
  value = 'value',
  type = 0,
  linkedId = undefined,
}: Partial<BitwardenExport.Field>) {
  return {
    name,
    value,
    type,
    linkedId,
  }
}

function createPasswordHistory({
  lastUsedDate = '2001-01-01T01:00:00.000Z',
  password = 'password',
}: Partial<BitwardenExport.PasswordHistory>) {
  return {
    lastUsedDate,
    password,
  }
}
