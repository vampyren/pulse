#!/bin/sh
set -eu

cd "$HOME/App/pulse"

force="${1-}"

# record commits (may be empty if repo not yet pulled)
prev="$(git rev-parse HEAD 2>/dev/null || echo "")"
git pull --ff-only || true
now="$(git rev-parse HEAD 2>/dev/null || echo "")"

prev_ref="$prev"; [ -n "$prev_ref" ] || prev_ref=HEAD
now_ref="$now";   [ -n "$now_ref" ]   || now_ref=HEAD

changed_backend=0
changed_web=0

# remote changes
if [ -n "$prev" ] && [ -n "$now" ] && [ "$prev" != "$now" ]; then
  c1="$(git diff --name-only "$prev" "$now" -- backend | wc -l | tr -d ' ')"
  c2="$(git diff --name-only "$prev" "$now" -- web     | wc -l | tr -d ' ')"
  [ "$c1" -gt 0 ] && changed_backend=1
  [ "$c2" -gt 0 ] && changed_web=1
fi

# local uncommitted changes
l1="$(git status --porcelain -- backend | wc -l | tr -d ' ')"
l2="$(git status --porcelain -- web     | wc -l | tr -d ' ')"
[ "$l1" -gt 0 ] && changed_backend=1
[ "$l2" -gt 0 ] && changed_web=1

# force flags
[ "${force}" = "--force" ]          && changed_backend=1 && changed_web=1
[ "${force}" = "--force-web" ]      && changed_web=1
[ "${force}" = "--force-backend" ]  && changed_backend=1

# BACKEND
if [ "$changed_backend" -gt 0 ]; then
  if git diff --quiet "$prev_ref" "$now_ref" -- backend/package.json backend/package-lock.json 2>/dev/null; then
    echo "backend: deps unchanged"
  else
    (cd backend && npm ci)
  fi
  sudo systemctl restart pulse-backend
fi

# WEB
if [ "$changed_web" -gt 0 ]; then
  if git diff --quiet "$prev_ref" "$now_ref" -- web/package.json web/package-lock.json 2>/dev/null; then
    echo "web: deps unchanged"
  else
    (cd web && npm ci)
  fi
  (cd web && npm run typecheck && npm run build)
  sudo rsync -a --delete "$HOME/App/pulse/web/dist/" /var/www/pulse/
  sudo systemctl reload nginx
fi

if [ "$changed_backend" -eq 0 ] && [ "$changed_web" -eq 0 ]; then
  echo "No changes detected. Tip: ./deploy.fast.sh --force-web"
fi

echo "Deploy complete 🎉"
