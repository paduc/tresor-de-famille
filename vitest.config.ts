import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,spec,integration}.?(c|m)[jt]s?(x)'],
  },
})
