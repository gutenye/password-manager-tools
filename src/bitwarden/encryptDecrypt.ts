const { crypto } = globalThis
import { AppError } from '#/errors'

const ITERLATIONS = 600000

export async function decrypt(
  {
    data,
    salt,
    kdfIterations,
  }: { data: string; salt: string; kdfIterations: number },
  password: string,
) {
  try {
    const key = await deriveKey({
      password: Buffer.from(password),
      salt: Buffer.from(salt),
      iterations: kdfIterations,
    })
    const decrypted = await decryptText(data, key)
    return JSON.parse(decrypted)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'OperationError') {
        throw new AppError('Incorrect password')
      }
    }
    throw error
  }
}

export async function encrypt(data: Record<string, any>, password: string) {
  const salt = generateSalt()
  const key = await deriveKey({
    salt,
    iterations: ITERLATIONS,
    password: stringToUint8Array(password),
  })
  const text = JSON.stringify(data)
  const encryptedText = await encryptText(text, key)
  return {
    encrypted: true,
    passwordProtected: true,
    salt: uint8ArrayToString(salt),
    kdfType: 0,
    kdfIterations: ITERLATIONS,
    encKeyValidation_DO_NOT_EDIT: '',
    data: encryptedText,
  }
}

async function deriveKey({
  password,
  salt,
  iterations,
}: { password: ArrayBufferView; salt: ArrayBufferView; iterations: number }) {
  const masterKey = await pbkdf2(password, salt, 'sha256', iterations)
  const key = await hkdfExpand(masterKey, 'enc', 32, 'sha256')
  return new Uint8Array(key)
}

// derive password to key
async function pbkdf2(
  password: ArrayBufferView,
  salt: ArrayBufferView,
  algorithm: string,
  iterations: number,
) {
  const wcLen = algorithm === 'sha256' ? 256 : 512
  const pbkdf2Params = {
    name: 'PBKDF2',
    salt,
    iterations: iterations,
    hash: { name: toWebCryptoAlgorithm(algorithm) },
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    password,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )
  return new Uint8Array(
    await crypto.subtle.deriveBits(pbkdf2Params, cryptoKey, wcLen),
  )
}

function toWebCryptoAlgorithm(algorithm: string) {
  if (algorithm === 'md5') {
    throw new Error('MD5 is not supported in WebCrypto.')
  }
  return algorithm === 'sha1'
    ? 'SHA-1'
    : algorithm === 'sha256'
      ? 'SHA-256'
      : 'SHA-512'
}

async function hkdfExpand(
  prk: Uint8Array,
  info: string,
  outputByteSize: number,
  algorithm: string,
) {
  const hashLen = algorithm === 'sha256' ? 32 : 64
  if (outputByteSize > 255 * hashLen) {
    throw new Error('outputByteSize is too large.')
  }
  if (prk.length < hashLen) {
    throw new Error('prk is too small.')
  }
  const infoArr = stringToUint8Array(info)
  let runningOkmLength = 0
  let previousT = new Uint8Array(0)
  const n = Math.ceil(outputByteSize / hashLen)
  const okm = new Uint8Array(n * hashLen)
  for (let i = 0; i < n; i++) {
    const t = new Uint8Array(previousT.length + infoArr.length + 1)
    t.set(previousT)
    t.set(infoArr, previousT.length)
    t.set([i + 1], t.length - 1)
    previousT = await hmac(t, prk, algorithm)
    okm.set(previousT, runningOkmLength)
    runningOkmLength += previousT.length
    if (runningOkmLength >= outputByteSize) {
      break
    }
  }
  return okm.slice(0, outputByteSize)
}

async function hmac(
  value: ArrayBufferView,
  key: ArrayBufferView,
  algorithm: string,
) {
  const signingAlgorithm = {
    name: 'HMAC',
    hash: { name: toWebCryptoAlgorithm(algorithm) },
  }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    signingAlgorithm,
    false,
    ['sign'],
  )
  return new Uint8Array(
    await crypto.subtle.sign(signingAlgorithm, cryptoKey, value),
  )
}

async function decryptText(text: string, key: ArrayBufferView) {
  const parts = text.split('.')[1].split('|')
  const [iv, cipherText, mac] = parts.map((part) => Buffer.from(part, 'base64'))
  const clear = await aesDecrypt(cipherText, iv, key)
  return new TextDecoder().decode(clear)
}

async function encryptText(text: string, key: ArrayBufferView) {
  const { iv, encryptedData } = await aesEncrypt(Buffer.from(text), key)
  const outputs = [iv, encryptedData].map((part) =>
    Buffer.from(part).toString('base64'),
  )
  return `2.${outputs.join('|')}`
}

async function aesDecrypt(
  data: ArrayBufferView,
  iv: ArrayBufferView,
  key: ArrayBufferView,
) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  )
  return await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data)
}

async function aesEncrypt(data: ArrayBufferView, key: ArrayBufferView) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  )
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    data,
  )
  return { iv, encryptedData: new Uint8Array(encryptedData) }
}

function generateSalt(length = 16) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return stringToUint8Array(uint8ArrayToString(array, 'base64'))
}

function stringToUint8Array(
  text: string,
  encoding: BufferEncoding | undefined = undefined,
) {
  return new Uint8Array(Buffer.from(text, encoding))
}

function uint8ArrayToString(
  buffer: Uint8Array,
  encoding: BufferEncoding | undefined = undefined,
) {
  return Buffer.from(buffer).toString(encoding)
}
