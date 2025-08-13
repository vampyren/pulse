# Pulse — Product Spec, Roadmap & Validation Checklist

**Version:** v0.1.0
**Date:** 2025‑08‑11
**Owner:** Aryantech
**Repo:** `github.com/vampyren/pulse`
**Deploy:** [https://app1.kubara.se](https://app1.kubara.se)

> This document captures the full feature set we aligned on, how we’ll validate each item, and the backend-first shape so the frontend never has to guess. Use it as the master checklist for development and QA.

---

## 1) Roles, Privacy & Core Concepts

* **Roles**

  * **Admin**: full moderation, content management, user actions (approve/suspend/ban), activity moderation, access to metrics and logs.
  * **User**: standard use; can create/join/leave activities, manage profile, friendships, chat (later), report/flag content.
* **Membership roles (per activity)**: `owner` (creator), `cohost` (optional, future), `member`.
* **Privacy levels (per activity)**

  * `PUBLIC`: visible to all.
  * `FRIENDS`: visible only to **creator and creator’s friends** (friends can request to join; creator can invite friends).
  * `INVITE`: hidden except to invited users and members.
* **Join modes** (server-enforced): `instant` (auto-join if slots), `request` (owner approval), `invite_only` (explicit invite required).
* **Flags & Ratings** (moderation & quality)

  * Users can **rate** activities (1–5) and **flag** abusive/incorrect content; Admin reviews in Moderation.
* **History & Audit**

  * Server stores immutable actions (create/edit/delete activities, joins/leaves, bans, moderation decisions). Admin can view per-user and per-activity history.

---

## 2) Data Model (backend-first)

**Users**: id, username, name, email, password\_hash, avatar\_url, bio, address\_city, lat, lng, language, theme, favorite\_sports\[], created\_at, status (`approved|suspended|banned`).

**Friendships**: id, requester\_id, addressee\_id, status (`pending|accepted|blocked`), created\_at.

**Sports**: id, name, icon (emoji or asset path), is\_active.

**Activities (Groups)**: id, title, details, sport\_id, creator\_id, location\_full, location\_city, lat, lng, date\_time, max\_members, experience\_level, privacy (`PUBLIC|FRIENDS|INVITE`), join\_mode (`instant|request|invite_only`), is\_active, created\_at.

**Memberships**: id, activity\_id, user\_id, role (`owner|cohost|member`), joined\_at.

**Invites**: id, activity\_id, user\_id, status (`pending|accepted|declined`), invited\_by, created\_at.

**Join Requests**: id, activity\_id, user\_id, status (`pending|approved|rejected`), reviewed\_by, created\_at.

**Favorites**: id, user\_id, activity\_id, created\_at.

**Ratings**: id, activity\_id, user\_id, score (1–5), comment, created\_at.

**Flags/Reports**: id, entity\_type (`activity|user|message`), entity\_id, reason, details, reporter\_id, status (`open|closed`), created\_at, resolved\_by, resolved\_at.

**Chat (future)**

* **Threads**: id, type (`dm|group`), title (for group), owner\_id, is\_private, created\_at.
* **ThreadMembers**: id, thread\_id, user\_id, role (`owner|mod|member`), joined\_at.
* **Messages**: id, thread\_id, user\_id, body, attachments\[], created\_at, edited\_at, deleted\_at.
* **Moderation**: message flags, thread mutes, member kicks.

**Bookings (future)**

* **Venues**: id, name, address, lat, lng, provider\_id, metadata.
* **Slots**: id, venue\_id, start, end, price, currency.
* **Bookings**: id, activity\_id (optional), venue\_id, slot\_id, status (`draft|pending_payment|confirmed|canceled`), total, split\_mode (`even|custom`).
* **Payments**: id, booking\_id, user\_id, amount, status (`pending|paid|failed`).

> Notes: We keep future tables sketched to avoid migrations later. Fields can stay nullable until the features go live.

---

## 3) API Surface (v0.1.x → v0.5 roadmap)

**v0.1.x (now)**

* `GET /api/v2/health` — service check ✅
* `POST /api/v2/auth/login` — JWT (7d expiry) ✅
* `GET /api/v2/groups` — list discoverable activities with privacy filtering ✅

**v0.1.x planned additions**

* `GET /api/v2/me` — returns current user profile.
* `GET /api/v2/sports` — list sports for filters.

**v0.2 — Membership & Social**

* `POST /api/v2/groups` (owner-only) — create activity.
* `POST /api/v2/groups/:id/join` — instant or create join-request.
* `POST /api/v2/groups/:id/leave` — leave activity.
* `GET /api/v2/groups/:id` — details + members.
* `POST /api/v2/groups/:id/requests/:reqId/approve|reject` — owner/admin.
* `POST /api/v2/groups/:id/invites` — invite by username/email.
* `POST /api/v2/friends` — send request; `PATCH /friends/:id` accept/reject; `GET /friends` list.
* `POST /api/v2/favorites/:activityId` (toggle) ; `GET /favorites` list.

**v0.3 — Map & Calendar Modes**

* `GET /api/v2/groups/map?bbox=…&sport=…` — clustered markers.
* `GET /api/v2/groups/calendar?from=…&to=…` — calendar feed.

**v0.4 — Chat**

* `POST /api/v2/chat/threads` ; `GET /chat/threads`
* `POST /api/v2/chat/threads/:id/messages` ; `GET /chat/threads/:id/messages`
* Member add/remove/kick endpoints.

**v0.5 — Bookings**

* Venue/slot discovery, booking create, cost split, per-user payment confirmations, submit when all paid.

> **Dedup rules**: Prefer `join_requests` + `invites` over extra status fields. Keep `favorites` separate from `memberships`. Ratings vs Flags remain distinct (different workflows).

---

## 4) Frontend Scope & UX (responsive, app-like)

**Shell & Navigation**

* Bottom nav (mobile), top bar (desktop), version badge.
* Pages: Discover, Map, Friends, Chat (future), Profile/Settings, Login.

**Discover**

* Multi-filter: Created by me, Joined by me, Favorites, Sport, City/radius (from profile), Date range, Privacy.
* Card shows: title, sport, city, date/time, privacy badge, joined/max, avatars.
* Switchers: **Map mode** and **Calendar mode**.

**Profile & Settings**

* Edit: name, avatar, email, password, address\_city, language, theme.
* Favorite sports multi-select.
* My activities: created, joined, favorites; leave.
* Friends list: add/remove/block; search users.

**Admin**

* Dashboard: counts, flagged items queue, user history.
* Actions: approve/suspend/ban user, archive activity, resolve reports.

**Chat (future)**

* Private DMs and group chats; invite/leave/kick; mute.

**Booking (future)**

* Venue/slot picker, cost split workflow, payment confirmations.

---

## 5) Non‑Functional & Engineering Rules

* **Coding rules** (carried over):

  * Version header at top of every file.
  * Micro‑diff PRs (small, focused changes).
  * “Do not remove features” — deprecate behind flags.
  * Each feature has test steps and acceptance criteria.
* **Security**: JWT (7d), bcrypt password hashing, input validation, role checks server‑side.
* **Privacy enforcement**: server filters results by privacy and friendship; client never trusts itself.
* **Performance**: list endpoints paginated; indexes on foreign keys + datetime.
* **Observability**: request logs (morgan), error logs; admin audit tables.
* **Deployment**: Nginx serves SPA; API via systemd on 4010; `deploy.sh` updates both; TLS via Certbot.

---

## 6) Validation Checklists

### v0.1.0 (Baseline)

* [ ] **Auth**: `POST /auth/login` returns 200 for known user and 401 for invalid.
* [ ] **Seed users present**: `admin/admin`, `test/test`, `test2/test2`, `test3/test3`, plus bob, carol, dave, eva, frank, gustav, helena.
* [ ] **Discover**: `GET /groups` returns mixed activities with correct privacy filtering per requester.
* [ ] **Profile**: `GET /me` returns current user fields (username, email, city, prefs).
* [ ] **Sports**: `GET /sports` returns active sports with icons.

### v0.2 (Membership & Social)

* [ ] Create activity (owner).
* [ ] Join instant / Request join / Invite only flows.
* [ ] Approve/Reject join requests (owner/admin).
* [ ] Friends: send/accept/block, visibility of FRIENDS activities.
* [ ] Favorites: toggle + listing.

### v0.3 (Map & Calendar)

* [ ] Map markers honor filters + privacy; cluster in dense areas.
* [ ] Calendar feed shows created/joined/favorites merges.

### v0.4 (Chat)

* [ ] Create DM/group; invite/leave/kick; message moderation.

### v0.5 (Bookings)

* [ ] Venue link, slot selection, cost split, payment confirmations; auto‑submit when all paid.

---

## 7) Admin & Moderation Flows

* **Reports**: user submits → ticket open → admin action (warn/archive/ban) → resolution audit.
* **User history**: per-user view of actions and moderation outcomes.
* **Flags**: threshold for auto‑hide; admin overrides.

---

## 8) API Contracts (samples)

* **POST /api/v2/auth/login**

  * Req: `{ "username": "admin", "password": "admin" }`
  * Res: `{ ok: true, data: { token, user } }`
* **GET /api/v2/groups?city=Stockholm\&sport=Padel\&radius\_km=50\&mine=created|joined|favorites**

  * Res: `{ ok: true, data: { items: [...] } }`
* **POST /api/v2/groups/\:id/join** → `{ ok: true, data: { status: "joined"|"pending" } }`
* **POST /api/v2/groups/\:id/invites** → invite by username/email.

---

## 9) Open Questions / Later Decisions

* Cohost role permissions (edit vs manage members).
* Message attachments & storage (S3 or local?).
* Payment provider for bookings (Stripe/Adyen/Swish?).
* Multi‑city radius logic (haversine vs provider API).

---

## 10) Change Log

* **v0.1.0** — Initial spec; users & activities seeded; auth baseline; deployment topology set (Nginx + systemd).

<!-- snapshot:v0.1.2 — added 2025-08-13 -->
## Status snapshot (2025-08-13)

**Infra & Deploy**
- ✅ Domain `app1.kubara.se` via Nginx (SPA) with `/api/v2` proxy → backend `127.0.0.1:4010`.
- ✅ Backend under systemd: `pulse-backend` (Node 22).
- ✅ Health: `GET /api/v2/health`.
- ✅ Deploy: `deploy.sh` (full) and **`deploy.fast.sh`** (web-only).
- ✅ API & seeder use the same DB via `PULSE_DB_PATH=/home/vampyren/App/pulse/data/pulse.db`.

**Backend**
- ✅ Auth endpoints: `POST /auth/login` (JWT 7d), `GET /auth/me`, `GET /auth/admin/ping`.
- ✅ Middleware: `authOptional`, `requireAuth`, `requireAdmin`.
- ✅ **Sports**: `GET /api/v2/sports` (read-only).
- ✅ Seeder (ESM): `backend/src/db/seed.mjs` → `npm run seed` resets & seeds **users + sports**.
- ⏭ Read endpoints to add next: `GET /groups`, `GET /groups/:id`, `GET /venues`, `GET /activities?group=...`.

**Database & Data**
- ✅ SQLite at `~/App/pulse/data/pulse.db`.
- ✅ Users (bcrypt; password = username): admin, test, test2, test3, bob, carol, dave, eva, frank, gustav, helena (mixed statuses for testing).
- ✅ Sports (stable ids): padel, football, basketball, volleyball, tennis, badminton, running, table_tennis.
- ⏭ Extend seed with: venues (admin-approved), groups (public/private + `join_mode` open/request/invite), group_members (owner/member/pending), activities (future), friendships (pending/accepted/rejected), flags.

**Frontend (React + Vite + TS)**
- ✅ Typed API client `web/src/lib/api.ts` (JWT storage; `login`, `me`, `logout`).
- ✅ Auth provider + guards: `AuthProvider`, `Protected`, `AuthGate` (redirects to `/login`).
- ✅ Routes:
  - Public: `/discover`, `/map`, `/calendar`, `/login`, `/ui*`
  - **Protected**: `/me`, `/wallet`, `/settings`, `/friends`, `/favorites`, `/book`, `/chat`
- ✅ Global **glass bottom dock** (hover-expand on desktop; compact mobile labels).
- ✅ Login works (e.g., test/test). Logged-out users cannot access protected pages.
- 🔧 Discover shows baseline cards (teaser mode when logged out).
- ⏭ Wire **sports chips** (from `/api/v2/sports`) to filter Discover client-side.

**Immediate next step**
1) Wire sports chips on Discover (frontend only).
2) Add backend read endpoints (groups, group detail w/ members, venues, activities).
3) Extend seeder with venues/groups/members/activities/friendships/flags and plug UI.

<!-- changelog:added 2025-08-13 -->
## Changelog (2025-08-13)

- Added ESM route **`/api/v2/sports`** and mounted in `app.js`.
- Set systemd override for **`PULSE_DB_PATH=/home/vampyren/App/pulse/data/pulse.db`** so API & seeder share the same DB.
- Simplified seeding to **one command**: `npm run seed` (ESM `backend/src/db/seed.mjs`) → resets & seeds users + sports.
- Hardened frontend auth:
  - **Protected** routes now include `/book` and `/chat`.
  - `AuthGate` enforces redirect to `/login` when logged out.
- UI shell:
  - Global glass bottom dock (hover expand on desktop, compact labels on mobile).
  - Minor bounce/active states and menu-close behavior on route change.

**References (files touched recently)**
- `backend/src/routes/sports.js`
- `backend/src/db/seed.mjs`
- `backend/src/app.js`
- `web/src/lib/api.ts`
- `web/src/components/{Protected.tsx,AuthGate.tsx,GlassDockBottom.tsx}`
- `web/src/App.tsx`
