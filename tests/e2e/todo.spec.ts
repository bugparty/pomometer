import { test, expect } from '@playwright/test';

test('user can add, complete and delete a todo', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');

  // Add a new todo
  const input = page.getByTestId('todo-input');
  await expect(input).toBeVisible();
  await input.fill('e2e todo');

  const addButton = page.getByTestId('add-todo-button');
  await expect(addButton).toBeVisible();
  await addButton.click();
  
  // Wait for todo to be processed and page to update
  await page.waitForTimeout(2000);
  
  // Find the todo row by text
  const todoRow = page.getByTestId('todo-item').filter({ hasText: 'e2e todo' });
  await expect(todoRow).toBeVisible({ timeout: 10000 });

  // Mark todo as completed
  const todoCheckbox = todoRow.getByTestId('todo-checkbox');
  await expect(todoCheckbox).toBeVisible();
  await todoCheckbox.click();
  await expect(todoRow).toHaveClass(/completed/);

  // Delete the todo
  const deleteButton = todoRow.getByTestId('todo-delete-button');
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // Confirm deletion in modal
  const confirmButton = page.getByTestId('confirm-delete-todo');
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  // Wait a moment for deletion to process
  await page.waitForTimeout(500);

  // Verify todo is deleted
  await expect(page.getByTestId('todo-text').filter({ hasText: 'e2e todo' })).toHaveCount(0);
});
