import fs from 'node:fs/promises'
import Papa from 'papaparse'
import type { ApplePasswordsExport, Bitwarden, Context } from '#/types'
import { BitwardenExport } from '#/types'

export class ApplePasswords {
  static async from(app: Bitwarden, context: Context) {
    const { report } = context
    const outputs = []
    let processedCount = 0
    let skippedCount = 0
    let requireFixCount = 0
    for (const item of app.root.items) {
      switch (item.type) {
        case BitwardenExport.ItemType.Login: {
          processedCount++
          const login = item.login
          const hostnames = login.__sameHostnames__?.value ?? [undefined]
          for (const hostname of hostnames) {
            const notes = app.serializeCommon(item)
            let name = item.name
            if (login.__sameHostnames__?.hasMore) {
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
        case BitwardenExport.ItemType.SecureNote: {
          const notes = app.serializeCommon(item)
          const output: ApplePasswordsExport.Item = {
            Title: `${item.name} (SecureNote)`,
            Notes: notes,
          }
          outputs.push(output)
          break
        }
        case BitwardenExport.ItemType.Card: {
          const notes = app.serializeCard(item)
          const output: ApplePasswordsExport.Item = {
            Title: `${item.name} (Card)`,
            Notes: notes,
          }
          outputs.push(output)
          break
        }
        default: {
          skippedCount++
          continue
        }
      }
    }
    report.set('processedCount', processedCount)
    report.set('skippedCount', report.data.skippedCount + skippedCount)
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
    })
    await fs.writeFile(output, csv)
  }
}
