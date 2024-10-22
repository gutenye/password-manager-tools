import { expect, it } from 'bun:test'
import { omitByDeep } from '../omitByDeep'

it('works', () => {
  const input = {
    a: {
      b: 1,
      __omit__: 1,
    },
    a2: [
      {
        b2: 1,
        __omit__: 1,
      },
    ],
    __omit__: 1,
  }
  const output = {
    a: {
      b: 1,
    },
    a2: [{ b2: 1 }],
  }
  const received = omitByDeep(input, (value, key) => key === '__omit__')
  expect(received).toEqual(output)
})
