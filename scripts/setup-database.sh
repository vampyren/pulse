#!/bin/bash

# Pulse Database Setup Script
# Version: v1.0.1 | Date: 2025-08-20
# Purpose: Initialize SQLite database with fresh seed data
# Usage: ./scripts/setup-database.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for nice output
ROCKET="🚀"
DATABASE="🗄️"
SPORTS="⚽"
USERS="👥"
GROUPS="🏟️"
FLAGS="🚩"
CHECK="✅"
CLEAN="🧹"
SEED="🌱"

echo -e "${BLUE}${ROCKET} Pulse Database Setup${NC}"
echo -e "${PURPLE}================================${NC}"
echo ""

# Get script directory and project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
DATABASE_DIR="$BACKEND_DIR/database"
DB_FILE="$DATABASE_DIR/pulse.db"
SCHEMA_FILE="$DATABASE_DIR/schema.sql"
SEED_FILE="$DATABASE_DIR/init-db.js"

echo -e "${YELLOW}Project Directory: $PROJECT_DIR${NC}"
echo -e "${YELLOW}Database File: $DB_FILE${NC}"
echo ""

# Check if we're in the right place
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: Cannot find backend directory${NC}"
    echo -e "${YELLOW}Please run this script from the pulse/ project root directory${NC}"
    echo -e "${YELLOW}Usage: ./scripts/setup-database.sh${NC}"
    exit 1
fi

# Create directories if they don't exist
echo -e "${BLUE}${CLEAN} Creating directory structure...${NC}"
mkdir -p "$DATABASE_DIR"

# Check required files exist
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ Error: schema.sql not found at $SCHEMA_FILE${NC}"
    echo -e "${YELLOW}Please create the schema.sql file in backend/database/${NC}"
    exit 1
fi

if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}❌ Error: init-db.js not found at $SEED_FILE${NC}"
    echo -e "${YELLOW}Please create the init-db.js file in backend/database/${NC}"
    exit 1
fi

# Remove old database
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}${CLEAN} Removing old database...${NC}"
    rm "$DB_FILE"
fi

# Check if sqlite3 is installed
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}❌ Error: sqlite3 is not installed${NC}"
    echo -e "${YELLOW}Please install sqlite3:${NC}"
    echo -e "${YELLOW}  macOS: brew install sqlite3${NC}"
    echo -e "${YELLOW}  Ubuntu: sudo apt-get install sqlite3${NC}"
    echo -e "${YELLOW}  Windows: Download from https://sqlite.org/download.html${NC}"
    exit 1
fi

# Check Node.js dependencies
echo -e "${BLUE}${DATABASE} Checking Node.js dependencies...${NC}"
cd "$BACKEND_DIR"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No package.json found in backend directory${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
fi

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
npm install sqlite3 bcrypt jsonwebtoken --save

# Create database and run schema
echo -e "${BLUE}${DATABASE} Creating database and running schema...${NC}"
if ! sqlite3 "$DB_FILE" < "$SCHEMA_FILE"; then
    echo -e "${RED}❌ Error: Failed to create database schema${NC}"
    exit 1
fi

# Run the Node.js seed script
echo -e "${BLUE}${SEED} Running seed script...${NC}"
if ! node "$SEED_FILE"; then
    echo -e "${RED}❌ Error: Failed to seed database${NC}"
    exit 1
fi

# Verify database creation
if [ ! -f "$DB_FILE" ]; then
    echo -e "${RED}❌ Error: Database file was not created${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}${CHECK} Database setup completed successfully!${NC}"
echo ""

# Show database stats with nice formatting
echo -e "${PURPLE}📊 DATABASE STATISTICS${NC}"
echo -e "${PURPLE}=====================${NC}"

# Count records in each table
SPORTS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sports;" 2>/dev/null || echo "0")
USERS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
GROUPS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM groups;" 2>/dev/null || echo "0")
MEMBERS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM group_members;" 2>/dev/null || echo "0")
RATINGS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM user_ratings;" 2>/dev/null || echo "0")
FLAGS_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM flag_reports;" 2>/dev/null || echo "0")

echo -e "${SPORTS} Sports:      ${GREEN}${SPORTS_COUNT}${NC} categories"
echo -e "${USERS} Users:       ${GREEN}${USERS_COUNT}${NC} registered"
echo -e "${GROUPS} Groups:      ${GREEN}${GROUPS_COUNT}${NC} activities"
echo -e "👤 Members:     ${GREEN}${MEMBERS_COUNT}${NC} memberships"
echo -e "⭐ Ratings:     ${GREEN}${RATINGS_COUNT}${NC} user ratings"
echo -e "${FLAGS} Flags:       ${GREEN}${FLAGS_COUNT}${NC} reports"

echo ""
echo -e "${CYAN}📋 SAMPLE DATA${NC}"
echo -e "${CYAN}=============${NC}"

# Show sample sports
echo -e "${SPORTS} ${YELLOW}Available Sports:${NC}"
sqlite3 "$DB_FILE" "SELECT '  ' || icon || ' ' || name FROM sports ORDER BY name LIMIT 5;" 2>/dev/null || echo "  No sports found"

echo ""
# Show sample users
echo -e "${USERS} ${YELLOW}Sample Users:${NC}"
sqlite3 "$DB_FILE" "SELECT '  👤 ' || name || ' (@' || username || ')' FROM users WHERE role = 'user' ORDER BY name LIMIT 5;" 2>/dev/null || echo "  No users found"

echo ""
# Show sample groups
echo -e "${GROUPS} ${YELLOW}Recent Activities:${NC}"
sqlite3 "$DB_FILE" "SELECT '  📅 ' || title || ' in ' || city FROM groups ORDER BY created_at DESC LIMIT 5;" 2>/dev/null || echo "  No activities found"

echo ""
echo -e "${GREEN}${CHECK} Database is ready for development!${NC}"
echo ""
echo -e "${BLUE}🔧 NEXT STEPS:${NC}"
echo -e "1. Start the backend server: ${YELLOW}cd backend && npm run dev${NC}"
echo -e "2. Start the frontend: ${YELLOW}cd web && npm run dev${NC}"
echo -e "3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${CYAN}📝 DEFAULT LOGIN:${NC}"
echo -e "   Username: ${YELLOW}admin${NC}"
echo -e "   Password: ${YELLOW}password123${NC}"
echo ""
echo -e "${PURPLE}📁 Database location: ${DATABASE_DIR}/pulse.db${NC}"
echo -e "${PURPLE}🛠️  To reset database: ./scripts/setup-database.sh${NC}"
echo ""
