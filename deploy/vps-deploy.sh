#!/usr/bin/env bash
set -euo pipefail

# Lumiere VPS deploy script
# - Installs system dependencies (nginx, certbot, node)
# - Pulls/builds the repo
# - Runs shop + rent via systemd
# - Configures Nginx reverse proxy
# - Issues/renews Let's Encrypt certificates
#
# Usage (project already on VPS, no git needed):
#   sudo \
#   SHOP_DOMAIN=shop.example.com \
#   RENT_DOMAIN=rent.example.com \
#   LETSENCRYPT_EMAIL=ops@example.com \
#   APP_DIR=/var/www/lumiere \
#   APP_USER=deploy \
#   bash deploy/vps-deploy.sh
#
# Notes:
# - APP_DIR should point to an existing local project directory on the VPS.
# - If APP_DIR is missing, set SOURCE_DIR to copy files from a local path.
# - RENT_DOMAIN is optional. If omitted, only the shop app is exposed.
# - Ensure DNS for domains points to this VPS before running certbot.

log() {
  echo "[deploy] $*"
}

err() {
  echo "[deploy][error] $*" >&2
  exit 1
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    err "Run as root (e.g. sudo ... bash deploy/vps-deploy.sh)"
  fi
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Missing command: $1"
}

prompt_with_default() {
  local var_name="$1"
  local prompt_text="$2"
  local default_value="${3:-}"
  local secret="${4:-false}"
  local value

  if [[ "${secret}" == "true" ]]; then
    read -r -s -p "${prompt_text} [${default_value}]: " value
    echo
  else
    read -r -p "${prompt_text} [${default_value}]: " value
  fi

  if [[ -z "${value}" ]]; then
    value="${default_value}"
  fi
  printf -v "${var_name}" "%s" "${value}"
}

prompt_yes_no() {
  local prompt_text="$1"
  local default_answer="${2:-y}"
  local answer
  read -r -p "${prompt_text} [${default_answer}/n]: " answer
  answer="${answer:-${default_answer}}"
  [[ "${answer}" =~ ^[Yy]$ ]]
}

collect_inputs() {
  echo
  log "Step 1/8: Collect deployment settings"
  prompt_with_default APP_DIR "App directory on VPS" "${APP_DIR}"
  prompt_with_default APP_USER "System user for services" "${APP_USER}"
  prompt_with_default SOURCE_DIR "Optional source dir to copy from (blank to skip)" "${SOURCE_DIR}"
  prompt_with_default SHOP_DOMAIN "Shop domain" "${SHOP_DOMAIN}"
  prompt_with_default RENT_DOMAIN "Rent domain (optional)" "${RENT_DOMAIN}"
  prompt_with_default LETSENCRYPT_EMAIL "Let's Encrypt email" "${LETSENCRYPT_EMAIL}"

  [[ -n "${SHOP_DOMAIN}" ]] || err "SHOP_DOMAIN is required"
  [[ -n "${LETSENCRYPT_EMAIL}" ]] || err "LETSENCRYPT_EMAIL is required"

  echo
  log "Deployment summary:"
  echo "  APP_DIR: ${APP_DIR}"
  echo "  APP_USER: ${APP_USER}"
  if [[ -n "${SOURCE_DIR}" ]]; then
    echo "  SOURCE_DIR: ${SOURCE_DIR}"
  else
    echo "  SOURCE_DIR: (none)"
  fi
  echo "  SHOP_DOMAIN: ${SHOP_DOMAIN}"
  echo "  RENT_DOMAIN: ${RENT_DOMAIN:-"(none)"}"
  echo "  LETSENCRYPT_EMAIL: ${LETSENCRYPT_EMAIL}"
  echo
  prompt_yes_no "Proceed with deployment?" "y" || err "Cancelled by user"
}

ensure_apt_pkgs() {
  log "Installing system packages"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    curl \
    git \
    rsync \
    ca-certificates \
    build-essential
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
    if [[ "${major}" -ge 20 ]]; then
      log "Node $(node -v) already installed"
      return
    fi
  fi

  log "Installing Node.js 20.x"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  log "Node installed: $(node -v), npm: $(npm -v)"
}

ensure_user() {
  if id -u "${APP_USER}" >/dev/null 2>&1; then
    return
  fi
  log "Creating user ${APP_USER}"
  useradd --create-home --shell /bin/bash "${APP_USER}"
}

setup_repo() {
  local candidate
  local probe

  # Helper: valid monorepo root has package.json + apps/shop + packages/db.
  is_repo_root() {
    local dir="$1"
    [[ -f "${dir}/package.json" && -d "${dir}/apps/shop" && -d "${dir}/packages/db" ]]
  }

  # 1) If APP_DIR is already the root, use it.
  if is_repo_root "${APP_DIR}"; then
    log "Using existing local project at ${APP_DIR}"
    chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
    return
  fi

  # 2) If APP_DIR points inside repo (e.g. /app/apps or /app/apps/shop), walk up.
  probe="${APP_DIR}"
  for _ in 1 2 3 4 5; do
    if is_repo_root "${probe}"; then
      log "Detected project root by walking upward: ${probe} (updating APP_DIR)"
      APP_DIR="${probe}"
      chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
      return
    fi
    if [[ "${probe}" == "/" ]]; then
      break
    fi
    probe="$(dirname "${probe}")"
  done

  # Common case: user copied the project into a subfolder (e.g. /var/www/lumiere/JewlleryEshop).
  # Auto-detect one level down if it looks like this monorepo.
  candidate="$(
    find "${APP_DIR}" -mindepth 1 -maxdepth 2 -type f -name package.json 2>/dev/null \
      | while read -r f; do
          d="$(dirname "$f")"
          if [[ -f "${d}/package.json" && -d "${d}/apps/shop" && -d "${d}/packages/db" ]]; then
            echo "${d}"
            break
          fi
        done
  )"
  if [[ -n "${candidate}" ]]; then
    log "Detected project root at ${candidate} (updating APP_DIR)"
    APP_DIR="${candidate}"
    chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
    return
  fi

  if [[ -n "${SOURCE_DIR}" && -f "${SOURCE_DIR}/package.json" ]]; then
    log "Copying local source from ${SOURCE_DIR} -> ${APP_DIR}"
    mkdir -p "${APP_DIR}"
    rsync -a --delete \
      --exclude .git \
      --exclude node_modules \
      --exclude .next \
      "${SOURCE_DIR}/" "${APP_DIR}/"
    chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
    return
  fi

  err "APP_DIR does not contain a project root (missing package.json/apps/shop/packages/db). Set APP_DIR to the repo root or provide SOURCE_DIR."
}

