import { Page } from '@playwright/test';

/**
 * Google Tasks Mock 辅助工具
 *
 * 提供可复用的Mock函数和测试工具
 */

export interface MockTodo {
  id: string;
  text: string;
  completed: boolean;
  deleted: boolean;
  focus: boolean;
  created_date: string;
  updated_date: string;
  subItems: MockSubTodo[];
  google_task_id?: string;
  googleTaskId?: string;
}

export interface MockSubTodo {
  id: string;
  todo_id: string;
  text: string;
  completed: boolean;
  deleted: boolean;
  focus: boolean;
  created_date: string;
  updated_date: string;
  google_task_id?: string;
  googleTaskId?: string;
}

export interface MockConfig {
  authToken?: string;
  googleAccessToken?: string;
  mockTodos?: MockTodo[];
  syncDelay?: number; // 模拟网络延迟（毫秒）
  shouldFailAuth?: boolean; // 是否模拟认证失败
  shouldFailSync?: boolean; // 是否模拟同步失败
}

/**
 * 默认Mock配置
 */
export const defaultMockConfig: Required<MockConfig> = {
  authToken: 'mock-auth-token-12345',
  googleAccessToken: 'mock-google-access-token-67890',
  mockTodos: [
    {
      id: 'mock-todo-1',
      text: 'Mock Todo from Google Tasks',
      completed: false,
      deleted: false,
      focus: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      subItems: []
    }
  ],
  syncDelay: 0,
  shouldFailAuth: false,
  shouldFailSync: false
};

/**
 * 创建Mock Todo
 */
export function createMockTodo(overrides?: Partial<MockTodo>): MockTodo {
  return {
    id: `mock-todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: 'Mock Todo',
    completed: false,
    deleted: false,
    focus: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    subItems: [],
    ...overrides
  };
}

/**
 * 创建Mock SubTodo
 */
export function createMockSubTodo(todoId: string, overrides?: Partial<MockSubTodo>): MockSubTodo {
  return {
    id: `mock-subtodo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    todo_id: todoId,
    text: 'Mock SubTodo',
    completed: false,
    deleted: false,
    focus: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...overrides
  };
}

/**
 * 设置认证状态
 */
export async function setupAuth(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  await page.evaluate(({ authToken, googleToken }) => {
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('google_access_token', googleToken);
  }, {
    authToken: finalConfig.authToken,
    googleToken: finalConfig.googleAccessToken
  });
}

/**
 * 设置完整的Mock环境（认证 + API）
 */
export async function setupMockEnvironment(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  // 设置认证
  await setupAuth(page, finalConfig);

  // 设置API Mocks
  await setupApiMocks(page, finalConfig);
}

/**
 * 设置所有API Mocks
 */
export async function setupApiMocks(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  // Mock: POST /api/todos/sync
  await mockSyncPendingOperations(page, finalConfig);

  // Mock: POST /api/todos/google-sync
  await mockGoogleTasksSync(page, finalConfig);

  // Mock: GET /api/todos
  await mockGetTodos(page, finalConfig);

  // Mock: POST /api/todos
  await mockAddTodo(page, finalConfig);

  // Mock: PATCH /api/todos/:id
  await mockUpdateTodo(page, finalConfig);

  // Mock: DELETE /api/todos/:id
  await mockDeleteTodo(page, finalConfig);
}

/**
 * Mock: POST /api/todos/sync - 同步pending操作
 */
export async function mockSyncPendingOperations(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  await page.route('**/api/todos/sync', async (route) => {
    console.log('[Mock] Intercepted POST /api/todos/sync');

    // 模拟网络延迟
    if (finalConfig.syncDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, finalConfig.syncDelay));
    }

    // 模拟同步失败
    if (finalConfig.shouldFailSync) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Sync failed'
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          conflicts: [],
          serverOperations: [],
          lastSyncTime: new Date().toISOString()
        }
      })
    });
  });
}

/**
 * Mock: POST /api/todos/google-sync - Google Tasks全量同步
 */
export async function mockGoogleTasksSync(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  await page.route('**/api/todos/google-sync', async (route) => {
    console.log('[Mock] Intercepted POST /api/todos/google-sync');

    // 模拟网络延迟
    if (finalConfig.syncDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, finalConfig.syncDelay));
    }

    // 模拟认证失败
    if (finalConfig.shouldFailAuth) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized'
        })
      });
      return;
    }

    // 模拟同步失败
    if (finalConfig.shouldFailSync) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Google Tasks sync failed'
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          todos: finalConfig.mockTodos,
          lastSyncTime: new Date().toISOString()
        }
      })
    });
  });
}

