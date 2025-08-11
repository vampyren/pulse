--
-- Pulse Backend — db/schema.sql
-- File version: 0.1.1
-- Date: 2025-08-11
-- Purpose: Fresh database schema with privacy, invites, join-requests.
--
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  gender TEXT,
  status TEXT DEFAULT 'approved',
  is_admin INTEGER DEFAULT 0,
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  dm_policy TEXT DEFAULT 'friends',
  default_activity_privacy TEXT DEFAULT 'PUBLIC',
  address_street TEXT, address_city TEXT, address_postal TEXT, address_country TEXT,
  lat REAL, lng REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  sport_id TEXT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_full TEXT, location_city TEXT,
  lat REAL, lng REAL,
  date_time DATETIME NOT NULL,
  max_members INTEGER NOT NULL,
  experience_level TEXT DEFAULT 'Mixed',
  privacy TEXT CHECK(privacy IN ('PUBLIC','FRIENDS','INVITE')) DEFAULT 'PUBLIC',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_groups_city ON groups(location_city);
CREATE INDEX IF NOT EXISTS idx_groups_date ON groups(date_time);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_groups_latlng ON groups(lat, lng);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS activity_invites (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_invites_pending ON activity_invites(activity_id, user_id, status);

CREATE TABLE IF NOT EXISTS join_requests (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_joinreq_pending ON join_requests(activity_id, user_id, status);

CREATE TABLE IF NOT EXISTS user_ratings (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id TEXT NULL REFERENCES groups(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_user_id, to_user_id, group_id)
);

CREATE TABLE IF NOT EXISTS user_flags (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_favorite_sports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  rank INTEGER DEFAULT 0,
  UNIQUE(user_id, sport_id)
);

CREATE TABLE IF NOT EXISTS favorites_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
