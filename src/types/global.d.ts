import type { Fixtures } from '#/src/__tests__/fixtures'

declare global {
  interface GlobalThis {
    a: string
    __TEST__: {
      fixtures: Fixtures
    }
  }
}
