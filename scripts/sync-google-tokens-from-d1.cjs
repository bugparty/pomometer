/**
 * Fetches google_access_token / google_refresh_token for a user from remote Cloudflare D1
 * and writes them to a gitignored env file (never commit).
 *
 * Requires: wrangler logged in (wrangler login) or CLOUDFLARE_API_TOKEN set.
 *
 * Usage:
 *   pnpm run sync-google-env-from-d1 -- you@example.com
 *   GOOGLE_SYNC_EMAIL=you@example.com pnpm run sync-google-env-from-d1
 *   pnpm run sync-google-env-from-d1 -- --staging you@example.com
 *   pnpm run sync-google-env-from-d1 -- you@example.com --merge   # merge block into .env.local
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
/** Same entry as `node_modules/wrangler/bin/wrangler.js` (needs --experimental-vm-modules). */
const WRANGLER_CLI = path.join(ROOT, "node_modules", "wrangler", "wrangler-dist", "cli.js");
const WRANGLER_CONFIG = "backgroundworker/wrangler.jsonc";
const OUT_FILE = path.join(ROOT, ".env.google.synced.local");
const ENV_LOCAL = path.join(ROOT, ".env.local");

const MERGE_BEGIN = "# >>> BEGIN POMO_SYNCED_GOOGLE (scripts/sync-google-tokens-from-d1.cjs)";
const MERGE_END = "# <<< END POMO_SYNCED_GOOGLE";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseArgs(argv) {
  const rest = argv.slice(2).filter((a) => a !== "--");
  let staging = false;
  let merge = false;
  const positional = [];
  for (const a of rest) {
    if (a === "--staging") staging = true;
    else if (a === "--merge") merge = true;
    else positional.push(a);
  }
  return {
    email: process.env.GOOGLE_SYNC_EMAIL || positional[0],
    staging,
    merge,
  };
}

function escapeSqlString(s) {
  return s.replace(/'/g, "''");
}

function escapeEnvDoubleQuoted(value) {
  if (value == null) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function buildEnvContent(row, email, { staging }) {
  const iso = new Date().toISOString();
  const lines = [
    "# AUTO-GENERATED — DO NOT COMMIT",
    `# Generated: ${iso}`,
    `# Source: remote D1 (${staging ? "staging" : "production"}) user email: ${email}`,
    "# These are OAuth secrets. Rotate in Google Account if leaked.",
    "",
    `POMO_SYNCED_USER_ID="${escapeEnvDoubleQuoted(row.id)}"`,
    `POMO_SYNCED_USER_EMAIL="${escapeEnvDoubleQuoted(row.email)}"`,
    `POMO_SYNCED_GOOGLE_ACCESS_TOKEN="${escapeEnvDoubleQuoted(row.google_access_token)}"`,
    `POMO_SYNCED_GOOGLE_REFRESH_TOKEN="${escapeEnvDoubleQuoted(row.google_refresh_token)}"`,
    `POMO_SYNCED_GOOGLE_TOKEN_EXPIRY="${escapeEnvDoubleQuoted(row.google_token_expiry)}"`,
    "",
    "# Optional: point Playwright or a one-off script at these (load via dotenv/config).",
    "# Next.js does not load this file automatically — add to .env.local manually or use --merge.",
    "",
  ];
  return lines.join("\n");
}

function mergeIntoEnvLocal(content) {
  let existing = "";
  try {
    existing = fs.readFileSync(ENV_LOCAL, "utf8");
  } catch {
    existing = "";
  }
  const block = `${MERGE_BEGIN}\n${content.trimEnd()}\n${MERGE_END}\n`;
  const re = new RegExp(
    `${MERGE_BEGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${MERGE_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "m"
  );
  let next;
  if (re.test(existing)) {
    next = existing.replace(re, block);
  } else {
    next = existing ? `${existing.trimEnd()}\n\n${block}` : block;
  }
  fs.writeFileSync(ENV_LOCAL, next, "utf8");
}

function parseWranglerJson(stdout) {
  const trimmed = stdout.trim();
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    throw new Error(
      "Could not parse wrangler JSON output. Is wrangler logged in? stderr may have details."
    );
  }
  const first = Array.isArray(data) ? data[0] : data;
  const results = first && first.results;
  if (!results || !Array.isArray(results) || results.length === 0) {
    return null;
  }
  return results[0];
}

function main() {
  const { email, staging, merge } = parseArgs(process.argv);

  if (!email || !emailRegex.test(email)) {
    console.error(
      "Usage: pnpm run sync-google-env-from-d1 -- <email>\n" +
        "   or: GOOGLE_SYNC_EMAIL=<email> pnpm run sync-google-env-from-d1\n" +
        "   add --staging for pomometer-db-staging\n" +
        "   add --merge to replace/update a marked block inside .env.local"
    );
    process.exit(1);
  }

  const sql = `SELECT id, email, google_access_token, google_refresh_token, google_token_expiry FROM users WHERE email = '${escapeSqlString(
    email
  )}' LIMIT 1`;

  const dbName = staging ? "pomometer-db-staging" : "pomometer-db";
  const args = [
    "--no-warnings",
    "--experimental-vm-modules",
    WRANGLER_CLI,
    ...(staging ? ["--env", "staging"] : []),
    "d1",
    "execute",
    dbName,
    "--remote",
    "--config",
    WRANGLER_CONFIG,
    "--command",
    sql,
    "--json",
  ];

  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0) {
    console.error(
      result.error || result.stderr || result.stdout || "wrangler failed"
    );
    process.exit(result.status ?? 1);
  }

  const row = parseWranglerJson(result.stdout);
  if (!row || !row.id) {
    console.error(`No row found for email: ${email}`);
    process.exit(2);
  }

  const content = buildEnvContent(row, email, { staging });
  fs.writeFileSync(OUT_FILE, content, "utf8");
  console.log(`Wrote secrets to ${path.relative(ROOT, OUT_FILE)} (not printed).`);

  if (merge) {
    mergeIntoEnvLocal(content);
    console.log(`Merged marked block into ${path.relative(ROOT, ENV_LOCAL)}`);
  } else {
    console.log(
      "Tip: copy vars into .env.local, or re-run with --merge to inject a marked block."
    );
  }
}

main();
