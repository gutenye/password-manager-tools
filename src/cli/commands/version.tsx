import { Text } from 'ink'
import pkg from '#/../package.json'

export default function () {
  return <Text>{pkg.version}</Text>
}
