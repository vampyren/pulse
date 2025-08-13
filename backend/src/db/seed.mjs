/*
 * Pulse Backend — db/seed.mjs
 * Version: v0.4.0
 * Purpose: Single-command dev seed (clean slate each run).
 *  - Ensures minimal schema for: users, sports, venues, groups, group_members, activities, friendships, flags
 *  - Resets data safely (FKs off during wipe)
 *  - Seeds realistic test data:
 *      • Users (admin/test/bob…helena) with varied statuses (approved/pending/suspended/rejected)
 *      • Sports (stable slugs)
 *      • Venues (admin-approved)
 *      • Groups (public/private) with join_mode (open/request/invite)
 *      • Group members (owner/member/pending)
 *      • Activities (future dates)
 *      • Friendships (pending/accepted/rejected)
 *      • Flags (open)
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
 * v0.4.0
 * Creates required tables/indexes if they don't exist.
 */
function ensureSchema(db) {
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      name          TEXT,
      email         TEXT NOT NULL UNIQUE,
      password      TEXT NOT NULL,
      is_admin      INTEGER DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'approved', -- pending|approved|suspended|rejected
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
      approved     INTEGER DEFAULT 0,     -- 1=approved by admin
      created_by   TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      sport_id   TEXT NOT NULL REFERENCES sports(id),
      privacy    TEXT NOT NULL DEFAULT 'public',  -- public|private
      join_mode  TEXT NOT NULL DEFAULT 'open',    -- open|request|invite
      city       TEXT,
      owner_id   TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      role       TEXT NOT NULL DEFAULT 'member',     -- owner|member
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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id            TEXT PRIMARY KEY,
      a_user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      b_user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status        TEXT NOT NULL,      -- pending|accepted|rejected
      requested_by  TEXT NOT NULL REFERENCES users(id),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (a_user_id, b_user_id)
    );

    CREATE TABLE IF NOT EXISTS flags (
      id          TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,       -- 'user'|'group'|'activity'
      entity_id   TEXT NOT NULL,
      reason      TEXT NOT NULL,
      created_by  TEXT NOT NULL REFERENCES users(id),
      status      TEXT NOT NULL DEFAULT 'open', -- open|resolved
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- helpful indexes
    CREATE INDEX IF NOT EXISTS idx_groups_sport ON groups (sport_id);
    CREATE INDEX IF NOT EXISTS idx_activities_group ON activities (group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members (user_id);
  `);
}

/** resetDev
 * v0.4.0
 * Wipe tables in FK-safe order. Turns FKs OFF during wipe, ON after.
 */
function resetDev(db) {
  const exec = (sql) => db.exec(sql);
  exec("PRAGMA foreign_keys = OFF;");
  // children first
  ["group_members","activities","friendships","flags","groups","venues","sports","users"].forEach(t => {
    try { exec(`DELETE FROM ${t};`); } catch {}
  });
  exec("PRAGMA foreign_keys = ON;");
}

/** isoIn
 * v0.4.0 — Return ISO string for now + N minutes
 */
function isoIn({ minutes = 0, hours = 0, days = 0 } = {}) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes + hours*60 + days*24*60);
  return d.toISOString();
}

/** seedUsers
 * v0.4.0 — Baseline users (varied statuses). Password = username.
 */
function seedUsers(db) {
  const mk = (u, n, email, { admin = false, city = "Malmö", status = "approved" } = {}) => ({
    id: nid(),
    username: u,
    name: n,
    email,
    password: hash(u),
    is_admin: admin ? 1 : 0,
    status,
    address_city: city,
    lat: 55.604,
    lng: 13.003,
  });

  const users = [
    mk("admin",  "Admin User",   "admin@example.com",  { admin: true, status: "approved" }),
    mk("test",   "Test One",     "test@example.com",   { status: "approved" }),
    mk("test2",  "Test Two",     "test2@example.com",  { status: "pending" }),
    mk("test3",  "Test Three",   "test3@example.com",  { status: "rejected" }),
    mk("bob",    "Bob Anders",   "bob@example.com"),
    mk("carol",  "Carol Berg",   "carol@example.com"),
    mk("dave",   "Dave Carl",    "dave@example.com"),
    mk("eva",    "Eva Dahl",     "eva@example.com"),
    mk("frank",  "Frank Elm",    "frank@example.com",  { status: "suspended" }),
    mk("gustav", "Gustav Falk",  "gustav@example.com"),
    mk("helena", "Helena Gård",  "helena@example.com"),
  ];

  const stmt = db.prepare(`
    INSERT INTO users (id, username, name, email, password, is_admin, status, address_city, lat, lng, wallet_balance_cents)
    VALUES (@id,@username,@name,@email,@password,@is_admin,@status,@address_city,@lat,@lng,0)
  `);
  const tx = db.transaction(arr => arr.forEach(u => stmt.run(u)));
  tx(users);

  // convenience maps
  const byUsername = Object.fromEntries(users.map(u => [u.username, u]));
  return { users, byUsername };
}

/** seedSports
 * v0.4.0 — Stable slugs for filters.
 */
function seedSports(db) {
  const sports = [
    { id: "padel",         name: "Padel",        icon: "🎾" },
    { id: "football",      name: "Football",     icon: "⚽" },
    { id: "basketball",    name: "Basketball",   icon: "🏀" },
    { id: "volleyball",    name: "Volleyball",   icon: "🏐" },
    { id: "tennis",        name: "Tennis",       icon: "🎾" },
    { id: "badminton",     name: "Badminton",    icon: "🏸" },
    { id: "running",       name: "Running",      icon: "🏃" },
    { id: "table_tennis",  name: "Table Tennis", icon: "🏓" },
  ];
  const stmt = db.prepare("INSERT INTO sports (id,name,icon) VALUES (@id,@name,@icon)");
  const tx = db.transaction(arr => arr.forEach(s => stmt.run(s)));
  tx(sports);
  const byId = Object.fromEntries(sports.map(s => [s.id, s]));
  return { sports, byId };
}

/** seedVenues
 * v0.4.0 — Admin-approved locations users can select.
 */
function seedVenues(db, U) {
  const venues = [
    { id: nid(), name: "Malmö Sporthall",  address_city: "Malmö", lat: 55.600, lng: 13.010, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Lund Idrottshall", address_city: "Lund",  lat: 55.705, lng: 13.193, approved: 1, created_by: U.admin.id },
    { id: nid(), name: "Ribersborg Strand",address_city: "Malmö", lat: 55.612, lng: 12.963, approved: 0, created_by: U.test.id }, // pending spot
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
 * v0.4.0 — Creates groups and member rows (owner/member/pending).
 */
function seedGroupsAndMembers(db, U, S) {
  const groups = [
    { id: nid(), name: "Early Runners Malmö",   sport_id: S.running.id,      privacy: "public",  join_mode: "open",    city: "Malmö",  owner_id: U.test.id },
    { id: nid(), name: "Padel Nights",          sport_id: S.padel.id,        privacy: "private", join_mode: "request", city: "Malmö",  owner_id: U.carol.id },
    { id: nid(), name: "Lund Basketball Crew",  sport_id: S.basketball.id,   privacy: "public",  join_mode: "invite",  city: "Lund",   owner_id: U.dave.id },
  ];
  const insGroup = db.prepare(`
    INSERT INTO groups (id,name,sport_id,privacy,join_mode,city,owner_id,created_at,updated_at)
    VALUES (@id,@name,@sport_id,@privacy,@join_mode,@city,@owner_id,datetime('now'),datetime('now'))
  `);
  const txG = db.transaction(arr => arr.forEach(g => insGroup.run(g)));
  txG(groups);

  const members = [
    // owners
    { group_id: groups[0].id, user_id: U.test.id,   role: "owner", status: "active" },
    { group_id: groups[1].id, user_id: U.carol.id,  role: "owner", status: "active" },
    { group_id: groups[2].id, user_id: U.dave.id,   role: "owner", status: "active" },
    // members
    { group_id: groups[0].id, user_id: U.bob.id,    role: "member", status: "active" },
    { group_id: groups[0].id, user_id: U.eva.id,    role: "member", status: "active" },
    { group_id: groups[1].id, user_id: U.gustav.id, role: "member", status: "pending" }, // requested
    { group_id: groups[2].id, user_id: U.helena.id, role: "member", status: "pending" }, // invite pending
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
 * v0.4.0 — A few future activities per group.
 */
function seedActivities(db, groups, U, venues) {
  const [g1, g2, g3] = groups;
  const v1 = venues[0]?.id ?? null;
  const v2 = venues[1]?.id ?? null;

  const acts = [
    { id: nid(), group_id: g1.id, title: "Sunrise 5K",      starts_at: isoIn({ days: 1, hours: 7 }),  venue_id: v1, privacy: "public",  created_by: U.test.id },
    { id: nid(), group_id: g1.id, title: "Saturday Long",   starts_at: isoIn({ days: 3, hours: 8 }),  venue_id: v1, privacy: "public",  created_by: U.test.id },
    { id: nid(), group_id: g2.id, title: "Padel Ladder",    starts_at: isoIn({ days: 2, hours: 19 }), venue_id: v2, privacy: "private", created_by: U.carol.id },
    { id: nid(), group_id: g3.id, title: "Open Scrimmage",  starts_at: isoIn({ days: 4, hours: 18 }), venue_id: v2, privacy: "public",  created_by: U.dave.id },
  ];

  const ins = db.prepare(`
    INSERT INTO activities (id,group_id,title,starts_at,ends_at,venue_id,privacy,created_by,created_at)
    VALUES (@id,@group_id,@title,@starts_at,NULL,@venue_id,@privacy,@created_by,datetime('now'))
  `);
  const tx = db.transaction(arr => arr.forEach(a => ins.run(a)));
  tx(acts);
  return { activities: acts };
}

/** seedFriendships
 * v0.4.0 — pending/accepted/rejected edges. Always store ordered pairs (a<b) for uniqueness.
 */
function seedFriendships(db, U) {
  const pairs = [
    { u1: U.test.id,   u2: U.carol.id,  status: "accepted", requested_by: U.test.id },
    { u1: U.test.id,   u2: U.dave.id,   status: "pending",  requested_by: U.test.id },
    { u1: U.gustav.id, u2: U.helena.id, status: "rejected", requested_by: U.gustav.id },
  ];

  const order = (a, b) => (a < b ? [a, b] : [b, a]);

  const ins = db.prepare(`
    INSERT INTO friendships (id,a_user_id,b_user_id,status,requested_by,created_at)
    VALUES (@id,@a_user_id,@b_user_id,@status,@requested_by,datetime('now'))
    ON CONFLICT(a_user_id,b_user_id) DO UPDATE SET status=excluded.status, requested_by=excluded.requested_by
  `);

  const tx = db.transaction(arr => {
    arr.forEach(p => {
      const [a_user_id, b_user_id] = order(p.u1, p.u2);
      ins.run({ id: nid(), a_user_id, b_user_id, status: p.status, requested_by: p.requested_by });
    });
  });
  tx(pairs);

  return { friendships: pairs.length };
}

/** seedFlags
 * v0.4.0 — a sample open flag.
 */
function seedFlags(db, U) {
  const flags = [
    { id: nid(), entity_type: "user", entity_id: U.test3.id, reason: "possible spam", created_by: U.admin.id, status: "open" },
  ];
  const ins = db.prepare(`
    INSERT INTO flags (id,entity_type,entity_id,reason,created_by,status,created_at)
    VALUES (@id,@entity_type,@entity_id,@reason,@created_by,@status,datetime('now'))
  `);
  const tx = db.transaction(arr => arr.forEach(f => ins.run(f)));
  tx(flags);
  return { flags: flags.length };
}

/** main
 * v0.4.0 — one clean run.
 */
function main() {
  const db = new Database(DB_PATH);

  ensureSchema(db);
  resetDev(db);

  const { users, byUsername: U } = seedUsers(db);
  const { byId: S } = seedSports(db);
  const { venues } = seedVenues(db, U);
  const { groups, members } = seedGroupsAndMembers(db, U, S);
  const { activities } = seedActivities(db, groups, U, venues);
  const { friendships } = seedFriendships(db, U);
  const { flags } = seedFlags(db, U);

  console.log(
    `[seed] users:${users.length} sports:${Object.keys(S).length} venues:${venues.length} groups:${groups.length} members:${members.length} activities:${activities.length} friendships:${friendships} flags:${flags}`
  );

  db.close();
}

main();
