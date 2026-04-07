import { test, expect, Page } from '@playwright/test';
import { INTRO_HIDDEN_KEY } from '../../../src/app/componments/localStorageKeys';
import { E2E_CLOCK_STATE_EN_US, signE2ETestJwt } from '../helpers/auth-fixture';

/**
 * Google Tasks 同步 UI — 仅拦截 `GET /api/user/profile`；其余走本地 `pnpm dev` + D1。
 * 首屏 `POST /api/e2e/ensure-user` 按 JWT `sub` upsert `users`（满足 todos FK）。
 * 无 storageState；由 playwright.logged-in.config.ts 的 `tasks-mock` 项目运行。
 *
 * 前置：`.env.local` 与 `pnpm dev` 相同的 `JWT_SECRET`、Cloudflare D1 变量。
 */

const jwtSecret = process.env.JWT_SECRET;

/** 仅用于 `hasGoogleTasksPermission()`（非空即可）；真实 Google 同步见 integration 用例。 */
const placeholderGoogleAccessToken = 'e2e-placeholder-google-access-token';

function syncButtonLocator(page: Page) {
  return page.getByTestId('todo-full-sync-button');
}

/** 避免与历史 D1 数据或同页重复渲染冲突，保证 locator 唯一 */
function uniqueE2ePrefix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 等待「包含指定 ADD_TODO 文本」的那次 sync 完成，避免匹配到首屏其它 pending sync */
async function waitForSyncResponseWithAddTodoText(page: Page, todoText: string) {
  await page.waitForResponse(
    async (response) => {
      if (response.request().method() !== 'POST') return false;
      if (new URL(response.url()).pathname !== '/api/todos/sync') return false;
      if (!response.ok()) return false;
      try {
        const postData = response.request().postDataJSON() as {
          operations?: { type: string; payload?: { text?: string } }[];
        };
        return (
          postData.operations?.some(
            (op) => op.type === 'ADD_TODO' && op.payload?.text === todoText,
          ) ?? false
        );
      } catch {
        return false;
      }
    },
    { timeout: 30_000 },
  );
}

/** 与页面同源 GET /api/todos，避免 waitForResponse 误匹配到较早的 GET */
async function fetchTodosViaBrowser(page: Page) {
  return page.evaluate(async () => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch('/api/todos', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!r.ok) {
      throw new Error(`GET /api/todos failed: ${r.status}`);
    }
    return r.json() as Promise<{
      success: boolean;
      data?: { todos?: { text: string; completed?: boolean }[] };
    }>;
  });
}

async function waitForSyncResponseWithToggleTodo(page: Page) {
  await page.waitForResponse(
    async (response) => {
      if (response.request().method() !== 'POST') return false;
      if (new URL(response.url()).pathname !== '/api/todos/sync') return false;
      if (!response.ok()) return false;
      try {
        const postData = response.request().postDataJSON() as {
          operations?: { type: string }[];
        };
        return postData.operations?.some((op) => op.type === 'TOGGLE_TODO') ?? false;
      } catch {
        return false;
      }
    },
    { timeout: 30_000 },
  );
}

/**
 * `todos.user_id` FK → `users.id`；JWT 用户需在 D1 中存在一行。每次 `reload` 后需再调一次（与首屏 `goto` 后相同）。
 */
async function ensureE2eUserRow(page: Page) {
  await page.evaluate(async () => {
    const t = window.localStorage.getItem('auth_token');
    if (!t) throw new Error('missing auth_token');
    const r = await fetch('/api/e2e/ensure-user', {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!r.ok) {
      throw new Error(`POST /api/e2e/ensure-user failed: ${r.status}`);
    }
  });
}

async function reloadAuthenticatedPage(page: Page) {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await ensureE2eUserRow(page);
}

async function setupProfileMockOnly(page: Page) {
  await page.route('**/api/user/profile', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id: 'e2e-login-toast-user',
          email: 'e2e-login@pomometer.test',
          name: 'E2E Login',
          picture: '',
        },
      }),
    });
  });
}

/**
 * 与 `auth-fixture` 一致：本地 JWT + persist 仅 clock；profile 走 mock；
 * `checkAuthStatus` 会命中 mock profile。
 */
