import { test, expect, type Page } from '@playwright/test';
import {
  applyE2EAuthenticatedSession,
  signE2ETestJwt,
} from './helpers/auth-fixture';

test.describe.configure({ mode: 'serial' });

const jwtSecret = process.env.JWT_SECRET;

test.describe('login success toast', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !jwtSecret,
      'JWT_SECRET required in .env / .env.local (same as pnpm dev) for /api/user/profile'
    );
    const token = signE2ETestJwt(jwtSecret!);
    await applyE2EAuthenticatedSession(page, { token });
  });

  async function gotoHomeAndCloseIntro(page: Page) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const introClose = page.getByRole('button', { name: 'Close introduction' });
    if (await introClose.isVisible()) {
      await introClose.click();
    }
  }

  function loginSuccessNotice(page: Page) {
    return page
      .locator('.ant-message-notice')
      .filter({ hasText: /Login successful/i });
  }

  test('shows exactly one login success toast', async ({ page }) => {
    await gotoHomeAndCloseIntro(page);
    const toast = loginSuccessNotice(page);
    await expect.poll(async () => toast.count(), { timeout: 15_000 }).toBe(1);
  });

  test('login success toast dismisses on content click', async ({ page }) => {
    await gotoHomeAndCloseIntro(page);
    const toast = loginSuccessNotice(page);
    await expect(toast).toBeVisible();
    await toast.locator('.ant-message-notice-content').click();
    await expect(toast).toBeHidden({ timeout: 5000 });
  });

  test('login success toast auto-hides', async ({ page }) => {
    await gotoHomeAndCloseIntro(page);
    const toast = loginSuccessNotice(page);
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 10_000 });
  });
});
