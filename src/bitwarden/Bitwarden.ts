import fs from 'node:fs/promises'
import { groupBy, orderBy, partition } from 'lodash-es'
import tldts from 'tldts'
import { BitwardenExport } from '#/types'

export class Bitwarden {
  static async import(input: string) {
    const text = await fs.readFile(input, 'utf8')
    const root: BitwardenExport.Root = JSON.parse(text)
    if (root.encrypted) {
      throw new Error(`Encrypted file '${input}' is not supported`)
    }
    const app = new Bitwarden(root)
    app.normalize()
    return app
  }

  #root: BitwardenExport.Root

  constructor(root: BitwardenExport.Root) {
    this.#root = root
  }

  get root() {
    return this.#root
  }

  normalize() {
    this.#normalizeUris()
  }

  serializeRest(item: BitwardenExport.Item) {
    const outs = []
    outs.push(this.#serializeSection('FIELDS', this.#seriaizeFields(item.fields)))
    outs.push(this.#serializeSection('NOTES', this.#serializeNotes(item.notes)))
    outs.push(this.#serializeSection('PASSWORD_HISTORY', this.#serializePasswordHistory(item.passwordHistory)))
    if (item.type === BitwardenExport.ItemType.Login && item.login.__sameHostnames__?.hasMore) {
      outs.push(this.#serializeSection('URIS', this.#serializeUris(item.login.uris)))
    }
    return outs.join('\n\n')
  }

  includeUris(domains: string[]) {
    const parts = partition(this.#root.items, (item) => {
      return (
        item.type === BitwardenExport.ItemType.Login &&
        item.login.uris.some((uriItem) => {
          return domains.some((domain) => uriItem.uri.includes(domain))
        })
      )
    })
    return parts.map((items) => {
      return items.length > 0 ? new Bitwarden({ ...this.#root, items }) : null
    })
  }

  async export(output: string) {
    const json = JSON.stringify(this.#root, null, 2)
    await fs.writeFile(output, json)
  }

  // add __sameHostnames__
  #normalizeUris() {
    const supportedUriMatches = [
      BitwardenExport.UriMatch.Default,
      BitwardenExport.UriMatch.BaseDomain,
    ] as BitwardenExport.TUriMatch[]

    for (const item of this.#root.items) {
      switch (item.type) {
        case BitwardenExport.ItemType.Login: {
          const login = item.login
          const urlItems = login.uris.map((originInfo) => {
            if (supportedUriMatches.includes(originInfo.match)) {
              try {
                const urlInfo = new URL(originInfo.uri)
                const domainInfo = tldts.parse(originInfo.uri)
                return { hostname: urlInfo.hostname, domain: domainInfo.domain }
              } catch {
                return {}
              }
            } else {
              return {}
            }
          })
          const [validUrlItems, invalidUrlItems] = partition(urlItems, (urlItem) => urlItem.hostname) as unknown as [
            { hostname: string; domain: string }[],
            { hostname: undefined }[],
          ]
          const [firstValidUrlItems, ...restValidUrlItemsItems] = orderBy(
            Object.values(groupBy(validUrlItems, 'domain')),
            'length',
            'desc',
          )
          const restValidUrlItems = restValidUrlItemsItems.flat(Number.POSITIVE_INFINITY)
          login.__sameHostnames__ = {
            value: firstValidUrlItems.map((v) => v.hostname),
            hasMore: restValidUrlItems.length > 0 || invalidUrlItems.length > 0,
          }
        }
      }
    }
  }

  #serializeSection(title: string, value: string) {
    if (!value) {
      return ''
    }
    return `# ${title} #\n${value}`
  }

  #seriaizeFields(fields?: BitwardenExport.Field[]) {
    if (!fields) {
      return ''
    }
    const outFields = fields.map((field) => {
      let out = `${field.name}: ${field.value || ''}`
      if (field.type !== BitwardenExport.FieldType.Text) {
        out = `${out} TYPE=${BitwardenExport.FieldType[field.type]}`
      }
      if (field.linkedId) {
        out = `${out} LINKED_ID=${BitwardenExport.FieldLinkedId[field.linkedId]}`
      }
      return out
    })
    return outFields.join('\n')
  }

  #serializeNotes(notes?: string) {
    return notes || ''
  }

  #serializePasswordHistory(passwordHistory?: BitwardenExport.PasswordHistory[]) {
    if (!passwordHistory) {
      return ''
    }
    return passwordHistory
      .map((history) => {
        return `${history.lastUsedDate}: ${history.password}`
      })
      .join('\n')
  }

  #serializeUris(uris?: BitwardenExport.Uri[]) {
    if (!uris) {
      return ''
    }
    return uris
      .map((uri) => {
        return `${BitwardenExport.UriMatchReverse[uri.match]}: ${uri.uri}`
      })
      .join('\n')
  }
}
