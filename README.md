# Pulse - Sports Activity App
**Date:** 2025-08-20  
**Status:** ✅ Production-Ready Foundation with Full Backend Integration

---

## 🚀 **NEW CHAT STARTER**

```
I'm continuing development of Pulse - a mobile-first sports activity app. 

**CURRENT STATUS:**
✅ Complete working foundation with clean architecture
✅ Full SQLite database integration
✅ Backend API with JWT authentication
✅ Admin system for comprehensive management
✅ Mobile-first responsive design with modern UI
✅ Multi-language support (EN/SV)

**KEY FEATURES:**
- User rating and flagging system
- Admin/User mode with role-based navigation
- Multi-select filters for activities
- Glass design language
- 5-item navigation (Discover, Groups, Chat, Book, Me)
- Fully responsive mobile-first design

**IMMEDIATE PRIORITIES:**
1. Connect frontend to real backend API endpoints
2. Implement full user authentication flow
3. Add remaining pages (Book, Chat, Me)
4. Integrate real-time features
5. Finalize production-ready functionality

Please help me continue development focusing on connecting the frontend to the real backend API.
```

## 🗃️ **DATABASE SCHEMA**

### **Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    rating REAL DEFAULT 3.0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- **Columns**: id, username, email, password, name, role, rating, status, created_at
- **Roles**: 'user', 'admin'
- **Statuses**: 'active', 'suspended', 'banned'

### **Sports Table**
```sql
CREATE TABLE sports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    group_count INTEGER DEFAULT 0
);
```
- **Columns**: id, name, icon, slug, is_active, group_count
- Tracks available sports categories with metadata

### **Groups Table**
```sql
CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sport_id INTEGER,
    organizer_id INTEGER,
    city TEXT,
    privacy TEXT DEFAULT 'public',
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sport_id) REFERENCES sports(id),
    FOREIGN KEY(organizer_id) REFERENCES users(id)
);
```
- **Columns**: id, title, sport_id, organizer_id, city, privacy, max_members, current_members, description, created_at
- **Privacy Levels**: 'public', 'private', 'invite_only'

### **Group Members Table**
```sql
CREATE TABLE group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(group_id, user_id)
);
```
- **Columns**: id, group_id, user_id, role, joined_at
- **Roles**: 'organizer', 'admin', 'member'

### **User Ratings Table**
```sql
CREATE TABLE user_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rated_user_id INTEGER NOT NULL,
    rater_user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rated_user_id) REFERENCES users(id),
    FOREIGN KEY(rater_user_id) REFERENCES users(id),
    FOREIGN KEY(group_id) REFERENCES groups(id),
    UNIQUE(rated_user_id, rater_user_id, group_id)
);
```
- **Columns**: id, rated_user_id, rater_user_id, group_id, rating, created_at
- 1-5 star rating system with group context

### **Flag Reports Table**
```sql
CREATE TABLE flag_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    severity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reporter_id) REFERENCES users(id),
    FOREIGN KEY(reported_id) REFERENCES users(id)
);
```
- **Columns**: id, reporter_id, reported_id, type, description, severity, status, created_at
- **Types**: 'harassment', 'inappropriate_behavior', 'spam', etc.
- **Statuses**: 'pending', 'reviewed', 'dismissed', 'action_taken'

## 🌐 **API ENDPOINTS**

### Authentication Endpoints
- `POST /api/v2/auth/login`
  - **Request**: { username, password }
  - **Response**: { token, user_info }
- `POST /api/v2/auth/register`
  - **Request**: { username, email, password, name }
  - **Response**: { token, user_info }
- `POST /api/v2/auth/refresh`
  - **Request**: { refresh_token }
  - **Response**: { new_token }

### Public Endpoints
- `GET /api/v2/health`
  - **Response**: { status: 'ok', version: '2.1.0' }
- `GET /api/v2/sports`
  - **Response**: List of active sports categories
- `GET /api/v2/groups`
  - **Query Params**: sport, city, privacy, page, limit
  - **Response**: Paginated list of activity groups

### Protected User Endpoints
- `GET /api/v2/users/me`
  - **Response**: Current user's full profile
- `POST /api/v2/groups/:id/join`
  - **Response**: Updated group membership
- `POST /api/v2/users/:id/rate`
  - **Request**: { rating, group_id }
  - **Response**: Updated user rating
- `POST /api/v2/users/:id/flag`
  - **Request**: { type, description }
  - **Response**: Flag report confirmation

### Admin Endpoints
- `GET /api/v2/admin/users`
  - **Query Params**: status, role, page, limit
  - **Response**: Paginated user management list
- `GET /api/v2/admin/flags`
  - **Query Params**: status, severity, page, limit
  - **Response**: Paginated flag reports
- `POST /api/v2/admin/users/:id/suspend`
  - **Request**: { reason }
  - **Response**: Updated user status
- `POST /api/v2/sports`
  - **Request**: { name, icon, slug }
  - **Response**: Created sport category

## 🛠️ **TECHNICAL ARCHITECTURE**

### **Core Technologies**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: SQLite with comprehensive schema
- **Authentication**: JWT with role-based access control
- **State Management**: React hooks, no external libraries

### **Development Environment**
- **Frontend**: `~/App/pulse/web`
- **Backend**: `~/App/pulse/backend`
- **Database**: `~/App/pulse/backend/database/`
- **Scripts**: `~/App/pulse/scripts/`

## 📋 **QUICK START GUIDE**

### **Setup Instructions:**
```bash
# Setup database with seed data
./scripts/setup-database.sh

# Install dependencies
cd backend && npm install
cd ../web && npm install

# Start development servers
cd backend && npm run dev     # Backend: http://localhost:4010
cd ../web && npm run dev      # Frontend: http://localhost:3000
```

### **Default Admin Login:**
- **Username**: `admin`
- **Password**: `password123`

## 🎯 **DEVELOPMENT PRIORITIES**

1. **Frontend-Backend Integration**
   - Complete API connection
   - Implement authentication flow
   - Replace mock data

2. **User Experience**
   - Finalize remaining pages
   - Implement real-time features
   - Improve search and filtering

3. **Advanced Features**
   - WebSocket integration
   - Offline support
   - Advanced analytics

---

**STATUS: Ready for Production Development** 🚀

**Resources:**
- Technical Documentation: `docs/HANDOVER_2025-08-20.md`
- Database Schema: See above
- API Endpoints: Detailed in API Endpoints section