async function setupAuthenticatedSession(page: Page) {
  await setupProfileMockOnly(page);
  const token = signE2ETestJwt(jwtSecret!);
  await page.addInitScript(
    ({ authToken, googleToken, clock, introHiddenKey }) => {
      window.localStorage.setItem('auth_token', authToken);
      window.localStorage.setItem('google_access_token', googleToken);
      window.localStorage.setItem('state', JSON.stringify({ clock }));
      window.localStorage.setItem(introHiddenKey, 'true');
    },
    {
      authToken: token,
      googleToken: placeholderGoogleAccessToken,
      clock: E2E_CLOCK_STATE_EN_US,
      introHiddenKey: INTRO_HIDDEN_KEY,
    },
  );
  await page.goto('/');
  await ensureE2eUserRow(page);
}

test.beforeEach(() => {
  test.skip(
    !jwtSecret,
    'JWT_SECRET required in .env / .env.local (same as pnpm dev) for /api/todos/* and JWT',
  );
});

test('should trigger full sync on login', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[GoogleTasksSyncInitializer]') || text.includes('[SyncManager]')) {
      logs.push(text);
    }
  });

  await setupAuthenticatedSession(page);

  await reloadAuthenticatedPage(page);

  await page.waitForTimeout(5000);

  const hasSyncTrigger = logs.some((log) => log.includes('Triggering initial full sync on login'));
  const hasSyncCompleted = logs.some(
    (log) => log.includes('Initial full sync completed') || log.includes('Full sync completed'),
  );

  expect(hasSyncTrigger).toBeTruthy();
  expect(hasSyncCompleted).toBeTruthy();
});

test('should show sync button and trigger manual sync', async ({ page }) => {
  await setupAuthenticatedSession(page);
  await reloadAuthenticatedPage(page);

  await page.waitForTimeout(2000);

  const syncButton = syncButtonLocator(page);

  await expect(syncButton).toBeVisible({ timeout: 10000 });

  let syncCalled = false;
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/todos/google-sync')) {
      syncCalled = true;
      return;
    }
    try {
      const pathname = new URL(url).pathname;
      if (request.method() === 'GET' && pathname === '/api/todos') {
        syncCalled = true;
      }
    } catch {
      /* ignore */
    }
  });

  await syncButton.click();

  await page.waitForTimeout(3000);

  expect(syncCalled).toBeTruthy();
});

test('should sync pending operations before fetching from server', async ({ page }) => {
  const apiCalls: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/todos/sync') && request.method() === 'POST') {
      apiCalls.push('sync-pending');
      console.log('[Test] API Call: sync pending operations');
    } else if (url.includes('/api/todos/google-sync')) {
      apiCalls.push('google-sync');
      console.log('[Test] API Call: google tasks full sync');
    } else {
      try {
        if (request.method() === 'GET' && new URL(url).pathname === '/api/todos') {
          apiCalls.push('get-todos');
          console.log('[Test] API Call: GET /api/todos');
        }
      } catch {
        /* ignore */
      }
    }
  });

  await setupAuthenticatedSession(page);
  await reloadAuthenticatedPage(page);

  await page.waitForTimeout(3000);

  const tag = uniqueE2ePrefix();
  const pendingLabel = `Test pending sync ${tag}`;

  const input = page.getByTestId('todo-input');
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(pendingLabel);

  const addButton = page.getByTestId('add-todo-button');
  await addButton.click();
  await waitForSyncResponseWithAddTodoText(page, pendingLabel);

  const pendingTodoText = page.getByTestId('todo-text').filter({ hasText: pendingLabel });
  await expect(pendingTodoText.first()).toBeVisible({ timeout: 20_000 });

  const syncButton = syncButtonLocator(page);

  const buttonText = await syncButton.textContent();
  console.log('[Test] Sync button text:', buttonText);

  /** 只统计手动点「同步」之后的请求，避免把首屏/自动拉取的 GET 算进去 */
  apiCalls.length = 0;
  await syncButton.click();

  await page.waitForTimeout(4000);

  console.log('[Test] API call order (after manual sync click):', apiCalls);

  const syncPendingIndex = apiCalls.indexOf('sync-pending');
  const getTodosIndex = apiCalls.indexOf('get-todos');
  const googleSyncIndex = apiCalls.indexOf('google-sync');

  if (syncPendingIndex !== -1 && getTodosIndex !== -1) {
    expect(syncPendingIndex).toBeLessThan(getTodosIndex);
  } else if (syncPendingIndex !== -1 && googleSyncIndex !== -1) {
    expect(syncPendingIndex).toBeLessThan(googleSyncIndex);
  }

  const getTodosBody = await fetchTodosViaBrowser(page);
  expect(getTodosBody.success).toBeTruthy();
  const todos = getTodosBody.data?.todos ?? [];
  expect(todos.some((t) => t.text === pendingLabel)).toBeTruthy();
});

