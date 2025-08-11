/* 
 * Pulse Backend — db/seed.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Create a fresh database and seed canonical data.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./index.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runSqlFile(file) {
  const sql = fs.readFileSync(file, "utf8");
  db.exec(sql);
}

function id() { return nanoid(); }

function seed() {
  const schemaPath = path.join(__dirname, "schema.sql");
  runSqlFile(schemaPath);

  const users = [
    { id: id(), username: "admin", name: "Administrator", email: "admin@example.com", password: "admin", is_admin: 1, status: "approved" },
    { id: id(), username: "test", name: "Test One", email: "test@example.com", password: "test", status: "approved", address_city: "Malmö", lat: 55.605, lng: 13.003 },
    { id: id(), username: "test2", name: "Test Two", email: "test2@example.com", password: "test2", status: "approved", address_city: "Stockholm", lat: 59.329, lng: 18.068 },
    { id: id(), username: "alice", name: "Alice Andersson", email: "alice@example.com", password: "alice", status: "approved", address_city: "Göteborg", lat: 57.708, lng: 11.974 }
  ];
  const insUser = db.prepare(`INSERT INTO users (id, username, name, email, password, is_admin, status, address_city, lat, lng)
                              VALUES (@id,@username,@name,@email,@password,@is_admin,@status,@address_city,@lat,@lng)`);
  db.transaction(arr => arr.forEach(u => insUser.run(u)))(users);

  const sports = ["Padel","Football","Basketball","Volleyball","Tennis","Badminton"].map(name => ({ id: id(), name, icon: "" }));
  const insSport = db.prepare("INSERT INTO sports (id, name, icon) VALUES (@id,@name,@icon)");
  db.transaction(arr => arr.forEach(s => insSport.run(s)))(sports);

  const now = new Date();
  function addDays(d) { const n = new Date(now.getTime()+d*86400000); return n.toISOString(); }
  const [uAdmin,u1,u2,u3] = users;
  const [padel, football, basketball, volleyball] = sports;

  const groups = [
    {
      id: id(), title: "Morning Padel", details: "Padel match for beginners—bring energy!",
      sport_id: padel.id, creator_id: u1.id, location_full: "NK Padel", location_city: "Malmö",
      lat: 55.605, lng: 13.003, date_time: addDays(1), max_members: 4, experience_level: "Mixed", privacy: "PUBLIC"
    },
    {
      id: id(), title: "Afterwork Football", details: "5-a-side friendly match.",
      sport_id: football.id, creator_id: uAdmin.id, location_full: "Zinkensdamm IP", location_city: "Stockholm",
      lat: 59.31, lng: 18.02, date_time: addDays(2), max_members: 10, experience_level: "Mixed", privacy: "PUBLIC"
    },
    {
      id: id(), title: "Friends Volleyball", details: "Friends-only game.",
      sport_id: volleyball.id, creator_id: uAdmin.id, location_full: "Arena 41", location_city: "Stockholm",
      lat: 59.33, lng: 18.06, date_time: addDays(3), max_members: 10, experience_level: "Mixed", privacy: "FRIENDS"
    },
    {
      id: id(), title: "Invite-only Basketball", details: "Private training session.",
      sport_id: basketball.id, creator_id: u3.id, location_full: "Korsvägen", location_city: "Göteborg",
      lat: 57.70, lng: 11.97, date_time: addDays(4), max_members: 6, experience_level: "Advanced", privacy: "INVITE"
    }
  ];
  const insGroup = db.prepare(`INSERT INTO groups
    (id,title,details,sport_id,creator_id,location_full,location_city,lat,lng,date_time,max_members,experience_level,privacy)
    VALUES (@id,@title,@details,@sport_id,@creator_id,@location_full,@location_city,@lat,@lng,@date_time,@max_members,@experience_level,@privacy)`);
  db.transaction(arr => arr.forEach(g => insGroup.run(g)))(groups);

  const insMember = db.prepare("INSERT INTO memberships (id, group_id, user_id, role) VALUES (@id,@group_id,@user_id,@role)");
  const mems = groups.map(g => ({ id: id(), group_id: g.id, user_id: g.creator_id, role: "owner" }));
  db.transaction(arr => arr.forEach(m => insMember.run(m)))(mems);

  const insFriend = db.prepare("INSERT INTO friendships (id, requester_id, addressee_id, status) VALUES (@id,@requester_id,@addressee_id,@status)");
  insFriend.run({ id: id(), requester_id: uAdmin.id, addressee_id: u2.id, status: "accepted" });

  const inviteGroup = groups.find(g => g.privacy === "INVITE");
  const insInvite = db.prepare("INSERT INTO activity_invites (id, activity_id, user_id, status) VALUES (@id,@activity_id,@user_id,@status)");
  insInvite.run({ id: id(), activity_id: inviteGroup.id, user_id: u1.id, status: "pending" });

  console.log("✔ Pulse seed complete");
}

seed();
