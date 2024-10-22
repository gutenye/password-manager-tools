import { expect, it } from 'bun:test'
import { decrypt } from '../decrypt'

it('decrypt', async () => {
  const { fixtures } = globalThis.__TEST__
  const received = await decrypt(fixtures.bitwardenEncrypted.data, '1')
  expect(received).toEqual(fixtures.bitwardenDecrypted.data)
})
