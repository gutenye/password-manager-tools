import { BitwardenToApplePasswords } from '#/converter'

export function convert({ input, output }: { input: string; output: string }) {
  return new BitwardenToApplePasswords().convert(input, output)
}
