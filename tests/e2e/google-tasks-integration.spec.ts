import { test, expect } from '@playwright/test';
import { applyGoogleIntegrationSession } from './helpers/google-integration-auth';

/**
 * Real Google Tasks sync — local only. Does not mock `/api/todos/google-sync`.
 *
 * Prereqs:
 * 1. `pnpm sync-google-env-from-d1 -- your@email.com` → `.env.google.synced.local`
 * 2. `.env.local`: `JWT_SECRET`, `E2E_GOOGLE_INTEGRATION_SEED_SECRET`, Cloudflare D1 vars (same DB as sync script)
 * 3. Run: `pnpm test:e2e:google-integration`
 */

test.describe('Google Tasks (real API)', () => {
  test.beforeEach(() => {
    test.skip(
      process.env.E2E_GOOGLE_INTEGRATION !== '1',
      'Set E2E_GOOGLE_INTEGRATION=1 and use pnpm test:e2e:google-integration',
    );
  });

  /**
   * Seed runs here (not in globalSetup): globalSetup runs before webServer is ready in some setups,
   * and the Next child process must receive E2E_* / POMO_* via webServer.env (see playwright.config.ts).
   */
  test.beforeAll(async ({ request }) => {
    if (process.env.E2E_GOOGLE_INTEGRATION !== '1') return;

    const secret = process.env.E2E_GOOGLE_INTEGRATION_SEED_SECRET;
    if (!secret) {
      throw new Error(
        'E2E_GOOGLE_INTEGRATION_SEED_SECRET is required in .env.local when E2E_GOOGLE_INTEGRATION=1',
      );
    }

    const res = await request.post('/api/e2e/google-integration-seed', {
      headers: { 'x-e2e-google-seed-secret': secret },
    });
    const text = await res.text();
    if (!res.ok()) {
      throw new Error(`google-integration-seed failed: ${res.status()} ${text}`);
    }
  });

  test('manual sync returns success from real google-sync', async ({ page }) => {
    await applyGoogleIntegrationSession(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('google-tasks-manual-sync')).toBeVisible({ timeout: 15_000 });

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/todos/google-sync') &&
          r.request().method() === 'POST',
        { timeout: 120_000 },
      ),
      page.getByTestId('google-tasks-manual-sync').click(),
    ]);
    expect(response.status(), 'google-sync HTTP status').toBe(200);
    const body = (await response.json()) as { success?: boolean };
    expect(body.success, 'google-sync JSON success').toBe(true);
  });
});
