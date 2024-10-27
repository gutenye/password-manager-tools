import type { Item, Uri } from '#/__tests__/types'
import type { BitwardenExport } from '#/types'

export function createBitwarden(items: Item[] = []): BitwardenExport.Root {
  return {
    encrypted: false,
    folders: [],
    collections: [],
    items: items
      .map((item, index) => createLoginItem(index, item))
      .filter((v) => v !== undefined),
  }
}

function createLoginItem(
  index: number,
  item: Item,
): BitwardenExport.Item | undefined {
  if (item === null) {
    return
  }
  const {
    name,
    uris = [],
    fields = [],
    passwordHistory = [],
    notes = '',
  } = item
  const suffix = index + 1
  return {
    id: '',
    folderId: null,
    organizationId: null,
    collectionIds: null,
    name: name || `name${suffix}`,
    notes,
    type: 1,
    login: {
      username: `username${suffix}`,
      password: `password${suffix}`,
      uris: uris.map(createUri),
      totp: `totp${suffix}`,
      fido2Credentials: [],
    },
    favorite: true,
    reprompt: 0,
    fields: fields.map(createField),
    passwordHistory: passwordHistory.map(createPasswordHistory),
    revisionDate: '2024-10-19T00:08:08.486000061Z',
    creationDate: '2024-07-07T04:50:27.513000011Z',
    deletedDate: null,
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
