import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv({ path: resolve(__dirname, '.env.local') });
loadEnv({ path: resolve(__dirname, '.env') });

/** Must match tests/e2e/manual-auth.setup.ts MANUAL_AUTH_STORAGE */
const AUTH_FILE = resolve(__dirname, 'tests/e2e/.auth/user.json');

/**
 * Use system browser for manual Google login — bundled Chromium is often blocked by Google.
 *   PowerShell: $env:PLAYWRIGHT_MANUAL_AUTH_CHANNEL='chrome'; pnpm test:e2e:logged-in
 *   Or: 'msedge' if you use Edge. Unset / empty = Playwright Chromium (more likely blocked).
 *
 * Google Cloud: redirect URI must match dev origin exactly, e.g. http://localhost:3000/auth/google/callback
 * If OAuth consent is "Testing", add your Google account under Test users.
 */
const manualAuthChannel = process.env.PLAYWRIGHT_MANUAL_AUTH_CHANNEL as
  | 'chrome'
  | 'msedge'
  | undefined;
const manualAuthBrowserOptions =
  manualAuthChannel === 'chrome' || manualAuthChannel === 'msedge'
    ? { channel: manualAuthChannel as 'chrome' | 'msedge' }
    : {};

/** Skip opening the browser for login; use existing tests/e2e/.auth/user.json */
const reuseSavedAuth =
  process.env.E2E_REUSE_AUTH === '1' && existsSync(AUTH_FILE);

/**
 * Projects:
 * - `tasks-mock` — `logged-in/google-tasks-sync-mock.spec.ts` (localStorage + route mocks, no storageState)
 * - `manual-auth` — save real login to tests/e2e/.auth/user.json
 * - `logged-in` — specs under logged-in/ with storageState (ignores the mock file)
 *
 * Order: tasks-mock → manual-auth → logged-in (or tasks-mock → logged-in when E2E_REUSE_AUTH=1).
 *
 * Run: pnpm test:e2e:logged-in | pnpm test:e2e:tasks-mock
 * Reuse: E2E_REUSE_AUTH=1 pnpm test:e2e:logged-in
 */
const TASKS_MOCK_SPEC = '**/logged-in/google-tasks-sync-mock.spec.ts';

const tasksMockProject = {
  name: 'tasks-mock',
  testMatch: TASKS_MOCK_SPEC,
} as const;

const loggedInProject = {
  name: 'logged-in',
  testDir: './tests/e2e/logged-in',
  testIgnore: /google-tasks-sync-mock\.spec\.ts$/,
  use: { storageState: AUTH_FILE },
} as const;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    },
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    /** Prefer reusing an already-running dev server (e.g. port 3000 busy). Set PLAYWRIGHT_FORCE_NEW_SERVER=1 to always spawn `pnpm dev`. */
    reuseExistingServer: process.env.PLAYWRIGHT_FORCE_NEW_SERVER !== '1',
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_E2E_TOAST_SECONDS: '4',
    },
  },
  projects: reuseSavedAuth
    ? [
        tasksMockProject,
        {
          ...loggedInProject,
          dependencies: ['tasks-mock'],
        },
      ]
    : [
        tasksMockProject,
        {
          name: 'manual-auth',
          testMatch: /manual-auth\.setup\.ts$/,
          dependencies: ['tasks-mock'],
          use: {
            headless: false,
            ...manualAuthBrowserOptions,
            launchOptions: {
              ignoreDefaultArgs: ['--enable-automation'],
              args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
              ],
            },
          },
        },
        {
          ...loggedInProject,
          dependencies: ['manual-auth'],
        },
      ],
});
