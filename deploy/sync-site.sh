#!/usr/bin/env bash
set -euo pipefail

# Easy sync wrapper:
# - Mirrors easy-deploy.sh prompt/confirm style
# - Syncs project files to VPS with rsync
# - Preserves destination .env, SQLite DB files, and apps/shop/public/uploads (rsync excludes)
# - Rebuilds and restarts app service
# - Does NOT touch SSL/certbot/domain/nginx config

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SELF_DIR}/.." && pwd)"

log() {
  echo "[sync-site] $*"
}

err() {
  echo "[sync-site][error] $*" >&2
  exit 1
}

prompt() {
  local var_name="$1"
  local label="$2"
  local default_value="${3:-}"
  local value
  read -r -p "${label} [${default_value}]: " value
  value="${value:-${default_value}}"
  printf -v "${var_name}" "%s" "${value}"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Missing command: $1"
}

if [[ "${EUID}" -ne 0 ]]; then
  log "This script needs root privileges to restart services after sync."
  log "Re-running with sudo..."
  exec sudo bash "$0" "$@"
fi

echo
echo "Lumiere VPS Easy Sync"
echo "---------------------"
echo "Source detected: ${PROJECT_ROOT}"
echo

SOURCE_DIR="${SOURCE_DIR:-${PROJECT_ROOT}}"
APP_USER="${APP_USER:-${SUDO_USER:-deploy}}"
VPS_HOST="${VPS_HOST:-}"
VPS_PORT="${VPS_PORT:-22}"
VPS_APP_DIR="${VPS_APP_DIR:-/var/www/lumiere}"
SYNC_TARGET="${SYNC_TARGET:-${APP_USER}@${VPS_HOST}:${VPS_APP_DIR}/}"
REMOTE_POST_SYNC_DEFAULT="cd '${VPS_APP_DIR}' && npm ci && npm run build && sudo systemctl restart lumiere-shop"
REMOTE_POST_SYNC="${REMOTE_POST_SYNC:-${REMOTE_POST_SYNC_DEFAULT}}"
DRY_RUN="${DRY_RUN:-0}"

prompt SOURCE_DIR "Local source directory to sync" "${SOURCE_DIR}"
prompt APP_USER "System user on VPS" "${APP_USER}"
prompt VPS_HOST "VPS host (or SSH alias)" "${VPS_HOST}"
prompt VPS_PORT "SSH port" "${VPS_PORT}"
prompt VPS_APP_DIR "App directory on VPS" "${VPS_APP_DIR}"

SYNC_TARGET="${APP_USER}@${VPS_HOST}:${VPS_APP_DIR}/"

if [[ -z "${VPS_HOST}" ]]; then
  err "VPS_HOST is required."
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
  err "Source directory not found: ${SOURCE_DIR}"
fi

require_cmd rsync
require_cmd ssh

echo
echo "About to sync with:"
echo "  SOURCE_DIR=${SOURCE_DIR}"
echo "  APP_USER=${APP_USER}"
echo "  VPS_HOST=${VPS_HOST}"
echo "  VPS_PORT=${VPS_PORT}"
echo "  VPS_APP_DIR=${VPS_APP_DIR}"
echo "  SYNC_TARGET=${SYNC_TARGET}"
echo "  Preserve destination .env and DB files: yes"
echo "  SSL/domain changes: disabled"
echo
read -r -p "Continue? [y/N]: " ok
if [[ ! "${ok}" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

RSYNC_FLAGS=(
  -az
  --delete
  --exclude ".git"
  --exclude "node_modules"
  --exclude ".next"
  --exclude ".turbo"
  --exclude ".DS_Store"
  --exclude "*.log"
  --exclude ".env"
  --exclude "*.db"
  --exclude "*.db-shm"
  --exclude "*.db-wal"
  --exclude "apps/shop/public/uploads/"
)

if [[ "${DRY_RUN}" == "1" ]]; then
  RSYNC_FLAGS+=(--dry-run)
fi

log "Syncing ${SOURCE_DIR}/ -> ${SYNC_TARGET}"
rsync "${RSYNC_FLAGS[@]}" -e "ssh -p ${VPS_PORT}" "${SOURCE_DIR}/" "${SYNC_TARGET}"

if [[ "${DRY_RUN}" == "1" ]]; then
  log "Dry run complete."
  exit 0
fi

if [[ -n "${REMOTE_POST_SYNC}" ]]; then
  log "Running remote post-sync (build + restart)"
  ssh -p "${VPS_PORT}" "${APP_USER}@${VPS_HOST}" "${REMOTE_POST_SYNC}"
fi

log "Sync complete."
