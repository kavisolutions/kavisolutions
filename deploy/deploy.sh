#!/usr/bin/env bash
#
# Deploy Kavi Solutions to your VPS.
#
# This runs ON the VPS inside the cloned project directory. It is safe to run
# alongside other apps on the same server: it uses its own PM2 app name and a
# dedicated port (3111) so it never touches another application's files, ports
# or process names.
#
# Usage:
#   ./deploy/deploy.sh              # pull latest main, then install + build + reload
#   ./deploy/deploy.sh --no-pull    # deploy what is already on disk (used by CI)
#   PORT=3200 ./deploy/deploy.sh    # pick a different free port
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3111}"
APP_NAME="kavi-solutions"
BRANCH="${BRANCH:-main}"
PULL=1
[ "${1:-}" = "--no-pull" ] && PULL=0

cd "${APP_DIR}"

# --- Pre-flight: make sure our port is free, or already held by our node app ---
if command -v ss >/dev/null 2>&1; then
  OWNER="$(ss -ltnp 2>/dev/null | grep "[:.]${PORT} " || true)"
  if [ -n "${OWNER}" ] && ! echo "${OWNER}" | grep -Eq "node|next"; then
    echo "ERROR: port ${PORT} is already used by another app:"
    echo "${OWNER}"
    echo "Pick a free port, e.g.  PORT=3200 ./deploy/deploy.sh"
    exit 1
  fi
fi

echo "==> Deploying ${APP_NAME} on port ${PORT} (app dir: ${APP_DIR})"

if [ "${PULL}" = "1" ]; then
  echo "==> Pulling latest ${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
fi

echo "==> Installing dependencies"
npm ci || npm install

echo "==> Building production bundle"
npm run build

echo "==> Ensuring PM2 is available"
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2 globally..."
  npm install -g pm2
fi

echo "==> Starting / reloading ${APP_NAME} with PM2"
PORT="${PORT}" pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "==> Health check"
for i in $(seq 1 15); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
    echo "    OK — app is responding on port ${PORT}"
    break
  fi
  if [ "${i}" = "15" ]; then
    echo "ERROR: app did not respond on port ${PORT}."
    echo "       Check: pm2 logs ${APP_NAME}"
    exit 1
  fi
  sleep 2
done

echo ""
echo "==> Done."
echo "    Check: pm2 status ${APP_NAME}"
echo "    Logs:  pm2 logs ${APP_NAME}"
echo "    Local test (optional): curl -I http://127.0.0.1:${PORT}"
echo ""
echo "==> Next: configure nginx (once) if not already done:"
echo "    sudo cp deploy/nginx.conf /etc/nginx/sites-available/kavisolutions"
echo "    sudo ln -sf /etc/nginx/sites-available/kavisolutions /etc/nginx/sites-enabled/"
echo "    sudo nginx -t && sudo systemctl reload nginx"
echo "==> Then enable HTTPS (once DNS resolves):"
echo "    sudo certbot --nginx -d kavisolutions.in -d www.kavisolutions.in"
