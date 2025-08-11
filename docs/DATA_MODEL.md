# Pulse — Data Model

**Version:** v0.1.0
**Date:** 2025‑08‑11
**Owner:** Aryantech
**Scope:** Authoritative schema for Pulse (SQLite) with forward‑compat for chat & bookings.

> IDs are **12‑char nanoid** strings. Booleans stored as INTEGER (0/1). Timestamps are ISO (TEXT) or `DATETIME DEFAULT CURRENT_TIMESTAMP`.

---

## 1) Entity‑Relationship Overview

```mermaid
%% Pulse ERD (v0.1.0)
ERDiagram
  USERS ||--o{ MEMBERSHIPS : has
  USERS ||--o{ FRIENDSHIPS : requests
  USERS ||--o{ ACTIVITY_INVITES : receives
  USERS ||--o{ JOIN_REQUESTS : submits
  USERS ||--o{ RATINGS : gives
  USERS ||--o{ FLAGS : files
  USERS ||--o{ FAVORITES : marks
  USERS ||--o{ THREAD_MEMBERS : joins
  USERS ||--o{ MESSAGES : writes

  SPORTS ||--o{ GROUPS : categorizes
  GROUPS ||--o{ MEMBERSHIPS : includes
  GROUPS ||--o{ ACTIVITY_INVITES : sends
  GROUPS ||--o{ JOIN_REQUESTS : reviews
  GROUPS ||--o{ RATINGS : receives
  GROUPS ||--o{ FAVORITES : starred
  THREADS ||--o{ THREAD_MEMBERS : contains
  THREADS ||--o{ MESSAGES : contains

  USERS {
    TEXT id PK
    TEXT username UNIQUE
    TEXT email UNIQUE
    TEXT password_hash
    TEXT first_name
    TEXT last_name
    TEXT display_name
    TEXT avatar_url
    TEXT bio
    TEXT gender  "male|female|other|unspecified"
    TEXT phone
    INTEGER email_verified
    INTEGER phone_verified
    TEXT address_line1
    TEXT address_line2
    TEXT city
    TEXT postal_code
    TEXT country_code
    REAL lat
    REAL lng
    TEXT language  "en|sv|..."
    TEXT timezone
    TEXT theme     "light|dark|system"
    INTEGER discover_city_only
    INTEGER discover_radius_km
    INTEGER is_profile_public
    DATETIME last_active_at
    TEXT status    "pending|approved|suspended|banned"
    DATETIME created_at
  }
  SPORTS {
    TEXT id PK
    TEXT name UNIQUE
    TEXT slug UNIQUE
    TEXT icon
    INTEGER is_active
  }
  GROUPS {
    TEXT id PK
    TEXT title
    TEXT details
    TEXT slug
    TEXT sport_id FK -> SPORTS.id
    TEXT creator_id FK -> USERS.id
    TEXT location_full
    TEXT address_line1
    TEXT address_line2
    TEXT city
    TEXT postal_code
    TEXT country_code
    REAL lat
    REAL lng
    DATETIME date_time
    DATETIME join_deadline_at
    INTEGER min_members
    INTEGER max_members
    INTEGER price_cents
    TEXT currency
    TEXT experience_level
    TEXT cover_image_url
    TEXT privacy     "PUBLIC|FRIENDS|INVITE"
    TEXT join_mode   "instant|request|invite_only"
    INTEGER is_active
    DATETIME created_at
    DATETIME updated_at
    DATETIME cancelled_at
    TEXT cancel_reason
    DATETIME archived_at
  }
  MEMBERSHIPS {
    TEXT id PK
    TEXT group_id FK -> GROUPS.id
    TEXT user_id  FK -> USERS.id
    TEXT role "owner|cohost|member"
    DATETIME joined_at
    UNIQUE (group_id, user_id)
  }
  FRIENDSHIPS {
    TEXT id PK
    TEXT requester_id FK -> USERS.id
    TEXT addressee_id FK -> USERS.id
    TEXT status "pending|accepted|blocked"
    DATETIME created_at
    UNIQUE (requester_id, addressee_id)
  }
  ACTIVITY_INVITES {
    TEXT id PK
    TEXT activity_id FK -> GROUPS.id
    TEXT user_id     FK -> USERS.id
    TEXT invited_by  FK -> USERS.id
    TEXT status "pending|accepted|declined"
    DATETIME created_at
    UNIQUE (activity_id, user_id)
  }
  JOIN_REQUESTS {
    TEXT id PK
    TEXT activity_id FK -> GROUPS.id
    TEXT user_id     FK -> USERS.id
    TEXT status "pending|approved|rejected"
    TEXT reviewed_by FK -> USERS.id
    DATETIME created_at
    UNIQUE (activity_id, user_id)
  }
  FAVORITES {
    TEXT id PK
    TEXT user_id   FK -> USERS.id
    TEXT entity_type "activity|sport|venue|user"
    TEXT entity_id
    DATETIME created_at
    UNIQUE (user_id, entity_type, entity_id)
  }
  RATINGS {
    TEXT id PK
    TEXT activity_id FK -> GROUPS.id
    TEXT user_id  FK -> USERS.id
    INTEGER score  "1..5"
    TEXT comment
    DATETIME created_at
    UNIQUE (activity_id, user_id)
  }
  FLAGS {
    TEXT id PK
    TEXT entity_type "activity|user|message"
    TEXT entity_id
    TEXT reason
    TEXT details
    TEXT reporter_id FK -> USERS.id
    TEXT status "open|closed"
    DATETIME created_at
    TEXT resolved_by FK -> USERS.id
    DATETIME resolved_at
  }
  THREADS {
    TEXT id PK
    TEXT type "dm|group"
    TEXT title
    TEXT owner_id FK -> USERS.id
    INTEGER is_private
    DATETIME created_at
  }
  THREAD_MEMBERS {
    TEXT id PK
    TEXT thread_id FK -> THREADS.id
    TEXT user_id   FK -> USERS.id
    TEXT role "owner|mod|member"
    DATETIME joined_at
    UNIQUE (thread_id, user_id)
  }
  MESSAGES {
    TEXT id PK
    TEXT thread_id FK -> THREADS.id
    TEXT user_id   FK -> USERS.id
    TEXT body
    TEXT attachments_json
    DATETIME created_at
    DATETIME edited_at
    DATETIME deleted_at
  }
```

