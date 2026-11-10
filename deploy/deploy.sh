#!/usr/bin/env bash
#
# Deploy Kavi Solutions (Next.js site + NestJS API) on the app server.
#
# Runs ON the server inside the cloned repository. The repo root holds two apps:
# the Next.js frontend in ./app and the NestJS backend in ./api.
#
# Usage:
#   ./deploy/deploy.sh              # pull latest main, install/build/reload both apps
#   ./deploy/deploy.sh --no-pull    # deploy what is already on disk (used by CI)
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${APP_DIR}/api"
FE_DIR="${APP_DIR}/app"
FE_PORT="${PORT:-3111}"
BE_PORT="${API_PORT:-3200}"
FE_APP="kavi-solutions"
BE_APP="kavi-solutions-be"
BRANCH="${BRANCH:-main}"
PULL=1
[ "${1:-}" = "--no-pull" ] && PULL=0

cd "${APP_DIR}"

if [ "${PULL}" = "1" ]; then
  echo "==> Pulling latest ${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  npm install -g pm2
fi

# ---------------------------------------------------------------- backend ----
echo "==> [api] Installing dependencies"
cd "${API_DIR}"
npm ci || npm install

echo "==> [api] Applying DB migrations"
npm run db:migrate

echo "==> [api] Building"
npm run build

echo "==> [api] Reloading ${BE_APP} on port ${BE_PORT}"
PORT="${BE_PORT}" pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# --------------------------------------------------------------- frontend ----
echo "==> [web] Installing dependencies"
cd "${FE_DIR}"
npm ci || npm install

echo "==> [web] Building production bundle"
# Rewrites in next.config.ts are baked in at build time; the API origin must be
# present here as well as in the running PM2 process.
export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:${BE_PORT}}"
npm run build

echo "==> [web] Reloading ${FE_APP} on port ${FE_PORT}"
PORT="${FE_PORT}" pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# -------------------------------------------------------------- health ------
echo "==> Health checks"
for attempt in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${BE_PORT}/api/health" 2>/dev/null; then
    echo "    api OK (:${BE_PORT})"
    break
  fi
  if [ "${attempt}" = "15" ]; then
    echo "ERROR: API did not respond on port ${BE_PORT}. Check: pm2 logs ${BE_APP}"
    exit 1
  fi
  sleep 2
done

for attempt in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${FE_PORT}/" 2>/dev/null; then
    echo "    web OK (:${FE_PORT})"
    break
  fi
  if [ "${attempt}" = "15" ]; then
    echo "ERROR: web app did not respond on port ${FE_PORT}. Check: pm2 logs ${FE_APP}"
    exit 1
  fi
  sleep 2
done

echo "==> Done."
