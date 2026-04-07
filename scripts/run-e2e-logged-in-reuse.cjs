/**
 * Reuses tests/e2e/.auth/user.json without opening the manual login browser.
 */
process.env.E2E_REUSE_AUTH = '1';
const { spawnSync } = require('child_process');
const { resolve } = require('path');

const args = [
  'exec',
  'playwright',
  'test',
  '-c',
  'playwright.logged-in.config.ts',
  '--project=logged-in',
  ...process.argv.slice(2),
];
const result = spawnSync('pnpm', args, {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
  env: process.env,
  shell: true,
});
process.exit(result.status ?? 1);