---

## 2) Tables & Columns (detail)

### 2.1 Users

* `id TEXT PK`
* `username TEXT UNIQUE NOT NULL`
* `email TEXT UNIQUE NOT NULL`
* `password_hash TEXT NOT NULL` (bcrypt)
* `first_name TEXT`; `last_name TEXT`; `display_name TEXT`
* `avatar_url TEXT`
* `bio TEXT`
* `gender TEXT CHECK(gender IN ('male','female','other','unspecified')) DEFAULT 'unspecified'`
* `phone TEXT`; `email_verified INTEGER DEFAULT 0`; `phone_verified INTEGER DEFAULT 0`
* `address_line1 TEXT`; `address_line2 TEXT`; `city TEXT`; `postal_code TEXT`; `country_code TEXT`; `lat REAL`; `lng REAL`
* `language TEXT DEFAULT 'en'`; `timezone TEXT`
* `theme TEXT DEFAULT 'system'`
* `discover_city_only INTEGER DEFAULT 0`; `discover_radius_km INTEGER DEFAULT 50`
* `is_profile_public INTEGER DEFAULT 1`
* `last_active_at DATETIME`
* `status TEXT CHECK(status IN ('pending','approved','suspended','banned')) DEFAULT 'approved'`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

**Indexes**: `users(username)`, `users(email)`, `users(city)`, `users(last_active_at)`
**Notes**: For favorite sports, use join table `user_favorite_sports(user_id,sport_id)` (planned v0.2).

### 2.2 Sports

* `id TEXT PK`

* `name TEXT UNIQUE NOT NULL`

* `slug TEXT UNIQUE`

* `icon TEXT` (emoji or asset path)

* `is_active INTEGER DEFAULT 1`

* `id TEXT PK`

* `name TEXT UNIQUE NOT NULL`

* `icon TEXT` (emoji or asset path)

* `is_active INTEGER DEFAULT 1`

### 2.3 Groups (Activities)

