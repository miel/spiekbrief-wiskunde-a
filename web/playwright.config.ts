import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5179',
    trace: 'on-first-retry',
  },
  projects: [
    // The app was designed for an iPhone 12 mini; keep that the default viewport.
    // Chromium at the 12 mini's viewport: the device preset defaults to WebKit, which we
    // do not install, and the layout is what this project is checking.
    {
      name: 'mobile',
      use: { ...devices['iPhone 12 Mini'], browserName: 'chromium' },
    },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx vite --port 5179 --strictPort',
    url: 'http://localhost:5179',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
