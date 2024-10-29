import { Text } from 'ink'
import pkg from '#/../package.json'

export const description = 'Show version number'

export default function () {
  return <Text>{pkg.version}</Text>
}
