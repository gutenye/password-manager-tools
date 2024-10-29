import React from 'react'
import { Bitwarden } from '#/bitwarden'
import { decrypt, encrypt } from '#/bitwarden/encryptDecrypt'
import { BaseCommand } from '#/cli/BaseCommand'
import { AppError } from '#/errors'
import type { BitwardenExport } from '#/types'
import type {
  RunEncryptCommandOptions,
  RunEncryptDecryptCommandOptions,
} from './types'

export * from './options'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function EncryptDecryptCommand(props: any) {
  return <BaseCommand {...props} runCommand={runEncryptDecryptCommand} />
}

async function runEncryptDecryptCommand({
  name,
  args,
  context,
}: RunEncryptDecryptCommandOptions) {
  const [appName, inputPath, outputPath] = args
  switch (name) {
    case 'encrypt':
      return runEncryptCommand({ inputPath, outputPath, context })
    case 'decrypt':
      return runDecryptCommand({ inputPath, outputPath, context })
    default:
      throw new AppError(
        `[runEncryptDecryptCommand] command '${name}' is not supported`,
      )
  }
}

async function runEncryptCommand({
  inputPath,
  outputPath,
  context,
}: RunEncryptCommandOptions) {
  const { input, report } = context
  const data = await Bitwarden.readFile(inputPath)
  if (data.encrypted) {
    return report.exit('Skip, file is already encrypted.')
  }
  const password = await input({
    label: 'Enter password',
    type: 'password',
  })
  const encryptedData = await encrypt(data, password)
  await Bitwarden.writeFile(outputPath, encryptedData)
  report.exit(`The file is encrypted and saved in '${outputPath}'.`)
}

async function runDecryptCommand({
  inputPath,
  outputPath,
  context,
}: RunEncryptCommandOptions) {
  const { input, report } = context
  const data = (await Bitwarden.readFile(
    inputPath,
  )) as BitwardenExport.RootEncrypted
  if (!data.encrypted) {
    report.exit('Skip, file is not encrypted.')
  }
  const password = await input({
    label: 'Enter password',
    type: 'password',
  })
  const decryptedData = await decrypt(data, password)
  await Bitwarden.writeFile(outputPath, decryptedData)
  report.exit(`The file is decrypted and saved in '${outputPath}'`)
}
