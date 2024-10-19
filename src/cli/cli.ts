import { convert } from './convert'

export function main() {
  const [command, ...args] = process.argv.slice(2)
  switch (command) {
    case 'bitwarden-to-apple': {
      const [input, output] = args
      return convert({ input, output })
    }
    default:
      throw new Error(`command '${command}' not found`)
  }
}
