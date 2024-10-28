import fs from 'node:fs/promises'
import { groupBy, orderBy, partition } from 'lodash-es'
import tldts from 'tldts'
import {
  CLI_INCLUDE_TYPE_TO_APP_TYPE,
  FieldLinkedId,
  FieldType,
  ItemType,
  NORMALIZE_URI_SUPPORTED_MATCHES,
  URI_MATCH_REVERSE,
} from '#/bitwarden/constants'
import { decrypt, encrypt } from '#/bitwarden/encryptDecrypt'
import type { BitwardenExport } from '#/types'
import type { CliConvert, Context } from '#/types'
import { extractHost, omitByDeep } from '#/utils'

export class Bitwarden {
  static async import(
    inputPath: string,
    options: CliConvert.ProcessedOptions,
    context: Context,
  ) {
    const { input, report } = context
    const text = await fs.readFile(inputPath, 'utf8')
    const fileData: BitwardenExport.File = JSON.parse(text)
    let root: BitwardenExport.Root
    let password = ''
    if (fileData.encrypted) {
      password = await input({ label: 'Enter password', type: 'password' })
      root = await decrypt(fileData, password)
    } else {
      root = fileData
    }

    const all = new Bitwarden(root, options, context)
    all.normalize()
    let exported: Bitwarden | null = all
    let remaining: Bitwarden = new Bitwarden(
      { ...all.root, items: [] },
      options,
      context,
    )
    if (options.includeUris) {
      const parts = all.includeUris(options.includeUris)
      exported = parts[0]
      remaining = parts[1]
      report.set('remainingCount', remaining.count)
    } else if (options.includeFirst) {
      const parts = all.includeFirst(options.includeFirst)
      exported = parts[0]
      remaining = parts[1]
      report.set('remainingCount', remaining.count)
    } else if (options.includeNames) {
      const parts = all.includeNames(options.includeNames)
      exported = parts[0]
      remaining = parts[1]
      report.set('remainingCount', remaining.count)
    } else if (options.includeTypes) {
      const parts = all.includeTypes(options.includeTypes)
      exported = parts[0]
      remaining = parts[1]
      report.set('remainingCount', remaining.count)
    }

    return { exported, remaining, password }
  }

  #root: BitwardenExport.Root
  #options: CliConvert.ProcessedOptions
  #context: Context

  constructor(
    root: BitwardenExport.Root,
    options: CliConvert.ProcessedOptions,
    context: Context,
  ) {
    this.#context = context
    this.#options = options
    this.#root = root
  }

  get root() {
    return this.#root
  }

  get count() {
    return this.#root.items.length
  }

  includeUris(domains: string[]) {
    const parts = partition(this.#root.items, (item) => {
      return (
        item.type === ItemType.Login &&
        item.login.uris.some((uriItem) => {
          return domains.some((domain) => uriItem.uri.includes(domain))
        })
      )
    })
    return parts.map((items) => {
      return new Bitwarden(
        { ...this.#root, items },
        this.#options,
        this.#context,
      )
    })
  }

