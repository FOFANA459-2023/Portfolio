import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * Unit and component tests.
 *
 * Kept separate from `vite.config.ts` on purpose: the app config loads the
 * Tailwind plugin, which has to scan and compile a stylesheet on every start.
 * A test run has no use for that, and paying for it on every watch rebuild is
 * the difference between a suite you run constantly and one you avoid.
 *
 * End-to-end lives in `e2e/` and belongs to Playwright, so it is excluded here
 * rather than being picked up and failed by the wrong runner.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: './coverage',
      // Only what the suite is actually responsible for. Counting the whole of
      // `src` would average a real number for the logic against a wall of
      // presentational JSX and report something meaningless.
      include: ['src/lib/**/*.ts', 'src/data/**/*.ts'],
      exclude: ['src/lib/scroll.ts', 'src/**/*.test.*'],
      // Set just under what the suite actually reaches, so the gate bites on
      // a real regression rather than on rounding.
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 90,
        lines: 98,
      },
    },
  },
})