/**
 * Mock: GET /api/todos - 获取todos列表
 */
export async function mockGetTodos(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  await page.route('**/api/todos', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }

    console.log('[Mock] Intercepted GET /api/todos');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          todos: finalConfig.mockTodos,
          lastSyncTime: new Date().toISOString()
        }
      })
    });
  });
}

/**
 * Mock: POST /api/todos - 添加新todo
 */
export async function mockAddTodo(page: Page, config: MockConfig = {}) {
  const finalConfig = { ...defaultMockConfig, ...config };

  await page.route('**/api/todos', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }

    console.log('[Mock] Intercepted POST /api/todos');
    const postData = route.request().postDataJSON();

    const newTodo = createMockTodo({
      id: postData.id,
      text: postData.text,
      created_date: postData.createdDate
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: newTodo
      })
    });
  });
}

/**
 * Mock: PATCH /api/todos/:id - 更新todo
 */
export async function mockUpdateTodo(page: Page, config: MockConfig = {}) {
  await page.route('**/api/todos/*', async (route) => {
    if (route.request().method() !== 'PATCH') {
      return route.continue();
    }

    console.log('[Mock] Intercepted PATCH /api/todos/:id');
    const patchData = route.request().postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: patchData.id,
          ...patchData
        }
      })
    });
  });
}

/**
 * Mock: DELETE /api/todos/:id - 删除todo
 */
export async function mockDeleteTodo(page: Page, config: MockConfig = {}) {
  await page.route('**/api/todos/*', async (route) => {
    if (route.request().method() !== 'DELETE') {
      return route.continue();
    }

    console.log('[Mock] Intercepted DELETE /api/todos/:id');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { deleted: true }
      })
    });
  });
}

/**
 * 监听同步相关的控制台日志
 */
export function createSyncLogCollector(page: Page): {
  logs: string[];
  hasLog: (pattern: string | RegExp) => boolean;
  clear: () => void;
} {
  const logs: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    if (
      text.includes('[SyncManager]') ||
      text.includes('[GoogleTasksSyncManager]') ||
      text.includes('[GoogleTasksSyncInitializer]') ||
      text.includes('[TodoSyncActions]')
    ) {
      logs.push(text);
    }
  });

  return {
    logs,
    hasLog: (pattern: string | RegExp) => {
      if (typeof pattern === 'string') {
        return logs.some(log => log.includes(pattern));
      }
      return logs.some(log => pattern.test(log));
    },
    clear: () => {
      logs.length = 0;
    }
  };
}

/**
 * 监听API调用顺序
 */
export function createApiCallTracker(page: Page): {
  calls: Array<{ url: string; method: string; timestamp: number }>;
  hasCall: (urlPattern: string | RegExp) => boolean;
  getCallOrder: (urls: string[]) => number[];
  clear: () => void;
} {
  const calls: Array<{ url: string; method: string; timestamp: number }> = [];

  page.on('request', request => {
    calls.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now()
    });
  });

  return {
    calls,
    hasCall: (urlPattern: string | RegExp) => {
      if (typeof urlPattern === 'string') {
        return calls.some(call => call.url.includes(urlPattern));
      }
      return calls.some(call => urlPattern.test(call.url));
    },
    getCallOrder: (urls: string[]) => {
      return urls.map(url => {
        const index = calls.findIndex(call => call.url.includes(url));
        return index;
      });
    },
    clear: () => {
      calls.length = 0;
    }
  };
}

/**
 * 等待同步完成
 */
export async function waitForSyncComplete(page: Page, timeoutMs: number = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const isSyncing = await page.evaluate(() => {
      // 检查同步按钮是否仍在同步中
      const button = document.querySelector('button:has-text("同步中")');
      return button !== null;
    });

    if (!isSyncing) {
      return true;
    }

    await page.waitForTimeout(500);
  }

  return false;
}

/**
 * 获取Pending操作数量
 */
export async function getPendingCount(page: Page): Promise<number> {
  const buttonText = await page.locator('button:has-text("同步")').first().textContent();
  if (!buttonText) return 0;

  const match = buttonText.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}
