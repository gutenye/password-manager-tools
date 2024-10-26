import { Static, Text } from 'ink'
import React, { useState, useEffect } from 'react'
import type { Props } from './types'
import { useConvert } from './useConvert'

export * from './options'

export default function Convert(props: Props) {
  const { result, inputElement, loggerElement } = useConvert(props)

  return (
    <>
      {loggerElement}
      {result instanceof Error ? (
        <Text color="red">Error: {result.message}</Text>
      ) : (
        <Text>{result || 'loading'}</Text>
      )}
      {inputElement}
    </>
  )
}
