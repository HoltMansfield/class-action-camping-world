import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e-tests',
  // globalSetup: './e2e-tests/global-setup.ts',
  globalTeardown: './e2e-tests/global-teardown.js',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Set number of workers: 6 locally, 3 in CI */
  workers: process.env.CI ? 3 : 6,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    /* Speed up tests by disabling animations */
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        channel: 'chrome'
      }
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        channel: 'firefox'
      }
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
        channel: 'webkit'
      }
    }
  ]
});
