import { defineConfig, devices } from '@playwright/test'

/**
 * The offline check runs against the built app, because the service worker only exists
 * there. Kept separate from playwright.config.ts so the fast tests do not need a build.
 */
export default defineConfig({
  testDir: './tests/offline',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4179', trace: 'on-first-retry' },
  projects: [{ name: 'mobile', use: { ...devices['iPhone 12 Mini'], browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4179 --strictPort',
    url: 'http://localhost:4179',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
