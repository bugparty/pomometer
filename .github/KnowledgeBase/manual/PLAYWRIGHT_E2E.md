# Playwright E2E (login toast)

- **Run:** `pnpm test:e2e tests/e2e/login-toast.spec.ts` (uses `@playwright/test` Chromium, not the Cursor built-in browser MCP).
- **`JWT_SECRET`:** Must match the dev server (same as `pnpm dev`), e.g. in `.env` / `.env.local`. `playwright.config.ts` loads those files via dotenv. CI should inject the same secret.
- **`NEXT_PUBLIC_E2E_TOAST_SECONDS`:** Playwright’s `webServer` sets this to `4` for the child `pnpm dev` so the login success toast can auto-dismiss within a short timeout. Tests also set `window.__POMO_E2E_TOAST_SECONDS` via `addInitScript` so auto-dismiss stays reliable if you reuse an already-running dev server on port 3000.
- **Optional `storageState` (local only):** `pnpm exec playwright codegen --save-storage=tests/e2e/.auth/storage.json`, then `test.use({ storageState: 'tests/e2e/.auth/storage.json' })` in a spec; keep `beforeEach` clearing `sessionStorage` key `pomometer_login_success_toast_uid` if you need the toast again. The `tests/e2e/.auth/` directory is gitignored.
