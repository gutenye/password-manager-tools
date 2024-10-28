const validHosts = ['localhost']

export function extractHost(rawUri: string) {
  const uri = rawUri.trim()
  let protocol = 'https'
  let rest = uri
  const protocolMatch = uri.match(/^([a-z_-]+):\/\/(.*)/)
  if (protocolMatch) {
    if (!['https', 'http'].includes(protocolMatch[1])) {
      return
    }
    protocol = protocolMatch[1]
    rest = protocolMatch[2]
  }
  const host = rest.split('/')[0]
  if (!(host.includes('.') || validHosts.includes(host))) {
    return
  }
  return `${protocol}://${host}`
}
