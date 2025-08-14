/**
 * Pulse Backend — routes/venues.js
 * Version: v0.1.0
 * Purpose: Read-only Venues listing
 */

import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const DB_PATH = process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;
const db = new Database(DB_PATH, { readonly: true });

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
