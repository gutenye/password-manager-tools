import { expect, it } from 'bun:test'
import type { BitwardenExport } from '#/types'
import { createBitwarden } from './createBitwarden'

const ROOT: Partial<BitwardenExport.Root> = {
  collections: [],
  encrypted: false,
  folders: [],
}

const ITEM: Partial<BitwardenExport.Item> = {
  creationDate: '2001-01-01T00:00:00.000000000Z',
  favorite: true,
  fields: [],
  id: 'id',
  notes: '',
  organizationId: null,
  collectionIds: null,
  deletedDate: null,
  folderId: null,
  passwordHistory: [],
  reprompt: 0,
  revisionDate: '2001-01-01T00:00:00.000000000Z',
  type: 1,
}

it('empty', () => {
  expect(createBitwarden([])).toEqual({
    ...ROOT,
    items: [],
  })
})

it('works', () => {
  expect(createBitwarden([{ uris: [{}, {}] }, {}])).toEqual({
    ...ROOT,
    items: [
      {
        ...ITEM,
        login: {
          fido2Credentials: [],
          password: 'password1',
          totp: 'totp1',
          uris: [
            {
              match: null,
              uri: '1.example.com',
            },
            {
              match: null,
              uri: '2.example.com',
            },
          ],
          username: 'username1',
        },
        name: 'name1',
      },
      {
        ...ITEM,
        login: {
          fido2Credentials: [],
          password: 'password2',
          totp: 'totp2',
          uris: [],
          username: 'username2',
        },
        name: 'name2',
      },
    ],
  })
})
