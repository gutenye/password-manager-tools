import type { Fixtures } from '#/src/__tests__/fixtures'

declare global {
  interface GlobalThis {
    __TEST__: {
      fixtures: Fixtures
    }
  }
}
