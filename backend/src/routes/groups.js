/** 
 * Pulse Backend — routes/groups.js
 * Version: v0.2.4
 * Purpose: Read-only Groups endpoints for Discover.
 * Supports filters: privacy, sport (comma list), city, city_like (prefix),
 * city_contains (substring), city_in (comma list; precedence over others).
 */

import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// Map DB row -> API shape
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
    updated_at: row.updated_at ?? null,
  };
}

/**
 * GET /api/v2/groups
 * Query: privacy=public|friends|invite|private
 *        sport=padel,tennis
 *        city=Stockholm            (exact)
 *        city_like=Mal             (prefix, case-insensitive)
 *        city_contains=holm        (substring, case-insensitive)
 *        city_in=Malmö,Stockholm   (IN, case-insensitive; takes precedence)
 *
 * Precedence: city_in > city_contains > city_like. If `city` is present,
 * it's combined with other filters unless city_in is used.
 */
router.get("/", (req, res) => {
  const { privacy, sport, city, city_like, city_contains, city_in } = req.query;
  const where = [];
  const params = {};

  // privacy
  if (privacy && ["public", "friends", "invite", "private"].includes(String(privacy))) {
    where.push("privacy = @privacy");
    params.privacy = String(privacy);
  }

  // sport IN
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

  // city filters with precedence
  if (city_in) {
    const list = String(city_in).split(",").map(c => c.trim()).filter(Boolean);
    if (list.length) {
      where.push(
        `LOWER(city) IN (${list.map((_, i) => `LOWER(@c${i})`).join(",")})`
      );
      list.forEach((val, i) => (params[`c${i}`] = val));
    }
  } else if (city_contains) {
    where.push("LOWER(city) LIKE LOWER(@city_contains)");
    params.city_contains = `%${String(city_contains)}%`;
  } else if (city_like) {
    where.push("LOWER(city) LIKE LOWER(@city_like)");
    params.city_like = `${String(city_like)}%`;
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

/**
 * GET /api/v2/groups/:id
 * Returns: { group, members, activities }
 */
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
      ORDER BY gm.role DESC, gm.joined_at ASC
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
