import { Box, Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import React, { useState, useCallback } from 'react'

type Options = {
  label?: string
  type?: 'password'
}

export type InputFn = (options?: Options) => Promise<string>

export function useInput() {
  const [handleSubmit, setHandleSubmit] = useState(null)
  const [options, setOptions] = useState<Options>({})
  const { label, type } = options
  const mask = type === 'password' ? '*' : undefined

  const input: InputFn = useCallback(async (options = {}) => {
    setOptions(options)
    const result = await new Promise((resolve) => {
      setHandleSubmit(
        () =>
          function handleSubmit(value: string) {
            resolve(value)
            setHandleSubmit(null)
          },
      )
    })
    return result as string
  }, [])

  const inputElement = (
    <>
      {handleSubmit && (
        <Box>
          <Text>{label || 'Enter'}: </Text>
          <UncontrolledTextInput onSubmit={handleSubmit} mask={mask} />
        </Box>
      )}
    </>
  )

  return {
    input,
    inputElement,
  }
}
