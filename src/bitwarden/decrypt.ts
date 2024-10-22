const { crypto } = globalThis

export async function decrypt(input: Record<string, any>, password: string) {
  const { salt, kdfIterations, data } = input
  const master = await pbkdf2(password, salt, 'sha256', Number(kdfIterations))
  const stretchedKey = await hkdfExpand(master, 'enc', 32, 'sha256')
  const stretchedMacKey = await hkdfExpand(master, 'mac', 32, 'sha256')
  const decrypted = await decryptCipherString(data, stretchedKey, stretchedMacKey)
  return JSON.parse(decrypted)
}

async function pbkdf2(password: string, salt: string, algorithm: string, iterations: number) {
  const wcLen = algorithm === 'sha256' ? 256 : 512
  const passwordBuf = toBuf(password)
  const saltBuf = toBuf(salt)

  const pbkdf2Params = {
    name: 'PBKDF2',
    salt: saltBuf,
    iterations: iterations,
    hash: { name: toWebCryptoAlgorithm(algorithm) },
  }

  const impKey = await crypto.subtle.importKey('raw', passwordBuf, { name: 'PBKDF2' }, false, ['deriveBits'])
  return await crypto.subtle.deriveBits(pbkdf2Params, impKey, wcLen)
}

function toBuf(value: string) {
  return fromUtf8ToArray(value).buffer as ArrayBuffer
}

function toWebCryptoAlgorithm(algorithm: string) {
  if (algorithm === 'md5') {
    throw new Error('MD5 is not supported in WebCrypto.')
  }
  return algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : 'SHA-512'
}

function fromUtf8ToArray(str: string) {
  const strUtf8 = unescape(encodeURIComponent(str))
  const arr = new Uint8Array(strUtf8.length)
  for (let i = 0; i < strUtf8.length; i++) {
    arr[i] = strUtf8.charCodeAt(i)
  }
  return arr
}

async function hkdfExpand(prk: ArrayBuffer, info: string, outputByteSize: number, algorithm: string) {
  const hashLen = algorithm === 'sha256' ? 32 : 64
  if (outputByteSize > 255 * hashLen) {
    throw new Error('outputByteSize is too large.')
  }
  const prkArr = new Uint8Array(prk)
  if (prkArr.length < hashLen) {
    throw new Error('prk is too small.')
  }
  const infoBuf = toBuf(info)
  const infoArr = new Uint8Array(infoBuf)
  let runningOkmLength = 0
  let previousT = new Uint8Array(0)
  const n = Math.ceil(outputByteSize / hashLen)
  const okm = new Uint8Array(n * hashLen)
  for (let i = 0; i < n; i++) {
    const t = new Uint8Array(previousT.length + infoArr.length + 1)
    t.set(previousT)
    t.set(infoArr, previousT.length)
    t.set([i + 1], t.length - 1)
    previousT = new Uint8Array(await hmac(t.buffer as ArrayBuffer, prk, algorithm))
    okm.set(previousT, runningOkmLength)
    runningOkmLength += previousT.length
    if (runningOkmLength >= outputByteSize) {
      break
    }
  }
  return okm.slice(0, outputByteSize).buffer as ArrayBuffer
}

async function hmac(value: ArrayBuffer, key: ArrayBuffer, algorithm: string) {
  const signingAlgorithm = {
    name: 'HMAC',
    hash: { name: toWebCryptoAlgorithm(algorithm) },
  }

  const impKey = await crypto.subtle.importKey('raw', key, signingAlgorithm, false, ['sign'])
  return await crypto.subtle.sign(signingAlgorithm, impKey, value)
}

async function decryptCipherString(data: string, key: ArrayBuffer, _macKey: ArrayBuffer) {
  const parts = data.split('.')[1].split('|').slice(0, 3)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [iv, cipherText, _mac] = parts.map((part) => base64ToArrayBuffer(part))

  const clear = await aesDecrypt(cipherText, iv, key)
  return new TextDecoder().decode(clear)
}

async function aesDecrypt(data: ArrayBuffer, iv: ArrayBuffer, key: ArrayBuffer) {
  const impKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt'])
  return await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, impKey, data)
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}
