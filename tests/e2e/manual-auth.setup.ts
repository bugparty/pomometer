import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Written here and read by the `logged-in` project in playwright.logged-in.config.ts */
export const MANUAL_AUTH_STORAGE = join(process.cwd(), 'tests/e2e/.auth/user.json');

/**
 * Headed browser: you sign in with Google (or any flow that ends with Logout visible).
 * When the Logout button appears, we save Playwright storageState for dependent tests.
 */
test.use({ headless: false });

test('manual login — wait for Logout, then save storage state', async ({ page }) => {
  mkdirSync(dirname(MANUAL_AUTH_STORAGE), { recursive: true });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const closeIntro = page.getByRole('button', { name: /close introduction|关闭/i });
  if (await closeIntro.isVisible().catch(() => false)) {
    await closeIntro.click();
  }

  await expect(page.getByRole('button', { name: /logout|登出/i })).toBeVisible({
    timeout: 600_000,
  });

  await page.context().storageState({ path: MANUAL_AUTH_STORAGE });
});
