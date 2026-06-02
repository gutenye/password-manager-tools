import type { Bitwarden } from "#/bitwarden"
import type { ApplePasswordsExport } from "."
import type { Stats } from "#/types"
import type { Logger } from "#/types"

export type Root = Array<Item>

export type Item = {
  Title?: string
  URL?: string
  Username?: string
  Password?: string
  Notes?: string
  OTPAuth?: string
}

export interface ConversionStrategy {
  transform(item: any, app: Bitwarden, stats: Stats, logger: Logger): StrategyResult
}

export type StrategyResult {
  items: ApplePasswordsExport.Item[]
  needsFix: boolean
}
