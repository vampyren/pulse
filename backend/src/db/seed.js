/*
 * Pulse Backend — db/seed.js
 * File version: v0.2.0
 * Purpose: Simple, idempotent-ish dev seed.
 * - Resets core tables (safe DELETEs, FK off during wipe)
 * - Seeds baseline users and sports
 * - No groups/activities yet (to avoid FK errors while iterating)
 */

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
let bcrypt;
try { bcrypt = require("bcrypt"); } catch { bcrypt = require("bcryptjs"); }
const { customAlphabet } = require("nanoid");
const nid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);

// --- DB path (matches your backend) ---
const DB_PATH = process.env.PULSE_DB_PATH || path.join(process.env.HOME, "App/pulse/data/pulse.db");

// --- helpers ---
const hash = (pw) => bcrypt.hashSync(pw, 10);

/** resetDev
 * v0.2.0 — wipe tables in safe order (ignore if missing), FKs OFF during wipe.
 */
function resetDev(db) {
  const execSafe = (sql) => { try { db.exec(sql); } catch { /* ignore */ } };
  execSafe("PRAGMA foreign_keys = OFF;");
  // children first
  execSafe("DELETE FROM group_members;");
  execSafe("DELETE FROM favorites;");
  execSafe("DELETE FROM flags;");
  execSafe("DELETE FROM ratings;");
  execSafe("DELETE FROM messages;");
  execSafe("DELETE FROM activities;");
  execSafe("DELETE FROM groups;");
  // parents
  execSafe("DELETE FROM users;");
  execSafe("DELETE FROM sports;");
  execSafe("DELETE FROM venues;");
  execSafe("PRAGMA foreign_keys = ON;");
}

/** seedSports
 * v0.2.0 — stable IDs; easy to use in filters
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
  const stmt = db.prepare(
    "INSERT INTO sports (id,name,icon) VALUES (@id,@name,@icon)"
  );
  const tx = db.transaction((arr) => arr.forEach((s) => stmt.run(s)));
  tx(sports);
  return sports.length;
}

/** seedUsers
 * v0.2.0 — your baseline users; bcrypt hashed; status=approved
 */
function seedUsers(db) {
  const mk = (u, n, email, admin = false, city = "Malmö") => ({
    id: nid(),
    username: u,
    name: n,
    email,
    password: hash(u), // password = username
    is_admin: admin ? 1 : 0,
    status: "approved",
    address_city: city,
    lat: 55.604, // rough Malmö center
    lng: 13.003,
  });

  const users = [
    mk("admin",  "Admin User",   "admin@example.com",  true),
    mk("test",   "Test One",     "test@example.com"),
    mk("test2",  "Test Two",     "test2@example.com"),
    mk("test3",  "Test Three",   "test3@example.com"),
    mk("bob",    "Bob Anders",   "bob@example.com"),
    mk("carol",  "Carol Berg",   "carol@example.com"),
    mk("dave",   "Dave Carl",    "dave@example.com"),
    mk("eva",    "Eva Dahl",     "eva@example.com"),
    mk("frank",  "Frank Elm",    "frank@example.com"),
    mk("gustav", "Gustav Falk",  "gustav@example.com"),
    mk("helena", "Helena Gård",  "helena@example.com"),
  ];

  const stmt = db.prepare(`
    INSERT INTO users (id, username, name, email, password, is_admin, status, address_city, lat, lng)
    VALUES (@id,@username,@name,@email,@password,@is_admin,@status,@address_city,@lat,@lng)
  `);
  const tx = db.transaction((arr) => arr.forEach((u) => stmt.run(u)));
  tx(users);
  return users.length;
}

/** main
 * v0.2.0
 */
function main() {
  // open DB (creates file if missing)
  const db = new Database(DB_PATH);

  resetDev(db);

  // IMPORTANT: we assume schema already exists (your backend shipped it).
  // If you want this file to also create schema, we can add: db.exec(fs.readFileSync(schemaPath,'utf8'))
  // For now we just insert rows, same as your previous workflow after recreating DB.

  const countSports = seedSports(db);
  const countUsers  = seedUsers(db);

  console.log(`[seed] sports: ${countSports}, users: ${countUsers}`);
  db.close();
}

if (require.main === module) {
  try {
    main();
    process.exit(0);
  } catch (e) {
    console.error("[seed] failed:", e);
    process.exit(1);
  }
}
