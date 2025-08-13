# Pulse — Product Spec, Roadmap & Validation Checklist
**Version:** v0.1.2  
**Date:** 2025‑08‑13  
**Owner:** Aryantech  
**Repo:** `github.com/vampyren/pulse`  
**Deploy:** https://app1.kubara.se

> Master checklist for development & QA. Keep structure, tick checkboxes, and append changelog as we ship.

---

## 1) Roles, Privacy & Core Concepts

- **Roles**
  - [x] Anonymous (not logged in) — can browse teasers; no PII, no actions
  - [x] User — full app features subject to status
  - [x] Admin — moderation, approvals, settings, user feedback

- **User Status**
  - [x] `pending` — needs approval (limited visibility)
  - [x] `approved` — normal
  - [x] `suspended` — temporarily blocked
  - [x] `rejected` — denied

- **Privacy**
  - [x] `public` — discoverable to all users (logged-out sees teasers only)
  - [x] `private` — visible to members/invitees
  - [_] (friends-only can be layered via membership/friend graph later)

- **Join Mode**
  - [x] `open` — join instantly
  - [x] `request` — owner/admin approves
  - [x] `invite` — owner/admin invites only

---

## 2) Data Model (backend-first)

> SQLite at `~/App/pulse/data/pulse.db`. Future columns may be nullable until features go live.

### Users
- **Fields:** `id (nanoid)`, `username`, `name`, `email (unique)`, `password (bcrypt)`, `is_admin (0/1)`, `status ('pending'|'approved'|'suspended'|'rejected')`,  
  `address_city`, `lat`, `lng`, `wallet_balance_cents (int, default 0)`
- **Notes:** Wallet ledger table is planned for history; status gates visibility & actions.

### Sports
- **Fields:** `id (slug)`, `name (unique)`, `icon (emoji)`
- **Seed (stable):** padel, football, basketball, volleyball, tennis, badminton, running, table_tennis

### Venues
- **Fields:** `id`, `name`, `address_city`, `lat`, `lng`, `approved (0/1)`, `created_by (user_id)`
- **Notes:** Users may propose venues; admin approves before public listing.

### Groups
- **Fields:** `id`, `name`, `sport_id → sports.id`, `privacy ('public'|'private')`, `join_mode ('open'|'request'|'invite')`, `city`,  
  `owner_id → users.id`, `created_at`, `updated_at`
- **Indexes:** `sport_id`, `(city, sport_id)` (future)

### GroupMembers
- **Fields:** `group_id → groups.id`, `user_id → users.id`, `role ('owner'|'member')`, `status ('active'|'pending')`, `joined_at`
- **PK:** `(group_id, user_id)`

### Activities
- **Fields:** `id`, `group_id → groups.id`, `title`, `starts_at (ISO)`, `ends_at (nullable)`, `venue_id → venues.id (nullable)`,  
  `privacy ('public'|'private')`, `created_by → users.id`, `created_at`

### Friendships
- **Fields:** `id`, `a_user_id`, `b_user_id`, `status ('pending'|'accepted'|'rejected')`, `requested_by`, `created_at`
- **Uniq:** `(a_user_id, b_user_id)` with ordered storage (a<b)

### Favorites (polymorphic)
- **Fields:** `id`, `user_id`, `entity_type ('activity'|'sport'|'venue'|'user')`, `entity_id`, `created_at`

### Flags / Ratings / Chat (placeholders)
- **Flags:** moderation of `user|group|activity` with `reason`, `status ('open'|'resolved')`
- **Ratings:** (future) activity/venue feedback
- **Chat:** (future) messaging threads/messages

---

## 3) API Surface (v0.1.x → v0.5 roadmap)

### v0.1.x (now)
- [x] `GET  /api/v2/health` — service check
- [x] `POST /api/v2/auth/login` — bcrypt + JWT (7d)
- [x] `GET  /api/v2/auth/me` — current user
- [x] `GET  /api/v2/auth/admin/ping` — admin-only
- [x] `GET  /api/v2/sports` — list sports
- [ ] `GET  /api/v2/groups` — list discoverable groups/activities
- [ ] `GET  /api/v2/groups/:id` — details + members
- [ ] `GET  /api/v2/venues` — approved venues
- [ ] `GET  /api/v2/activities?group=:id` — activities for group

### v0.2 (read-first)
- [ ] **Groups read**, **Group details**, **Venues read**, **Activities read**
- [ ] Auth masks for unauthenticated users at API layer (hide PII/cities)

### v0.3 (write)
- [ ] Groups CRUD (create/update/delete), join/leave with `join_mode`
- [ ] Friend requests: request/accept/reject
- [ ] Favorites CRUD (polymorphic)
- [ ] Venue proposal + admin approval

### v0.4+ (enhance)
- [ ] Wallet ledger endpoints
- [ ] Ratings, flags moderation endpoints
- [ ] Notifications (email/web), invites
- [ ] Real-time chat

---

## 4) Frontend UX & Navigation

- **Shell**
  - [x] Minimal header (brand)
  - [x] Global **glass bottom dock** (desktop hover-expand + bounce; compact labels on mobile)
  - [x] Responsive layout (mobile-first)
