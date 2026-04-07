#!/bin/bash
# Extract Service Account credentials from JSON file and generate environment variables
# Usage: ./scripts/extract-service-account-env.sh [path-to-json-file]
#
# Output: Can be piped to a .env file or sourced in your shell

set -e

# Default JSON file path
JSON_FILE="${1:-./google-service-account-key.json}"

# Check if file exists
if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Error: JSON file not found: $JSON_FILE"
  echo "Usage: $0 [path-to-json-file]"
  exit 1
fi

echo "=========================================="
echo "Extracting Service Account credentials"
echo "from: $JSON_FILE"
echo "=========================================="
echo ""

# Extract values using jq
if ! command -v jq &> /dev/null; then
  echo "❌ Error: 'jq' is required but not installed"
  echo "Install jq: brew install jq (macOS) or apt-get install jq (Linux)"
  exit 1
fi

# Check if it's a valid JSON file
if ! jq empty "$JSON_FILE" 2>/dev/null; then
  echo "❌ Error: Invalid JSON file: $JSON_FILE"
  exit 1
fi

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

# Validate required fields
if [ -z "$SA_TYPE" ] || [ -z "$SA_PROJECT_ID" ] || [ -z "$SA_PRIVATE_KEY" ] || [ -z "$SA_CLIENT_EMAIL" ]; then
  echo "❌ Error: Missing required fields in JSON file"
  exit 1
fi

# Convert newlines to \n for environment variable
SA_PRIVATE_KEY_ESCAPED=$(echo "$SA_PRIVATE_KEY" | sed ':a;N;$!ba;s/\n/\\n/g')

# Output environment variables
echo "# Extracted from: $JSON_FILE"
echo "# Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""
echo "SA_TYPE=\"$SA_TYPE\""
echo "SA_PROJECT_ID=\"$SA_PROJECT_ID\""
echo "SA_PRIVATE_KEY_ID=\"$SA_PRIVATE_KEY_ID\""
echo "SA_PRIVATE_KEY=\"$SA_PRIVATE_KEY_ESCAPED\""
"
echo "SA_CLIENT_EMAIL=\"$SA_CLIENT_EMAIL\""
echo "SA_CLIENT_ID=\"$SA_CLIENT_ID\""
echo "SA_AUTH_URI=\"$SA_AUTH_URI\""
echo "SA_TOKEN_URI=\"$SA_TOKEN_URI\""
echo "SA_AUTH_PROVIDER_X509_CERT_URL=\"$SA_AUTH_PROVIDER_X509_CERT_URL\""
echo "SA_CLIENT_X509_CERT_URL=\"$SA_CLIENT_X509_CERT_URL\""
echo ""
echo "=========================================="
echo "✅ Environment variables extracted!"
echo "=========================================="
echo ""
echo "You can now:"
echo ""
echo "1. Save to a file:"
echo "   $0 $JSON_FILE > .env.service-account"
echo ""
echo "2. Append to existing .env file:"
echo "   $0 $JSON_FILE >> .env.local"
echo ""
echo "3. Source in current shell:"
echo "   export \$($0 $JSON_FILE | grep -v '^#')"
echo ""
echo "4. Set as Cloudflare Workers secrets (for production):"
echo "   pnpm wrangler secret put SA_TYPE -- '$SA_TYPE'"
echo "   pnpm wrangler secret put SA_PROJECT_ID -- '$SA_PROJECT_ID'"
echo "   pnpm wrangler secret put SA_PRIVATE_KEY_ID -- '$SA_PRIVATE_KEY_ID'"
echo "   pnpm wrangler secret put SA_PRIVATE_KEY -- '$SA_PRIVATE_KEY'"
echo "   pnpm wrangler secret put SA_CLIENT_EMAIL -- '$SA_CLIENT_EMAIL'"
echo "   # ... and so on for other variables"
echo ""
