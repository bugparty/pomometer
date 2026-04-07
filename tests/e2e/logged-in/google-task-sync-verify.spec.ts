import { test, expect } from '@playwright/test';
import {
  waitForTaskCompletionsInPomometerList,
  waitForTaskTitleInPomometerList,
} from '../helpers/googleTasksApiVerify';

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

test('complete todo should also complete subtodo in app and Google', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const closeIntro = page.getByRole('button', { name: /close introduction|关闭/i });
  if (await closeIntro.isVisible().catch(() => false)) {
    await closeIntro.click();
  }

  await expect(page.getByRole('button', { name: /logout|登出/i })).toBeVisible({ timeout: 30_000 });

  const accessToken = await page.evaluate(() => localStorage.getItem('google_access_token'));
  test.skip(!accessToken, 'No google_access_token — sign in with Google (OAuth) first');

  const unique = `E2E-GAPI-CASCADE-${Date.now()}`;
  const todoText = `${unique}-todo`;
  const subTodoText = `${unique}-subtodo`;

  await page.getByTestId('todo-input').fill(todoText);
  await page.getByTestId('add-todo-button').click();

  const parentTodo = page.getByTestId('todo-item').filter({ hasText: todoText });
  await expect(parentTodo).toBeVisible({ timeout: 20_000 });
  await parentTodo.getByTestId('todo-text').click();

  await parentTodo.getByTestId('add-subtodo-button').click();
  await page.getByTestId('subtodo-input').fill(subTodoText);
  await page.keyboard.press('Enter');

  const subTodo = page.getByTestId('subtodo-item').filter({ hasText: subTodoText });
  const subTodoCheckbox = subTodo.getByTestId('subtodo-checkbox');
  await expect(subTodo).toBeVisible({ timeout: 20_000 });
  await expect(subTodoCheckbox).toBeVisible();

  const parentCheckbox = parentTodo.getByTestId('todo-checkbox');
  await parentCheckbox.click();

  await expect(parentTodo).toHaveClass(/completed/, { timeout: 10_000 });
  await expect(subTodo).toHaveClass(/completed/, { timeout: 10_000 });
  await expect(subTodoCheckbox).toBeChecked({ timeout: 10_000 });

  const fullSync = page.getByTestId('todo-full-sync-button');
  await expect(fullSync).toBeVisible({ timeout: 15_000 });
  await fullSync.click();

  const seen = await waitForTaskCompletionsInPomometerList(accessToken!, [todoText, subTodoText], {
    timeoutMs: 120_000,
    pollIntervalMs: 2_500,
  });

  expect(
    seen,
    `Expected "${todoText}" and "${subTodoText}" to appear as completed in Google list "${'AA Pomometer'}"`,
  ).toBe(true);
});
});
