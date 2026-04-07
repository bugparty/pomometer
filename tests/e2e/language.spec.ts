import { test, expect } from '@playwright/test';

// Verify that language changes through settings are reflected on the navbar
// even after multiple consecutive switches.
test('user can switch languages via settings', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const introClose = page.getByRole('button', { name: 'Close introduction' });
  if (await introClose.isVisible()) {
    await introClose.click();
  }

  const steps = [
    { value: 'zh-CN', text: '设置' },
    { value: 'de-DE', text: 'Einstellungen' },
    { value: 'en-US', text: 'Settings' },
  ];

  let currentText = 'Settings';

  for (const { value, text } of steps) {
    const settingsButton = page.getByTestId('settings-button');
    await expect(settingsButton).toHaveText(currentText);
    await settingsButton.click();

    const languageSelect = page.getByTestId('settings-language-select');
    await expect(languageSelect).toBeVisible();
    await languageSelect.selectOption(value);

    const closeButton = page.getByTestId('settings-close-button');
    await closeButton.click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('settings-button')).toHaveText(text);

    currentText = text;
  }
});
