import { argument } from 'pastel'
import zod from 'zod'

export const options = zod.object({
  includeUris: zod
    .string()
    .optional()
    .describe('Include domains (example: a.com,b.com)'),
  outputRemaining: zod
    .string()
    .optional()
    .describe(
      'Remaining items output file (choices: "overwrite-input-file", "<path>"',
    ),
})

export const args = zod.tuple([
  zod.enum(['bitwarden-to-apple']).describe(
    argument({
      name: 'app1-to-app2',
      description: 'From one password manager to another',
    }),
  ),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod
    .string()
    .describe(argument({ name: 'output', description: 'Output file' })),
])
