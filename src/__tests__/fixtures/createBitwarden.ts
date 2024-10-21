export function createBitwarden() {
  return {
    encrypted: false,
    folders: [],
    collections: [],
    items: [createLoginItem()],
  }
}

function createLoginItem() {
  return {
    id: '',
    folderId: null,
    organizationId: null,
    collectionIds: null,
    name: 'HelloLogin1',
    notes: '',
    type: 1,
    login: {
      username: 'username',
      password: 'password',
      uris: [createUri()],
      totp: 'totp',
      fido2Credentials: [],
    },
    favorite: true,
    reprompt: 0,
    fields: [createField()],
    passwordHistory: [createPasswordHistory()],
    revisionDate: '2024-10-19T00:08:08.486000061Z',
    creationDate: '2024-07-07T04:50:27.513000011Z',
    deletedDate: null,
  }
}

function createUri() {
  return {
    uri: 'https://a.com',
    match: null,
  }
}

function createField() {
  return {
    name: 'Text',
    value: 'text',
    type: 0,
    linkedId: null,
  }
}

function createPasswordHistory() {
  return {
    lastUsedDate: '2024-02-24T02:56:29.772Z',
    password: 'OldPassword',
  }
}
