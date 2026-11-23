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
SURVEY_DIR="${APP_DIR}/survey"
FE_PORT="${PORT:-3111}"
BE_PORT="${API_PORT:-3200}"
SURVEY_PORT="${SURVEY_PORT:-3004}"
SURVEY_BE_PORT="${SURVEY_API_PORT:-3201}"
PUBLIC_URL="${PUBLIC_URL:-https://kavisolutions.in}"
FE_APP="kavi-solutions"
BE_APP="kavi-solutions-be"
SURVEY_APP="kavi-survey"
SURVEY_BE_APP="kavi-solutions-survey-be"
SOCIAL_APP="kavi-social-agent"
SOCIAL_PORT="${SOCIAL_PORT:-3300}"
BRANCH="${BRANCH:-main}"
PULL=1
[ "${1:-}" = "--no-pull" ] && PULL=0

cd "${APP_DIR}"

if [ "${PULL}" = "1" ]; then
  echo "==> Pulling latest ${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
fi

if [ -f .gitmodules ]; then
  echo "==> Syncing submodules"
  git submodule sync --recursive

  # CI exports a read token for the private survey submodule.
  if [ -n "${SURVEY_REPO_TOKEN:-}" ]; then
    SURVEY_REPO_URL="https://github.com/kavi-solutions/kavi-survey-research"
    SURVEY_AUTH_URL="https://x-access-token:${SURVEY_REPO_TOKEN}@github.com/kavi-solutions/kavi-survey-research.git"
    cleanup_survey_auth() {
      git config submodule.survey.url "${SURVEY_REPO_URL}" 2>/dev/null || true
      if [ -e survey/.git ]; then
        git -C survey remote set-url origin "${SURVEY_REPO_URL}" 2>/dev/null || true
      fi
    }
    trap cleanup_survey_auth EXIT
    if [ -e survey/.git ]; then
      git -C survey remote set-url origin "${SURVEY_AUTH_URL}"
    fi
    git config submodule.survey.url "${SURVEY_AUTH_URL}"
    GIT_TERMINAL_PROMPT=0 git submodule update --init --recursive
    cleanup_survey_auth
    trap - EXIT
  else
    git submodule update --init --recursive
  fi
fi

# Runtime env comes from Env Manager. The read-only deploy tokens live outside
# the repository in ~/.config/kavi (0600). Set ENV_PULL=0 only for an emergency
# deploy that must use the existing .env files.
ENV_PULL="${ENV_PULL:-1}"
if [ "${ENV_PULL}" = "1" ]; then
  echo "==> Pulling runtime env from Env Manager"
  "${APP_DIR}/scripts/env-manager.sh" pull production
else
  echo "==> Env Manager pull skipped (ENV_PULL=0)"
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

# PM2 keeps the previous `script`/`cwd` on startOrReload, so delete the apps
# first to make sure a moved entrypoint is picked up. The ecosystem file starts
# the main API (:3200) and the survey API (:3201) from the same build.
echo "==> [api] Reloading ${BE_APP} on port ${BE_PORT} and ${SURVEY_BE_APP} on port ${SURVEY_BE_PORT}"
pm2 delete "${BE_APP}" "${SURVEY_BE_APP}" >/dev/null 2>&1 || true
PORT="${BE_PORT}" pm2 start ecosystem.config.js --update-env
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
pm2 delete "${FE_APP}" >/dev/null 2>&1 || true
PORT="${FE_PORT}" pm2 start ecosystem.config.js --update-env
pm2 save

# ------------------------------------------------------------- survey ----
# Separate frontend, own API process (same codebase/database). Browser calls
# use the same-origin /survey-api path handled by nginx.
if [ ! -f "${SURVEY_DIR}/package.json" ]; then
  echo "ERROR: survey frontend is missing. Run: git submodule update --init --recursive"
  exit 1
fi

echo "==> [survey] Installing dependencies"
cd "${SURVEY_DIR}"
npm ci || npm install

echo "==> [survey] Building production bundle"
export API_BASE_URL="${SURVEY_API_URL:-http://127.0.0.1:${SURVEY_BE_PORT}}"
export NEXT_PUBLIC_API_BASE_URL="${SURVEY_PUBLIC_API_PATH:-/survey-api}"
export NEXT_PUBLIC_APP_URL="${SURVEY_PUBLIC_URL:-${PUBLIC_URL}}"
export AUTH_PUBLIC_URL="${SURVEY_PUBLIC_URL:-${PUBLIC_URL}}"
npm run build

# `output: "standalone"` does not copy these into the standalone directory.
rm -rf .next/standalone/.next/static .next/standalone/public
cp -a .next/static .next/standalone/.next/static
if [ -d public ]; then cp -a public .next/standalone/public; fi

echo "==> [survey] Reloading ${SURVEY_APP} on port ${SURVEY_PORT}"
pm2 delete "${SURVEY_APP}" >/dev/null 2>&1 || true
PORT="${SURVEY_PORT}" pm2 start ecosystem.config.js --update-env
pm2 save

# ---------------------------------------------------------- social agent ----
# Optional sidecar: image calendar + scheduled captions + publishing.
# Its runtime config lives in social-agent/.env, which is untracked and
# preserved across deploys. If the directory is absent, skip it.
SOCIAL_DIR="${APP_DIR}/social-agent"
SOCIAL_READY=0
if [ -f "${SOCIAL_DIR}/package.json" ] && [ -f "${SOCIAL_DIR}/.env" ]; then
  echo "==> [social] Installing dependencies"
  cd "${SOCIAL_DIR}"
  npm ci || npm install

  echo "==> [social] Building"
  npm run build

  echo "==> [social] Reloading ${SOCIAL_APP} on port ${SOCIAL_PORT}"
  pm2 delete "${SOCIAL_APP}" >/dev/null 2>&1 || true
  PORT="${SOCIAL_PORT}" pm2 start ecosystem.config.js --update-env
  pm2 save
  SOCIAL_READY=1
else
  echo "==> [social] Skipped (social-agent/.env is not configured)"
fi

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
  if curl -fsS -o /dev/null "http://127.0.0.1:${SURVEY_BE_PORT}/api/health" 2>/dev/null; then
    echo "    survey api OK (:${SURVEY_BE_PORT})"
    break
  fi
  if [ "${attempt}" = "15" ]; then
    echo "ERROR: survey API did not respond on port ${SURVEY_BE_PORT}. Check: pm2 logs ${SURVEY_BE_APP}"
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

for attempt in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${SURVEY_PORT}/survey" 2>/dev/null; then
    echo "    survey frontend OK (:${SURVEY_PORT})"
    break
  fi
  if [ "${attempt}" = "15" ]; then
    echo "ERROR: survey frontend did not respond on port ${SURVEY_PORT}. Check: pm2 logs ${SURVEY_APP}"
    exit 1
  fi
  sleep 2
done

if [ "${SOCIAL_READY}" = "1" ]; then
  for attempt in $(seq 1 15); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${SOCIAL_PORT}/health" 2>/dev/null; then
      echo "    social agent OK (:${SOCIAL_PORT})"
      break
    fi
    if [ "${attempt}" = "15" ]; then
      echo "ERROR: social agent did not respond on port ${SOCIAL_PORT}. Check: pm2 logs ${SOCIAL_APP}"
      exit 1
    fi
    sleep 2
  done
fi

echo "==> Done."
