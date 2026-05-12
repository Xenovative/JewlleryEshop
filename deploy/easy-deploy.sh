#!/usr/bin/env bash
set -euo pipefail

# Painless wrapper around deploy/vps-deploy.sh
# - Suggests APP_DIR as repo root, or /var/www/<basename> if the repo is under /root
# - When under /root, defaults SOURCE_DIR to that path so vps-deploy rsyncs into APP_DIR
#   (override with SOURCE_DIR=… or EASY_DEPLOY_SKIP_RSYNC=1 to skip the copy)
# - If APP_DIR already looks like a deployment, offers to delete it before vps-deploy
# - Re-runs itself with sudo if needed
# - Calls main script in NONINTERACTIVE mode

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR_DEFAULT="$(cd "${SELF_DIR}/.." && pwd)"
# Never default APP_DIR to a path under /root (permissions + upload/static mismatch).
IS_ROOT_CLONE=0
if [[ "${APP_DIR_DEFAULT}" == /root || "${APP_DIR_DEFAULT}" == /root/* ]]; then
  APP_DIR_SUGGEST="/var/www/$(basename "${APP_DIR_DEFAULT}")"
  IS_ROOT_CLONE=1
else
  APP_DIR_SUGGEST="${APP_DIR_DEFAULT}"
fi
MAIN_SCRIPT="${SELF_DIR}/vps-deploy.sh"

if [[ ! -x "${MAIN_SCRIPT}" ]]; then
  # Keep it robust when git doesn't preserve executable bits.
  chmod +x "${MAIN_SCRIPT}" 2>/dev/null || true
fi

log() {
  echo "[easy-deploy] $*"
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

# Non-empty APP_DIR that already has project artifacts (prior clone / deploy).
looks_like_existing_deployment() {
  local d="$1"
  [[ -d "${d}" ]] || return 1
  [[ -f "${d}/package.json" || -d "${d}/node_modules" || -d "${d}/.next" || -d "${d}/apps" ]] && return 0
  return 1
}

# Refuse obviously dangerous rm -rf targets.
safe_to_remove_deploy_dir() {
  local d="${1%/}"
  [[ -n "${d}" ]] || return 1
  case "${d}" in
    / | /root | /var | /usr | /etc | /home | /bin | /boot | /lib | /lib64 | /sbin | /opt)
      return 1
      ;;
  esac
  case "${d}" in
    /*/*) return 0 ;;
    *) return 1 ;;
  esac
}

if [[ "${EUID}" -ne 0 ]]; then
  log "This script needs root privileges for nginx/systemd/certbot."
  log "Re-running with sudo..."
  exec sudo bash "$0" "$@"
fi

[[ -f "${MAIN_SCRIPT}" ]] || {
  echo "[easy-deploy][error] Missing ${MAIN_SCRIPT}" >&2
  exit 1
}

echo
echo "Lumiere VPS Easy Deploy"
echo "-----------------------"
echo "Project root detected: ${APP_DIR_DEFAULT}"
if [[ "${IS_ROOT_CLONE}" -eq 1 ]]; then
  echo "(Repo is under /root — default APP_DIR is ${APP_DIR_SUGGEST}; files will be rsync'd there unless EASY_DEPLOY_SKIP_RSYNC=1.)"
fi
echo

APP_DIR="${APP_DIR:-${APP_DIR_SUGGEST}}"
APP_USER="${APP_USER:-${SUDO_USER:-deploy}}"
SHOP_DOMAIN="${SHOP_DOMAIN:-}"
RENT_DOMAIN="${RENT_DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
SOURCE_DIR="${SOURCE_DIR:-}"

prompt APP_DIR "App directory on VPS" "${APP_DIR}"

if looks_like_existing_deployment "${APP_DIR}"; then
  echo
  log "Existing content detected at ${APP_DIR} (e.g. package.json, node_modules, .next, or apps/)."
  read -r -p "Delete this directory entirely before deploying? [y/N]: " wipe
  if [[ "${wipe}" =~ ^[Yy]$ ]]; then
    if ! safe_to_remove_deploy_dir "${APP_DIR}"; then
      echo "[easy-deploy][error] Refusing to remove '${APP_DIR}' (path safety check). Delete manually or pick another APP_DIR." >&2
      exit 1
    fi
    log "Removing ${APP_DIR} ..."
    rm -rf "${APP_DIR}"
    log "Removed."
  else
    log "Keeping existing directory; vps-deploy will update / rsync over it where applicable."
  fi
  echo
fi

prompt APP_USER "System user for services" "${APP_USER}"
if [[ "${IS_ROOT_CLONE}" -eq 1 ]]; then
  if [[ "${EASY_DEPLOY_SKIP_RSYNC:-0}" == "1" ]]; then
    SOURCE_DIR=""
    log "EASY_DEPLOY_SKIP_RSYNC=1: not copying from /root (SOURCE_DIR left empty)."
  elif [[ -z "${SOURCE_DIR}" ]]; then
    SOURCE_DIR="${APP_DIR_DEFAULT}"
    log "Will rsync from ${SOURCE_DIR} → ${APP_DIR} (under-/root bootstrap)."
  else
    log "Using SOURCE_DIR=${SOURCE_DIR} (set in environment)."
  fi
else
  prompt SOURCE_DIR "Optional source dir to sync into APP_DIR (blank to skip)" "${SOURCE_DIR}"
fi
prompt SHOP_DOMAIN "Shop domain (required)" "${SHOP_DOMAIN}"
prompt RENT_DOMAIN "Rent domain (optional)" "${RENT_DOMAIN}"
prompt LETSENCRYPT_EMAIL "Let's Encrypt email (required)" "${LETSENCRYPT_EMAIL}"

if [[ -z "${SHOP_DOMAIN}" || -z "${LETSENCRYPT_EMAIL}" ]]; then
  echo "[easy-deploy][error] SHOP_DOMAIN and LETSENCRYPT_EMAIL are required." >&2
  exit 1
fi

echo
echo "About to deploy with:"
echo "  APP_DIR=${APP_DIR}"
echo "  APP_USER=${APP_USER}"
echo "  SOURCE_DIR=${SOURCE_DIR:-"(none)"}"
echo "  SHOP_DOMAIN=${SHOP_DOMAIN}"
echo "  RENT_DOMAIN=${RENT_DOMAIN:-"(none)"}"
echo "  LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}"
echo
read -r -p "Continue? [y/N]: " ok
if [[ ! "${ok}" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

NONINTERACTIVE=1 \
APP_DIR="${APP_DIR}" \
APP_USER="${APP_USER}" \
SOURCE_DIR="${SOURCE_DIR}" \
SHOP_DOMAIN="${SHOP_DOMAIN}" \
RENT_DOMAIN="${RENT_DOMAIN}" \
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL}" \
bash "${MAIN_SCRIPT}"

