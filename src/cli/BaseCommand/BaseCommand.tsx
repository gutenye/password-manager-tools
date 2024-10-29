import React from 'react'
import { useBaseCommand } from './useBaseCommand'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function BaseCommand(props: any) {
  const { inputElement, loggerElement, reportElement } = useBaseCommand(props)

  return (
    <>
      {loggerElement}
      {inputElement}
      {reportElement}
    </>
  )
}
