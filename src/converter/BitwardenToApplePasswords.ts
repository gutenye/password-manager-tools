import { ApplePasswords } from '#/applePasswords'
import { Bitwarden } from '#/bitwarden'

export async function bitwardenToApplePasswords(input: string, output: string) {
  const bitwarden = await Bitwarden.import(input)
  const applePasswords = await ApplePasswords.from(bitwarden)
  await applePasswords.export(output)
}
