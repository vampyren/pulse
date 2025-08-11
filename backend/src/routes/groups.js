/* 
 * Pulse Backend — routes/groups.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Groups (activities) CRUD + fetch with visibility + join/leave.
 */
import express from "express";
import { all, get, run } from "../db/index.js";
import { ok, fail } from "../utils/respond.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);

export const router = express.Router();

function canSee(userId, row) {
  if (row.privacy === "PUBLIC") return true;
  if (!userId) return false;
  if (row.creator_id === userId) return true;
  if (row.privacy === "INVITE") {
    const invited = get("SELECT 1 FROM activity_invites WHERE activity_id=? AND user_id=? AND status IN ('pending','accepted')",
                        [row.id, userId]);
    return !!invited;
  }
  if (row.privacy === "FRIENDS") {
    const f = get("SELECT 1 FROM friendships WHERE status='accepted' AND ((requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?))",
                  [userId, row.creator_id, row.creator_id, userId]);
    return !!f;
  }
  return false;
}

function memberCount(groupId) {
  const r = get("SELECT COUNT(*) as c FROM memberships WHERE group_id=?", [groupId]);
  return r?.c || 0;
}

router.get("/", optionalAuth, (req,res)=> {
  const rows = all(`SELECT g.*, s.name as sport_name, s.icon as sport_icon, u.name as creator_name
                    FROM groups g
                    JOIN sports s ON s.id=g.sport_id
                    JOIN users u ON u.id=g.creator_id
                    ORDER BY datetime(g.date_time) ASC`);
  const items = rows.filter(r => canSee(req.user?.id, r)).map(r => ({
    group: Object.assign({}, r, { sport_name: undefined, sport_icon: undefined, creator_name: undefined }),
    member_count: memberCount(r.id),
    sport: { id: r.sport_id, name: r.sport_name, icon: r.sport_icon },
    creator: { id: r.creator_id, name: r.creator_name },
    can_join: true,
    join_mode: r.privacy === "PUBLIC" ? "join" : (r.privacy === "FRIENDS" ? "request" : "invite")
  }));
  return ok(res, { items, total_count: items.length });
});

router.post("/", requireAuth, (req,res)=> {
  const b = req.body || {};
  const needed = ["title","sport_id","date_time","max_members","location_city"];
  for (const k of needed) if (!b[k]) return fail(res, 400, `missing field: ${k}`);
  const id = nanoid();
  run(`INSERT INTO groups (id,title,details,sport_id,creator_id,location_full,location_city,lat,lng,date_time,max_members,experience_level,privacy)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    id, b.title, b.details || "", b.sport_id, req.user.id, b.location_full || b.location_city, b.location_city,
    b.lat || null, b.lng || null, b.date_time, b.max_members, b.experience_level || "Mixed", b.privacy || "PUBLIC"
  ]);
  run("INSERT INTO memberships (id, group_id, user_id, role) VALUES (?,?,?,?)", [nanoid(), id, req.user.id, "owner"]);
  return ok(res, { id });
});

router.post("/:id/join", requireAuth, (req,res)=> {
  const g = get("SELECT * FROM groups WHERE id=?", [req.params.id]);
  if (!g) return fail(res, 404, "group not found");
  if (g.privacy === "INVITE") {
    const inv = get("SELECT * FROM activity_invites WHERE activity_id=? AND user_id=? AND status='pending'", [g.id, req.user.id]);
    if (!inv) return fail(res, 403, "invite required");
    run("UPDATE activity_invites SET status='accepted' WHERE id=?", [inv.id]);
  } else if (g.privacy === "FRIENDS") {
    const f = get("SELECT 1 FROM friendships WHERE status='accepted' AND ((requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?))",
      [req.user.id, g.creator_id, g.creator_id, req.user.id]);
    if (!f) return fail(res, 403, "only friends can join (MVP); request flow TBD");
  }
  const count = memberCount(g.id);
  if (count >= g.max_members) return fail(res, 409, "group is full");
  try {
    run("INSERT INTO memberships (id, group_id, user_id, role) VALUES (?,?,?,?)", [nanoid(), g.id, req.user.id, "member"]);
  } catch (e) { return fail(res, 409, "already a member"); }
  return ok(res, true);
});

router.post("/:id/leave", requireAuth, (req,res)=> {
  const g = get("SELECT * FROM groups WHERE id=?", [req.params.id]);
  if (!g) return fail(res, 404, "group not found");
  run("DELETE FROM memberships WHERE group_id=? AND user_id=?", [g.id, req.user.id]);
  return ok(res, true);
});
