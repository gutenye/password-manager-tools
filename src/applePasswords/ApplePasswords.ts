import fs from 'node:fs/promises'
import Papa from 'papaparse'
import type { ApplePasswordsExport, Bitwarden, Context } from '#/types'
import { BitwardenExport } from '#/types'

export class ApplePasswords {
  static async from(app: Bitwarden, context: Context) {
    const { logger } = context
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
            logger.warn('URLs needs manual fixing: ', item.name)
          }
          break
        }
        default: {
          logger.warn(
            `Skiped unsupported item type: ${BitwardenExport.ItemType[item.type]}`,
          )
          continue
        }
      }
    }
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
    const csv = Papa.unparse(this.#root)
    await fs.writeFile(output, csv)
  }
}
