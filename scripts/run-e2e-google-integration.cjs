/**
 * Sets E2E_GOOGLE_INTEGRATION=1 and loads .env.local + .env + .env.google.synced.local
 * before spawning Playwright (cross-platform).
 */
const { config } = require('dotenv');
const { resolve } = require('path');
const { spawnSync } = require('child_process');

const root = resolve(__dirname, '..');
process.env.E2E_GOOGLE_INTEGRATION = '1';
config({ path: resolve(root, '.env.local') });
config({ path: resolve(root, '.env') });
config({ path: resolve(root, '.env.google.synced.local') });

const args = [
  'exec',
  'playwright',
  'test',
  'tests/e2e/google-tasks-integration.spec.ts',
  ...process.argv.slice(2),
];
const result = spawnSync('pnpm', args, {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
  shell: true,
});
process.exit(result.status ?? 1);
