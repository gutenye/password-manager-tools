import { expect, it } from 'bun:test'
import { extractHost } from '../extractHost'

const fixtures: [string, string | undefined][] = [
  // host
  ['example.com', 'https://example.com'],
  ['www.example.com:80/a', 'https://www.example.com:80'],
  ['localhost/a', 'https://localhost'],
  ['example/a', undefined],
  // protocol
  ['https://www.example.com/a', 'https://www.example.com'],
  ['http://www.example.com/a', 'http://www.example.com'],
  ['https://localhost/a', 'https://localhost'],
  ['https://example/a', undefined],
  ['ftp://example.com/a', undefined],
  ['app-extension://example.com/a', undefined],
  ['app-extension://path/a', undefined],
  // ip
  ['1.1.1.1:80/a', 'https://1.1.1.1:80'],
]

for (const [input, expected] of fixtures) {
  it(`extractHost: ${input}`, () => {
    expect<typeof expected>(extractHost(input)).toEqual(expected)
  })
}
