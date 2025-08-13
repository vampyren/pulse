/**
 * Pulse API — routes/sports.js
 * Version: v0.1.4
 * Purpose: Public sports listing + admin add/remove with icon.
 *
 * Routes (mounted under /api/v2 in app.js):
 *   GET    /sports                 -> public list [{ id, name, icon }]
 *   POST   /sports       (admin)   -> add/update by name { name, icon? }
 *   DELETE /sports/:id   (admin)   -> remove by id
 */

import { Router } from "express";
import Database from "better-sqlite3";
import { authOptional, requireAdmin } from "../middleware/auth.js";

const DB_PATH =
  process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;

const router = Router();

// helper: open DB
function openDb() {
  return new Database(DB_PATH, { fileMustExist: true });
}

// helper: slugify name -> id (ascii, lowercase, underscores)
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** GET /sports — public list */
router.get("/sports", (_req, res) => {
  try {
    const db = openDb();
    const rows = db
      .prepare("SELECT id, name, icon FROM sports ORDER BY name")
      .all();
    db.close();
    // handy while we’re stabilizing
    res.set("X-DB-Path", DB_PATH);
    return res.json({ ok: true, data: rows, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

/** POST /sports — admin add/update by name */
router.post("/sports", authOptional, requireAdmin, (req, res) => {
  const { name, icon = "" } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ ok: false, error: "name is required" });
  }
  const id = slugify(name);
  try {
    const db = openDb();
    db.prepare(
      `INSERT INTO sports (id, name, icon)
       VALUES (@id, @name, @icon)
       ON CONFLICT(name) DO UPDATE SET icon = excluded.icon`
    ).run({ id, name: name.trim(), icon });

    const row = db
      .prepare("SELECT id, name, icon FROM sports WHERE id = ?")
      .get(id);
    db.close();
    return res.json({ ok: true, data: row, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

/** DELETE /sports/:id — admin remove */
router.delete("/sports/:id", authOptional, requireAdmin, (req, res) => {
  try {
    const db = openDb();
    const info = db.prepare("DELETE FROM sports WHERE id = ?").run(req.params.id);
    db.close();
    return res.json({ ok: true, data: { deleted: info.changes }, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

export default router;
