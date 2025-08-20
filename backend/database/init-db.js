/**
 * Version: v1.1.0 | Date: 2025-08-20
 * Purpose: Database seeding script with random data generation (ES Module)
 * Features: Random users, activities, ratings, and flags
 * Author: Pulse Admin System
 */

import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database path
const dbPath = path.join(__dirname, 'pulse.db');
const db = new sqlite3.Database(dbPath);

// Helper function to generate random IDs
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Helper function to generate random dates
function randomFutureDate() {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
    return futureDate.toISOString().slice(0, 19).replace('T', ' ');
}

function randomPastDate() {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Last 6 months
    return pastDate.toISOString().slice(0, 10);
}

// Sample data arrays
const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Charlotte', 'Oliver', 'Amelia', 'James', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Mason', 'Luna', 'Michael', 'Camila', 'Ethan', 'Gianna', 'Daniel', 'Elizabeth', 'Jacob', 'Eleanor', 'Logan'];

const lastNames = ['Anderson', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const cities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'];

const activityTitles = [
    'Morning Workout Session',
    'Weekend Tournament',
    'Friendly Match',
    'Training Session',
    'Championship Game',
    'Practice Round',
    'Social Game',
    'Competitive Match',
    'Fun Activity',
    'Skill Building Session',
    'Advanced Training',
    'Beginner Friendly Game',
    'Evening Session',
    'Saturday Morning Activity',
    'Sunday Fun Day'
];

const activityDescriptions = [
    'Join us for an exciting session! All skill levels welcome.',
    'Great opportunity to meet new people and stay active.',
    'Competitive but friendly atmosphere. Come ready to play!',
    'Perfect for improving your skills and having fun.',
    'Welcoming community of sports enthusiasts.',
    'Regular meetup for active individuals.',
    'High-energy session with experienced players.',
    'Relaxed and social environment for everyone.',
    'Challenge yourself and meet like-minded people.',
    'Fun way to stay fit and make new friends.'
];

const flagReasons = ['harassment', 'bad_sportsmanship', 'cheating', 'no_show', 'inappropriate_behavior', 'other'];
const flagDetails = [
    'Was rude to other players during the game.',
    'Used inappropriate language throughout the session.',
    'Did not show up without notice.',
    'Displayed poor sportsmanship and attitude.',
    'Was aggressive and made others uncomfortable.',
    'Cheated during the game and refused to acknowledge it.',
    'Sent inappropriate messages after the activity.',
    'Disrupted the game and argued with the organizer.'
];

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Hash password for all users
    const hashedPassword = await hashPassword('password123');

    // Insert sports (fixed data)
    const sports = [
        ['1', 'Football', '⚽', 'football', 1, 0],
        ['2', 'Basketball', '🏀', 'basketball', 1, 0],
        ['3', 'Tennis', '🎾', 'tennis', 1, 0],
        ['4', 'Swimming', '🏊', 'swimming', 1, 0],
        ['5', 'Running', '🏃', 'running', 1, 0],
        ['6', 'Padel', '🎾', 'padel', 1, 0],
        ['7', 'Cycling', '🚴', 'cycling', 1, 0],
        ['8', 'Volleyball', '🏐', 'volleyball', 1, 0],
        ['9', 'Badminton', '🏸', 'badminton', 1, 0],
        ['10', 'Golf', '⛳', 'golf', 1, 0]
    ];

    console.log('⚽ Inserting sports...');
    const sportStmt = db.prepare('INSERT INTO sports (id, name, icon, slug, is_active, group_count) VALUES (?, ?, ?, ?, ?, ?)');
    for (const sport of sports) {
        sportStmt.run(sport);
    }
    sportStmt.finalize();

    // Generate random users
    console.log('👥 Generating random users...');
    const users = [];
    
    // Add admin user first
    users.push([
        '1', 
        'Admin User', 
        'admin', 
        'admin@pulse.com', 
        hashedPassword, 
        'admin', 
        5.0, 
        1, 
        0, 
        'active', 
        '2025-01-01', 
        '2025-08-20'
    ]);

    // Generate 50 random users
    for (let i = 2; i <= 51; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
        const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
        const totalRatings = Math.floor(Math.random() * 30) + 1;
        const flags = Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0; // 20% chance of having flags
        const status = flags > 0 && Math.random() < 0.3 ? 'suspended' : 'active';
        
        users.push([
            i.toString(),
            name,
            username,
            email,
            hashedPassword,
            'user',
            rating,
            totalRatings,
            flags,
            status,
            randomPastDate(),
            '2025-08-' + String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
        ]);
    }

    const userStmt = db.prepare('INSERT INTO users (id, name, username, email, password_hash, role, rating, total_ratings, flags, status, join_date, last_activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const user of users) {
        userStmt.run(user);
    }
    userStmt.finalize();

    // Generate random groups
    console.log('🏟️  Creating random activities...');
    const groups = [];
    for (let i = 1; i <= 30; i++) {
        const sportId = sports[Math.floor(Math.random() * sports.length)][0];
        const organizerId = Math.floor(Math.random() * 50) + 2; // Random user (not admin)
        const title = activityTitles[Math.floor(Math.random() * activityTitles.length)];
        const details = activityDescriptions[Math.floor(Math.random() * activityDescriptions.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const privacy = ['PUBLIC', 'PUBLIC', 'PUBLIC', 'FRIENDS', 'INVITE'][Math.floor(Math.random() * 5)]; // More public
        const maxMembers = Math.floor(Math.random() * 20) + 4; // 4-24 members
        
        groups.push([
            i.toString(),
            title,
            details,
            sportId,
            organizerId.toString(),
            city,
            `${city} Sports Center`,
            randomFutureDate(),
            privacy,
            maxMembers,
            'upcoming'
        ]);
    }

    const groupStmt = db.prepare('INSERT INTO groups (id, title, details, sport_id, organizer_id, city, location, date_time, privacy, max_members, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const group of groups) {
        groupStmt.run(group);
    }
    groupStmt.finalize();

    // Generate random group memberships
    console.log('👤 Adding group memberships...');
    const memberships = [];
    let membershipId = 1;

    for (const group of groups) {
        const groupId = group[0];
        const organizerId = group[4];
        
        // Add organizer as member
        memberships.push([
            membershipId.toString(),
            groupId,
            organizerId,
            'organizer'
        ]);
        membershipId++;

        // Add random members (20-80% of max capacity)
        const maxMembers = parseInt(group[9]);
        const memberCount = Math.floor(Math.random() * (maxMembers * 0.6) + (maxMembers * 0.2));
        
        const usedUserIds = new Set([organizerId]);
        for (let i = 0; i < memberCount; i++) {
            let userId = Math.floor(Math.random() * 50) + 2;
            while (usedUserIds.has(userId.toString())) {
                userId = Math.floor(Math.random() * 50) + 2;
            }
            usedUserIds.add(userId.toString());
            
            memberships.push([
                membershipId.toString(),
                groupId,
                userId.toString(),
                'member'
            ]);
            membershipId++;
        }
    }

    const memberStmt = db.prepare('INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)');
    for (const membership of memberships) {
        memberStmt.run(membership);
    }
    memberStmt.finalize();

    // Generate random ratings
    console.log('⭐ Creating user ratings...');
    const ratings = [];
    let ratingId = 1;

    for (let i = 0; i < 200; i++) { // 200 random ratings
        const ratedUserId = Math.floor(Math.random() * 50) + 2;
        let raterUserId = Math.floor(Math.random() * 50) + 2;
        while (raterUserId === ratedUserId) {
            raterUserId = Math.floor(Math.random() * 50) + 2;
        }
        const groupId = Math.floor(Math.random() * 30) + 1;
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
        
        ratings.push([
            ratingId.toString(),
            ratedUserId.toString(),
            raterUserId.toString(),
            groupId.toString(),
            rating
        ]);
        ratingId++;
    }

    const ratingStmt = db.prepare('INSERT OR IGNORE INTO user_ratings (id, rated_user_id, rater_user_id, group_id, rating) VALUES (?, ?, ?, ?, ?)');
    for (const rating of ratings) {
        ratingStmt.run(rating);
    }
    ratingStmt.finalize();

    // Generate random flag reports
    console.log('🚩 Creating flag reports...');
    const flags = [];
    let flagId = 1;

    for (let i = 0; i < 15; i++) { // 15 flag reports
        const reporterId = Math.floor(Math.random() * 50) + 2;
        let reportedId = Math.floor(Math.random() * 50) + 2;
        while (reportedId === reporterId) {
            reportedId = Math.floor(Math.random() * 50) + 2;
        }
        const groupId = Math.floor(Math.random() * 30) + 1;
        const type = flagReasons[Math.floor(Math.random() * flagReasons.length)];
        const reason = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const details = flagDetails[Math.floor(Math.random() * flagDetails.length)];
        const severity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
        const status = Math.random() < 0.6 ? 'pending' : ['reviewed', 'dismissed'][Math.floor(Math.random() * 2)];
        
        flags.push([
            flagId.toString(),
            reporterId.toString(),
            reportedId.toString(),
            groupId.toString(),
            type,
            reason,
            details,
            severity,
            status
        ]);
        flagId++;
    }

    const flagStmt = db.prepare('INSERT INTO flag_reports (id, reporter_id, reported_id, group_id, type, reason, details, severity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const flag of flags) {
        flagStmt.run(flag);
    }
    flagStmt.finalize();

    console.log('✅ Database seeding completed successfully!');
}

// Run the seeding
db.serialize(() => {
    seedDatabase().then(() => {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
                process.exit(1);
            } else {
                console.log('🎉 Database connection closed successfully!');
                process.exit(0);
            }
        });
    }).catch(err => {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    });
});
