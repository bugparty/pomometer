#!/usr/bin/env bash
set -euo pipefail

# Push secrets to Cloudflare Workers (root web worker + background worker)
# Usage:
#   ./scripts/push-secrets.sh staging            # push to staging env
#   ./scripts/push-secrets.sh production         # push to production env
# Optional env vars:
#   SECRETS_FILE=.env.production ./scripts/push-secrets.sh production
# Defaults: env file priority: .env.local -> .env

ENV_NAME="${1:-staging}"

# Decide env file
if [[ -n "${SECRETS_FILE:-}" && -f "$SECRETS_FILE" ]]; then
  ENV_FILE="$SECRETS_FILE"
elif [[ -f .env.production ]]; then
  ENV_FILE=.env.production
elif [[ -f .env.local ]]; then
  ENV_FILE=.env.local
elif [[ -f .env ]]; then
  ENV_FILE=.env
else
  echo "[secrets] ❌ No env file (.env.local or .env) found and SECRETS_FILE not set" >&2
  exit 1
fi

echo "[secrets] Using env file: $ENV_FILE"
echo "[secrets] Target environment: $ENV_NAME"

# Secrets to push (only those that should NOT be plain vars in wrangler config)
SECRETS=(
  GOOGLE_CLIENT_SECRET
  JWT_SECRET
)

extract_value() {
  local key="$1"
  # Grep first matching non-comment line KEY=
  local line
  line=$(grep -E "^${key}=" "$ENV_FILE" || true)
  if [[ -z "$line" ]]; then
    return 1
  fi
  echo "${line#${key}=}"
}

push_secret() {
  local key="$1"; shift
  local value="$1"; shift
  # Avoid echoing secret value
  printf '%s' "$value" | wrangler secret put "$key" --env "$ENV_NAME" "$@" >/dev/null
  echo "[secrets] ✅ Pushed $key"
}

missing=()
for key in "${SECRETS[@]}"; do
  if val=$(extract_value "$key"); then
    if [[ -z "$val" ]]; then
      echo "[secrets] ⚠ $key empty, skip" >&2
      missing+=("$key")
      continue
    fi
    # Push to root worker (web)
    push_secret "$key" "$val"
    # Push to background worker (explicit config)
    printf '%s' "$val" | wrangler secret put "$key" --env "$ENV_NAME" --config backgroundworker/wrangler.jsonc >/dev/null
    echo "[secrets]   ↳ also pushed to backgroundworker"
  else
    echo "[secrets] ⚠ $key not found in $ENV_FILE" >&2
    missing+=("$key")
  fi
done

if (( ${#missing[@]} )); then
  echo "[secrets] Done with warnings. Missing/empty: ${missing[*]}" >&2
else
  echo "[secrets] All secrets pushed successfully." >&2
fi

echo "[secrets] Reminder: non-secret public vars (e.g. GOOGLE_CLIENT_ID) stay in wrangler config vars section."
