import { test, expect } from '@playwright/test';

test('user can focus and edit a todo', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const introClose = page.getByRole('button', { name: 'Close introduction' });
  if (await introClose.isVisible()) {
    await introClose.click();
  }

  const input = page.getByTestId('todo-input');
  await input.fill('focus edit todo');
  await page.getByTestId('add-todo-button').click();

  await page.waitForTimeout(2000);

  const todoItem = page.getByTestId('todo-item').filter({ hasText: 'focus edit todo' });
  await todoItem.getByTestId('todo-focus-button').click();
  await expect(todoItem.locator('.todo-focus-icon')).toHaveClass(/focused/);

  await todoItem.getByTestId('todo-text').click();

  const editInput = page.locator('input.add-subtask-input');
  await expect(editInput).toBeVisible();
  await editInput.fill('focus edit todo updated');
  await editInput.press('Enter');

  await expect(page.getByTestId('todo-text').filter({ hasText: 'focus edit todo updated' })).toBeVisible();
  await expect(editInput).toHaveCount(0);

  const updatedItem = page.getByTestId('todo-item').filter({ hasText: 'focus edit todo updated' });
  await updatedItem.getByTestId('todo-delete-button').click();
  await page.getByTestId('confirm-delete-todo').click();
});
