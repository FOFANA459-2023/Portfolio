import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end, run against the production build rather than the dev server.
 *
 * That distinction matters: the dev server serves unminified modules through
 * Vite's transform pipeline, so it can pass while the thing users are actually
 * given is broken. `npm run preview` serves `dist/`, which is the artefact the
 * deploy uploads.
 *
 * Desktop and mobile both run, because the layout genuinely differs between
 * them: columns collapse, the nav becomes a sheet, and labels drop out of the
 * project index.
 */
const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // A test marked `.only` that reaches main would silently stop running the
  // rest of the suite, so CI refuses the build instead.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
