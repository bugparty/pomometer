import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  // CI-specific settings
  ...(process.env.CI && {
    retries: 2,
    workers: 1,
    use: {
      baseURL: 'http://localhost:3000',
      actionTimeout: 15000,
      navigationTimeout: 30000,
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
  }),
});
