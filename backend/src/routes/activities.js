/**
 * Pulse Backend — routes/activities.js
 * Version: v0.1.2
 * Purpose: Read-only Activities listing (optionally scoped by group)
 */

import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

// GET /api/v2/activities?group=<group_id>
router.get("/", (req, res) => {
  const { group } = req.query;

  if (group) {
    const rows = db.prepare(`
      SELECT id, group_id, title, starts_at, price_cents, currency, privacy, details
      FROM activities
      WHERE group_id = @group
      ORDER BY datetime(starts_at) DESC
      LIMIT 100
    `).all({ group });
    return res.json({ ok: true, data: rows, meta: { count: rows.length } });
  }

  const rows = db.prepare(`
    SELECT id, group_id, title, starts_at, price_cents, currency, privacy, details
    FROM activities
    ORDER BY datetime(starts_at) DESC
    LIMIT 100
  `).all();
  res.json({ ok: true, data: rows, meta: { count: rows.length } });
});

export default router;
