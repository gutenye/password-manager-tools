import { invert } from 'lodash-es'

export interface Root {
  encrypted: boolean
  folders?: Array<Folder>
  collections?: Array<Collection>
  items: Array<Item>
}

export interface Folder {
  id: string
  name: string
}

export interface Collection {
  id: string
  organizationId: string
  name: string
  externalId?: string
}

export type Item = LoginItem | SecureNoteItem | CardItem | IdentityItem

interface BaseItem {
  id: string
  name: string
  type: ItemType
  notes?: string
  fields?: Array<Field>
  passwordHistory?: Array<PasswordHistory>
  favorite: boolean
  folderId?: string
  organizationId?: string
  collectionIds?: string
  revisionDate: string
  creationDate: string
  deletedDate?: string
  reprompt: 0 | 1
}

export interface LoginItem extends BaseItem {
  type: ItemType.Login
  login: {
    username?: string
    password?: string
    totp?: string
    uris: Array<Uri>
    __sameHostnames__?: {
      value: string[]
      hasMore: boolean
    }
    fido2Credentials: []
  }
}

export interface SecureNoteItem extends BaseItem {
  type: ItemType.SecureNote
  secureNote: {
    type: number
  }
}

export interface CardItem extends BaseItem {
  type: ItemType.Card
  card: {
    cardholderName?: string
    expMonth?: string
    expYear?: string
    code?: string
    brand?: string
    number?: string
  }
}

export interface IdentityItem extends BaseItem {
  type: ItemType.Identity
  identity: {
    title?: null
    firstName?: null
    middleName?: null
    lastName?: null
    address1?: null
    address2?: null
    address3?: null
    city?: null
    state?: null
    postalCode?: null
    country?: null
    company?: null
    email?: null
    phone?: null
    ssn?: null
    username?: null
    passportNumber?: null
    licenseNumber?: null
  }
}

export enum ItemType {
  Login = 1,
  SecureNote = 2,
  Card = 3,
  Identity = 4,
}

export interface Field {
  name: string
  value: string
  type: FieldType
  linkedId?: FieldLinkedId
}

export enum FieldType {
  Text = 0,
  Hidden = 1,
  Boolean = 2,
  Linked = 3,
}

export enum FieldLinkedId {
  Username = 100,
  Password = 101,
}

export interface PasswordHistory {
  lastUsedDate: string
  password: string
}

export interface Uri {
  match: TUriMatch
  uri: string
}

export const UriMatch = {
  Default: null,
  BaseDomain: 0,
  Host: 1,
  StartsWith: 2,
  Exact: 3,
  RegularExpression: 4,
  Never: 5,
} as const

export type TUriMatch = (typeof UriMatch)[keyof typeof UriMatch]

export const UriMatchReverse = invert(UriMatch) as { null: string; [key: number]: string }
