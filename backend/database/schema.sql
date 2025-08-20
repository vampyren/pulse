-- Pulse App Database Schema
-- Version: v1.0.0 | Date: 2025-08-20
-- Purpose: Complete database schema for Pulse sports app
-- Author: Pulse Admin System

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    rating REAL DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    flags INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    join_date TEXT NOT NULL,
    last_activity TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sports table
CREATE TABLE sports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    group_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Groups/Activities table
CREATE TABLE groups (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    sport_id TEXT NOT NULL,
    organizer_id TEXT NOT NULL,
    city TEXT NOT NULL,
    location TEXT,
    date_time DATETIME NOT NULL,
    privacy TEXT DEFAULT 'PUBLIC' CHECK (privacy IN ('PUBLIC', 'FRIENDS', 'INVITE', 'PRIVATE')),
    max_members INTEGER NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group memberships table
CREATE TABLE group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
);

-- User ratings table
CREATE TABLE user_ratings (
    id TEXT PRIMARY KEY,
    rated_user_id TEXT NOT NULL,
    rater_user_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE(rated_user_id, rater_user_id, group_id)
);

-- Flag reports table
CREATE TABLE flag_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    reported_id TEXT NOT NULL,
    group_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('harassment', 'bad_sportsmanship', 'cheating', 'no_show', 'inappropriate_behavior', 'other')),
    reason TEXT NOT NULL,
    details TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    reviewed_by TEXT,
    reviewed_at DATETIME,
    action_taken TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_groups_sport_id ON groups(sport_id);
CREATE INDEX idx_groups_organizer_id ON groups(organizer_id);
CREATE INDEX idx_groups_date_time ON groups(date_time);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_flag_reports_status ON flag_reports(status);
CREATE INDEX idx_flag_reports_reported_id ON flag_reports(reported_id);

-- Triggers to update group member counts
CREATE TRIGGER update_group_member_count_insert
    AFTER INSERT ON group_members
BEGIN
    UPDATE groups 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.group_id;
END;

CREATE TRIGGER update_group_member_count_delete
    AFTER DELETE ON group_members
BEGIN
    UPDATE groups 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.group_id;
END;

-- Trigger to update user ratings
CREATE TRIGGER update_user_rating
    AFTER INSERT ON user_ratings
BEGIN
    UPDATE users 
    SET 
        rating = (
            SELECT AVG(rating) 
            FROM user_ratings 
            WHERE rated_user_id = NEW.rated_user_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM user_ratings 
            WHERE rated_user_id = NEW.rated_user_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.rated_user_id;
END;

-- Trigger to update user flag counts
CREATE TRIGGER update_user_flags
    AFTER INSERT ON flag_reports
BEGIN
    UPDATE users 
    SET 
        flags = (
            SELECT COUNT(*) 
            FROM flag_reports 
            WHERE reported_id = NEW.reported_id AND status = 'pending'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.reported_id;
END;

-- Update flags when status changes
CREATE TRIGGER update_user_flags_on_status_change
    AFTER UPDATE OF status ON flag_reports
BEGIN
    UPDATE users 
    SET 
        flags = (
            SELECT COUNT(*) 
            FROM flag_reports 
            WHERE reported_id = NEW.reported_id AND status = 'pending'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.reported_id;
END;
