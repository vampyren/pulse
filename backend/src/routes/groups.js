/**
 * Pulse Backend — routes/groups.js
 * Version: v0.2.2
 * Purpose: Read-only Groups endpoints for Discover
 *  - Supports: privacy, sport (comma list), city_like (prefix), city_in (comma list)
 */

import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const DB_PATH = process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;
const db = new Database(DB_PATH, { readonly: true });

function mapGroup(row) {
  return {
    id: row.id,
    name: row.name,
    sport_id: row.sport_id,
    privacy: row.privacy,
    join_mode: row.join_mode,
    city: row.city,
    owner_id: row.owner_id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /api/v2/groups
// Query: privacy, sport=padel,tennis, city_like=Mal, city_in=Malmö,Stockholm
router.get("/", (req, res) => {
  const { privacy, sport, city, city_like, city_in } = req.query;
  const where = [];
  const params = {};

  // privacy
  if (privacy && ["public", "friends", "invite", "private"].includes(String(privacy))) {
    where.push("privacy = @privacy");
    params.privacy = String(privacy);
  }

  // sports (IN)
  if (sport) {
    const list = String(sport).split(",").map(s => s.trim()).filter(Boolean);
    if (list.length) {
      where.push(`sport_id IN (${list.map((_, i) => `@s${i}`).join(",")})`);
      list.forEach((val, i) => (params[`s${i}`] = val));
    }
  }

  // exact city
  if (city) {
    where.push("city = @city");
    params.city = String(city);
  }

  // city_like (prefix)
  if (city_like) {
    where.push("LOWER(city) LIKE LOWER(@city_like)");
    params.city_like = `${String(city_like)}%`;
  }

  // city_in (IN, case-insensitive match by normalizing)
  if (city_in) {
    const list = String(city_in).split(",").map(c => c.trim()).filter(Boolean);
    if (list.length) {
      where.push(
        `LOWER(city) IN (${list.map((_, i) => `LOWER(@c${i})`).join(",")})`
      );
      list.forEach((val, i) => (params[`c${i}`] = val));
    }
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db.prepare(
    `
      SELECT id,name,sport_id,privacy,join_mode,city,owner_id,status,created_at,updated_at
      FROM groups
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT 200
    `
  ).all(params);

  res.json({ ok: true, data: rows.map(mapGroup), meta: { count: rows.length } });
});

// GET /api/v2/groups/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const group = db.prepare(
    `SELECT id,name,sport_id,privacy,join_mode,city,owner_id,status,created_at,updated_at FROM groups WHERE id = ?`
  ).get(id);
  if (!group) return res.status(404).json({ ok: false, error: "not_found", data: null });

  const members = db.prepare(
    `
      SELECT gm.user_id, gm.role, gm.status, u.username, u.name
      FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.role = 'owner' DESC, u.username ASC
      LIMIT 200
    `
  ).all(id);

  const activities = db.prepare(
    `
      SELECT id, title, starts_at, price_cents, currency, privacy, details
      FROM activities
      WHERE group_id = ?
      ORDER BY datetime(starts_at) DESC
      LIMIT 20
    `
  ).all(id);

  res.json({ ok: true, data: { group: mapGroup(group), members, activities }, meta: null });
});

export default router;