test('should not overwrite user actions during sync', async ({ page }) => {
  await setupAuthenticatedSession(page);
  await reloadAuthenticatedPage(page);

  await page.waitForTimeout(3000);

  const tag = uniqueE2ePrefix();
  const protectionLabel = `Test user action protection ${tag}`;

  const input = page.getByTestId('todo-input');
  await expect(input).toBeVisible({ timeout: 10_000 });
  await input.fill(protectionLabel);
  const addButton = page.getByTestId('add-todo-button');
  await addButton.click();
  await waitForSyncResponseWithAddTodoText(page, protectionLabel);

  const todoText = page.getByTestId('todo-text').filter({ hasText: protectionLabel });
  await expect(todoText.first()).toBeVisible({ timeout: 20_000 });

  const todoRow = page.getByTestId('todo-item').filter({ hasText: protectionLabel });
  const checkbox = todoRow.getByTestId('todo-checkbox');
  await checkbox.click();

  await expect(checkbox).toBeChecked({ timeout: 2000 });
  await waitForSyncResponseWithToggleTodo(page);

  const syncButton = syncButtonLocator(page);
  await syncButton.click();

  await page.waitForTimeout(4000);

  const getTodosBody = await fetchTodosViaBrowser(page);
  expect(getTodosBody.success).toBeTruthy();
  const todos = getTodosBody.data?.todos ?? [];
  const match = todos.find((t) => t.text === protectionLabel);
  expect(match).toBeTruthy();
  expect(match?.completed).toBe(true);
});

/**
 * 每次 add 会在 ~100ms 内触发 sync，pending 队列常被清空，按钮未必出现「Sync (n)」。
 * 此处改为断言连续添加后列表中出现 3 条带同一 run tag 的任务。
 */
test('should show multiple added todos and sync button', async ({ page }) => {
  await setupAuthenticatedSession(page);
  await reloadAuthenticatedPage(page);
  await page.waitForTimeout(3000);

  const runTag = uniqueE2ePrefix();
  const input = page.getByTestId('todo-input');

  for (let i = 1; i <= 3; i++) {
    await input.fill(`Pending todo ${runTag} ${i}`);
    const addButton = page.getByTestId('add-todo-button');
    await addButton.click();
    await page.waitForTimeout(500);
  }

  await expect(page.getByTestId('todo-text').filter({ hasText: runTag })).toHaveCount(3, {
    timeout: 25_000,
  });

  const syncButton = syncButtonLocator(page);
  await expect(syncButton).toBeVisible({ timeout: 10_000 });
  const buttonText = await syncButton.textContent();
  console.log('[Test] Sync button text after multiple adds:', buttonText);
  expect(buttonText).toMatch(/Sync/i);
});

test('should not sync when offline', async ({ page, context }) => {
  await setupAuthenticatedSession(page);
  await reloadAuthenticatedPage(page);
  await page.waitForTimeout(3000);

  let syncAttempted = false;
  page.on('request', (request) => {
    try {
      const pathname = new URL(request.url()).pathname;
      if (pathname === '/api/todos/google-sync') syncAttempted = true;
      if (pathname === '/api/todos/sync' && request.method() === 'POST') syncAttempted = true;
      if (pathname === '/api/todos' && request.method() === 'GET') syncAttempted = true;
    } catch {
      /* ignore */
    }
  });

  await context.setOffline(true);

  const syncButton = syncButtonLocator(page);
  if (await syncButton.isVisible()) {
    await syncButton.click();
    await page.waitForTimeout(2000);
  }

  expect(syncAttempted).toBeFalsy();

  await context.setOffline(false);
});
