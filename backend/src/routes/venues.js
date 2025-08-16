/**
 * Pulse Backend — routes/venues.js
 * Version: v0.1.2
 * Purpose: Read-only Venues listing
 */

import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db.prepare(`
    SELECT id,name,address_city AS city,lat,lng,approved,created_by
    FROM venues
    ORDER BY name ASC
    LIMIT 200
  `).all();
  res.json({ ok: true, data: rows, meta: { count: rows.length } });
});

export default router;
