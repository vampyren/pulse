# Pulse Baseline – v0.1.1
*Created: 2025-08-12 — This document represents the clean starting point for the Pulse project.*

---

## 1. Repository & Infrastructure

- **Repo:** [https://github.com/vampyren/pulse](https://github.com/vampyren/pulse)
- **Server path:** `~/App/pulse`
- **Domain:** `https://app1.kubara.se`
- **Backend:** Node.js (v22) + Express + SQLite
- **Systemd service:** `pulse-backend` (port `4010`)
- **API proxy:** Nginx → `/api/v2` → `127.0.0.1:4010`
- **Installer:** `scripts/install.sh` — *one-shot server setup*
- **Deploy script:** `deploy.sh` — *pull latest code, rebuild, deploy, reload Nginx*

---

## 2. Backend (v0.1.1)

### 2.1 Health & Auth Endpoints
- `GET /api/v2/health` — returns service status ✅
- `POST /api/v2/auth/login` — bcrypt auth + JWT (7 days) ✅
- `GET  /api/v2/auth/me` — returns current user (requires JWT) ✅
- `GET  /api/v2/auth/admin/ping` — admin-only ping ✅

### 2.2 Middleware
- `authOptional`
- `requireAuth`
- `requireAdmin`

### 2.3 Database
- **SQLite file:** `~/App/pulse/data/pulse.db`
- **Seed users** (bcrypt-hashed):
  - `admin/admin`
  - `test/test`
  - `test2/test2`
  - `test3/test3`
  - plus `bob`, `carol`, `dave`, `eva`, `frank`, `gustav`, `helena`

### 2.4 Data Model Highlights
- **Users**
  - First/last/display name
  - Gender enum
  - `status` now includes `pending`
  - Structured address: `line1`, `line2`, `city`, `postal`, `country`
  - Preferences
  - Wallet: `wallet_balance_cents` + ledger table
- **Activities/Groups**
  - Privacy & `join_mode`
  - Structured location
  - Lifecycle fields
- **Favorites**
  - Polymorphic: `activity|sport|venue|user`
- **Venues**
  - For future booking support
- **Other**
  - Flags, Ratings, Chat placeholders

---

## 3. Frontend (v0.1.0)

- Built with **Vite**
- Path alias fix applied: `@/styles/index.css`
- Served from `/var/www/pulse`
- API base: `/api/v2`

---

## 4. Documentation

- `docs/FEATURES_ROADMAP.md` — feature list & validation checklist
- `docs/DATA_MODEL.md` — ERD, tables, indexes, and rules

---

## 5. Immediate Next Steps

1. **Frontend Login Flow**
   - Add login view
   - Call `/auth/login`, store JWT in `localStorage`
   - Fetch `/auth/me` on app load, show avatar/name, add logout
2. **Sports Endpoint & Filters**
   - `GET /api/v2/sports` (id, name, icon)
3. **Groups CRUD**
   - Create / join / leave
   - Apply privacy rules
4. **Favorites**
   - Implement polymorphic favorites APIs (`activity|sport|venue|user`)

---

## 6. New Chat Copy-Paste Block

```bash
Pulse handoff (dev snapshot)
Repo: https://github.com/vampyren/pulse
Server path: ~/App/pulse
Domain: https://app1.kubara.se
Backend: Node/Express + SQLite (systemd: pulse-backend, port 4010)
API proxy: Nginx /api/v2 -> 127.0.0.1:4010
Installer: scripts/install.sh
Deploy: ./deploy.sh

Docs:
- docs/FEATURES_ROADMAP.md
- docs/DATA_MODEL.md

Auth (working):
- POST /api/v2/auth/login  -> JWT (7d)
- GET  /api/v2/auth/me     -> current user
- GET  /api/v2/auth/admin/ping -> admin-only

Seed users (dev): admin/admin, test/test, test2/test2, test3/test3, plus bob…helena
DB file: ~/App/pulse/data/pulse.db

Next focus:
1) Frontend login flow (store JWT, call /auth/me, show user state)
2) Sports endpoint & filters (GET /sports)
3) Groups CRUD (create/join/leave) with privacy rules
4) Favorites (polymorphic) APIs
