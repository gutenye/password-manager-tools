import { argument } from 'pastel'
import zod from 'zod'

export const options = zod.object({
  includeUris: zod.string().optional().describe('Include domains (example: a.com,b.com)'),
  overwrite: zod.boolean().default(false).describe('Overwrite input file'),
})

export const args = zod.tuple([
  zod
    .enum(['bitwarden-to-apple'])
    .describe(argument({ name: 'app1-to-app2', description: 'From one password manager to another' })),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod.string().describe(argument({ name: 'output', description: 'Output file' })),
])
