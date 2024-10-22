import fs from 'node:fs/promises'
import Papa from 'papaparse'
import type { ApplePasswordsExport, Bitwarden } from '#/types'
import { BitwardenExport } from '#/types'

export class ApplePasswords {
  static async from(app: Bitwarden) {
    const outputs = []
    for (const item of app.root.items) {
      switch (item.type) {
        case BitwardenExport.ItemType.Login: {
          const login = item.login
          const hostnames = login.__sameHostnames__?.value ?? [undefined]
          for (const hostname of hostnames) {
            const notes = app.serializeRest(item)
            const output: ApplePasswordsExport.Item = {
              Title: item.name,
              Username: login.username,
              Password: login.password,
              OTPAuth: login.totp,
              URL: hostname,
              Notes: notes,
            }
            outputs.push(output)
          }
          if (login.__sameHostnames__?.hasMore) {
            console.log('URLs needs manual fixing: ', item.name)
          }
          break
        }
        default: {
          console.warn(`skiped unsupported item type: ${BitwardenExport.ItemType[item.type]}`)
          continue
        }
      }
    }
    return new ApplePasswords(outputs)
  }

  #root: ApplePasswordsExport.Root

  constructor(root: ApplePasswordsExport.Root) {
    this.#root = root
  }

  get root() {
    return this.#root
  }

  async export(output: string) {
    const csv = Papa.unparse(this.#root)
    await fs.writeFile(output, csv)
  }
}