* `id TEXT PK`
* `title TEXT NOT NULL`
* `details TEXT`
* `slug TEXT UNIQUE`
* `sport_id TEXT NOT NULL REFERENCES sports(id) ON DELETE RESTRICT`
* `creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
* `location_full TEXT`; `address_line1 TEXT`; `address_line2 TEXT`; `city TEXT`; `postal_code TEXT`; `country_code TEXT`
* `lat REAL`; `lng REAL`
* `date_time DATETIME NOT NULL`; `join_deadline_at DATETIME`
* `min_members INTEGER DEFAULT 2`; `max_members INTEGER NOT NULL`
* `price_cents INTEGER DEFAULT 0`; `currency TEXT DEFAULT 'SEK'`
* `experience_level TEXT`; `cover_image_url TEXT`
* `privacy TEXT CHECK(privacy IN ('PUBLIC','FRIENDS','INVITE')) DEFAULT 'PUBLIC'`
* `join_mode TEXT CHECK(join_mode IN ('instant','request','invite_only')) DEFAULT 'instant'`
* `is_active INTEGER DEFAULT 1`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`; `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `cancelled_at DATETIME`; `cancel_reason TEXT`; `archived_at DATETIME`

**Indexes**: `groups(sport_id)`, `groups(date_time)`, `groups(city)`, `groups(creator_id)`, `groups(postal_code)`, `groups(slug)`

### 2.4 Memberships

* `id TEXT PK`

* `group_id TEXT REFERENCES groups(id) ON DELETE CASCADE`

* `user_id  TEXT REFERENCES users(id)  ON DELETE CASCADE`

* `role TEXT CHECK(role IN ('owner','cohost','member')) DEFAULT 'member'`

* `joined_at DATETIME DEFAULT CURRENT_TIMESTAMP`

* `UNIQUE(group_id, user_id)`

* `id TEXT PK`

* `group_id TEXT REFERENCES groups(id) ON DELETE CASCADE`

* `user_id  TEXT REFERENCES users(id)  ON DELETE CASCADE`

* `role TEXT CHECK(role IN ('owner','cohost','member')) DEFAULT 'member'`

* `joined_at DATETIME DEFAULT CURRENT_TIMESTAMP`

* `UNIQUE(group_id, user_id)`

### 2.5 Friendships

* `id TEXT PK`
* `requester_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `addressee_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `status TEXT CHECK(status IN ('pending','accepted','blocked')) NOT NULL`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `UNIQUE(requester_id, addressee_id)`

### 2.6 Activity Invites

* `id TEXT PK`
* `activity_id TEXT REFERENCES groups(id) ON DELETE CASCADE`
* `user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `invited_by TEXT REFERENCES users(id) ON DELETE SET NULL`
* `status TEXT CHECK(status IN ('pending','accepted','declined')) DEFAULT 'pending'`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `UNIQUE(activity_id, user_id)`

### 2.7 Join Requests (v0.2)

* `id TEXT PK`
* `activity_id TEXT REFERENCES groups(id) ON DELETE CASCADE`
* `user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending'`
* `reviewed_by TEXT REFERENCES users(id)`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `UNIQUE(activity_id, user_id)`

### 2.8 Favorites (polymorphic)

* `id TEXT PK`
* `user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `entity_type TEXT CHECK(entity_type IN ('activity','sport','venue','user')) NOT NULL`
* `entity_id TEXT NOT NULL`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `UNIQUE(user_id, entity_type, entity_id)`

**Use cases**: star an **activity**, follow a **sport**, bookmark a **venue/facility**, or favorite a **friend (user)**.

### 2.9 Ratings

* `id TEXT PK`
* `activity_id TEXT REFERENCES groups(id) ON DELETE CASCADE`
* `user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
* `score INTEGER CHECK(score BETWEEN 1 AND 5) NOT NULL`
* `comment TEXT`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `UNIQUE(activity_id, user_id)`

### 2.10 Flags / Reports

* `id TEXT PK`
* `entity_type TEXT CHECK(entity_type IN ('activity','user','message')) NOT NULL`
* `entity_id TEXT NOT NULL`
* `reason TEXT NOT NULL`
* `details TEXT`
* `reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL`
* `status TEXT CHECK(status IN ('open','closed')) DEFAULT 'open'`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
* `resolved_by TEXT REFERENCES users(id)`
* `resolved_at DATETIME`

### 2.11 Venues (Facilities)

* `id TEXT PK`
* `name TEXT NOT NULL`
* `slug TEXT UNIQUE`
* `address_line1 TEXT`; `address_line2 TEXT`; `city TEXT`; `postal_code TEXT`; `country_code TEXT`
* `lat REAL`; `lng REAL`
* `provider_id TEXT`; `metadata_json TEXT`
* `is_active INTEGER DEFAULT 1`
* `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

> Introduced early so users can **favorite** facilities now; booking integration comes later.

### 2.12 Chat (v0.4)

* `threads(id, type, title, owner_id, is_private, created_at)`
* `thread_members(id, thread_id, user_id, role, joined_at)`
* `messages(id, thread_id, user_id, body, attachments_json, created_at, edited_at, deleted_at)`

### 2.13 Bookings (v0.5)

* `venues(id, name, address, lat, lng, provider_id, metadata_json)`
* `slots(id, venue_id, start, end, price, currency)`
* `bookings(id, activity_id, venue_id, slot_id, status, total, split_mode)`
* `payments(id, booking_id, user_id, amount, status)`

---

## 3) Privacy & Visibility Rules (server‑enforced)

**Discoverable groups for a viewer ************`V`************:**

```sql
SELECT g.*
FROM groups g
LEFT JOIN friendships f
  ON (
      (f.requester_id = g.creator_id AND f.addressee_id = :viewer AND f.status='accepted')
   OR (f.addressee_id = g.creator_id AND f.requester_id = :viewer AND f.status='accepted')
  )
