#!/usr/bin/env bash
set -euo pipefail

# Copy the project tree to a destination (no git commands — run those yourself first).
# Uses rsync --delete with the same excludes as before.
#
# Destination (first match wins):
#   1. SYNC_TARGET — full rsync destination, either:
#        - Local dir (mounted disk, WSL path, etc.): /mnt/lumiere/  or  W:/lumiere/
#        - Remote: user@host:/var/www/lumiere/
#   2. VPS_HOST + VPS_USER + VPS_APP_DIR  ->  ${VPS_USER}@${VPS_HOST}:${VPS_APP_DIR}/
#   3. First line of deploy/.sync-host (same formats as SYNC_TARGET)
#   4. .env SYNC_TARGET= or VPS_HOST= (see dotenv_get below)
#
# Remote targets (user@host:path) use rsync over ssh — ssh must be installed.
# Local targets do not use ssh.
#
# SSH keys: use the SAME host string as in ~/.ssh/config (e.g. if you have
#   Host jewel
#     HostName jewel.xenovative-ltd.com
#     IdentityFile ~/.ssh/id_ed25519
# then set SYNC_TARGET=deploy@jewel:/var/www/lumiere — not the FQDN — so that
# Host block matches. This script only reads Port from ssh -G; it does not
# rewrite your host to the canonical name (that would skip IdentityFile).
#
# Optional:
#   VPS_PORT=22
#   RSYNC_RSH — full rsync transport, e.g. "ssh" or "ssh -i /path/key -p 22"
#               (default: ssh -p $VPS_PORT)
#   REMOTE_POST_SYNC — shell command run AFTER sync; only for remote targets (ssh).
#                        Set empty to skip. Default restarts lumiere-shop.
#   DRY_RUN=1
#
# Examples:
#   SYNC_TARGET=/Volumes/my-vps-mount/lumiere bash deploy/sync-site.sh
#   SYNC_TARGET=deploy@203.0.113.10:/var/www/lumiere bash deploy/sync-site.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

VPS_USER="${VPS_USER:-deploy}"
VPS_PORT_WAS_EXPLICIT=0
if [[ -v VPS_PORT ]]; then
  VPS_PORT_WAS_EXPLICIT=1
fi
VPS_PORT="${VPS_PORT:-22}"
VPS_APP_DIR="${VPS_APP_DIR:-/var/www/lumiere}"
VPS_HOST="${VPS_HOST:-}"
SYNC_TARGET="${SYNC_TARGET:-}"

REMOTE_POST_SYNC_DEFAULT="cd '${VPS_APP_DIR}' && npm ci && npm run build && sudo systemctl restart lumiere-shop"
REMOTE_POST_SYNC="${REMOTE_POST_SYNC:-${REMOTE_POST_SYNC_DEFAULT}}"

DRY_RUN="${DRY_RUN:-0}"

log() {
  echo "[sync-site] $*" >&2
}

err() {
  echo "[sync-site][error] $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Missing command: $1"
}

