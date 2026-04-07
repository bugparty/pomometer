# Google Tasks 同步 E2E 测试

## 测试概述

`tests/e2e/logged-in/google-tasks-sync-mock.spec.ts`（Playwright 项目 `tasks-mock`，见 `playwright.logged-in.config.ts`）验证同步 UI 与本地 API：仅拦截 **`GET /api/user/profile`**，其余 `/api/todos/*` 走 **`pnpm dev`** 与 **D1**。首屏会 `POST /api/e2e/ensure-user`（仅非 production），按 JWT `sub` 在 `users` 表 upsert 一行，保证 `todos.user_id` 外键可写；使用 `signE2ETestJwt(JWT_SECRET)` 与 `auth-fixture` 的 clock persist。

### 测试场景

1. **登录时自动同步** - 验证用户登录后自动触发全量同步
2. **手动同步按钮** - 验证同步按钮显示和手动触发功能
3. **Pending操作优先** - 验证本地操作先同步再拉取服务器数据
4. **用户操作保护** - 验证用户操作不会被全量同步覆盖
5. **Pending计数显示** - 验证同步按钮显示待同步操作数量
6. **离线处理** - 验证离线时不尝试同步

## 运行测试

### 前置条件

```bash
# 安装依赖
pnpm install

# 安装 Playwright browsers
pnpm exec playwright install
```

### 运行所有同步测试

```bash
# 运行所有 Google Tasks mock 同步测试（不依赖真实登录 / storageState）
pnpm test:e2e:tasks-mock

# 等价：显式指定配置与项目
pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock

# 运行并显示浏览器（调试模式）
pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --headed

# 运行单个测试
pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock -g "should trigger full sync on login"
```

### 真实 Google Tasks 集成（本地原型）

`google-tasks-integration.spec.ts` **不 mock** `/api/todos/google-sync`，会走服务端到 Google Tasks 的真实请求（需未过期的 `google_access_token`）。

1. 拉取令牌：`pnpm sync-google-env-from-d1 -- your@email.com` → 生成 `.env.google.synced.local`（勿提交）。
2. `.env.local`：`JWT_SECRET`（与本地 `pnpm dev` 相同）、`E2E_GOOGLE_INTEGRATION_SEED_SECRET`（任意随机串）、以及 `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_DATABASE_ID` / `CLOUDFLARE_D1_TOKEN`，须与 sync 脚本读取的 **同一套** 远程 D1。
3. 运行：`pnpm test:e2e:google-integration`

测试文件里的 `test.beforeAll` 会 `POST /api/e2e/google-integration-seed`（在 **webServer 就绪之后**），在 **development** 下把环境变量里的 token 写入 D1 用户行（需 header secret）。`playwright.config.ts` 里对 `webServer.env` 显式传入了 `E2E_*` / `POMO_*`，避免子进程拿不到变量导致 403。不要在生产或 CI 中开启；勿把 seed secret 或 synced 文件提交到仓库。

若本机 **3000** 已被占用且 Playwright 复用了别的进程，Next 可能没有上述环境变量——请关掉占用端口的进程，或设 `PLAYWRIGHT_FORCE_NEW_SERVER=1` 强制由 Playwright 独占启动 `pnpm dev`。

### 调试测试

```bash
# 使用 Playwright Inspector
pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --debug

# 生成测试报告
pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock --reporter=html
pnpm exec playwright show-report
```

## 网络与数据（tasks-mock 套件）

### 仅 mock

| Endpoint | 说明 |
|----------|------|
| `GET /api/user/profile` | Playwright `route.fulfill`，避免与真实 profile 假设耦合；`JWT_SECRET` 与 `signE2ETestJwt` 仍用于真实 `/api/todos/*`。 |

### 真实 API

- `POST /api/e2e/ensure-user`：开发环境写入 `users` 行（Bearer JWT `sub`）。
- `/api/todos/sync`、`GET /api/todos` 等：走本地 Next + D1，**不**在浏览器里 mock。

### 本地存储

- `auth_token`：与 `pnpm dev` 一致密钥签出的 HS256 JWT。
- `google_access_token`：占位非空字符串，满足 `hasGoogleTasksPermission()`；真实 Google 同步见 integration 用例。

## 测试详解

### Test 1: 登录时自动同步

**验证点：**
- `[GoogleTasksSyncInitializer]` 日志包含 "Triggering initial full sync"
- `[SyncManager]` 日志包含 "Full sync completed"

