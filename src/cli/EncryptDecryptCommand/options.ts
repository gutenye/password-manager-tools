import { argument } from 'pastel'
import zod from 'zod'

export const args = zod.tuple([
  zod
    .enum(['bitwarden'])
    .describe(argument({ name: 'app', description: 'App name' })),
  zod.string().describe(argument({ name: 'input', description: 'Input file' })),
  zod
    .string()
    .describe(argument({ name: 'output', description: 'Output file' })),
])
