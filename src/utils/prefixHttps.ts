export function prefixHttps(uri: string) {
  return uri.startsWith('http') ? uri : `https://${uri}`
}
