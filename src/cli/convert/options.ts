import { argument } from 'pastel'
import zod from 'zod'
import { AppError } from '#/errors'
import type { CliConvert } from '#/types'
import type { IncludeType, Options } from './types'

export const CLI_INCLUDE_TYPES = ['login', 'note', 'card', 'identity'] as const

export const args = zod.tuple([
  zod.enum(['bitwarden-to-apple']).describe(
    argument({
      name: 'app1-to-app2',
      description: 'From one app to another',
    }),
  ),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod
    .string()
    .describe(argument({ name: 'output', description: 'Output file' })),
])

export const options = zod.object({
  includeUris: zod
    .string()
    .optional()
    .describe('Include items with domains (example: a.com,b.com)'),
  includeFirst: zod
    .number()
    .optional()
    .describe('Include first n items (example: 10)'),
  includeNames: zod
    .string()
    .optional()
    .describe('Include items with names (example: a,b)'),
  includeTypes: zod
    .string()
    .optional()
    .describe('Include items with types (example: login,note,card,identity)'),
  outputRemaining: zod
    .string()
    .optional()
    .describe(
      'Remaining items output file (choices: "overwrite-input-file", "<path>")',
    ),
  skipFields: zod
    .string()
    .optional()
    .describe('Skip fields output by field names (example: a,b)'),
})

export function processOptions(options: Options) {
  const processedOptions: CliConvert.ProcessedOptions = {
    ...options,
    includeUris: options.includeUris?.split(','),
    includeNames: options.includeNames?.split(','),
    includeTypes: parseIncludeTypes(options.includeTypes),
  }
  return processedOptions
}

function parseIncludeTypes(includeTypes?: string) {
  if (!includeTypes) {
    return
  }
  const types = includeTypes.split(',')
  for (const type of types) {
    if (!CLI_INCLUDE_TYPES.includes(type as any)) {
      throw new AppError(
        `--include-types '${type}' must be one of ${CLI_INCLUDE_TYPES.join(', ')}`,
      )
    }
  }
  return types as IncludeType[]
}
