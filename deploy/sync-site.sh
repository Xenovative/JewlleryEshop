#!/usr/bin/env bash
set -euo pipefail

# Sync local project files to VPS and optionally run remote steps.
#
# Example:
#   VPS_HOST=203.0.113.10 VPS_USER=deploy VPS_APP_DIR=/var/www/lumiere \
#   bash deploy/sync-site.sh
#
# Optional:
#   VPS_PORT=22
#   REMOTE_POST_SYNC="cd /var/www/lumiere && npm ci && npm run build && sudo systemctl restart lumiere-shop lumiere-rent"
#   DRY_RUN=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-deploy}"
VPS_PORT="${VPS_PORT:-22}"
VPS_APP_DIR="${VPS_APP_DIR:-/var/www/lumiere}"
DRY_RUN="${DRY_RUN:-0}"

REMOTE_POST_SYNC_DEFAULT="cd '${VPS_APP_DIR}' && npm ci && npm run build && sudo systemctl restart lumiere-shop"
REMOTE_POST_SYNC="${REMOTE_POST_SYNC:-${REMOTE_POST_SYNC_DEFAULT}}"

log() {
  echo "[sync-site] $*"
}

err() {
  echo "[sync-site][error] $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Missing command: $1"
}

prompt_if_empty() {
  local var_name="$1"
  local prompt_text="$2"
  local current_value="$3"
  local input_value

  if [[ -n "${current_value}" ]]; then
    return
  fi

  read -r -p "${prompt_text}: " input_value
  [[ -n "${input_value}" ]] || err "${var_name} is required"
  printf -v "${var_name}" "%s" "${input_value}"
}

require_cmd rsync
require_cmd ssh

prompt_if_empty VPS_HOST "VPS host or IP" "${VPS_HOST}"

RSYNC_FLAGS=(
  -az
  --delete
  --exclude ".git"
  --exclude "node_modules"
  --exclude ".next"
  --exclude ".turbo"
  --exclude ".DS_Store"
  --exclude "*.log"
)

if [[ "${DRY_RUN}" == "1" ]]; then
  RSYNC_FLAGS+=(--dry-run)
fi

SSH_CMD="ssh -p ${VPS_PORT}"
TARGET="${VPS_USER}@${VPS_HOST}:${VPS_APP_DIR}/"

log "Syncing ${PROJECT_ROOT} -> ${TARGET}"
rsync "${RSYNC_FLAGS[@]}" -e "${SSH_CMD}" "${PROJECT_ROOT}/" "${TARGET}"

if [[ "${DRY_RUN}" == "1" ]]; then
  log "Dry run complete. No remote command executed."
  exit 0
fi

if [[ -n "${REMOTE_POST_SYNC}" ]]; then
  log "Running remote post-sync command"
  ssh -p "${VPS_PORT}" "${VPS_USER}@${VPS_HOST}" "${REMOTE_POST_SYNC}"
fi

log "Sync complete."
