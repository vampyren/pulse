/**
 * Version: v2.2.0 | Date: 2025-08-20
 * Purpose: Express server with SQLite database integration (ES Module)
 * Features: Real database queries, authentication, CRUD operations
 * Author: Pulse Admin System
 */

import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4010;
const JWT_SECRET = process.env.JWT_SECRET || 'pulse-dev-secret-key';

// Database connection
const dbPath = path.join(__dirname, '..', 'database', 'pulse.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        console.log('📁 Database location:', dbPath);
    }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://136.244.101.169:3000',
    'http://136.244.101.169:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Helper function to promisify database operations
function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// Health check endpoint
app.get('/api/v2/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Pulse API v2.1.0 with SQLite database (ES Module)',
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Authentication endpoints
app.post('/api/v2/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await dbGet(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account suspended' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Update last activity
        await dbRun('UPDATE users SET last_activity = ? WHERE id = ?', [
            new Date().toISOString().slice(0, 10),
            user.id
        ]);
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                rating: user.rating,
                totalRatings: user.total_ratings,
                flags: user.flags
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/v2/auth/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await dbGet(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Math.random().toString(36).substr(2, 9);
        
        await dbRun(
            'INSERT INTO users (id, name, username, email, password_hash, join_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, username, email, hashedPassword, new Date().toISOString().slice(0, 10)]
        );
        
        res.status(201).json({ message: 'User created successfully' });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new group/activity endpoint
app.post('/api/v2/groups', authenticateToken, async (req, res) => {
    try {
        const { 
            sport_id, 
            date, 
            time, 
            skill_level, 
            location, 
            privacy, 
            description, 
            max_members 
        } = req.body;
        
        const organizerId = req.user.id;
        
        // Validate required fields
        if (!sport_id || !date || !time || !skill_level || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Get sport info for title generation
        const sport = await dbGet('SELECT name FROM sports WHERE id = ?', [sport_id]);
        if (!sport) {
            return res.status(400).json({ error: 'Invalid sport selected' });
        }
        
        // Skill level display names
        const skillLevelNames = {
            'newbie': 'Newbie Friendly',
            'weekend': 'Weekend Warrior', 
            'serious': 'Serious Player',
            'elite': 'Elite Level'
        };
        
        // Auto-generate title from sport + skill level
        const title = `${sport.name} - ${skillLevelNames[skill_level] || skill_level}`;
        
        // Combine date and time
        const dateTime = `${date} ${time}`;
        
        const groupId = Math.random().toString(36).substr(2, 9);
        
        await dbRun(`
            INSERT INTO groups (
                id, title, sport_id, organizer_id, city, privacy, 
                max_members, details, date_time, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            groupId, 
            title, 
            sport_id, 
            organizerId, 
            location, // Using location as city for now
            privacy, 
            max_members, 
            description || '', 
            dateTime,
            'upcoming'
        ]);
        
        // Add organizer as member with organizer role
        const membershipId = Math.random().toString(36).substr(2, 9);
        await dbRun(
            'INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)',
            [membershipId, groupId, organizerId, 'organizer']
        );
        
        // Update group count for the sport
        await dbRun(
            'UPDATE sports SET group_count = group_count + 1 WHERE id = ?',
            [sport_id]
        );
        
        // Fetch the created group with all details
        const newGroup = await dbGet(`
            SELECT 
                g.*,
                s.name as sport_name,
                s.icon as sport_icon,
                u.name as organizer_name
            FROM groups g
            LEFT JOIN sports s ON g.sport_id = s.id
            LEFT JOIN users u ON g.organizer_id = u.id
            WHERE g.id = ?
        `, [groupId]);
        
        res.status(201).json(newGroup);
        
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sports endpoints
app.get('/api/v2/sports', async (req, res) => {
    try {
        const sports = await dbAll(
            'SELECT id, name, icon, slug, is_active as isActive, group_count as groupCount FROM sports ORDER BY name'
        );
        res.json(sports);
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/v2/sports', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, icon, slug } = req.body;
        const sportId = Math.random().toString(36).substr(2, 9);
        
        await dbRun(
            'INSERT INTO sports (id, name, icon, slug) VALUES (?, ?, ?, ?)',
            [sportId, name, icon, slug || name.toLowerCase().replace(/\s+/g, '-')]
        );
        
        const sport = await dbGet('SELECT * FROM sports WHERE id = ?', [sportId]);
        res.status(201).json(sport);
    } catch (error) {
        console.error('Error creating sport:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Groups/Activities endpoints
app.get('/api/v2/groups', async (req, res) => {
    try {
        const { sport, city, privacy, search } = req.query;
        
        let query = `
            SELECT 
                g.*,
                s.name as sport_name,
                s.icon as sport_icon,
                u.name as organizer_name,
                COUNT(gm.id) as memberCount
            FROM groups g
            LEFT JOIN sports s ON g.sport_id = s.id
            LEFT JOIN users u ON g.organizer_id = u.id
            LEFT JOIN group_members gm ON g.id = gm.group_id
            WHERE g.status = 'upcoming'
        `;
        
        const params = [];
        
        if (sport && sport !== 'all') {
            query += ' AND g.sport_id = ?';
            params.push(sport);
        }
        
        if (city && city !== 'all') {
            query += ' AND g.city = ?';
            params.push(city);
        }
        
        if (privacy && privacy !== 'all') {
            query += ' AND g.privacy = ?';
            params.push(privacy);
        }
        
        if (search) {
            query += ' AND (g.title LIKE ? OR g.details LIKE ? OR s.name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ' GROUP BY g.id ORDER BY g.date_time';
        
        const groups = await dbAll(query, params);
        
        // Get members for each group
        for (const group of groups) {
            const members = await dbAll(`
                SELECT u.id, u.name, u.rating, u.total_ratings as totalRatings, u.flags, gm.role
                FROM group_members gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ?
                ORDER BY gm.role DESC, u.name
            `, [group.id]);
            
            group.members = members;
            group.sport_id = group.sport_id;
            group.date_time = group.date_time;
            group.max_members = group.max_members;
        }
        
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/v2/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const group = await dbGet(`
            SELECT 
                g.*,
                s.name as sport_name,
                s.icon as sport_icon,
                u.name as organizer_name
            FROM groups g
            LEFT JOIN sports s ON g.sport_id = s.id
            LEFT JOIN users u ON g.organizer_id = u.id
            WHERE g.id = ?
        `, [id]);
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        // Get members
        const members = await dbAll(`
            SELECT u.id, u.name, u.username, u.rating, u.total_ratings as totalRatings, u.flags, gm.role
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = ?
            ORDER BY gm.role DESC, u.name
        `, [id]);
        
        group.members = members;
        group.memberCount = members.length;
        
        res.json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join group endpoint
app.post('/api/v2/groups/:id/join', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Check if group exists and has space
        const group = await dbGet('SELECT * FROM groups WHERE id = ?', [id]);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        // Check if already a member
        const existingMembership = await dbGet(
            'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (existingMembership) {
            return res.status(400).json({ error: 'Already a member' });
        }
        
        // Check capacity
        const memberCount = await dbGet(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
            [id]
        );
        
        if (memberCount.count >= group.max_members) {
            return res.status(400).json({ error: 'Group is full' });
        }
        
        const membershipId = Math.random().toString(36).substr(2, 9);
        await dbRun(
            'INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)',
            [membershipId, id, userId, 'member']
        );
        
        res.json({ message: 'Successfully joined group' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User rating endpoint
app.post('/api/v2/users/:id/rate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, groupId } = req.body;
        const raterId = req.user.id;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        const ratingId = Math.random().toString(36).substr(2, 9);
        await dbRun(
            'INSERT OR REPLACE INTO user_ratings (id, rated_user_id, rater_user_id, group_id, rating) VALUES (?, ?, ?, ?, ?)',
            [ratingId, id, raterId, groupId, rating]
        );
        
        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Flag user endpoint
app.post('/api/v2/users/:id/flag', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, reason, details, groupId } = req.body;
        const reporterId = req.user.id;
        
        const flagId = Math.random().toString(36).substr(2, 9);
        await dbRun(
            'INSERT INTO flag_reports (id, reporter_id, reported_id, group_id, type, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [flagId, reporterId, id, groupId, type, reason, details]
        );
        
        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Error submitting flag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin endpoints
app.get('/api/v2/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, role, search } = req.query;
        
        let query = 'SELECT id, name, username, email, role, rating, total_ratings as totalRatings, flags, status, join_date as joinDate, last_activity as lastActivity FROM users WHERE 1=1';
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        
        if (role && role !== 'all') {
            query += ' AND role = ?';
            params.push(role);
        }
        
        if (search) {
            query += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ' ORDER BY name';
        
        const users = await dbAll(query, params);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/v2/admin/flags', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT 
                f.*,
                u1.name as reporter_name,
                u2.name as reported_name,
                u2.username as reported_username,
                g.title as activity_name
            FROM flag_reports f
            LEFT JOIN users u1 ON f.reporter_id = u1.id
            LEFT JOIN users u2 ON f.reported_id = u2.id
            LEFT JOIN groups g ON f.group_id = g.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND f.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY f.created_at DESC';
        
        const flags = await dbAll(query, params);
        res.json(flags);
    } catch (error) {
        console.error('Error fetching flags:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Pulse API v2.1.0 running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/v2/health`);
    console.log(`⚽ Sports endpoint: http://localhost:${PORT}/api/v2/sports`);
    console.log(`🏟️  Groups endpoint: http://localhost:${PORT}/api/v2/groups`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
