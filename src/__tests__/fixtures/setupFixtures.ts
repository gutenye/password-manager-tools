import { afterEach, beforeAll, mock } from 'bun:test'
import memfs from 'memfs'
import { getFixtures } from './getFixtures'

export function setupFixtures() {
  beforeAll(async () => {
    globalThis.__TEST__ = globalThis.__TEST__ || {}
    globalThis.__TEST__.fixtures = await getFixtures()
    mock.module('node:fs/promises', () => ({ default: memfs.fs.promises }))
  })

  afterEach(() => {
    memfs.vol.reset()
  })
}
