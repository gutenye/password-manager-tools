import { argument } from 'pastel'
import zod from 'zod'

export const CLI_INCLUDE_TYPES = ['login', 'note', 'card', 'identity'] as const

export const options = zod.object({
  includeUris: zod
    .string()
    .optional()
    .describe('Include domains (example: a.com,b.com)'),
  includeFirst: zod
    .number()
    .optional()
    .describe('Include first n items (example: 10)'),
  includeNames: zod
    .string()
    .optional()
    .describe('Include names (example: a,b)'),
  includeTypes: zod
    .string()
    .optional()
    .describe('Include types (example: login,note,card,identity)'),
  outputRemaining: zod
    .string()
    .optional()
    .describe(
      'Remaining items output file (choices: "overwrite-input-file", "<path>")',
    ),
})

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