**预期行为：**
1. 用户登录后2秒
2. 自动调用 `triggerFullSync()`
3. 先同步pending操作
4. 再拉取Google Tasks数据

### Test 2: 手动同步按钮

**验证点：**
- 同步按钮可见
- 点击后调用 `/api/todos/google-sync`
- 同步期间显示加载状态

**预期行为：**
1. 同步按钮显示在TodoContainer标题区域
2. 点击后触发全量同步
3. API调用成功

### Test 3: Pending操作优先

**验证点：**
- API调用顺序：`/api/todos/sync` → `/api/todos/google-sync`
- 新添加的todo存在且没有被覆盖

**预期行为：**
1. 用户添加新todo（创建pending操作）
2. 点击同步按钮
3. 先调用 `/api/todos/sync` 同步pending
4. 等待2秒
5. 再调用 `/api/todos/google-sync` 拉取数据
6. 新todo仍然存在

### Test 4: 用户操作保护

**验证点：**
- Toggle后checkbox保持选中状态
- 全量同步后状态不被覆盖

**预期行为：**
1. 用户toggle一个todo
2. 立即触发全量同步
3. Checkbox状态保持不变

### Test 5: Pending计数显示

**验证点：**
- 同步按钮文本包含数字
- 数字反映pending操作数量

**预期行为：**
1. 添加3个todos（创建3个pending操作）
2. 同步按钮显示 "同步 (3)"

### Test 6: 离线处理

**验证点：**
- 离线时不调用同步API
- 没有网络错误

**预期行为：**
1. 模拟离线状态
2. 点击同步按钮
3. 不发起任何API请求

### Test 7: 认证失败

**验证点：**
- 401错误被正确处理
- 不发生崩溃

**预期行为：**
1. Mock API返回401
2. 同步失败但应用正常运行
3. 认证状态被重置

## 常见问题

### Q: 测试超时怎么办？

**A:** 增加超时时间或检查Mock是否正确：

```typescript
// 在测试中增加超时
await page.waitForTimeout(5000); // 增加到5秒

// 或在playwright.config.ts中全局增加
timeout: 60000, // 60秒
```

### Q: 如何查看详细的日志？

**A:** 使用 `DEBUG` 环境变量：

```bash
DEBUG=pw:api pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock
```

### Q: Mock没有生效怎么办？

**A:** 检查route设置：

```typescript
// 确保route pattern正确
await page.route('**/api/todos/google-sync', async (route) => {
  console.log('[Mock] Intercepted!'); // 添加日志
  // ...
});

// 在测试中监听请求
page.on('request', req => console.log('Request:', req.url()));
```

### Q: 如何测试真实的Google Tasks API？

**A:** 使用 `google-tasks-integration.spec.ts`（`pnpm test:e2e:google-integration`）在受控环境下走真实 Google Tasks；mock 套件不通过 `REAL_API` 切换，如需在本地对 mock 文件做变体，可在该 spec 内自行分支环境变量。

## CI/CD 集成

### GitHub Actions示例

```yaml
name: E2E Tests - Google Tasks Sync

on:
  pull_request:
    paths:
      - 'src/app/componments/todo/**'
      - 'src/app/componments/sync/**'
      - 'tests/e2e/logged-in/google-tasks-sync-mock.spec.ts'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test -c playwright.logged-in.config.ts --project=tasks-mock
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 测试覆盖率

当前测试覆盖的代码模块：

- ✅ `GenericSyncManager.ts` - `triggerFullSync()`, `fetchDataFromServer()`
- ✅ `GoogleTasksSyncInitializer.tsx` - 登录时自动同步
- ✅ `SyncButton.tsx` - 手动同步按钮
- ✅ `todoSyncManager.ts` - 统一同步接口
- ✅ `GoogleTasksSyncManager.ts` - fetchFromGoogleTasks()

## 后续改进建议

### 短期
1. 添加性能测试（同步时间测量）
2. 添加并发操作测试（多个标签页同时操作）
3. 添加网络延迟测试（慢速网络场景）

### 中期
4. 添加冲突解决测试（多设备修改同一任务）
5. 添加大数据量测试（1000+ todos）
6. 添加错误恢复测试（网络中断后恢复）

### 长期
7. 视觉回归测试（同步状态UI）
8. 压力测试（频繁同步）
9. 跨浏览器兼容性测试

## 相关文档

- [Playwright 官方文档](https://playwright.dev/)
- [同步架构设计文档](../../docs/sync-architecture.md)
- [API Mock最佳实践](../../docs/api-mocking.md)
