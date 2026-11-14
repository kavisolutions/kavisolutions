#!/usr/bin/env bash
#
# Pull runtime environment from Env Manager.
#
#   ./scripts/env-manager.sh pull local
#   ./scripts/env-manager.sh pull production
#   ./scripts/env-manager.sh check local
#
# Tokens are read (in order) from:
#   ENV_MANAGER_TOKEN_BE / ENV_MANAGER_TOKEN_FE
#   ${ENV_MANAGER_TOKEN_DIR:-$HOME/.config/kavi}/env-manager-be.token
#   ${ENV_MANAGER_TOKEN_DIR:-$HOME/.config/kavi}/env-manager-fe.token
#
# The Env Manager TLS certificate is currently mismatched, so this script uses
# curl -k. Remove -k (or set ENV_MANAGER_INSECURE=0) once the certificate is
# fixed and the host is trusted.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${ENV_MANAGER_URL:-https://env.arkasodhara.tech}"
PROJECT_BE="${ENV_MANAGER_PROJECT_BE:-kavi-solutions-be}"
PROJECT_FE="${ENV_MANAGER_PROJECT_FE:-kavi-solutions}"
TOKEN_DIR="${ENV_MANAGER_TOKEN_DIR:-$HOME/.config/kavi}"
CURL_TLS=(-k)
[ "${ENV_MANAGER_INSECURE:-1}" = "0" ] && CURL_TLS=()

usage() {
  cat <<EOF
Usage: $0 <command> <environment>

Commands:
  pull <local|production>   Write the env files (0600)
  check <local|production>   Print the key names only, do not write

Environment variables:
  ENV_MANAGER_URL           default: $BASE_URL
  ENV_MANAGER_PROJECT_BE    default: $PROJECT_BE
  ENV_MANAGER_PROJECT_FE    default: $PROJECT_FE
  ENV_MANAGER_TOKEN_BE      backend project token
  ENV_MANAGER_TOKEN_FE      frontend project token
  ENV_MANAGER_TOKEN_DIR     default: $TOKEN_DIR
  ENV_MANAGER_INSECURE=0    disable curl -k once TLS is valid
EOF
}

read_token() {
  local kind="$1"
  local var="ENV_MANAGER_TOKEN_$(printf '%s' "$kind" | tr '[:lower:]' '[:upper:]')"
  local value="${!var:-}"

  if [ -n "$value" ]; then
    printf '%s' "$value"
    return 0
  fi

  local file="$TOKEN_DIR/env-manager-${kind}.token"
  if [ -f "$file" ]; then
    tr -d '\r\n' < "$file"
    return 0
  fi

  echo "Missing $var or $file" >&2
  return 1
}

fetch_env() {
  local project="$1"
  local env="$2"
  local token="$3"
  local out="$4"
  local tmp

  tmp="$(mktemp)"

  if ! curl -fsSL "${CURL_TLS[@]}" \
    -H "Authorization: Bearer $token" \
    "$BASE_URL/api/v1/$project/$env" -o "$tmp"; then
    rm -f "$tmp"
    echo "Could not pull $project/$env from $BASE_URL" >&2
    return 1
  fi

  if [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    echo "Env Manager returned an empty $project/$env" >&2
    return 1
  fi

  install -m 600 "$tmp" "$out"
  rm -f "$tmp"
  echo "Wrote $out from $project/$env"
}

print_keys() {
  local project="$1"
  local env="$2"
  local token="$3"
  local tmp

  tmp="$(mktemp)"

  if ! curl -fsSL "${CURL_TLS[@]}" \
    -H "Authorization: Bearer $token" \
    "$BASE_URL/api/v1/$project/$env" -o "$tmp"; then
    rm -f "$tmp"
    echo "Could not pull $project/$env from $BASE_URL" >&2
    return 1
  fi

  echo "=== $project/$env ==="
  sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "$tmp" | sort
  rm -f "$tmp"
}

pull() {
  local target="$1"
  local be_token fe_token

  be_token="$(read_token be)"
  fe_token="$(read_token fe)"

  case "$target" in
    local)
      fetch_env "$PROJECT_BE" "be-local" "$be_token" "$ROOT_DIR/api/.env"
      fetch_env "$PROJECT_FE" "fe-local" "$fe_token" "$ROOT_DIR/app/.env.local"
      ;;
    production)
      fetch_env "$PROJECT_BE" "be-production" "$be_token" "$ROOT_DIR/api/.env"
      fetch_env "$PROJECT_FE" "fe-production" "$fe_token" "$ROOT_DIR/app/.env.production"
      ;;
    *)
      echo "Unknown environment: $target" >&2
      usage
      exit 1
      ;;
  esac
}

check() {
  local target="$1"
  local be_env fe_env be_token fe_token

  case "$target" in
    local) be_env="be-local"; fe_env="fe-local" ;;
    production) be_env="be-production"; fe_env="fe-production" ;;
    *) echo "Unknown environment: $target" >&2; usage; exit 1 ;;
  esac

  be_token="$(read_token be)"
  fe_token="$(read_token fe)"

  print_keys "$PROJECT_BE" "$be_env" "$be_token"
  print_keys "$PROJECT_FE" "$fe_env" "$fe_token"
}

if [ $# -lt 2 ]; then
  usage
  exit 1
fi

case "$1" in
  pull) pull "$2" ;;
  check) check "$2" ;;
  *) usage; exit 1 ;;
esac
