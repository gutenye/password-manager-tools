import { Box, Static, Text } from 'ink'
import React from 'react'
import type { Props } from './types'
import { useConvert } from './useConvert'

export * from './options'

export default function Convert(props: Props) {
  const { result, inputElement } = useConvert(props)

  return (
    <>
      {result instanceof Error ? <Text color="red">Error: {result.message}</Text> : <Text>{result || 'loading'}</Text>}
      {inputElement}
    </>
  )
}
