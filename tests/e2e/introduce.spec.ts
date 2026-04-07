import { test, expect } from '@playwright/test';

test('introduction modal closes and stays hidden after refresh', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const introHeading = page.getByRole('heading', { name: 'Introduction of Pomodoro' });
  await expect(introHeading).toBeVisible();

  const closeButton = page.getByLabel('Close introduction');
  await expect(closeButton).toBeVisible();
  await closeButton.click();

  await expect(introHeading).not.toBeVisible();

  const stored = await page.evaluate(() => localStorage.getItem('pomometer:introHidden'));
  expect(stored).toBe('true');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(introHeading).not.toBeVisible();
});
