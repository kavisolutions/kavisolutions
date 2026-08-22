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
#   ./deploy/deploy.sh            # uses default port 3111
#   PORT=3200 ./deploy/deploy.sh  # pick a different free port
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3111}"
APP_NAME="kavi-solutions"

cd "${APP_DIR}"

# --- Pre-flight: make sure our port is not already taken by another app ---
if command -v ss >/dev/null 2>&1 && ss -ltn 2>/dev/null | grep -q "[:.]${PORT} "; then
  echo "ERROR: port ${PORT} is already in use by another app."
  echo "Pick a free port and retry, e.g.  PORT=3200 ./deploy/deploy.sh"
  exit 1
fi

echo "==> Deploying ${APP_NAME} on port ${PORT} (app dir: ${APP_DIR})"

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
PORT="${PORT}" pm2 startOrReload ecosystem.config.js --env production --update-env
pm2 save

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