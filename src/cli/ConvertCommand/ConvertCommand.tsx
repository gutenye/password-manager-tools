import React from 'react'
import { BaseCommand } from '#/cli/BaseCommand'
import { getConverter } from '#/converter'
import { processOptions } from './options'
import type { RunConvertCommandOptions } from './types'
export * from './options'

export const description = 'Convert file format from app1 to app2'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function ConvertCommand(props: any) {
  return (
    <BaseCommand {...props} name="convert" runCommand={runConvertCommand} />
  )
}

export function runConvertCommand({
  args,
  options: rawOptions,
  context,
}: RunConvertCommandOptions) {
  const [name, inputPath, outputPath] = args
  const options = processOptions(rawOptions)
  return getConverter(name)(inputPath, outputPath, options, context)
}
