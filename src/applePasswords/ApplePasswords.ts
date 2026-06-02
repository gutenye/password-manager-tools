import fs from 'node:fs/promises'
import Papa from 'papaparse'
import { BITWARDEN } from '#/bitwarden'
import type {
  ApplePasswordsExport,
  Bitwarden,
  BitwardenExport,
  Context,
  Stats,
  Logger,
} from '#/types'
import type {
  ConversionStrategy,
  StrategyResult,
} from './types/export'

export class ApplePasswords {

  static #STRATEGIES: Record<string, ConversionStrategy> = {
    [BITWARDEN.ItemType.Login]: { transform: ApplePasswords.loginStrategy },
    [BITWARDEN.ItemType.SecureNote]: { transform: ApplePasswords.secureNoteStrategy },
    [BITWARDEN.ItemType.Card]: { transform: ApplePasswords.cardIdentityStrategy },
    [BITWARDEN.ItemType.Identity]: { transform: ApplePasswords.cardIdentityStrategy },
  }

  #root: ApplePasswordsExport.Root
  #context: Context

  constructor(root: ApplePasswordsExport.Root, context: Context) {
    this.#root = root
    this.#context = context
  }

  static async from(app: Bitwarden, context: Context) {
    const { report, logger, stats } = context
    const needsFixes: ApplePasswordsExport.Item[] = []

    const output: ApplePasswordsExport.Item[] = app.root.items.reduce((acc, item) => {
      const strategy = ApplePasswords.getStrategy(item)
      const { items, needsFix } = strategy.transform(item, app, stats, logger)
      acc.push(...items)

      if (needsFix) {
        needsFixes.push(...items)
      }

      // needsFix && needsFixes.push(...items)

      stats.incProcessed()
      return acc
    }, [] as ApplePasswordsExport.Item[])

    stats.applyToReport(report)

    return {
      exported: new ApplePasswords(output, context),
      needsFix: new ApplePasswords(needsFixes, context),
    }
  }

  // static async from(app: Bitwarden, context: Context) {
  //   const { report, logger, stats } = context
  //   const needsFix: ApplePasswordsExport.Item[] = []

  //   const output: ApplePasswordsExport.Item[] = app.root.items.reduce((acc, item) => {
  //     const strategy = ApplePasswords.getStrategy(item)
  //     const { items, requiresFix } = strategy.transform(item, app, stats, logger)
  //     acc.push(...items)
  //     if (requiresFix) {
  //       needsFix.push(...requiresFix)
  //     }
  //     stats.incProcessed()
  //     return acc
  //   }, [] as ApplePasswordsExport.Item[])

  //   stats.applyToReport(report)

  //   return {
  //     exported: new ApplePasswords(output, context),
  //     needsFix: new ApplePasswords(needsFix, context),
  //   }
  // }

  static getStrategy(item: BitwardenExport.Item): ConversionStrategy {
    const strategy = ApplePasswords.#STRATEGIES[item.type]
    return strategy ?? { transform: ApplePasswords.unsupportedStrategy }
  }

  static unsupportedStrategy(item: BitwardenExport.Item, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult {
    stats.incRemaining()
    logger.error(`[ApplePasswords.unsupportedStrategy] Type '${item.type}' is not supported`);
    return {
      items: [],
      needsFix: false,
    }
  }

  static cardIdentityStrategy(item: BitwardenExport.Item, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult {
    if (item.type !== BITWARDEN.ItemType.Card && item.type !== BITWARDEN.ItemType.Identity) {
      throw new Error(`Item type must be Card or Identity`)
    }
    const type = BITWARDEN.ItemType[item.type]
    return {
      items: [{
        Title: `${item.name} (${type})`,
        Notes: app.serializeOther(item),
      }] as ApplePasswordsExport.Item[],
      needsFix: false,
    }
  }

  static secureNoteStrategy(item: BitwardenExport.Item, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult {
    if (item.type !== BITWARDEN.ItemType.SecureNote) {
      throw new Error(`Item type must be SecureNote`)
    }
    return {
      items: [{
        Title: `${item.name} (SecureNote)`,
        Notes: app.serializeCommon(item),
      }] as ApplePasswordsExport.Item[],
      needsFix: false,
    }
  }

  static loginStrategy(item: BitwardenExport.Item, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult {
    if (item.type !== BITWARDEN.ItemType.Login) {
      throw new Error(`Item type must be Login`)
    }

    const login = item.login
    const items = login.uris.map(uri => {
      let name = item.name
      if (login.__sameHostnames__?.needsFix) {
        name = `${item.name} FIXWEBSITE`
        stats.incRequiresFix()
      }
      //const name = login.__sameHostnames__?.needsFix ? `${item.name} FIXWEBSITE` : item.name
      return {
        Title: name,
        Username: login.username,
        Password: login.password,
        OTPAuth: login.totp,
        URL: uri.uri ? uri.uri : undefined,
        Notes: app.serializeCommon(item),
      } as ApplePasswordsExport.Item
    }
    )

    const needsFix = ApplePasswords.checkAfterImport(items)
    if (needsFix) {
      stats.incAfterImportCheck()
    }

    return {
      items,
      needsFix,
    }
  }

  static checkAfterImport(items: ApplePasswordsExport.Item[]): boolean {
    return items.filter(i => !i.Username && i.Password && i.URL).length > 0
  }

  // static loginItemToApplePasswords(item: BitwardenExport.Item, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult {
  //   if (item.type !== BITWARDEN.ItemType.Login) {
  //     throw new Error(`Item type must be Login`)
  //   }

  //   const login = item.login
  //   const loginItems = login.uris.map(uri =>
  //     ({
  //       Title: ApplePasswords.requiresFix(item, stats),
  //       Username: login.username,
  //       Password: login.password,
  //       OTPAuth: login.totp,
  //       URL: uri.uri ? uri.uri : undefined,
  //       Notes: app.serializeCommon(item),
  //     }) as ApplePasswordsExport.Item
  //   )
  //   return {
  //     items: loginItems,
  //     requiresFix: ApplePasswords.validateAfterImport(loginItems, stats)
  //   }
  // }

  // static requiresFix(item: BitwardenExport.LoginItem, stats: Stats): string {
  //   if (item.login.__sameHostnames__?.needsFix) {
  //     stats.incRequiresFix()
  //     return `${item.name} FIXWEBSITE`
  //   }
  //   return item.name
  // }

  // static validateAfterImport(items: ApplePasswordsExport.Item[], stats: Stats): ApplePasswordsExport.Item[] {
  //   return items.filter(item => {
  //     if (!item.Username && item.Password && item.URL) {
  //       stats.incAfterImportCheck()
  //       return true
  //     }
  //     return false
  //   })
  // }

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
