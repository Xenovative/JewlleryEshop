#!/usr/bin/env bash
set -euo pipefail

# Sync local project files to VPS and optionally run remote steps.
#
# Host detection (first match wins for SYNC_CANDIDATE; then one ssh -G pass):
#   1. Environment variable VPS_HOST
#   2. First non-empty line in deploy/.sync-host (IP, hostname, user@host, or SSH config alias)
#   3. Environment variable SYNC_SSH_ALIAS (SSH config Host alias)
#   4. Root .env: VPS_HOST= or SYNC_SSH_ALIAS=
#   5. Hostname taken from NEXT_PUBLIC_BASE_URL in .env (e.g. https://shop.example.com)
#   6. Interactive prompt
#
# When the candidate is an SSH config alias (or any name `ssh -G` understands), the script
# resolves HostName, User, and Port from your OpenSSH configuration.
#
# Example:
#   echo 'lumiere-vps' > deploy/.sync-host
#   bash deploy/sync-site.sh
#
# Or:
#   VPS_HOST=203.0.113.10 VPS_USER=deploy VPS_APP_DIR=/var/www/lumiere \
#   bash deploy/sync-site.sh
#
# Optional:
#   VPS_PORT=22
#   REMOTE_POST_SYNC="cd /var/www/lumiere && npm ci && npm run build && sudo systemctl restart lumiere-shop lumiere-rent"
#   DRY_RUN=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

VPS_USER="${VPS_USER:-deploy}"
VPS_PORT_WAS_EXPLICIT=0
if [[ -v VPS_PORT ]]; then
  VPS_PORT_WAS_EXPLICIT=1
fi
VPS_PORT="${VPS_PORT:-22}"
VPS_APP_DIR="${VPS_APP_DIR:-/var/www/lumiere}"
# Connection target before ssh -G (env, file, .env, or prompt); VPS_HOST is set by apply_candidate_host.
SYNC_CANDIDATE="${VPS_HOST:-}"
VPS_HOST=""
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

# Read KEY=value from project .env (simple unquoted or single/double-quoted value).
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

# Apply host candidate: prefer ssh -G canonicalization, else treat as literal host (optional user@).
apply_candidate_host() {
  local candidate="$1"
  local source="$2"

  candidate="${candidate%%#*}"
  candidate="${candidate#"${candidate%%[![:space:]]*}"}"
  candidate="${candidate%"${candidate##*[![:space:]]}"}"
  [[ -n "${candidate}" ]] || return 1

  local out h u p
  if out="$(ssh -G "${candidate}" 2>/dev/null)"; then
    h="$(printf '%s\n' "${out}" | awk 'tolower($1)=="hostname"{print $2; exit}')"
    u="$(printf '%s\n' "${out}" | awk 'tolower($1)=="user"{print $2; exit}')"
    p="$(printf '%s\n' "${out}" | awk 'tolower($1)=="port"{print $2; exit}')"
    if [[ -n "${h}" ]]; then
      VPS_HOST="${h}"
      # Only take User from ssh -G when the candidate is user@… or ssh resolved an alias
      # (raw IP/hostname would otherwise pick the local login name from ssh defaults).
      if [[ -n "${u}" ]]; then
        if [[ "${candidate}" =~ @ ]] || [[ "${h}" != "${candidate}" ]]; then
          VPS_USER="${u}"
        fi
      fi
      if [[ "${VPS_PORT_WAS_EXPLICIT}" -eq 0 ]] && [[ -n "${p}" ]]; then
        VPS_PORT="${p}"
      fi
      log "Resolved \"${candidate}\" -> ${VPS_USER}@${VPS_HOST} port ${VPS_PORT} (${source}, ssh -G)"
      return 0
    fi
  fi

  if [[ "${candidate}" =~ ^([^@]+)@(.+)$ ]]; then
    VPS_USER="${BASH_REMATCH[1]}"
    VPS_HOST="${BASH_REMATCH[2]}"
  else
    VPS_HOST="${candidate}"
  fi
  log "Using ${VPS_USER}@${VPS_HOST} port ${VPS_PORT} (${source}, literal)"
  return 0
}

# Fill SYNC_CANDIDATE from file / .env when not already set (e.g. from VPS_HOST env).
gather_sync_candidate() {
  [[ -n "${SYNC_CANDIDATE}" ]] && return 0

  local sync_file="${PROJECT_ROOT}/deploy/.sync-host"
  local line val

  if [[ -f "${sync_file}" ]]; then
    line="$(head -n 1 "${sync_file}")"
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    if [[ -n "${line}" ]]; then
      SYNC_CANDIDATE="${line}"
      return 0
    fi
  fi

  if [[ -n "${SYNC_SSH_ALIAS:-}" ]]; then
    SYNC_CANDIDATE="${SYNC_SSH_ALIAS}"
    return 0
  fi

  val="$(dotenv_get VPS_HOST 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    SYNC_CANDIDATE="${val}"
    return 0
  fi

  val="$(dotenv_get SYNC_SSH_ALIAS 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    SYNC_CANDIDATE="${val}"
    return 0
  fi

  val="$(dotenv_get NEXT_PUBLIC_BASE_URL 2>/dev/null || true)"
  if [[ -n "${val}" ]]; then
    local h
    h="$(extract_host_from_url "${val}")"
    if [[ -n "${h}" ]]; then
      SYNC_CANDIDATE="${h}"
      return 0
    fi
  fi

  return 1
}

prompt_sync_candidate_if_empty() {
  local prompt_text="$1"
  local input_value

  if [[ -n "${SYNC_CANDIDATE}" ]]; then
    return
  fi

  read -r -p "${prompt_text}: " input_value
  [[ -n "${input_value}" ]] || err "VPS host is required"
  SYNC_CANDIDATE="${input_value}"
}

require_cmd rsync
require_cmd ssh

gather_sync_candidate || true
prompt_sync_candidate_if_empty "VPS host or IP (or SSH alias — see deploy/.sync-host)"

apply_candidate_host "${SYNC_CANDIDATE}" "target"

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
