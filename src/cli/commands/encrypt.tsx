export * from '#/cli/EncryptDecryptCommand/EncryptDecryptCommand'
import EncryptDecryptCommand from '#/cli/EncryptDecryptCommand/EncryptDecryptCommand'

export const description = 'Encrypt file'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function DecryptCommand(props: any) {
  return <EncryptDecryptCommand {...props} name="encrypt" />
}
