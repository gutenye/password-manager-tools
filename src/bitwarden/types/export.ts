import type {
  FieldLinkedId,
  FieldType,
  ItemType,
  UriMatch,
} from '#/bitwarden/constants'

export type { UriMatch, ItemType, FieldLinkedId, FieldType }

export type File = Root | RootEncrypted

export interface Root {
  encrypted: false
  folders?: Array<Folder>
  collections?: Array<Collection>
  items: Array<Item>
}

export interface RootEncrypted {
  encrypted: true
  data: string
  salt: string
  kdfType: 0
  kdfIterations: number
  encKeyValidation_DO_NOT_EDIT: string
  passwordProtected: true
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
      value?: string[]
      needsFix?: boolean
      needsNote?: boolean
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

export interface Field {
  name: string
  value: string
  type: FieldType
  linkedId?: FieldLinkedId
}

export interface PasswordHistory {
  lastUsedDate: string
  password: string
}

export interface Uri {
  match: UriMatch
  uri: string
}
