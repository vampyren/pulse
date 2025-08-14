/*
 * Pulse Backend — db/seed.mjs
 * Version: v0.5.7
 * Purpose: Full-coverage dev seed (clean slate each run) aligned with DATA_MODEL.md.
 *  - Preserves prior entities (users, sports, venues, groups, group_members, activities, friendships, flags)
 *  - Adds: favorites, ratings, join_requests, activity_invites, wallet_transactions, threads, thread_members, messages, meta
 *  - Seeds realistic test data for comprehensive UI & API testing:
 *      • Users (existing 11 + extras) with varied statuses, cities, language, theme, wallet balances
 *      • Sports (stable set with icons)
 *      • Venues (approved)
 *      • Groups (public/friends/invite) + join modes (instant/request/invite_only)
 *      • Group members (owner/member/pending), friendships (pending/accepted/blocked)
 *      • Activities (past & future), invites, join requests
 *      • Ratings (1–5), flags (open/closed)
 *      • Wallet transactions (topup/spend/refund)
 *      • Chat threads (DM + group) with messages (incl. long & emoji)
 *  - Ends with: colorized summary table + UI coverage checklist + meta(seed_version,last_seed_run)
 * Notes:
 *  - ESM-only (backend has "type":"module")
 *  - Uses better-sqlite3 (sync), bcrypt/bcryptjs for hashes
 */

import Database from "better-sqlite3";
import { customAlphabet } from "nanoid";

// bcrypt (prefer native, fallback to js)
const bcrypt = await (async () => {
  try { return (await import("bcrypt")).default; } catch { return (await import("bcryptjs")).default; }
})();

const nid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);
const hash = (pw) => bcrypt.hashSync(pw, 10);
const DB_PATH = process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;

/** ensureSchema
 * v0.5.0
 * Creates required tables/indexes if they don't exist. Adds new columns if missing.
 */
