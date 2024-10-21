import type { ConvertOptions as RawConvertOptions } from './convert'

type ConvertOptions = Partial<
  Omit<RawConvertOptions, 'includeUris'> & {
    includeUris: string[]
  }
>

export type { ConvertOptions }
