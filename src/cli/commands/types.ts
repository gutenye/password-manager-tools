import type { ConvertOptions as RawConvertOptions } from './convert'

type ConvertOptions = Omit<RawConvertOptions, 'includeUris'> & {
  includeUris: string[]
}

export type { ConvertOptions }
