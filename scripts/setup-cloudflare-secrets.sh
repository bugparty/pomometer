#!/bin/bash
# Setup Service Account secrets for Cloudflare Workers
# Usage: ./scripts/setup-cloudflare-secrets.sh [json-file-path]
#
# This script reads a Google Service Account JSON file and sets each field as a Cloudflare Workers secret

set -e

# Default JSON file path
JSON_FILE="${1:-./google-service-account-key.json}"

# Check if file exists
if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Error: JSON file not found: $JSON_FILE"
  echo "Usage: $0 [path-to-json-file]"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "❌ Error: 'jq' is required but not installed"
  echo "Install jq: brew install jq (macOS) or apt-get install jq (Linux)"
  exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "❌ Error: 'pnpm' is required but not installed"
  exit 1
fi

echo "=========================================="
echo "Setting Cloudflare Workers Secrets"
echo "from: $JSON_FILE"
echo "=========================================="
echo ""

# Extract values
SA_TYPE=$(jq -r '.type' "$JSON_FILE")
SA_PROJECT_ID=$(jq -r '.project_id' "$JSON_FILE")
SA_PRIVATE_KEY_ID=$(jq -r '.private_key_id' "$JSON_FILE")
SA_PRIVATE_KEY=$(jq -r '.private_key' "$JSON_FILE")
SA_CLIENT_EMAIL=$(jq -r '.client_email' "$JSON_FILE")
SA_CLIENT_ID=$(jq -r '.client_id' "$JSON_FILE")
SA_AUTH_URI=$(jq -r '.auth_uri' "$JSON_FILE")
SA_TOKEN_URI=$(jq -r '.token_uri' "$JSON_FILE")
SA_AUTH_PROVIDER_X509_CERT_URL=$(jq -r '.auth_provider_x509_cert_url' "$JSON_FILE")
SA_CLIENT_X509_CERT_URL=$(jq -r '.client_x509_cert_url' "$JSON_FILE")

# Function to set a secret
set_secret() {
  local name="$1"
  local value="$2"
  
  echo "Setting secret: $name"
  echo "$value" | pnpm wrangler secret put "$name"
  echo "✅ Set: $name"
  echo ""
}

# Set all secrets
set_secret "SA_TYPE" "$SA_TYPE"
set_secret "SA_PROJECT_ID" "$SA_PROJECT_ID"
set_secret "SA_PRIVATE_KEY_ID" "$SA_PRIVATE_KEY_ID"
set_secret "SA_PRIVATE_KEY" "$SA_PRIVATE_KEY"
set_secret "SA_CLIENT_EMAIL" "$SA_CLIENT_EMAIL"
set_secret "SA_CLIENT_ID" "$SA_CLIENT_ID"
set_secret "SA_AUTH_URI" "$SA_AUTH_URI"
set_secret "SA_TOKEN_URI" "$SA_TOKEN_URI"
set_secret "SA_AUTH_PROVIDER_X509_CERT_URL" "$SA_AUTH_PROVIDER_X509_CERT_URL"
set_secret "SA_CLIENT_X509_CERT_URL" "$SA_CLIENT_X509_CERT_URL"

echo "=========================================="
echo "✅ All Cloudflare Workers secrets set!"
echo "=========================================="
