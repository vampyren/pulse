#!/usr/bin/env bash
set -e
cd ~/App/pulse
git pull
(cd backend && npm ci && sudo systemctl restart pulse-backend)
(cd web (cd web && npm ci && npm run build(cd web && npm ci && npm run build npm ci (cd web && npm ci && npm run build(cd web && npm ci && npm run build npm run typecheck && npm run build && sudo rsync -a --delete ~/App/pulse/web/dist/ /var/www/pulse/)
sudo systemctl reload nginx
echo "Deploy complete 🎉"
