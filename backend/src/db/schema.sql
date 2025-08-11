-- Pulse schema v0.1.1
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hash (compat; rename to password_hash later)
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- addresses (structured)
  address_city TEXT, -- compat for current code
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country_code TEXT,
  lat REAL,
  lng REAL,
  -- prefs & profile
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
  -- wallet (deposits)
  wallet_balance_cents INTEGER DEFAULT 0,
  wallet_currency TEXT DEFAULT 'SEK',
  -- status
  last_active_at DATETIME,
  status TEXT CHECK(status IN ('pending','approved','suspended','banned')) DEFAULT 'approved',
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(address_city);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

CREATE TABLE IF NOT EXISTS sports (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_sports_name ON sports(name);
CREATE INDEX IF NOT EXISTS idx_sports_slug ON sports(slug);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  sport_id TEXT NOT NULL REFERENCES sports(id),
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- location (display + structured)
  location_full TEXT,
  location_city TEXT, -- compat for current code
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country_code TEXT,
  lat REAL,
  lng REAL,
  -- scheduling & capacity
  date_time DATETIME NOT NULL,
  max_members INTEGER NOT NULL,
  min_members INTEGER DEFAULT 2,
  join_deadline_at DATETIME,
  -- visibility & flow
  experience_level TEXT,
  privacy TEXT CHECK(privacy IN ('PUBLIC','FRIENDS','INVITE')) DEFAULT 'PUBLIC',
  join_mode TEXT CHECK(join_mode IN ('instant','request','invite_only')) DEFAULT 'instant',
  -- media & pricing
  cover_image_url TEXT,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  -- lifecycle
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME,
  cancel_reason TEXT,
  archived_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_groups_sport ON groups(sport_id);
CREATE INDEX IF NOT EXISTS idx_groups_date ON groups(date_time);
CREATE INDEX IF NOT EXISTS idx_groups_city ON groups(location_city);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK(role IN ('owner','cohost','member')) DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user  ON memberships(user_id);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('pending','accepted','blocked')) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);
CREATE INDEX IF NOT EXISTS idx_friendships_pair ON friendships(requester_id, addressee_id);

CREATE TABLE IF NOT EXISTS activity_invites (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by TEXT REFERENCES users(id),
  status TEXT CHECK(status IN ('pending','accepted','declined')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_invites_activity_user ON activity_invites(activity_id, user_id);

CREATE TABLE IF NOT EXISTS join_requests (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id)
);

-- Polymorphic favorites: activity, sport, venue, user
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT CHECK(entity_type IN ('activity','sport','venue','user')) NOT NULL,
  entity_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_entity ON favorites(user_id, entity_type, entity_id);

-- Facilities / Venues (favorite now; bookings later)
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
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

-- Wallet ledger (deposits)
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
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_time ON wallet_transactions(user_id, created_at);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK(score BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id)
);

-- Flags
CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,
  entity_type TEXT CHECK(entity_type IN ('activity','user','message')) NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK(status IN ('open','closed')) DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_by TEXT REFERENCES users(id),
  resolved_at DATETIME
);

-- Chat (placeholders; implement in v0.4)
CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('dm','group')) NOT NULL,
  title TEXT,
  owner_id TEXT REFERENCES users(id),
  is_private INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS thread_members (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(thread_id, user_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT,
  attachments_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME,
  deleted_at DATETIME
);
