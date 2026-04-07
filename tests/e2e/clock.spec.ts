import { test, expect } from '@playwright/test';

// Ensure clock modes switch correctly and reset returns timer to zero

/*
 Steps:
 1. Start Pomodoro and verify countdown begins.
 2. Switch to Short Rest and Long Rest, checking time changes accordingly.
 3. Reset timer and verify it shows 00:00:00.
*/

test('clock mode switches and reset', async ({ page }) => {
  await page.addInitScript(({ clockState }) => {
    window.localStorage.setItem('state', JSON.stringify({ clock: clockState }));
  }, {
    clockState: {
      mode: 'POMODORO',
      status: 'RESET',
      timeInterval: 3,
      timeLeft: 3,
      playingTick: false,
      playingAlarm: false,
      short_break_duration: 2,
      long_break_duration: 4,
      pomodoro_duration: 3,
      ticking_sound_enabled: true,
      rest_ticking_sound_enabled: false,
      startedAt: null,
      stoppedAt: null,
      baseTime: 0,
      language: 'en-US',
    },
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const introClose = page.getByRole('button', { name: 'Close introduction' });
  if (await introClose.isVisible()) {
    await introClose.click();
  }

  const clock = page.locator('#clock');

  const pomodoroButton = page.getByTestId('pomodoro-button');
  await pomodoroButton.click();
  const pomodoroStart = await clock.textContent();
  await page.waitForTimeout(1000);
  const pomodoroAfter = await clock.textContent();
  expect(pomodoroAfter).not.toBe(pomodoroStart);

  const pomodoroSeconds = parseInt(pomodoroStart?.split(':')[1] ?? '0', 10);

  const shortButton = page.getByTestId('short-rest-button');
  await shortButton.click();
  await expect(clock).not.toHaveText(pomodoroAfter);
  const shortStart = await clock.textContent();
  const shortSeconds = parseInt(shortStart?.split(':')[1] ?? '0', 10);
  expect(shortSeconds).toBeLessThan(pomodoroSeconds);
  await page.waitForTimeout(1000);
  const shortAfter = await clock.textContent();
  expect(shortAfter).not.toBe(shortStart);

  const longButton = page.getByTestId('long-rest-button');
  await longButton.click();
  await expect(clock).not.toHaveText(shortAfter);
  const longStart = await clock.textContent();
  const longSeconds = parseInt(longStart?.split(':')[1] ?? '0', 10);
  expect(longSeconds).toBeGreaterThan(shortSeconds);
  await page.waitForTimeout(1000);
  const longAfter = await clock.textContent();
  expect(longAfter).not.toBe(longStart);

  const resetButton = page.getByTestId('reset-button');
  await resetButton.click();
  await expect(clock).toHaveText('00:00:00');
});

