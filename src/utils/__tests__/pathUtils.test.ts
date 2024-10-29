import { describe, expect, it } from 'bun:test'
import * as pathUtils from '../pathUtils'

describe('suffix', () => {
  const fixtures = [
    ['a.js', '-1', 'a-1.js'],
    ['a/b.js', '-1', 'a/b-1.js'],
    ['./a.js', '-1', 'a-1.js'],
    ['./a/b.js', '-1', 'a/b-1.js'],
    ['/a.js', '-1', '/a-1.js'],
    ['/a/b.js', '-1', '/a/b-1.js'],
  ]
  for (const [input, suffix, expected] of fixtures) {
    it(input, () => {
      expect(pathUtils.suffix(input, suffix)).toEqual(expected)
    })
  }
})