configure_env_file() {
  if [[ ! -f "${APP_DIR}/.env" ]]; then
    if [[ -f "${APP_DIR}/.env.example" ]]; then
      log "Creating .env from .env.example (fill real secrets before production traffic)"
      sudo -u "${APP_USER}" -H bash -lc "cp '${APP_DIR}/.env.example' '${APP_DIR}/.env'"
    else
      err "No .env or .env.example found at ${APP_DIR}"
    fi
  fi

  # Make sure public base URLs match domains.
  local rent_url
  rent_url="http://localhost:3001"
  if [[ -n "${RENT_DOMAIN}" ]]; then
    rent_url="https://${RENT_DOMAIN}"
  fi
  sed -i -E "s#^NEXT_PUBLIC_BASE_URL=.*#NEXT_PUBLIC_BASE_URL=\"https://${SHOP_DOMAIN}\"#g" "${APP_DIR}/.env" || true
  sed -i -E "s#^RENT_BASE_URL=.*#RENT_BASE_URL=\"${rent_url}\"#g" "${APP_DIR}/.env" || true
}

build_apps() {
  log "Installing npm dependencies"
  sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && npm ci"

  log "Pushing database schema"
  sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && npm run db:push"

  log "Building shop + rent"
  sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && npm run build"
}

write_systemd_services() {
  log "Writing systemd services"
  cat >/etc/systemd/system/lumiere-shop.service <<EOF
[Unit]
Description=Lumiere Shop (Next.js)
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
ExecStart=/usr/bin/env bash -lc 'cd "${APP_DIR}" && npm run -w @lumiere/shop start'
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now lumiere-shop.service

  if [[ -n "${RENT_DOMAIN}" ]]; then
    cat >/etc/systemd/system/lumiere-rent.service <<EOF
[Unit]
Description=Lumiere Rent (Next.js)
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
ExecStart=/usr/bin/env bash -lc 'cd "${APP_DIR}" && npm run -w @lumiere/rent start'
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable --now lumiere-rent.service
  fi
}

write_nginx_config() {
  log "Writing nginx site config"
  cat >/etc/nginx/sites-available/lumiere.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SHOP_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

  if [[ -n "${RENT_DOMAIN}" ]]; then
    cat >>/etc/nginx/sites-available/lumiere.conf <<EOF

server {
    listen 80;
    listen [::]:80;
    server_name ${RENT_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
  fi

  ln -sf /etc/nginx/sites-available/lumiere.conf /etc/nginx/sites-enabled/lumiere.conf
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
}

issue_ssl() {
  log "Issuing Let's Encrypt certificates"
  local certbot_cmd=(
    certbot --nginx --non-interactive --agree-tos
    --redirect
    --email "${LETSENCRYPT_EMAIL}"
    -d "${SHOP_DOMAIN}"
  )
  if [[ -n "${RENT_DOMAIN}" ]]; then
    certbot_cmd+=(-d "${RENT_DOMAIN}")
  fi
  "${certbot_cmd[@]}"

  # Certbot timer is usually enabled automatically, but this is harmless if already set.
  systemctl enable --now certbot.timer || true
  systemctl reload nginx
}

print_summary() {
  echo
  log "Deployment complete"
  echo "Shop URL: https://${SHOP_DOMAIN}"
  if [[ -n "${RENT_DOMAIN}" ]]; then
    echo "Rent URL: https://${RENT_DOMAIN}"
  fi
  echo
  echo "Useful checks:"
  echo "  systemctl status lumiere-shop"
  if [[ -n "${RENT_DOMAIN}" ]]; then
    echo "  systemctl status lumiere-rent"
  fi
  echo "  nginx -t"
  echo "  journalctl -u lumiere-shop -f"
}

require_root

APP_DIR="${APP_DIR:-/var/www/lumiere}"
APP_USER="${APP_USER:-${SUDO_USER:-deploy}}"
SOURCE_DIR="${SOURCE_DIR:-}"
SHOP_DOMAIN="${SHOP_DOMAIN:-}"
RENT_DOMAIN="${RENT_DOMAIN:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

collect_inputs

log "Step 2/8: Install apt packages"
ensure_apt_pkgs
log "Step 3/8: Install/verify Node.js"
ensure_node
require_cmd nginx
require_cmd certbot
require_cmd npm

log "Step 4/8: Ensure deploy user and project files"
ensure_user
setup_repo
log "Step 5/8: Configure environment file"
configure_env_file
log "Step 6/8: Install dependencies and build apps"
build_apps
log "Step 7/8: Configure systemd and nginx"
write_systemd_services
write_nginx_config
log "Step 8/8: Request SSL certificates"
issue_ssl
print_summary
