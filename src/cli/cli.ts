#!/usr/bin/env bun

import Pastel from 'pastel'

const app = new Pastel({
  importMeta: import.meta,
})

await app.run()
