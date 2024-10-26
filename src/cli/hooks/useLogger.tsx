import { Static, Text } from 'ink'
import React, { useState, useCallback, useMemo } from 'react'

const COLORS: Record<Level, string | undefined> = {
  log: undefined,
  error: 'red',
  warn: 'yellow',
}

export function useLogger() {
  const [items, setItems] = useState<Item[]>([])

  const loggerElement = useMemo(() => <Logger items={items} />, [items])

  const addItem = useCallback((item: Item) => {
    setItems((prev) => [...prev, item])
  }, [])

  const logger = useMemo(() => {
    const createLogFn = (level: Level) => {
      return function log(...messages: any[]) {
        addItem({
          level,
          message: messages.join(' '),
        })
      }
    }
    return {
      log: createLogFn('log'),
      warn: createLogFn('warn'),
      error: createLogFn('error'),
    }
  }, [addItem])

  return {
    logger,
    loggerElement,
  }
}

function Logger({ items }: Props) {
  return (
    <Static items={items}>
      {(item, index) => <LoggerItem key={index} item={item} />}
    </Static>
  )
}

function LoggerItem({ item }: LoggerItemProps) {
  const color = COLORS[item.level]
  return <Text color={color}>{item.message}</Text>
}

export type Logger = ReturnType<typeof useLogger>['logger']

type Props = { items: Item[] }

type LoggerItemProps = {
  item: Item
}

type Item = {
  level: Level
  message: string
}

type Level = 'log' | 'warn' | 'error'