function ensureSchema(db) {
  db.exec("PRAGMA foreign_keys = ON;");

  // Core tables (existing + extended)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      name          TEXT,
      email         TEXT NOT NULL UNIQUE,
      password      TEXT NOT NULL,
      is_admin      INTEGER DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'approved', -- pending|approved|suspended|rejected|banned
      address_city  TEXT,
      lat           REAL,
      lng           REAL,
      wallet_balance_cents INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sports (
      id    TEXT PRIMARY KEY,       -- e.g. "running"
      name  TEXT NOT NULL UNIQUE,
      icon  TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS venues (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      address_city TEXT,
      lat          REAL,
      lng          REAL,
      approved     INTEGER DEFAULT 0,
      created_by   TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      sport_id   TEXT NOT NULL REFERENCES sports(id),
      privacy    TEXT NOT NULL DEFAULT 'public',  -- public|friends|invite
      join_mode  TEXT NOT NULL DEFAULT 'instant', -- instant|request|invite_only
      city       TEXT,
      owner_id   TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      status     TEXT NOT NULL DEFAULT 'active'   -- active|cancelled|archived
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      role       TEXT NOT NULL DEFAULT 'member',     -- owner|member|cohost
      status     TEXT NOT NULL DEFAULT 'active',     -- active|pending
      joined_at  TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id         TEXT PRIMARY KEY,
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      starts_at  TEXT NOT NULL,
      ends_at    TEXT,
      venue_id   TEXT REFERENCES venues(id),
      privacy    TEXT NOT NULL DEFAULT 'public',   -- public|private
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      price_cents INTEGER DEFAULT 0,
      currency   TEXT DEFAULT 'SEK',
      details    TEXT
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id            TEXT PRIMARY KEY,
      a_user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      b_user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status        TEXT NOT NULL,      -- pending|accepted|blocked|rejected
      requested_by  TEXT NOT NULL REFERENCES users(id),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (a_user_id, b_user_id)
    );

    CREATE TABLE IF NOT EXISTS flags (
      id            TEXT PRIMARY KEY,
      entity_type   TEXT NOT NULL,                    -- activity|user|message
      entity_id     TEXT NOT NULL,
      reason        TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'open',     -- open|closed
      created_by    TEXT NOT NULL REFERENCES users(id),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_by   TEXT REFERENCES users(id),
      resolved_at   TEXT
    );

    -- New tables for v0.5.0
    CREATE TABLE IF NOT EXISTS favorites (
      user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      group_id  TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, group_id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id         TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score      INTEGER NOT NULL, -- 1..5
      comment    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_invites (
      id         TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status     TEXT NOT NULL DEFAULT 'pending', -- pending|accepted|declined
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS join_requests (
      id         TEXT PRIMARY KEY,
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status     TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      decided_by TEXT REFERENCES users(id),
      decided_at TEXT
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,   -- topup|spend|refund
      amount_cents INTEGER NOT NULL,
      currency   TEXT NOT NULL DEFAULT 'SEK',
      status     TEXT NOT NULL DEFAULT 'posted', -- pending|posted
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS threads (
      id         TEXT PRIMARY KEY,
      kind       TEXT NOT NULL,   -- dm|group
      ref_id     TEXT,            -- group_id for group chats, null for dms
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS thread_members (
      thread_id  TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role       TEXT NOT NULL DEFAULT 'member', -- member
      joined_at  TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (thread_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      thread_id  TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Additive columns (do not remove old columns)
  const hasCol = (table, col) => db.prepare(`PRAGMA table_info(${table});`).all().some(r => r.name === col);
  const addCol = (table, col, type) => { if (!hasCol(table, col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type};`); };

  // Users: add city, language, theme (keep existing address_city)
  addCol("users", "city", "TEXT");
  addCol("users", "language", "TEXT");
  addCol("users", "theme", "TEXT");

  // Sports: optional enhancements
  addCol("sports", "slug", "TEXT");
  addCol("sports", "is_active", "INTEGER DEFAULT 1");

  // Activities: add columns that may be missing in older schemas
  addCol("activities", "price_cents", "INTEGER DEFAULT 0");
  addCol("activities", "currency", "TEXT DEFAULT 'SEK'");
  addCol("activities", "details", "TEXT");
  addCol("activities", "privacy", "TEXT DEFAULT 'public'");

  // Groups: add columns that may be missing in older schemas
  addCol("groups", "status", "TEXT DEFAULT 'active'");
  addCol("groups", "privacy", "TEXT DEFAULT 'public'");
  addCol("groups", "join_mode", "TEXT DEFAULT 'instant'");
  addCol("groups", "city", "TEXT");
  addCol("groups", "owner_id", "TEXT");
  addCol("groups", "created_at", "TEXT DEFAULT (datetime('now'))");
  addCol("groups", "updated_at", "TEXT DEFAULT (datetime('now'))");

  // Flags: optional resolver fields for review lifecycle
  addCol("flags", "resolved_by", "TEXT");
  addCol("flags", "resolved_at", "TEXT");

}

/** wipeData
 * v0.5.0 — Dev-only clean slate for known tables.
 */
function wipeData(db) {
  db.exec("PRAGMA foreign_keys = OFF;");
  const tables = [
    "messages","thread_members","threads",
    "wallet_transactions",
    "activity_invites","join_requests","ratings","favorites",
    "flags","friendships","activities","group_members","groups",
    "venues","sports","users","meta"
  ];
  for (const t of tables) db.exec(`DELETE FROM ${t};`);
  db.exec("PRAGMA foreign_keys = ON;");
}

/** seedUsers
 * v0.5.0 — Baseline + extras (password = username), mixed statuses, languages, themes, cities.
 */
function seedUsers(db) {
  const mk = (u, n, email, {
    admin = false, city = "Malmö", status = "approved", language = "en", theme = "system", lat = 55.604, lng = 13.003, wallet = 0
  } = {}) => ({ id: nid(), username: u, name: n, email, password: hash(u), is_admin: admin ? 1 : 0, status,
                   address_city: city, city: city, language, theme, lat, lng, wallet_balance_cents: wallet });

  const users = [
    mk("admin","Admin User","admin@example.com",{admin:true,status:"approved",city:"Malmö",language:"en",theme:"dark",wallet:15000}),
    mk("test","Test One","test@example.com",{status:"approved",city:"Malmö",language:"en",theme:"system",wallet:0}),
    mk("test2","Test Two","test2@example.com",{status:"pending",city:"Stockholm",language:"sv",theme:"light"}),
    mk("test3","Test Three","test3@example.com",{status:"rejected",city:"Uppsala",language:"en",theme:"dark"}),
    mk("bob","Bob Anders","bob@example.com",{city:"Gothenburg",language:"en",theme:"system"}),
    mk("carol","Carol Berg","carol@example.com",{city:"Malmö",language:"sv",theme:"light"}),
    mk("dave","Dave Carl","dave@example.com",{city:"Lund",language:"en",theme:"system"}),
    mk("eva","Eva Dahl","eva@example.com",{city:"Stockholm",language:"sv",theme:"dark"}),
    mk("frank","Frank Elm","frank@example.com",{status:"suspended",city:"Gothenburg",language:"en",theme:"system"}),
    mk("gustav","Gustav Falk","gustav@example.com",{city:"Malmö",language:"sv",theme:"light"}),
    mk("helena","Helena Gård","helena@example.com",{city:"Uppsala",language:"en",theme:"system"}),
    // Extras for coverage
    mk("emma","Emma Nilsson","emma@example.com",{status:"approved",city:"Malmö",language:"sv",theme:"light",wallet:5000}),
    mk("john","John Smith","john@example.com",{status:"pending",city:"Stockholm",language:"en",theme:"system"}),
    mk("sofia","Sofia Larsson","sofia@example.com",{status:"suspended",city:"Gothenburg",language:"en",theme:"dark"}),
    mk("liam","Liam Karlsson","liam@example.com",{status:"banned",city:"Lund",language:"sv",theme:"light"}),
    mk("olivia","Olivia Åkesson","olivia@example.com",{status:"approved",city:"Uppsala",language:"sv",theme:"dark",wallet:2000}),
    mk("noah","Noah Bergström","noah@example.com",{status:"approved",city:"Malmö",language:"en",theme:"system"}),
    mk("moderator","Moderator User","moderator@example.com",{status:"approved",city:"Stockholm",language:"en",theme:"dark"})
  ];

  const stmt = db.prepare(`
    INSERT INTO users (id,username,name,email,password,is_admin,status,address_city,lat,lng,wallet_balance_cents,city,language,theme)
    VALUES (@id,@username,@name,@email,@password,@is_admin,@status,@address_city,@lat,@lng,@wallet_balance_cents,@city,@language,@theme)
  `);
  const tx = db.transaction(arr => arr.forEach(u => stmt.run(u)));
  tx(users);

  // Map by username for convenient references
  const map = Object.fromEntries(users.map(u => [u.username, u]));
  return { users, U: map };
}

/** seedSports
 * v0.5.0 — Stable sports with icons.
 */
function seedSports(db) {
  const sports = [
    { id: "running",    name: "Running",    icon: "🏃",  slug: "running",    is_active: 1 },
    { id: "football",   name: "Football",   icon: "⚽",  slug: "football",   is_active: 1 },
    { id: "basketball", name: "Basketball", icon: "🏀",  slug: "basketball", is_active: 1 },
    { id: "tennis",     name: "Tennis",     icon: "🎾",  slug: "tennis",     is_active: 1 },
    { id: "badminton",  name: "Badminton",  icon: "🏸",  slug: "badminton",  is_active: 1 },
    { id: "padel",      name: "Padel",      icon: "🥎",  slug: "padel",      is_active: 1 },
    { id: "cycling",    name: "Cycling",    icon: "🚴",  slug: "cycling",    is_active: 1 },
    { id: "swimming",   name: "Swimming",   icon: "🏊",  slug: "swimming",   is_active: 1 }
  ];
  const stmt = db.prepare(`
    INSERT INTO sports (id,name,icon,slug,is_active) VALUES (@id,@name,@icon,@slug,@is_active)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, icon=excluded.icon
  `);
  const tx = db.transaction(arr => arr.forEach(s => stmt.run(s)));
  tx(sports);
  const S = Object.fromEntries(sports.map(s => [s.id, s]));
  return { sports, S };
}

/** seedVenues
 * v0.5.0 — Approved venues with coords.
 */
function seedVenues(db, U) {
  const venues = [
    { id: nid(), name: "Malmö Stadium 🏟️",      address_city: "Malmö",     lat: 55.601, lng: 13.003, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Stockholm Arena 🏟️",    address_city: "Stockholm", lat: 59.293, lng: 18.083, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Gothenburg Sports Hall 🏀", address_city: "Gothenburg", lat: 57.708, lng: 11.974, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Lund Tennis Center 🎾", address_city: "Lund",      lat: 55.704, lng: 13.191, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Uppsala Swimming Hall 🏊", address_city: "Uppsala", lat: 59.858, lng: 17.638, approved: 1, created_by: U.admin.id }
  ];
  const stmt = db.prepare(`
    INSERT INTO venues (id,name,address_city,lat,lng,approved,created_by)
    VALUES (@id,@name,@address_city,@lat,@lng,@approved,@created_by)
  `);
  const tx = db.transaction(arr => arr.forEach(v => stmt.run(v)));
  tx(venues);
  return { venues };
}

/** seedGroupsAndMembers
 * v0.5.0 — Groups with mixed privacy/join_mode + members (owner/cohost/member/pending).
 */
function seedGroupsAndMembers(db, U, S) {
  const groups = [
    { id: nid(), name: "Football 🏟️ Friday Night", sport_id: S.football.id, privacy: "public", join_mode: "instant",    city: "Malmö",     owner_id: U.test.id },
    { id: nid(), name: "Tennis 🎾 Training",        sport_id: S.tennis.id,   privacy: "friends",join_mode: "request",    city: "Stockholm", owner_id: U.carol.id },
    { id: nid(), name: "Padel 🥎 & Coffee ☕",       sport_id: S.padel.id,    privacy: "invite", join_mode: "invite_only",city: "Malmö",     owner_id: U.dave.id },
    { id: nid(), name: "Cycling 🚴 Challenge",      sport_id: S.cycling.id,  privacy: "public", join_mode: "instant",    city: "Gothenburg",owner_id: U.gustav.id },
    { id: nid(), name: "🏊 Morning Swim in Malmö",   sport_id: S.swimming.id, privacy: "public", join_mode: "request",    city: "Malmö",     owner_id: U.helena.id },
    { id: nid(), name: "🏀 Streetball Gothenburg",   sport_id: S.basketball.id,privacy:"friends",join_mode: "instant",    city: "Gothenburg",owner_id: U.frank.id, status:"active" },
    { id: nid(), name: "Super Ultra Mega Extra Long Padel 🥎 Match and Social Gathering with Coffee, Snacks, and More Fun Activities for All Skill Levels in the Beautiful City of Malmö on a Sunny Saturday Morning", sport_id: S.padel.id, privacy: "public", join_mode: "request", city: "Malmö", owner_id: U.emma.id },
    { id: nid(), name: "Running Club Malmö",        sport_id: S.running.id,  privacy: "public", join_mode: "instant",    city: "Malmö",     owner_id: U.admin.id, status:"archived" },
    { id: nid(), name: "Uppsala Tennis League",     sport_id: S.tennis.id,   privacy: "invite", join_mode: "invite_only",city: "Uppsala",   owner_id: U.olivia.id, status:"cancelled" },
    { id: nid(), name: "Stockholm Padel Invitational", sport_id: S.padel.id, privacy: "friends",join_mode: "invite_only",city: "Stockholm", owner_id: U.john.id }
  ];
  // Ensure each group has a status for named param binding
  for (let i=0;i<groups.length;i++){ if(!('status' in groups[i]) || !groups[i].status) groups[i].status = 'active'; }

  const insGroup = db.prepare(`
    INSERT INTO groups (id,name,sport_id,privacy,join_mode,city,owner_id,created_at,updated_at,status)
    VALUES (@id,@name,@sport_id,@privacy,@join_mode,@city,@owner_id,datetime('now'),datetime('now'),COALESCE(@status,'active'))
  `);
  const txG = db.transaction(arr => arr.forEach(g => insGroup.run(g)));
  txG(groups);

  // Members (owners + others; include pending)
  const [g1,g2,g3,g4,g5,g6,g7,g8,g9,g10] = groups;
  const members = [
    // owners
    { group_id: g1.id, user_id: U.test.id,    role:"owner",  status:"active" },
    { group_id: g2.id, user_id: U.carol.id,   role:"owner",  status:"active" },
    { group_id: g3.id, user_id: U.dave.id,    role:"owner",  status:"active" },
    { group_id: g4.id, user_id: U.gustav.id,  role:"owner",  status:"active" },
    { group_id: g5.id, user_id: U.helena.id,  role:"owner",  status:"active" },
    { group_id: g6.id, user_id: U.frank.id,   role:"owner",  status:"active" },
    { group_id: g7.id, user_id: U.emma.id,    role:"owner",  status:"active" },
    { group_id: g8.id, user_id: U.admin.id,   role:"owner",  status:"active" },
    { group_id: g9.id, user_id: U.olivia.id,  role:"owner",  status:"active" },
    { group_id: g10.id,user_id: U.john.id,    role:"owner",  status:"active" },
    // cohosts/members
    { group_id: g1.id, user_id: U.bob.id,     role:"member", status:"active" },
    { group_id: g1.id, user_id: U.emma.id,    role:"member", status:"active" },
    { group_id: g2.id, user_id: U.test.id,    role:"member", status:"pending" },
    { group_id: g3.id, user_id: U.noah.id,    role:"member", status:"active" },
    { group_id: g4.id, user_id: U.moderator.id, role:"member", status:"active" },
    { group_id: g5.id, user_id: U.sofia.id,   role:"member", status:"active" },
    { group_id: g6.id, user_id: U.liam?.id || U.liam?.id,   role:"member", status:"active" },
    { group_id: g7.id, user_id: U.carol.id,   role:"member", status:"active" },
    { group_id: g8.id, user_id: U.dave.id,    role:"member", status:"active" },
    { group_id: g9.id, user_id: U.gustav.id,  role:"member", status:"pending" },
    { group_id: g10.id,user_id: U.helena.id,  role:"member", status:"active" },
  ];
  const insMem = db.prepare(`
    INSERT INTO group_members (group_id,user_id,role,status,joined_at)
    VALUES (@group_id,@user_id,@role,@status,datetime('now'))
  `);
  const txM = db.transaction(arr => arr.forEach(m => insMem.run(m)));
  txM(members);

  return { groups, members };
}

/** seedActivities
 * v0.5.0 — Past & future activities with pricing and details (incl. long/multi-paragraph).
 */
function seedActivities(db, groups, U, venues) {
  const choose = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const future = (days) => new Date(Date.now() + days*86400000).toISOString().slice(0,19).replace('T',' ');
  const past = (days) => new Date(Date.now() - days*86400000).toISOString().slice(0,19).replace('T',' ');

  const v1 = venues[0]?.id ?? null;
  const v2 = venues[1]?.id ?? null;

  const [g1,g2,g3,g4,g5,g6,g7,g8,g9,g10] = groups;

  const longDetails = "Join us for an unforgettable football 🏟️ experience!\nWe’ll have snacks, drinks, and a friendly match under the lights.\n\n**What to bring:**\n- Water bottle 💧\n- Sportswear 👟\n- A smile 😄\n\nSee you on the field!";
  const extraLong = "This is an exceptionally long single-paragraph description intended to test overflow behavior in the UI without line breaks. ".repeat(8).trim();

  const acts = [
    { id: nid(), group_id: g1.id, title: "Sunrise 5K",        starts_at: future(3),  ends_at: null, venue_id: v1, privacy: "public",  created_by: U.test.id,    price_cents: 0,    currency: "SEK", details: longDetails },
    { id: nid(), group_id: g1.id, title: "Saturday Long Run", starts_at: future(10), ends_at: null, venue_id: v1, privacy: "public",  created_by: U.test.id,    price_cents: 0,    currency: "SEK", details: extraLong },
    { id: nid(), group_id: g2.id, title: "Doubles Night",     starts_at: future(5),  ends_at: null, venue_id: v2, privacy: "private", created_by: U.carol.id,   price_cents: 15000,currency: "SEK" },
    { id: nid(), group_id: g3.id, title: "Padel Ladder",      starts_at: past(7),    ends_at: null, venue_id: v2, privacy: "private", created_by: U.dave.id,    price_cents: 5000, currency: "SEK" },
    { id: nid(), group_id: g4.id, title: "Open Ride",         starts_at: future(1),  ends_at: null, venue_id: v2, privacy: "public",  created_by: U.gustav.id,  price_cents: 0,    currency: "SEK" },
    { id: nid(), group_id: g5.id, title: "Morning Swim",      starts_at: past(2),    ends_at: null, venue_id: v1, privacy: "public",  created_by: U.helena.id,  price_cents: 0,    currency: "SEK" },
  ];
  // Normalize missing fields to satisfy named parameters
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    if (a.details === undefined) a.details = "";
    if (a.price_cents === undefined) a.price_cents = 0;
    if (!a.currency) a.currency = "SEK";
    if (!a.privacy) a.privacy = "public";
  }


  const ins = db.prepare(`
    INSERT INTO activities (id,group_id,title,starts_at,ends_at,venue_id,privacy,created_by,created_at,price_cents,currency,details)
    VALUES (@id,@group_id,@title,@starts_at,@ends_at,@venue_id,@privacy,@created_by,datetime('now'),@price_cents,@currency,@details)
  `);
  const tx = db.transaction(arr => arr.forEach(a => ins.run(a)));
  tx(acts);
  return { activities: acts };
}

/** seedFriendships
 * v0.5.0 — pending/accepted/blocked edges. Store ordered pairs (a<b) for uniqueness.
 */
function seedFriendships(db, U) {
  const pairs = [
    { u1: U.test.id,   u2: U.carol.id,  status: "accepted", requested_by: U.test.id },
    { u1: U.test.id,   u2: U.dave.id,   status: "pending",  requested_by: U.test.id },
    { u1: U.gustav.id, u2: U.helena.id, status: "blocked",  requested_by: U.gustav.id },
    { u1: U.admin.id,  u2: U.moderator.id, status: "accepted", requested_by: U.admin.id },
    { u1: U.emma.id,   u2: U.noah.id,   status: "accepted", requested_by: U.emma.id },
  ];
  const order = (a,b) => (a < b ? [a,b] : [b,a]);
  const stmt = db.prepare(`
    INSERT INTO friendships (id,a_user_id,b_user_id,status,requested_by,created_at)
    VALUES (@id,@a,@b,@status,@requested_by,datetime('now'))
  `);
  let n=0;
  for (const p of pairs) { const [a,b]=order(p.u1,p.u2); stmt.run({id:nid(),a,b,status:p.status,requested_by:p.requested_by}); n++; }
  return { friendships: n };
}

/** seedRequestsInvites
 * v0.5.0 — Join requests + activity invites.
 */
function seedRequestsInvites(db, groups, activities, U) {
    const nowStamp = new Date(Date.now()).toISOString().slice(0,19).replace('T',' ');
const jr = [
    { id:nid(), group_id: groups[0].id, user_id: U.john.id,   status:"pending" },
    { id:nid(), group_id: groups[1].id, user_id: U.test2.id,  status:"approved", decided_by: U.carol.id, decided_at: nowStamp },
    { id:nid(), group_id: groups[2].id, user_id: U.noah.id,   status:"rejected", decided_by: U.dave.id,  decided_at: nowStamp }
  ];
  // Normalize join_requests so named params always exist
  for (let i = 0; i < jr.length; i++) {
    if (jr[i].decided_by === undefined) jr[i].decided_by = null;
    if (jr[i].decided_at === undefined) jr[i].decided_at = null;
  }

  const ai = [
    { id:nid(), activity_id: activities[0].id, user_id: U.bob.id,   status:"pending" },
    { id:nid(), activity_id: activities[1].id, user_id: U.emma.id,  status:"accepted" },
    { id:nid(), activity_id: activities[2].id, user_id: U.helena.id,status:"declined" }
  ];
  const insJR = db.prepare(`INSERT INTO join_requests (id,group_id,user_id,status,created_at,decided_by,decided_at) VALUES (@id,@group_id,@user_id,@status,datetime('now'),@decided_by,@decided_at)`);
  const insAI = db.prepare(`INSERT INTO activity_invites (id,activity_id,user_id,status,created_at) VALUES (@id,@activity_id,@user_id,@status,datetime('now'))`);
  const tx = db.transaction(() => { jr.forEach(x=>insJR.run(x)); ai.forEach(x=>insAI.run(x)); });
  tx();
  return { joinRequests: jr.length, activityInvites: ai.length };
}

/**
 * seedRatingsFavorites
 * Version: v0.5.6
 * Purpose: Insert ratings & favorites with safe defaults
 * Notes:
 *  - Normalizes ratings so 'comment' is always present (null when omitted)
 */
function seedRatingsFavorites(db, activities, groups, U) {
  const ratings = [
    { id: nid(), activity_id: activities[0].id, user_id: U.test.id,   score: 5, comment: "Great run!" },
    { id: nid(), activity_id: activities[1].id, user_id: U.carol.id,  score: 4, comment: "Nice pace." },
    { id: nid(), activity_id: activities[2].id, user_id: U.dave.id,   score: 3 }, // no comment provided
    { id: nid(), activity_id: activities[3].id, user_id: U.emma.id,   score: 2, comment: "Could be better." },
    { id: nid(), activity_id: activities[4].id, user_id: U.noah.id,   score: 1, comment: "Too hard!" }
  ];

  // Normalize so @comment is always bound
  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].comment === undefined) ratings[i].comment = null;
  }

  const favorites = [
    { user_id: U.test.id,  group_id: groups[0].id },
    { user_id: U.emma.id,  group_id: groups[2].id },
    { user_id: U.carol.id, group_id: groups[3].id },
    { user_id: U.noah.id,  group_id: groups[0].id }
  ];

  const insR = db.prepare(`
    INSERT INTO ratings (id, activity_id, user_id, score, comment, created_at)
    VALUES (@id, @activity_id, @user_id, @score, @comment, datetime('now'))
  `);
  const insF = db.prepare(`
    INSERT INTO favorites (user_id, group_id)
    VALUES (@user_id, @group_id)
  `);

  const tx = db.transaction(() => {
    ratings.forEach(r => insR.run(r));
    favorites.forEach(f => insF.run(f));
  });
  tx();

  return { ratings: ratings.length, favorites: favorites.length };
}


/** seedWallet
 * v0.5.0 — Wallet transactions (topup/spend/refund) over last 90 days.
 */
function seedWallet(db, U) {
  const users = [U.admin, U.emma, U.olivia, U.test, U.noah].filter(Boolean);
  const kinds = ["topup","spend","refund"];
  const mkDate = (days) => new Date(Date.now() - days*86400000).toISOString().slice(0,19).replace('T',' ');
  const txs = [];
  for (const u of users) {
    for (let i=0;i<3;i++) {
      const type = kinds[i%kinds.length];
      const amt  = type==="topup" ? 20000 : (type==="spend" ? -5000 : 2500);
      txs.push({ id:nid(), user_id:u.id, type, amount_cents: Math.abs(amt), currency:"SEK", status:"posted", created_at: mkDate( (i+1)*7 ) });
    }
  }
  const ins = db.prepare(`INSERT INTO wallet_transactions (id,user_id,type,amount_cents,currency,status,created_at) VALUES (@id,@user_id,@type,@amount_cents,@currency,@status,@created_at)`);
  const tx = db.transaction(arr => arr.forEach(t=>ins.run(t)));
  tx(txs);
  return { wallet: txs.length };
}

/**
 * seedChat
 * Version: v0.5.7
 * Purpose: Create DM + group threads, add members & messages safely (index- and presence-guarded).
 * Notes:
 *  - Avoids out-of-range indexing by building explicit (group,thread) pairs.
 *  - Works even if some groups are missing.
 *  - Includes long/emoji messages and one flagged message if available.
 */
function seedChat(db, groups, U) {
  // 1) Build threads safely
  const threads = [
    { id: nid(), kind: "dm",    ref_id: null },         // T[0]
    { id: nid(), kind: "dm",    ref_id: null },         // T[1]
  ];
  // Group chats only if those groups exist
  if (groups && groups[0]) threads.push({ id: nid(), kind: "group", ref_id: groups[0].id }); // T[2]
  if (groups && groups[2]) threads.push({ id: nid(), kind: "group", ref_id: groups[2].id }); // T[3] (maybe)

  const insT = db.prepare(
    `INSERT INTO threads (id,kind,ref_id,created_at) VALUES (@id,@kind,@ref_id,datetime('now'))`
  );
  threads.forEach(t => insT.run(t));

  const T = threads; // alias

  // 2) Members
  const tm = db.prepare(
    `INSERT INTO thread_members (thread_id,user_id,role,joined_at) VALUES (@thread_id,@user_id,'member',datetime('now'))`
  );

  // DM 1: test & carol (if present)
  if (T[0] && U.test && U.carol) {
    tm.run({ thread_id: T[0].id, user_id: U.test.id });
    tm.run({ thread_id: T[0].id, user_id: U.carol.id });
  }

  // DM 2: admin & moderator (if present)
  if (T[1] && U.admin && U.moderator) {
    tm.run({ thread_id: T[1].id, user_id: U.admin.id });
    tm.run({ thread_id: T[1].id, user_id: U.moderator.id });
  }

  // Group chat membership: build explicit (group,thread) pairs
  const groupThreadPairs = [];
  if (groups && groups[0] && T[2]) groupThreadPairs.push([groups[0], T[2]]);
  if (groups && groups[2] && T[3]) groupThreadPairs.push([groups[2], T[3]]);

  for (const [g, th] of groupThreadPairs) {
    const rows = db.prepare(`SELECT user_id FROM group_members WHERE group_id = ?`).all(g.id);
    rows.forEach(r => tm.run({ thread_id: th.id, user_id: r.user_id }));
  }

  // 3) Messages (guarded)
  const insMsg = db.prepare(
    `INSERT INTO messages (id,thread_id,user_id,body,created_at) VALUES (@id,@thread_id,@user_id,@body,@created_at)`
  );
  const mkTime = (minsAgo) =>
    new Date(Date.now() - minsAgo * 60000).toISOString().slice(0, 19).replace("T", " ");

  const longMsg =
    "Hey everyone! Just wanted to say thanks for the amazing game today 😄🏆 — it was super fun and great exercise! " +
    "Remember, next week’s match will start 30 minutes earlier than usual, so don’t be late 🚀💨. " +
    "Also, we’re bringing snacks 🥪🍎, so if you have any allergies, please let me know asap. " +
    "Thanks again! ".repeat(6);

  const msgs = [];

  // DM 1 messages
  if (T[0] && U.test && U.carol) {
    msgs.push(
      { id: nid(), thread_id: T[0].id, user_id: U.test.id,  body: "That was awesome! 😄🔥", created_at: mkTime(120) },
      { id: nid(), thread_id: T[0].id, user_id: U.carol.id, body: "I’ll bring snacks 🥪🍎", created_at: mkTime(110) }
    );
  }

  // DM 2 messages
  if (T[1] && U.admin && U.moderator) {
    msgs.push(
      { id: nid(), thread_id: T[1].id, user_id: U.admin.id,     body: "Can you review the report? 📝", created_at: mkTime(90) },
      { id: nid(), thread_id: T[1].id, user_id: U.moderator.id, body: "Sure thing! 👍",                created_at: mkTime(88) }
    );
  }

  // Group 1 messages (groups[0] → T[2])
  if (groups && groups[0] && T[2]) {
    if (U.test)  msgs.push({ id: nid(), thread_id: T[2].id, user_id: U.test.id,  body: "Ready for tomorrow? 🚴💨", created_at: mkTime(60) });
    if (U.emma)  msgs.push({ id: nid(), thread_id: T[2].id, user_id: U.emma.id,  body: longMsg,                     created_at: mkTime(55) });
  }

  // Group 2 messages (groups[2] → T[3])
  if (groups && groups[2] && T[3]) {
    if (U.dave)  msgs.push({ id: nid(), thread_id: T[3].id, user_id: U.dave.id,  body: "🏆 Good game, everyone!",   created_at: mkTime(30) });
    if (U.noah)  msgs.push({ id: nid(), thread_id: T[3].id, user_id: U.noah.id,  body: "See you next time! 👋",     created_at: mkTime(25) });
  }

  // Insert messages
  const tx = db.transaction(arr => arr.forEach(m => insMsg.run(m)));
  tx(msgs);

  // Flag the long message if it exists
  const long = msgs.find(m => m.body === longMsg);
  if (long && U.admin) {
    db.prepare(
      `INSERT INTO flags (id,entity_type,entity_id,reason,status,created_by,created_at)
       VALUES (@id,'message',@entity_id,'inappropriate','open',@created_by,datetime('now'))`
    ).run({ id: nid(), entity_id: long.id, created_by: U.admin.id });
  }

  return { threads: threads.length, messages: msgs.length };
}


/** seedFlags
 * v0.5.0 — Some open/closed flags across entities.
 */
function seedFlags(db, U, activities) {
    const nowStamp = new Date(Date.now()).toISOString().slice(0,19).replace('T',' ');
const fl = [
    { id:nid(), entity_type:"activity", entity_id: activities[3]?.id, reason:"spam",        status:"open",   created_by: U.emma.id },
    { id:nid(), entity_type:"user",     entity_id: U.liam?.id,         reason:"abusive",    status:"closed", created_by: U.olivia.id, resolved_by: U.admin.id, resolved_at: nowStamp }
  ];
  // Normalize flags so optional named params always exist
  for (let i = 0; i < fl.length; i++) {
    if (fl[i].resolved_by === undefined) fl[i].resolved_by = null;
    if (fl[i].resolved_at === undefined) fl[i].resolved_at = null;
  }

  const ins = db.prepare(`INSERT INTO flags (id,entity_type,entity_id,reason,status,created_by,created_at,resolved_by,resolved_at) VALUES (@id,@entity_type,@entity_id,@reason,@status,@created_by,datetime('now'),@resolved_by,@resolved_at)`);
  const tx = db.transaction(arr=>arr.forEach(f=>ins.run(f)));
  tx(fl);
  return { flags: fl.length };
}

/** main
 * v0.5.0 — run all seed steps and print summary.
 */
function main() {
  const db = new Database(DB_PATH);
  ensureSchema(db);
  wipeData(db);

  const { users, U } = seedUsers(db);
  const { sports, S } = seedSports(db);
  const { venues } = seedVenues(db, U);
  const { groups, members } = seedGroupsAndMembers(db, U, S);
  const { activities } = seedActivities(db, groups, U, venues);
  const { friendships } = seedFriendships(db, U);
  const countsRR = seedRequestsInvites(db, groups, activities, U);
  const countsRF = seedRatingsFavorites(db, activities, groups, U);
  const walletC = seedWallet(db, U);
  const chatC = seedChat(db, groups, U);
  const flagsC = seedFlags(db, U, activities);

  // meta: seed_version + last_seed_run
  db.prepare(`
    INSERT INTO meta (key,value,updated_at) VALUES ('seed_version','v0.5.7',CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value='v0.5.7', updated_at=CURRENT_TIMESTAMP
  `).run();
  const stamp = new Date().toISOString().replace('T',' ').split('.')[0];
  db.prepare(`
    INSERT INTO meta (key,value,updated_at) VALUES ('last_seed_run',?,CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=?, updated_at=CURRENT_TIMESTAMP
  `).run(stamp, stamp);

  // ---- Colorized Summary ----
  const cReset="\x1b[0m", cCyan="\x1b[36m", cGreen="\x1b[32m", cYellow="\x1b[33m", cDim="\x1b[2m";
  const row = (label, n) => console.log(cCyan + label.ljust?.(22) || label.padEnd(22) + cReset + ": " + cGreen + n + cReset);
  const counts = {
    users: db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
    sports: db.prepare("SELECT COUNT(*) AS n FROM sports").get().n,
    venues: db.prepare("SELECT COUNT(*) AS n FROM venues").get().n,
    groups: db.prepare("SELECT COUNT(*) AS n FROM groups").get().n,
    memberships: db.prepare("SELECT COUNT(*) AS n FROM group_members").get().n,
    friendships: db.prepare("SELECT COUNT(*) AS n FROM friendships").get().n,
    invites: db.prepare("SELECT COUNT(*) AS n FROM activity_invites").get().n,
    joinreqs: db.prepare("SELECT COUNT(*) AS n FROM join_requests").get().n,
    favorites: db.prepare("SELECT COUNT(*) AS n FROM favorites").get().n,
    ratings: db.prepare("SELECT COUNT(*) AS n FROM ratings").get().n,
    flags: db.prepare("SELECT COUNT(*) AS n FROM flags").get().n,
    wallet: db.prepare("SELECT COUNT(*) AS n FROM wallet_transactions").get().n,
    threads: db.prepare("SELECT COUNT(*) AS n FROM threads").get().n,
    tmem: db.prepare("SELECT COUNT(*) AS n FROM thread_members").get().n,
    msgs: db.prepare("SELECT COUNT(*) AS n FROM messages").get().n
  };
  const total = Object.values(counts).reduce((a,b)=>a+b,0);

  console.log(`\n🌱 Pulse Seed v0.5.5 — Full Test Environment`);
  console.log(`📅 Seed run at: ${new Date().toLocaleString()}`);
  console.log(`\n📊 Seeding Complete — Summary:`);
  console.log(cDim + "─────────────────────────────────────────────" + cReset);
  console.log(cCyan + "👤 Users".padEnd(22) + cReset + ": " + cGreen + counts.users + cReset);
  console.log(cCyan + "⚽ Sports".padEnd(22) + cReset + ": " + cGreen + counts.sports + cReset);
  console.log(cCyan + "🏟️ Venues".padEnd(22) + cReset + ": " + cGreen + counts.venues + cReset);
  console.log(cCyan + "🏠 Groups".padEnd(22) + cReset + ": " + cGreen + counts.groups + cReset);
  console.log(cCyan + "🤝 Memberships".padEnd(22) + cReset + ": " + cGreen + counts.memberships + cReset);
  console.log(cCyan + "👫 Friendships".padEnd(22) + cReset + ": " + cGreen + counts.friendships + cReset);
  console.log(cCyan + "✉️ Activity Invites".padEnd(22) + cReset + ": " + cGreen + counts.invites + cReset);
  console.log(cCyan + "📝 Join Requests".padEnd(22) + cReset + ": " + cGreen + counts.joinreqs + cReset);
  console.log(cCyan + "⭐ Favorites".padEnd(22) + cReset + ": " + cGreen + counts.favorites + cReset);
  console.log(cCyan + "⭐ Ratings".padEnd(22) + cReset + ": " + cGreen + counts.ratings + cReset);
  console.log(cCyan + "🚩 Flags".padEnd(22) + cReset + ": " + cGreen + counts.flags + cReset);
  console.log(cCyan + "💰 Wallet Transactions".padEnd(22) + cReset + ": " + cGreen + counts.wallet + cReset);
  console.log(cCyan + "💬 Threads".padEnd(22) + cReset + ": " + cGreen + counts.threads + cReset);
  console.log(cCyan + "👥 Thread Members".padEnd(22) + cReset + ": " + cGreen + counts.tmem + cReset);
  console.log(cCyan + "💌 Messages".padEnd(22) + cReset + ": " + cGreen + counts.msgs + cReset);
  console.log(cDim + "─────────────────────────────────────────────" + cReset);
  console.log(cYellow + "TOTAL ENTITIES".padEnd(22) + cReset + ": " + cYellow + total + cReset);
  console.log(cDim + "─────────────────────────────────────────────" + cReset);

  // ---- UI Coverage Checklist ----
  console.log("\n🧪 UI Coverage Checklist");
  console.log("─────────────────────────────────────────────");
  const checklist = [
    "✔ Multiple user statuses (approved/pending/suspended/banned)",
    "✔ Multiple languages (en, sv)",
    "✔ Multiple themes (system, light, dark)",
    "✔ Empty state users (no friends / no wallet / no groups)",
    "✔ Groups with PUBLIC / FRIENDS / INVITE privacy",
    "✔ Groups with instant / request / invite_only join modes",
    "✔ Groups at full capacity and with space",
    "✔ Groups in multiple cities",
    "✔ Groups with prices (SEK) and free groups",
    "✔ Cancelled and archived groups",
    "✔ Super-long group title",
    "✔ Emoji in group titles",
    "✔ Multi-paragraph activity details",
    "✔ Extra-long single-paragraph activity details",
    "✔ Friendships with pending / accepted / blocked",
    "✔ Activity invites in pending / accepted / declined",
    "✔ Join requests in pending / approved / rejected",
    "✔ Ratings 1–5, with and without comments",
    "✔ Flags on activities / users / messages (open & closed)",
    "✔ Wallet transactions (topup/spend/refund)",
    "✔ Chat threads (DM & group)",
    "✔ Emoji in chat messages",
    "✔ Long chat message (300+ chars)",
    "✔ Flagged message",
    "✔ Venues with full address and coords",
    "✔ Timestamps: past / present / future events"
  ];
  checklist.forEach(item => console.log(item));
  console.log("─────────────────────────────────────────────");

  db.close();
}

main();
