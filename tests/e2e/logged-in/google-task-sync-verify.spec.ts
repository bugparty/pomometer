import { test, expect } from '@playwright/test';
import { waitForTaskTitleInPomometerList } from '../helpers/googleTasksApiVerify';

/**
 * Real Google Tasks API verification — requires manual-auth storage with valid
 * `google_access_token` (Tasks scope). Run: pnpm test:e2e:logged-in (or :reuse).
 */
test.describe('Google Tasks sync (API verify)', () => {
  test.setTimeout(180_000);

  test('add todo, full sync, then task appears in Google Tasks (AA Pomometer list)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const closeIntro = page.getByRole('button', { name: /close introduction|关闭/i });
    if (await closeIntro.isVisible().catch(() => false)) {
      await closeIntro.click();
    }

    await expect(page.getByRole('button', { name: /logout|登出/i })).toBeVisible({ timeout: 30_000 });

    const accessToken = await page.evaluate(() => localStorage.getItem('google_access_token'));
    test.skip(!accessToken, 'No google_access_token — sign in with Google (OAuth) first');

    const unique = `E2E-GAPI-${Date.now()}`;

    await page.getByTestId('todo-input').fill(unique);
    await page.getByTestId('add-todo-button').click();

    await expect(page.getByTestId('todo-item').filter({ hasText: unique })).toBeVisible({
      timeout: 20_000,
    });

    const fullSync = page.getByTestId('todo-full-sync-button');
    await expect(fullSync).toBeVisible({ timeout: 15_000 });

    await fullSync.click();
    // triggerFullSync: pending → POST /api/todos/sync, then GET /api/todos; server may write to Google async
    await page.waitForTimeout(8_000);

    const seen = await waitForTaskTitleInPomometerList(accessToken!, unique, {
      timeoutMs: 120_000,
      pollIntervalMs: 2_500,
    });

    expect(seen, `Expected task title containing "${unique}" in Google Tasks list "${'AA Pomometer'}"`).toBe(true);
  });
});
