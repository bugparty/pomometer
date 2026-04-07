import { test, expect } from '@playwright/test';

// Verify that timer durations and ticking sound settings persist across reloads
// and that the Reset button restores default values.
test('user can update timer settings and reset to defaults', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const introClose = page.getByRole('button', { name: 'Close introduction' });
  if (await introClose.isVisible()) {
    await introClose.click();
  }

  const settingsButton = page.getByTestId('settings-button');
  await settingsButton.click();

  await page.getByTestId('settings-pomodoro-input').fill('35');
  await page.getByTestId('settings-short-break-input').fill('6');
  await page.getByTestId('settings-long-break-input').fill('16');

  const tickingSound = page.getByTestId('settings-ticking-sound-checkbox');
  const restTickingSound = page.getByTestId('settings-rest-ticking-sound-checkbox');

  await tickingSound.click();
  await restTickingSound.click();

  await page.getByTestId('settings-save-button').click();

  await page.reload({ waitUntil: 'domcontentloaded' });

  const introCloseReload = page.getByRole('button', { name: 'Close introduction' });
  if (await introCloseReload.isVisible()) {
    await introCloseReload.click();
  }

  await page.getByTestId('settings-button').click();

  await expect(page.getByTestId('settings-pomodoro-input')).toHaveValue('35');
  await expect(page.getByTestId('settings-short-break-input')).toHaveValue('6');
  await expect(page.getByTestId('settings-long-break-input')).toHaveValue('16');
  await expect(page.getByTestId('settings-ticking-sound-checkbox')).not.toBeChecked();
  await expect(page.getByTestId('settings-rest-ticking-sound-checkbox')).toBeChecked();

  await page.getByTestId('settings-reset-button').click();

  await page.reload({ waitUntil: 'domcontentloaded' });

  const introCloseAfterReset = page.getByRole('button', { name: 'Close introduction' });
  if (await introCloseAfterReset.isVisible()) {
    await introCloseAfterReset.click();
  }

  await page.getByTestId('settings-button').click();

  await expect(page.getByTestId('settings-pomodoro-input')).toHaveValue('25');
  await expect(page.getByTestId('settings-short-break-input')).toHaveValue('5');
  await expect(page.getByTestId('settings-long-break-input')).toHaveValue('15');
  await expect(page.getByTestId('settings-ticking-sound-checkbox')).toBeChecked();
  await expect(page.getByTestId('settings-rest-ticking-sound-checkbox')).not.toBeChecked();
});
