import React from 'react'
import type { Props } from './types'
import { useConvert } from './useConvert'

export * from './options'

export default function Convert(props: Props) {
  const { inputElement, loggerElement, reportElement } = useConvert(props)

  return (
    <>
      {loggerElement}
      {inputElement}
      {reportElement}
    </>
  )
}