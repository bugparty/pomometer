import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(__dirname, '.env.local') });
loadEnv({ path: resolve(__dirname, '.env') });

const googleIntegrationE2E = process.env.E2E_GOOGLE_INTEGRATION === '1';
if (googleIntegrationE2E) {
  loadEnv({ path: resolve(__dirname, '.env.google.synced.local') });
}

/** Ensure the Next dev child process sees the same POMO_* / E2E_* vars as the Playwright process (globalSetup cannot rely on this). */
function webServerEnvForGoogleIntegration(): NodeJS.ProcessEnv {
  if (!googleIntegrationE2E) return {};
  return {
    E2E_GOOGLE_INTEGRATION: '1',
    E2E_GOOGLE_INTEGRATION_SEED_SECRET: process.env.E2E_GOOGLE_INTEGRATION_SEED_SECRET ?? '',
    POMO_SYNCED_USER_ID: process.env.POMO_SYNCED_USER_ID ?? '',
    POMO_SYNCED_USER_EMAIL: process.env.POMO_SYNCED_USER_EMAIL ?? '',
    POMO_SYNCED_GOOGLE_ACCESS_TOKEN: process.env.POMO_SYNCED_GOOGLE_ACCESS_TOKEN ?? '',
    POMO_SYNCED_GOOGLE_REFRESH_TOKEN: process.env.POMO_SYNCED_GOOGLE_REFRESH_TOKEN ?? '',
    POMO_SYNCED_GOOGLE_TOKEN_EXPIRY: process.env.POMO_SYNCED_GOOGLE_TOKEN_EXPIRY ?? '',
  };
}

export default defineConfig({
  testDir: './tests/e2e',
  /** Manual login + logged-in-only specs live in playwright.logged-in.config.ts */
  testIgnore: ['**/manual-auth.setup.ts', '**/logged-in/**'],
  timeout: googleIntegrationE2E ? 120_000 : 60_000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    /** Prefer reusing an already-running dev server. Set PLAYWRIGHT_FORCE_NEW_SERVER=1 to always spawn `pnpm dev`. */
    reuseExistingServer: process.env.PLAYWRIGHT_FORCE_NEW_SERVER !== '1',
    timeout: 120000,
    env: {
      ...process.env,
      ...webServerEnvForGoogleIntegration(),
      // Client bundle reads this so login-toast auto-dismiss E2E can finish without waiting 180s (dev default)
      NEXT_PUBLIC_E2E_TOAST_SECONDS: '4',
    },
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
