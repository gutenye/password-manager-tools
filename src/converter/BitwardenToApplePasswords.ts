import fs from 'node:fs/promises'
import { groupBy, orderBy, partition } from 'lodash-es'
import Papa from 'papaparse'
import tldts from 'tldts'
import { Bitwarden } from '#/types'
import type { ApplePasswords } from '#/types'

export class BitwardenToApplePasswords {
  async convert(input: string, output: string) {
    const items = await this.read(input)
    const csv = Papa.unparse(items)
    await fs.writeFile(output, csv)
  }

  async read(input: string) {
    const text = await fs.readFile(input, 'utf8')
    const content: Bitwarden.Export = JSON.parse(text)
    if (content.encrypted) {
      throw new Error('encrypted file is not supported')
    }
    const outputs = []
    for (const item of content.items) {
      switch (item.type) {
        case Bitwarden.ItemType.Login: {
          const login = item.login
          const urlItems = login.uris.map((originInfo) => {
            if ([Bitwarden.UriMatch.Default, Bitwarden.UriMatch.BaseDomain].includes(originInfo.match)) {
              try {
                const urlInfo = new URL(originInfo.uri)
                const domainInfo = tldts.parse(originInfo.uri)
                const cleanUrl = `${urlInfo.protocol}//${urlInfo.host}`
                return { cleanUrl, originInfo, urlInfo, domainInfo }
              } catch {
                return { originInfo }
              }
            } else {
              return { originInfo }
            }
          })
          const [validUrlItems, invalidUrlItems] = partition(urlItems, (urlItem) => urlItem.cleanUrl)
          const [firstUrlItems, ...restUrlItemsItems] = orderBy(
            Object.values(groupBy(validUrlItems, 'domainInfo.domain')),
            'length',
            'desc',
          )
          const restUrlItems = restUrlItemsItems.flat(Number.POSITIVE_INFINITY)
          const saveUris = restUrlItems.length > 0 || invalidUrlItems.length > 0
          for (const urlItem of firstUrlItems) {
            const notes = this.buildNotes({ item, saveUris })
            const output: ApplePasswords.Item = {
              // common
              Title: item.name,
              // login
              Username: login.username,
              Password: login.password,
              OTPAuth: login.totp,
              URL: urlItem.cleanUrl,
              Notes: notes,
            }
            outputs.push(output)
          }
          console.log(':: restUrlItems', restUrlItems)
          console.log(
            ':: invalidUrlItems',
            invalidUrlItems.map((v) => v.originInfo.uri),
          )
          break
        }
        default: {
          console.warn(`skiped unsupported item type: ${Bitwarden.ItemType[item.type]}`)
          continue
        }
      }
    }
    return outputs
  }

  buildNotes({ item, saveUris }: { item: Bitwarden.Item; saveUris: boolean }) {
    const outs = []
    outs.push(this.serializeSection('FIELDS', this.seriaizeFields(item.fields)))
    outs.push(this.serializeSection('NOTES', this.serializeNotes(item.notes)))
    outs.push(this.serializeSection('PASSWORD_HISTORY', this.serializePasswordHistory(item.passwordHistory)))
    if (saveUris && item.type === Bitwarden.ItemType.Login) {
      outs.push(this.serializeSection('URIS', this.serializeUris(item.login.uris)))
    }
    return outs.join('\n\n')
  }

  serializeSection(title: string, value: string) {
    if (!value) {
      return ''
    }
    return `# ${title} #\n${value}`
  }

  seriaizeFields(fields?: Bitwarden.Field[]) {
    if (!fields) {
      return ''
    }
    const outFields = fields.map((field) => {
      let out = `${field.name}: ${field.value || ''}`
      if (field.type !== Bitwarden.FieldType.Text) {
        out = `${out} TYPE=${Bitwarden.FieldType[field.type]}`
      }
      if (field.linkedId) {
        out = `${out} LINKED_ID=${Bitwarden.FieldLinkedId[field.linkedId]}`
      }
      return out
    })
    return outFields.join('\n')
  }

  serializeNotes(notes?: string) {
    return notes || ''
  }

  serializePasswordHistory(passwordHistory?: Bitwarden.PasswordHistory[]) {
    if (!passwordHistory) {
      return ''
    }
    return passwordHistory
      .map((history) => {
        return `${history.lastUsedDate}: ${history.password}`
      })
      .join('\n')
  }

  serializeUris(uris?: Bitwarden.Uri[]) {
    if (!uris) {
      return ''
    }
    return uris
      .map((uri) => {
        return `${Bitwarden.UriMatchReverse[uri.match]}: ${uri.uri}`
      })
      .join('\n')
  }
}
