import { it } from 'bun:test'
import { BitwardenToApplePasswords } from '../BitwardenToApplePasswords'

it('a', () => {
  new BitwardenToApplePasswords().read(`${__dirname}/../../__tests__/fixtures/bitwarden.json`)
})
