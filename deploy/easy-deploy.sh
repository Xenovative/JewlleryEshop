#!/usr/bin/env bash
set -euo pipefail

# Painless wrapper around deploy/vps-deploy.sh
# - Auto-detects APP_DIR as repo root (script parent/..)
# - Asks only essential questions
# - Re-runs itself with sudo if needed
# - Calls main script in NONINTERACTIVE mode

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR_DEFAULT="$(cd "${SELF_DIR}/.." && pwd)"
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
echo

APP_DIR="${APP_DIR:-${APP_DIR_DEFAULT}}"
APP_USER="${APP_USER:-${SUDO_USER:-deploy}}"
SHOP_DOMAIN="${SHOP_DOMAIN:-}"
RENT_DOMAIN="${RENT_DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
SOURCE_DIR="${SOURCE_DIR:-}"

prompt APP_DIR "App directory on VPS" "${APP_DIR}"
prompt APP_USER "System user for services" "${APP_USER}"
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