- **Auth**
  - [x] API client (`web/src/lib/api.ts`) — login/me/logout + JWT storage
  - [x] `AuthProvider`, `Protected`, `AuthGate` — redirect to `/login` when logged out
- **Routing (`App.tsx`)**
  - Public: `/discover`, `/map`, `/calendar`, `/login`, `/ui*`
  - Protected: `/me`, `/wallet`, `/settings`, `/friends`, `/favorites`, `/book`, `/chat`
- **Discover**
  - [x] Baseline cards (teaser-safe when logged out)
  - [ ] Sports chips fed by `/api/v2/sports` with client-side filtering (next)
- **Map / Calendar**
  - [ ] Toggle/animation between Map & Calendar modes
- **Me**
  - [x] Menu: Friends, Settings, Wallet, Favorites, Logout
- **Chat / Book**
  - [ ] Placeholder UIs, protected, wired after read endpoints

---

## 5) QA & Validation Checklist

- **Auth**
  - [x] Login returns JWT (7d); `/auth/me` resolves current user
  - [x] Protected routes redirect to `/login` if not authed
  - [x] Logout clears token + context
- **API basics**
  - [x] `/health` 200 JSON
  - [x] `/sports` returns list (8 seeded)
  - [ ] `/groups`, `/groups/:id`, `/venues`, `/activities` return shapes per Data Model
- **Privacy/Masking**
  - [x] Logged-out users see teaser data only (no PII/actions)
  - [ ] API-level masking (server enforced)
- **UI**
  - [x] Glass dock interactions (hover-expand desktop; compact mobile)
  - [ ] Mobile spacing polish for labels
- **Deploy**
  - [x] `deploy.sh` full path, `deploy.fast.sh` web-only
  - [x] Nginx SPA + `/api/v2` proxy
  - [x] `PULSE_DB_PATH` pinned for service

---

## 6) Deployment & Ops

- **Systemd**
  - [x] `pulse-backend` service (Node 22), `WorkingDirectory` backend/
  - [x] Drop-in env: `PULSE_DB_PATH=/home/vampyren/App/pulse/data/pulse.db`
- **Nginx**
  - [x] SPA served from `/var/www/pulse`; proxy `/api/v2` → `127.0.0.1:4010`
- **Scripts**
  - [x] `scripts/install.sh`
  - [x] `deploy.sh` (full), `deploy.fast.sh` (web-only)
- **Monitoring**
  - [ ] Add logs rotation & error notifications
- **Backups**
  - [ ] DB snapshot/retention for `/home/vampyren/App/pulse/data/pulse.db`

---

## 7) Seed Data (dev)

- **File:** `backend/src/db/seed.mjs` (ESM)
- **Run:** `cd backend && npm run seed`
- **Behavior:** resets relevant tables (FK-safe), seeds **users (11)** + **sports (8)**, plus scaffolding ready for venues/groups/members/activities/friendships/flags.

---

## Changelog

### 2025-08-13
- Added ESM route **`GET /api/v2/sports`** and mounted in `app.js`.
- Pinned systemd env `PULSE_DB_PATH=/home/vampyren/App/pulse/data/pulse.db` so API & seeder share the same DB.
- Simplified seeding to a single command **`npm run seed`** (ESM `seed.mjs`) → resets and seeds **users + sports**.
- Hardened frontend auth: protected **/book** and **/chat**, `AuthGate` redirect on logout.
- UI shell improvements: glass bottom dock (hover-expand on desktop, compact mobile), subtle bounce/active states.

**References (recent)**
- `backend/src/routes/sports.js`
- `backend/src/db/seed.mjs`
- `backend/src/app.js`
- `web/src/lib/api.ts`
- `web/src/components/Protected.tsx`
- `web/src/components/AuthGate.tsx`
- `web/src/components/GlassDockBottom.tsx`
- `web/src/App.tsx`

## Admin Requests & Inbox (planned)
- **Purpose:** let users request new sports/activities/venues or report moderation issues; admins see an inbox and approve/reject.
- **Data model (proposed):** `admin_requests`
  - Fields: `id`, `type ('sport'|'venue'|'feature'|'other')`, `payload (JSON)`, `status ('open'|'approved'|'rejected')`,
    `created_by (user_id)`, `created_at`, `resolved_by (user_id, nullable)`, `resolved_at (nullable)`, `notes (nullable)`
- **API (planned):**
  - `POST /api/v2/admin/requests` (authed) — create a request (payload={ what, details, icon? })
  - `GET  /api/v2/admin/requests` (admin) — list/filter `status`
  - `POST /api/v2/admin/requests/:id/approve` (admin)
  - `POST /api/v2/admin/requests/:id/reject`  (admin, body: { notes })
- **Admin UI:**
  - Inbox with tabs: Open / Approved / Rejected
  - Row actions: View → Approve / Reject (with note)
- **Notes:**
  - If `type='sport'` and approved, auto-create a new row in `sports` with icon from request.
  - Audit trail via flags/logs later.