LEFT JOIN memberships m ON (m.group_id = g.id AND m.user_id = :viewer)
LEFT JOIN activity_invites ai ON (ai.activity_id = g.id AND ai.user_id = :viewer AND ai.status='pending')
WHERE (
  g.privacy = 'PUBLIC'
  OR (g.privacy = 'FRIENDS' AND (g.creator_id = :viewer OR f.id IS NOT NULL))
  OR (g.privacy = 'INVITE'  AND (m.id IS NOT NULL OR ai.id IS NOT NULL))
);
```

**Can viewer join?**

* `join_mode='instant'` and `member_count < max` → yes (not a member).
* `join_mode='request'` → create `join_requests(pending)`.
* `join_mode='invite_only'` → only with `activity_invites.accepted` or owner adds.

---

## 4) Indexes & Performance

* `users(username)`, `users(email)`, `users(city)`, `users(last_active_at)`
* `groups(sport_id)`, `groups(date_time)`, `groups(city)`, `groups(creator_id)`, `groups(postal_code)`, `groups(slug)`
* `sports(name)`, `sports(slug)`
* `favorites(user_id,entity_type,entity_id)`
* `venues(city)`, `venues(slug)`
* `wallet_transactions(user_id,created_at)`
* `memberships(group_id,user_id)`, `memberships(user_id)`
* `friendships(requester_id,addressee_id)`
* `activity_invites(activity_id,user_id)`
* `ratings(activity_id)`, `ratings(user_id)`
* `messages(thread_id,created_at)`

---

## 5) Referential Actions

* **On user delete**: cascade memberships, favorites, ratings; set‑null reporter/resolver in flags; restrict if owner of groups (or transfer ownership first).
* **On group delete**: cascade memberships, invites, join\_requests, favorites, ratings.

---

## 6) DDL Reference (SQLite)

> The live DDL is in `backend/src/db/schema.sql`. Snapshot (abbrev):

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hash (compat; will rename to password_hash later)
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  address_city TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country_code TEXT,
  lat REAL,
  lng REAL,
  language TEXT DEFAULT 'en',
  timezone TEXT,
  theme TEXT DEFAULT 'system',
  gender TEXT DEFAULT 'unspecified',
  phone TEXT,
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  discover_city_only INTEGER DEFAULT 0,
  discover_radius_km INTEGER DEFAULT 50,
  is_profile_public INTEGER DEFAULT 1,
  wallet_balance_cents INTEGER DEFAULT 0,
  wallet_currency TEXT DEFAULT 'SEK',
  last_active_at DATETIME,
  status TEXT CHECK(status IN ('pending','approved','suspended','banned')) DEFAULT 'approved',
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  sport_id TEXT NOT NULL REFERENCES sports(id),
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_full TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country_code TEXT,
  lat REAL,
  lng REAL,
  date_time DATETIME NOT NULL,
  max_members INTEGER NOT NULL,
  experience_level TEXT,
  privacy TEXT DEFAULT 'PUBLIC',
  join_mode TEXT DEFAULT 'instant',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id,user_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id,addressee_id)
);

CREATE TABLE IF NOT EXISTS activity_invites (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by TEXT REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id,user_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT CHECK(entity_type IN ('activity','sport','venue','user')) NOT NULL,
  entity_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country_code TEXT,
  lat REAL,
  lng REAL,
  provider_id TEXT,
  metadata_json TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK(type IN ('topup','spend','refund','adjustment')) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'SEK',
  related_type TEXT,
  related_id TEXT,
  status TEXT CHECK(status IN ('pending','posted','failed')) DEFAULT 'posted',
  balance_after_cents INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- (JOIN_REQUESTS, RATINGS, FLAGS, THREADS, THREAD_MEMBERS, MESSAGES: defined above / below as features mature)
```

---

## 7) Seed & Test Data (v0.1.0)

* **Users** (bcrypt): `admin/admin`, `test/test`, `test2/test2`, `test3/test3`, plus `bob`, `carol`, `dave`, `eva`, `frank`, `gustav`, `helena` (password = username).
* **Sports**: Padel, Football, Basketball, Volleyball, Tennis, Badminton, Running, Table Tennis.
* **Activities**: 6–8 mixed privacy and cities; creator auto‑membership + a few extra joins.

---

## 8) Migration & Extensibility

* New features (chat, bookings) already modeled → add tables behind feature flags.
* Prefer **additive** schema changes; avoid destructive migrations.
* Keep enums as `TEXT CHECK(...)` for clarity; app layer also validates.

---

## 9) Auditing (planned)

`events` table: `id, actor_user_id, entity_type, entity_id, action, meta_json, created_at`.
Use it for admin/user history views and moderation trails.

---

## 10) Validation Checklist (Data Model)

*
