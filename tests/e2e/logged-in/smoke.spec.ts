import { test, expect } from '@playwright/test';

/**
 * Runs after manual-auth.setup.ts (see playwright.logged-in.config.ts).
 * Uses saved storage from real browser login.
 */
test('logged-in: Logout visible; optional Google manual sync', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const closeIntro = page.getByRole('button', { name: /close introduction|关闭/i });
  if (await closeIntro.isVisible().catch(() => false)) {
    await closeIntro.click();
  }

  await expect(page.getByRole('button', { name: /logout|登出/i })).toBeVisible({
    timeout: 30_000,
  });

  const manualSync = page.getByTestId('google-tasks-manual-sync');
  if ((await manualSync.count()) > 0) {
    await expect(manualSync).toBeVisible({ timeout: 10_000 });
  }
});
