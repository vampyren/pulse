#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Pulse — One-shot Installer (Ubuntu)
# Version: v0.1.2
# Purpose: Provision a new server and deploy Pulse end-to-end.
# ----------------------------------------------------------------------------- 
set -euo pipefail

# ----------------------------- Config (defaults) ------------------------------
APP_USER="${APP_USER:-vampyren}"
DOMAIN="${DOMAIN:-app1.kubara.se}"
EMAIL="${EMAIL:-admin@${DOMAIN#*.}}"
REPO_URL="${REPO_URL:-https://github.com/vampyren/pulse.git}"
BRANCH="${BRANCH:-main}"
COMPANY="${COMPANY:-Aryantech}"
API_PORT="${API_PORT:-4010}"

APP_ROOT="/home/$APP_USER/App/pulse"
BACKEND_DIR="$APP_ROOT/backend"
WEB_DIR="$APP_ROOT/web"
DATA_DIR="$APP_ROOT/data"
WWW_ROOT="/var/www/pulse"
SYSTEMD_UNIT="/etc/systemd/system/pulse-backend.service"
NGINX_SITE="/etc/nginx/sites-available/pulse"

# ----------------------------- Helpers ---------------------------------------
log(){ echo -e "\033[1;32m[Pulse]\033[0m $*"; }
warn(){ echo -e "\033[1;33m[Pulse]\033[0m $*" >&2; }
die(){ echo -e "\033[1;31m[Pulse]\033[0m $*" >&2; exit 1; }

need_root(){
  [[ $EUID -eq 0 ]] || die "Run as root: sudo bash scripts/install.sh"
}

as_user(){ sudo -u "$APP_USER" -H bash -lc "$*"; }

file_has(){ [[ -f "$1" ]] && grep -q "$2" "$1"; }

# ----------------------------- Start -----------------------------------------
need_root

log "Using:
  USER=$APP_USER
  DOMAIN=$DOMAIN
  EMAIL=$EMAIL
  REPO_URL=$REPO_URL (branch $BRANCH)
  API_PORT=$API_PORT
  APP_ROOT=$APP_ROOT"

# 0) Sanity
id "$APP_USER" >/dev/null 2>&1 || die "User $APP_USER does not exist"

# 1) Base packages
log "Installing base packages…"
apt-get update -y
apt-get install -y git curl nginx certbot python3-certbot-nginx build-essential sqlite3 rsync

# 2) Node.js (use NodeSource so /usr/bin/node is available to systemd)
if ! command -v node >/dev/null 2>&1; then
  log "Installing Node.js (NodeSource 22.x)…"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  log "Node.js present: $(node -v)"
fi

# 3) Clone or update repo
log "Preparing repo at $APP_ROOT…"
install -d -m 0755 -o "$APP_USER" -g "$APP_USER" "$APP_ROOT"
if [[ -d "$APP_ROOT/.git" ]]; then
  log "Repo exists → pulling latest…"
  as_user "cd $APP_ROOT && git fetch && git checkout $BRANCH && git pull"
else
  log "Cloning repo…"
  as_user "git clone -b $BRANCH $REPO_URL $APP_ROOT"
fi

# 4) Env files
log "Writing backend .env (no commit)…"
install -d -m 0755 -o "$APP_USER" -g "$APP_USER" "$DATA_DIR"
BACKEND_ENV="$BACKEND_DIR/.env"
if [[ ! -f "$BACKEND_ENV" ]]; then
  JWT=$(openssl rand -hex 32)
  cat >"$BACKEND_ENV"<<EOF
COMPANY=$COMPANY
NODE_ENV=production
PORT=$API_PORT
JWT_SECRET=$JWT
DB_FILE=$DATA_DIR/pulse.db
EOF
  chown "$APP_USER:$APP_USER" "$BACKEND_ENV"
  chmod 600 "$BACKEND_ENV"
else
  warn "backend/.env exists → leaving as-is"
fi

log "Writing web .env (no commit)…"
WEB_ENV="$WEB_DIR/.env"
if [[ ! -f "$WEB_ENV" ]]; then
  cat >"$WEB_ENV"<<'EOF'
VITE_APP_NAME=Pulse
VITE_API_BASE_URL=/api/v2
EOF
  chown "$APP_USER:$APP_USER" "$WEB_ENV"
  chmod 600 "$WEB_ENV"
else
  warn "web/.env exists → leaving as-is"
fi

# 5) Backend deps + seed
log "Installing backend deps…"
as_user "cd $BACKEND_DIR && npm ci"

log "Seeding database…"
as_user "cd $BACKEND_DIR && node src/db/seed.js"

# 6) Systemd service
log "Creating systemd service…"
cat >"$SYSTEMD_UNIT"<<EOF
[Unit]
Description=Pulse API
After=network.target

[Service]
Type=simple
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/node src/server.js
EnvironmentFile=$BACKEND_DIR/.env
User=$APP_USER
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pulse-backend

# 7) Frontend build → /var/www/pulse
log "Building frontend…"
as_user "cd $WEB_DIR && npm ci && npm run build"
install -d -m 0755 "$WWW_ROOT"
rsync -a --delete "$WEB_DIR/dist/" "$WWW_ROOT/"

# 8) Nginx site
log "Configuring Nginx…"
cat >"$NGINX_SITE"<<EOF
server {
  listen 80;
  server_name $DOMAIN;

  root $WWW_ROOT;
  index index.html;

  location / {
    try_files \$uri /index.html;
  }

  location /api/v2/ {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }
}
EOF

ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/pulse
nginx -t && systemctl reload nginx

# 9) TLS (optional if DNS isn’t pointed yet)
if host "$DOMAIN" >/dev/null 2>&1; then
  log "Issuing TLS via Certbot for $DOMAIN…"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || warn "Certbot failed (DNS/ports?) — you can re-run later"
else
  warn "DNS for $DOMAIN not resolving here yet — skipping Certbot (run later: certbot --nginx -d $DOMAIN)"
fi

# 10) UFW (only if active)
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  log "UFW detected → allowing Nginx Full"
  ufw allow 'Nginx Full' || true
fi

# 11) Deploy script for future updates
DEPLOY="$APP_ROOT/deploy.sh"
if [[ ! -f "$DEPLOY" ]]; then
  log "Creating deploy script…"
  cat >"$DEPLOY"<<'EOS'
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "[deploy] git pull…"
git pull
echo "[deploy] backend deps + restart…"
(cd backend && npm ci && sudo systemctl restart pulse-backend)
echo "[deploy] web build + rsync…"
(cd web && npm ci && npm run build && sudo rsync -a --delete web/dist/ /var/www/pulse/)
echo "[deploy] reload nginx…"
sudo systemctl reload nginx
echo "[deploy] done 🎉"
EOS
  chown "$APP_USER:$APP_USER" "$DEPLOY"
  chmod +x "$DEPLOY"
fi

# 12) Final checks
sleep 1
log "Health check:"
curl -fsS "http://127.0.0.1:$API_PORT/api/v2/health" || true
echo
log "If health looks good, open: https://$DOMAIN"
log "Re-deploy next time with: bash $DEPLOY"
