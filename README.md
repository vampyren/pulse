# Pulse Monorepo (root)

This repo will host all Pulse apps and services.

- `backend/` — Node/Express API (SQLite). Start here.
- (optional) `web/` — React frontend (to be added).
- (optional) `infra/` — deployment scripts.

## Getting started (backend)
```bash
cd backend
npm install
cp .env.example .env   # update APP_NAME if you want
node src/db/seed.js
npm run dev
```

## Git quick start
```bash
git init -b main
git add .
git commit -m "chore: init Pulse repo with backend v0.1.1"
git tag v0.1.1
```