  includeFirst(count: number) {
    const firstItems = this.#root.items.slice(0, count)
    const restItems = this.#root.items.slice(count)
    return [firstItems, restItems].map((items) => {
      return new Bitwarden(
        { ...this.#root, items },
        this.#options,
        this.#context,
      )
    })
  }

  includeNames(names: string[]) {
    const parts = partition(this.#root.items, (item) => {
      return names.some((name) => item.name.includes(name))
    })
    return parts.map((items) => {
      return new Bitwarden(
        { ...this.#root, items },
        this.#options,
        this.#context,
      )
    })
  }

  includeTypes(cliTypes: CliConvert.IncludeType[]) {
    const parts = partition(this.#root.items, (item) => {
      return cliTypes.some((cliType) => {
        const appType = CLI_INCLUDE_TYPE_TO_APP_TYPE[cliType]
        return appType === item.type
      })
    })
    return parts.map((items) => {
      return new Bitwarden(
        { ...this.#root, items },
        this.#options,
        this.#context,
      )
    })
  }

  normalize() {
    this.#normalizeUris()
  }

  serializeCommon(item: BitwardenExport.Item) {
    const outs = []
    outs.push(
      this.#serializeSection('FIELDS', this.#serializeFields(item.fields)),
    )
    if (item.type === ItemType.SecureNote) {
      outs.push(this.#serializeNotes(item.notes))
    } else {
      outs.push(
        this.#serializeSection('NOTES', this.#serializeNotes(item.notes)),
      )
    }
    outs.push(
      this.#serializeSection(
        'PASSWORD_HISTORY',
        this.#serializePasswordHistory(item.passwordHistory),
      ),
    )
    if (
      item.type === ItemType.Login &&
      item.login.__sameHostnames__?.needsNote
    ) {
      outs.push(
        this.#serializeSection('URIS', this.#serializeUris(item.login.uris)),
      )
    }
    return outs.filter(Boolean).join('\n\n').trim()
  }

  serializeOther(item: BitwardenExport.Item) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let data: Record<string, any>
    if (item.type === ItemType.Card) {
      data = item.card
    } else if (item.type === ItemType.Identity) {
      data = item.identity
    } else {
      throw new Error(
        `[bitwarden.serializeOther] type '${ItemType[item.type]}' is not supported`,
      )
    }

    const items = []
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        items.push(`${key} = ${value}`)
      }
    }
    const text = items.join('\n')

    const common = this.serializeCommon(item)
    return `${text}\n\n${common}`.trim()
  }

  async export(output: string, { password }: { password?: string } = {}) {
    const newRoot = omitByDeep(this.#root, (_, key) => {
      return Boolean(key.match(/^__.*__$/))
    })
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let result: any = newRoot
    if (password) {
      result = await encrypt(result, password)
    }
    const text = JSON.stringify(result, null, 2)
    await fs.writeFile(output, text)
  }

  // add __sameHostnames__
  #normalizeUris() {
    for (const item of this.#root.items) {
      switch (item.type) {
        case ItemType.Login: {
          const login = item.login
          const urlItems = login.uris.map((originInfo) => {
            if (!NORMALIZE_URI_SUPPORTED_MATCHES.includes(originInfo.match)) {
              return
            }
            try {
              const host = extractHost(originInfo.uri)
              if (!host) {
                return
              }
              const urlInfo = new URL(host)
              const domainInfo = tldts.parse(host)
              return { hostname: urlInfo.hostname, domain: domainInfo.domain }
            } catch {
              return
            }
          })
          if (urlItems.length === 0) {
            continue
          }
          // vaidUrlItems: [], ivalidUrlItems [ undefined ]
          const [validUrlItems, invalidUrlItems] = partition(
            urlItems,
            (urlItem) => urlItem?.hostname,
          ) as unknown as [
            { hostname: string; domain: string }[],
            { hostname: undefined }[],
          ]
          const needsNote = invalidUrlItems.length > 0
          if (validUrlItems.length === 0) {
            login.__sameHostnames__ = {
              needsNote,
            }
          } else {
            const [firstValidUrlItems, ...restValidUrlItemsItems] = orderBy(
              Object.values(groupBy(validUrlItems, 'domain')),
              'length',
              'desc',
            )
            const restValidUrlItems = restValidUrlItemsItems.flat(
              Number.POSITIVE_INFINITY,
            )
            const needsFix = restValidUrlItems.length > 0
            login.__sameHostnames__ = {
              value: firstValidUrlItems.map((v) => v.hostname),
              needsFix,
              needsNote: needsNote || needsFix,
            }
          }
        }
      }
    }
  }

  #serializeSection(title: string, value: string) {
    if (!value) {
      return ''
    }
    return `[${title}]\n${value}`
  }

  #serializeFields(fields?: BitwardenExport.Field[]) {
    if (!fields) {
      return ''
    }
    const outFields = fields
      .map((field) => {
        if (
          this.#options.skipFields?.some((skipField) =>
            field.name?.includes(skipField),
          )
        ) {
          return
        }
        const name = this.#escapeField(field.name) || 'EMPTY'
        let out = `${name} =`
        if (field.value) {
          const value = this.#escapeField(field.value)
          out = `${out} ${value}`
        }
        if (field.type !== FieldType.Text && field.type) {
          out = `${out} TYPE=${FieldType[field.type]}`
        }
        if (field.linkedId) {
          out = `${out} LINKED_ID=${FieldLinkedId[field.linkedId]}`
        }
        return out
      })
      .filter((v) => v !== undefined)
    return outFields.join('\n')
  }

  #escapeField(name?: string | null) {
    return name?.replaceAll('=', '=')
  }

  #serializeNotes(notes?: string) {
    return notes ? notes.trim() : ''
  }

  #serializePasswordHistory(
    passwordHistory?: BitwardenExport.PasswordHistory[],
  ) {
    if (!passwordHistory) {
      return ''
    }
    return passwordHistory
      .map((history) => {
        return `${history.lastUsedDate} = ${history.password}`
      })
      .join('\n')
  }

  #serializeUris(uris?: BitwardenExport.Uri[]) {
    if (!uris) {
      return ''
    }
    return uris
      .map((uri) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return `${URI_MATCH_REVERSE[uri.match as any]} = ${uri.uri}`
      })
      .join('\n')
  }
}
