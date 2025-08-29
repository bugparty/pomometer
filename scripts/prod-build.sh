#!/usr/bin/env bash
# Temporarily hide .env.local so production build uses .env.production
# Usage:
#  scripts/prod-build.sh build               # just build
#  scripts/prod-build.sh deploy              # build + deploy to production
#  scripts/prod-build.sh deploy staging      # build + deploy to staging
#  scripts/prod-build.sh preview             # build + preview
#  scripts/prod-build.sh preview staging     # build + preview to staging
#  ENV=staging scripts/prod-build.sh deploy  # alternative way to specify env
# Optional env vars:
#  SKIP_ENV_LOCAL_SHIELD=1  -> skip hiding logic
#  EXTRA_BUILD_ARGS="..."    -> extra args passed to build command
#  ENV=production|staging    -> deployment environment (defaults to production)
set -euo pipefail
MODE=${1:-build}
ENV_ARG=${2:-}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

ORIG_ENV_LOCAL=".env.local"
TEMP_ENV_LOCAL=".env.local._bak_hidden"
RESTORE=0

shield_env_local() {
  if [[ -f "$ORIG_ENV_LOCAL" && -z "${SKIP_ENV_LOCAL_SHIELD:-}" ]]; then
    echo "[env-shield] Hiding $ORIG_ENV_LOCAL during production $MODE..."
    mv "$ORIG_ENV_LOCAL" "$TEMP_ENV_LOCAL"
    RESTORE=1
  else
    echo "[env-shield] No .env.local to hide or skipping."  
  fi
}

restore_env_local() {
  if [[ $RESTORE -eq 1 && -f "$TEMP_ENV_LOCAL" ]]; then
    mv "$TEMP_ENV_LOCAL" "$ORIG_ENV_LOCAL"
    echo "[env-shield] Restored .env.local"
  fi
}

trap restore_env_local EXIT INT TERM

# Determine deployment environment
get_deploy_env() {
  if [[ -n "$ENV_ARG" ]]; then
    echo "$ENV_ARG"
  elif [[ -n "${ENV:-}" ]]; then
    echo "$ENV"
  else
    echo "production"
  fi
}

# Build deploy command with environment
build_deploy_cmd() {
  local cmd_type=$1
  local env=$(get_deploy_env)
  echo "[env-shield] $cmd_type to $env environment..."
  echo "opennextjs-cloudflare $cmd_type --env=$env"
  opennextjs-cloudflare $cmd_type --env=$env
  
}

shield_env_local

export NODE_ENV=production

BUILD_CMD=(opennextjs-cloudflare build ${EXTRA_BUILD_ARGS:-})

echo "[env-shield] Running production build: ${BUILD_CMD[*]}"
"${BUILD_CMD[@]}"

echo "[env-shield] Build finished."

case "$MODE" in
  deploy)
    build_deploy_cmd deploy
    ;;
  preview)
    build_deploy_cmd preview
    ;;
  build)
    # nothing else
    ;;
  *)
    echo "[env-shield] Unknown mode '$MODE' (expected build|deploy|preview)" >&2
    exit 2
    ;;
esac