dotenv_get() {
  local key="$1"
  local file="${PROJECT_ROOT}/.env"
  [[ -f "$file" ]] || return 1
  local line
  line="$(grep -E "^[[:space:]]*${key}=" "$file" 2>/dev/null | tail -n 1)" || return 1
  [[ -n "$line" ]] || return 1
  local val="${line#*=}"
  val="${val#"${val%%[![:space:]]*}"}"
  val="${val%"${val##*[![:space:]]}"}"
  if [[ "${val}" =~ ^\".*\"$ ]]; then
    val="${val#\"}"
    val="${val%\"}"
  elif [[ "${val}" =~ ^\'.*\'$ ]]; then
    val="${val#\'}"
    val="${val%\'}"
  fi
  [[ -n "${val}" ]] || return 1
  printf '%s' "${val}"
}

extract_host_from_url() {
  local url="$1"
  url="${url#https://}"
  url="${url#http://}"
  url="${url%%/*}"
  url="${url%%:*}"
  printf '%s' "${url}"
}

# user@host:/path or user@host:path -> remote (ssh). Everything else -> local.
is_remote_rsync_target() {
  [[ "$1" =~ ^[^@]+@[^:]+:.+ ]]
}

# Apply Port from ssh -G only — keep host string unchanged so ~/.ssh/config Host matches.
apply_ssh_config_port_only() {
  local host_part="$1"
  local out p
  if out="$(ssh -G "${host_part}" 2>/dev/null)"; then
    p="$(printf '%s\n' "${out}" | awk 'tolower($1)=="port"{print $2; exit}')"
    if [[ "${VPS_PORT_WAS_EXPLICIT}" -eq 0 ]] && [[ -n "${p}" ]]; then
      VPS_PORT="${p}"
    fi
  fi
}

gather_sync_target() {
  local val line sync_file

  if [[ -n "${SYNC_TARGET}" ]]; then
    return 0
  fi

  if [[ -n "${VPS_HOST}" ]]; then
    SYNC_TARGET="${VPS_USER}@${VPS_HOST}:${VPS_APP_DIR}/"
    return 0
  fi

  sync_file="${PROJECT_ROOT}/deploy/.sync-host"
  if [[ -f "${sync_file}" ]]; then
    line="$(head -n 1 "${sync_file}")"
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    if [[ -n "${line}" ]]; then
      if is_remote_rsync_target "${line}"; then
        SYNC_TARGET="${line}"
      elif [[ "${line}" =~ ^[^@]+@[^@]+$ ]]; then
        # user@host with no path
        SYNC_TARGET="${line}:${VPS_APP_DIR}/"
      elif [[ -n "${line}" ]]; then
        # Bare hostname or IP -> build user@host:appdir
        SYNC_TARGET="${VPS_USER}@${line}:${VPS_APP_DIR}/"
      fi
      [[ -n "${SYNC_TARGET}" ]] && return 0
    fi
  fi

  val="$(dotenv_get SYNC_TARGET 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    SYNC_TARGET="${val}"
    return 0
  fi

  val="$(dotenv_get VPS_HOST 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    SYNC_TARGET="${VPS_USER}@${val}:${VPS_APP_DIR}/"
    return 0
  fi

  val="$(dotenv_get SYNC_SSH_ALIAS 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    require_cmd ssh
    SYNC_TARGET="${VPS_USER}@${val}:${VPS_APP_DIR}/"
    apply_ssh_config_port_only "${val}"
    return 0
  fi

  val="$(dotenv_get NEXT_PUBLIC_BASE_URL 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    local h
    h="$(extract_host_from_url "${val}")"
    if [[ -n "${h}" ]]; then
      SYNC_TARGET="${VPS_USER}@${h}:${VPS_APP_DIR}/"
      return 0
    fi
  fi

  return 1
}

prompt_sync_target_if_empty() {
  local input_value

  if [[ -n "${SYNC_TARGET}" ]]; then
    return
  fi

  read -r -p "SYNC_TARGET (local path or user@host:/remote/path): " input_value
  [[ -n "${input_value}" ]] || err "SYNC_TARGET is required"
  SYNC_TARGET="${input_value}"
}

require_cmd rsync

gather_sync_target || true
prompt_sync_target_if_empty

[[ -n "${SYNC_TARGET}" ]] || err "Set SYNC_TARGET or VPS_HOST (or deploy/.sync-host)"

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

REMOTE_RUN=0
RSYNC_SHELL=()

if is_remote_rsync_target "${SYNC_TARGET}"; then
  require_cmd ssh
  REMOTE_RUN=1
  if [[ "${SYNC_TARGET}" =~ ^([^@]+)@([^:]+):(.+)$ ]]; then
    VPS_USER="${BASH_REMATCH[1]}"
    _host="${BASH_REMATCH[2]}"
    apply_ssh_config_port_only "${_host}"
  fi
  log "Using rsync target ${SYNC_TARGET}"
  if [[ -n "${RSYNC_RSH:-}" ]]; then
    RSYNC_SHELL=(-e "${RSYNC_RSH}")
  else
    RSYNC_SHELL=(-e "ssh -p ${VPS_PORT}")
  fi
else
  log "Local rsync target (no ssh): ${SYNC_TARGET}"
fi

log "Syncing ${PROJECT_ROOT}/ -> ${SYNC_TARGET}"
if [[ "${#RSYNC_SHELL[@]}" -gt 0 ]]; then
  rsync "${RSYNC_FLAGS[@]}" "${RSYNC_SHELL[@]}" "${PROJECT_ROOT}/" "${SYNC_TARGET}"
else
  rsync "${RSYNC_FLAGS[@]}" "${PROJECT_ROOT}/" "${SYNC_TARGET}"
fi

if [[ "${DRY_RUN}" == "1" ]]; then
  log "Dry run complete."
  exit 0
fi

if [[ "${REMOTE_RUN}" -eq 1 ]] && [[ -n "${REMOTE_POST_SYNC}" ]]; then
  if [[ "${SYNC_TARGET}" =~ ^([^@]+)@([^:]+): ]]; then
    _u="${BASH_REMATCH[1]}"
    _h="${BASH_REMATCH[2]}"
    log "Running remote post-sync"
    if [[ -n "${RSYNC_RSH:-}" ]]; then
      # shellcheck disable=SC2086
      ${RSYNC_RSH} "${_u}@${_h}" "${REMOTE_POST_SYNC}"
    else
      ssh -p "${VPS_PORT}" "${_u}@${_h}" "${REMOTE_POST_SYNC}"
    fi
  fi
elif [[ "${REMOTE_RUN}" -eq 0 ]] && [[ -n "${REMOTE_POST_SYNC:-}" ]]; then
  log "Skipping REMOTE_POST_SYNC (local target). Run build/restart on the server yourself if needed."
fi

log "Sync complete."
