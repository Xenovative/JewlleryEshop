#!/usr/bin/env bash
# Nuclear option: stop Lumiere services, wipe install/build caches, run a full vps-deploy again.
#
# Does NOT delete your .env, database, or Let's Encrypt certs (unless you do that yourself).
#
# Usage (same env vars as vps-deploy.sh):
#   cd /path/to/JewlleryEshop && sudo -E bash deploy/nuclear-redeploy.sh
#   # -E keeps APP_DIR if you exported it; otherwise we infer repo root from deploy/nuclear-redeploy.sh
#
# Or set paths explicitly:
#   sudo \
#   SHOP_DOMAIN=jewel.xenovative-ltd.com \
#   RENT_DOMAIN=jewelrent.xenovative-ltd.com \
#   LETSENCRYPT_EMAIL=you@example.com \
#   APP_DIR=/root/JewlleryEshop \
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
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VPS_DEPLOY="${SCRIPT_DIR}/vps-deploy.sh"

log() {
  echo "[nuclear] $*"
}

err() {
  echo "[nuclear][error] $*" >&2
  exit 1
}

[[ "${EUID}" -eq 0 ]] || err "Run as root: sudo bash deploy/nuclear-redeploy.sh"

WIPE_NODE_MODULES="${WIPE_NODE_MODULES:-1}"

# Resolve APP_DIR: explicit env, else directory containing this script's repo root, else fail clearly.
if [[ -n "${APP_DIR:-}" ]]; then
  APP_DIR="${APP_DIR}"
elif [[ -f "${REPO_ROOT}/package.json" ]] && [[ -d "${REPO_ROOT}/apps/shop" ]]; then
  APP_DIR="${REPO_ROOT}"
  log "Using APP_DIR inferred from script location: ${APP_DIR}"
else
  err "APP_DIR is not set and could not infer repo root from ${REPO_ROOT}.
Set APP_DIR to the monorepo root on this server (folder with package.json and apps/shop), e.g.:
  sudo APP_DIR=/root/JewlleryEshop SHOP_DOMAIN=... LETSENCRYPT_EMAIL=... bash deploy/nuclear-redeploy.sh
Or run from the repo: cd /path/to/JewlleryEshop && sudo bash deploy/nuclear-redeploy.sh"
fi

[[ -d "${APP_DIR}" ]] || err "APP_DIR does not exist: ${APP_DIR}"
[[ -f "${APP_DIR}/package.json" ]] || err "APP_DIR must be the repo root (missing package.json): ${APP_DIR}"
[[ -d "${APP_DIR}/apps/shop" ]] || err "APP_DIR must contain apps/shop: ${APP_DIR}"

[[ -f "${VPS_DEPLOY}" ]] || err "Missing ${VPS_DEPLOY}"

export NONINTERACTIVE=1
[[ -n "${SHOP_DOMAIN:-}" ]] || err "Set SHOP_DOMAIN (required for non-interactive deploy)."
[[ -n "${LETSENCRYPT_EMAIL:-}" ]] || err "Set LETSENCRYPT_EMAIL."

echo
echo "This will STOP lumiere-shop / lumiere-rent and may DELETE build artifacts under:"
echo "  ${APP_DIR}"
echo "It will then run the full vps-deploy (npm ci, build, nginx, certbot)."
echo "Database and .env are left alone."
echo
read -r -p 'Type exactly YES to continue: ' confirm
[[ "${confirm}" == "YES" ]] || err "Aborted."

log "Stopping systemd units"
systemctl stop lumiere-shop.service 2>/dev/null || true
systemctl stop lumiere-rent.service 2>/dev/null || true

if [[ "${WIPE_NODE_MODULES}" == "1" ]]; then
  log "Removing node_modules, .next, .turbo under ${APP_DIR}"
  rm -rf "${APP_DIR}/node_modules"
  rm -rf "${APP_DIR}/apps/shop/.next" "${APP_DIR}/apps/rent/.next"
  rm -rf "${APP_DIR}/.turbo"
  rm -rf "${APP_DIR}/packages/db/node_modules" 2>/dev/null || true
fi

export APP_DIR
log "Running full deploy: ${VPS_DEPLOY}"
exec bash "${VPS_DEPLOY}"
