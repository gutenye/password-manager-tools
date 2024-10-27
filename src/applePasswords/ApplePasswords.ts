import fs from 'node:fs/promises'
import Papa from 'papaparse'
import { BITWARDEN } from '#/bitwarden'
import type { ApplePasswordsExport, Bitwarden, Context } from '#/types'
import type { BitwardenExport } from '#/types'

export class ApplePasswords {
  static async from(app: Bitwarden, context: Context) {
    const { report, logger } = context
    const outputs = []
    let processedCount = 0
    let remainingCount = 0
    let requireFixCount = 0
    for (const item of app.root.items) {
      switch (item.type) {
        case BITWARDEN.ItemType.Login: {
          processedCount++
          const login = item.login
          const hostnames = login.__sameHostnames__?.value ?? [undefined]
          for (const hostname of hostnames) {
            const notes = app.serializeCommon(item)
            let name = item.name
            if (login.__sameHostnames__?.needsFix) {
              name = `${name} FIXWEBSITE`
              requireFixCount++
            }
            const output: ApplePasswordsExport.Item = {
              Title: name,
              Username: login.username,
              Password: login.password,
              OTPAuth: login.totp,
              URL: hostname,
              Notes: notes,
            }
            outputs.push(output)
          }
          break
        }
        case BITWARDEN.ItemType.SecureNote: {
          processedCount++
          const notes = app.serializeCommon(item)
          const output: ApplePasswordsExport.Item = {
            Title: `${item.name} (SecureNote)`,
            Notes: notes,
          }
          outputs.push(output)
          break
        }
        case BITWARDEN.ItemType.Card:
        case BITWARDEN.ItemType.Identity: {
          processedCount++
          const type = BITWARDEN.ItemType[item.type]
          const notes = app.serializeOther(item)
          const output: ApplePasswordsExport.Item = {
            Title: `${item.name} (${type})`,
            Notes: notes,
          }
          outputs.push(output)
          break
        }
        default: {
          remainingCount++
          const { type, name } = item as BitwardenExport.Item
          logger.error(
            `[ApplePasswords.from] Type '${type}' from '${name}' is not supported`,
          )
          continue
        }
      }
    }
    report.set('processedCount', processedCount)
    report.set('remainingCount', report.data.remainingCount + remainingCount)
    report.set('requireFixCount', requireFixCount)
    return new ApplePasswords(outputs, context)
  }

  #root: ApplePasswordsExport.Root
  #context: Context

  constructor(root: ApplePasswordsExport.Root, context: Context) {
    this.#root = root
    this.#context = context
  }

  get root() {
    return this.#root
  }

  async export(output: string) {
    const csv = Papa.unparse(this.#root, {
      columns: ['Title', 'Username', 'Password', 'OTPAuth', 'URL', 'Notes'],
      newline: '\n',
    })
    await fs.writeFile(output, csv)
  }
}
