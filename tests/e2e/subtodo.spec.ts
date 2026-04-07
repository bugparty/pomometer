import { test, expect } from '@playwright/test';

test('user can manage sub todos using buttons', async ({ page }) => {
  await page.goto('/');

  // Add a new todo to hold subtasks
  const input = page.getByTestId('todo-input');
  await input.fill('todo with subtasks');
  await page.getByTestId('add-todo-button').click();

  const todoItem = page.getByTestId('todo-item').filter({ hasText: 'todo with subtasks' });
  const todoHeader = todoItem.getByTestId('todo-text');
  await expect(todoHeader).toBeVisible();
  await todoHeader.click();

  // Add a sub todo
  await todoItem.getByTestId('add-subtodo-button').click();
  await page.getByTestId('subtodo-input').fill('sub task 1');
  await page.keyboard.press('Enter');

  const subTodo = page.getByTestId('subtodo-item').filter({ hasText: 'sub task 1' });
  const subTodoCheckbox = subTodo.getByTestId('subtodo-checkbox');
  await expect(subTodoCheckbox).toBeVisible();

  // Edit the sub todo
  await subTodo.getByTestId('subtodo-text').click();
  await page.getByTestId('edit-subtodo-title').fill('sub task 1 edited');
  await page.getByTestId('edit-subtodo-description').fill('This is an edited sub task description');
  await page.keyboard.press('Enter');

  const editedSubItem = page.getByTestId('subtodo-item').filter({ hasText: 'sub task 1 edited' });
  const editedSubCheckbox = editedSubItem.getByTestId('subtodo-checkbox');
  await expect(editedSubCheckbox).toBeVisible();

  // Focus the sub todo
  await editedSubItem.getByTestId('subtodo-focus-button').click();
  await expect(editedSubItem.getByTestId('subtodo-focus-icon')).toHaveClass(/focused/);

  // Complete the sub todo
  await editedSubCheckbox.click();
  await expect(editedSubItem).toHaveClass(/completed/);

  // Delete the sub todo
  await editedSubItem.getByTestId('subtodo-delete-button').click();
  await expect(page.getByTestId('subtodo-item').filter({ hasText: 'sub task 1 edited' })).toHaveCount(0);

  // Clean up: delete the parent todo
  await todoItem.getByTestId('todo-delete-button').click();
  await page.getByTestId('confirm-delete-todo').click();
  await expect(page.getByTestId('todo-item').filter({ hasText: 'todo with subtasks' })).toHaveCount(0);
});

// test('checking parent todo cascades to all subtodos', async ({ page }) => {
//   await page.goto('/');

//   // Add a new parent todo
//   const input = page.getByTestId('todo-input');
//   await input.fill('cascade parent');
//   await page.getByTestId('add-todo-button').click();

//   const todoItem = page.getByTestId('todo-item').filter({ hasText: 'cascade parent' });
//   await expect(todoItem).toBeVisible();

//   // Add two subtodos
//   await todoItem.getByTestId('add-subtodo-button').click();
//   await page.getByTestId('subtodo-input').fill('sub A');
//   await page.keyboard.press('Enter');

//   await todoItem.getByTestId('add-subtodo-button').click();
//   await page.getByTestId('subtodo-input').fill('sub B');
//   await page.keyboard.press('Enter');

//   const subA = page.getByTestId('subtodo-item').filter({ hasText: 'sub A' });
//   const subB = page.getByTestId('subtodo-item').filter({ hasText: 'sub B' });
//   await expect(subA).toBeVisible();
//   await expect(subB).toBeVisible();

//   const subACheck = subA.getByTestId('subtodo-checkbox');
//   const subBCheck = subB.getByTestId('subtodo-checkbox');
//   await expect(subACheck).toBeVisible();
//   await expect(subBCheck).toBeVisible();

//   // Ensure initial state unchecked
//   await expect(await subACheck.isChecked()).toBeFalsy();
//   await expect(await subBCheck.isChecked()).toBeFalsy();

//   // Check parent todo
//   const parentCheckbox = todoItem.getByTestId('todo-checkbox');
//   await parentCheckbox.click();

//   // Both subtodos should now be checked and have completed class
//   await expect(subACheck).toBeChecked();
//   await expect(subBCheck).toBeChecked();
//   await expect(subA).toHaveClass(/completed/);
//   await expect(subB).toHaveClass(/completed/);

//   // Clean up
//   await todoItem.getByTestId('todo-delete-button').click();
//   await page.getByTestId('confirm-delete-todo').click();
// });
