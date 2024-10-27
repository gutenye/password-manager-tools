import { invert } from 'lodash-es'
import type { CliConvert } from '#/types'

export const URI_MATCH = {
  Default: null,
  BaseDomain: 0,
  Host: 1,
  StartsWith: 2,
  Exact: 3,
  RegularExpression: 4,
  Never: 5,
} as const

export type UriMatch = (typeof URI_MATCH)[keyof typeof URI_MATCH]

export const URI_MATCH_REVERSE = invert(URI_MATCH) as {
  null: string
  [key: number]: string
}

export enum ItemType {
  Login = 1,
  SecureNote = 2,
  Card = 3,
  Identity = 4,
}

export enum FieldLinkedId {
  Username = 100,
  Password = 101,
}

export enum FieldType {
  Text = 0,
  Hidden = 1,
  Boolean = 2,
  Linked = 3,
}

export const CLI_INCLUDE_TYPE_TO_APP_TYPE: Record<
  CliConvert.IncludeType,
  ItemType
> = {
  login: ItemType.Login,
  note: ItemType.SecureNote,
  card: ItemType.Card,
  identity: ItemType.Identity,
}
