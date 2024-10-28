import { expect, it } from 'bun:test'
import { decrypt, encrypt } from '../encryptDecrypt'

const PASSWORD = '1'

it('decrypt', async () => {
  const { fixtures } = globalThis.__TEST__
  const decryptedData = await decrypt(
    fixtures.bitwardenEncrypted.data,
    PASSWORD,
  )
  expect(decryptedData).toEqual(fixtures.bitwardenDecrypted.data)
})

it('encrypt', async () => {
  const { fixtures } = globalThis.__TEST__
  const encryptedData = await encrypt(
    fixtures.bitwardenDecrypted.data,
    PASSWORD,
  )
  const decryptedData = await decrypt(encryptedData, PASSWORD)
  expect(decryptedData).toEqual(fixtures.bitwardenDecrypted.data)
})
