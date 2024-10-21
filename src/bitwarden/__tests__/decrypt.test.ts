import { it } from 'bun:test'
import fixture from '#/__tests__/fixtures/bitwarden-encrypted.json'
import { decrypt } from '../decrypt'

it('decrypt', async () => {
  console.log(await decrypt(fixture, '1'))
})
