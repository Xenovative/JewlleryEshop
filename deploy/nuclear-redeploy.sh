#!/usr/bin/env bash
# Nuclear option: stop Lumiere services, wipe install/build caches, run a full vps-deploy again.
#
# Does NOT delete your .env, database, or Let's Encrypt certs (unless you do that yourself).
#
# Usage (same env vars as vps-deploy.sh):
#   sudo \
#   SHOP_DOMAIN=jewel.xenovative-ltd.com \
#   RENT_DOMAIN=jewelrent.xenovative-ltd.com \
#   LETSENCRYPT_EMAIL=you@example.com \
#   APP_DIR=/path/to/JewlleryEshop \
#   APP_USER=deploy \
#   bash deploy/nuclear-redeploy.sh
#
# Optional:
#   WIPE_NODE_MODULES=1   (default) — rm -rf node_modules + workspace .next + .turbo
#   WIPE_NODE_MODULES=0   — skip delete (only stop services + re-run deploy steps)
#
# After HTTPS still breaks assets: merge /_next/static locations + snippet include into each
#   listen 443 ssl server (see vps-deploy.sh), then nginx -t && reload.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VPS_DEPLOY="${SCRIPT_DIR}/vps-deploy.sh"

log() {
  echo "[nuclear] $*"
}

err() {
  echo "[nuclear][error] $*" >&2
  exit 1
}

[[ "${EUID}" -eq 0 ]] || err "Run as root: sudo bash deploy/nuclear-redeploy.sh"

APP_DIR="${APP_DIR:-/var/www/lumiere}"
WIPE_NODE_MODULES="${WIPE_NODE_MODULES:-1}"

echo
echo "This will STOP lumiere-shop / lumiere-rent and may DELETE build artifacts under:"
echo "  ${APP_DIR}"
echo "It will then run the full vps-deploy (npm ci, build, nginx, certbot)."
echo "Database and .env are left alone."
echo
read -r -p 'Type exactly YES to continue: ' confirm
[[ "${confirm}" == "YES" ]] || err "Aborted."

[[ -f "${VPS_DEPLOY}" ]] || err "Missing ${VPS_DEPLOY}"

log "Stopping systemd units"
systemctl stop lumiere-shop.service 2>/dev/null || true
systemctl stop lumiere-rent.service 2>/dev/null || true

if [[ "${WIPE_NODE_MODULES}" == "1" ]]; then
  [[ -d "${APP_DIR}" ]] || err "APP_DIR does not exist: ${APP_DIR}"
  log "Removing node_modules, .next, .turbo under ${APP_DIR}"
  rm -rf "${APP_DIR}/node_modules"
  rm -rf "${APP_DIR}/apps/shop/.next" "${APP_DIR}/apps/rent/.next"
  rm -rf "${APP_DIR}/.turbo"
  rm -rf "${APP_DIR}/packages/db/node_modules" 2>/dev/null || true
fi

export NONINTERACTIVE=1
[[ -n "${SHOP_DOMAIN:-}" ]] || err "Set SHOP_DOMAIN"
[[ -n "${LETSENCRYPT_EMAIL:-}" ]] || err "Set LETSENCRYPT_EMAIL"

log "Running full deploy: ${VPS_DEPLOY}"
exec bash "${VPS_DEPLOY}"
