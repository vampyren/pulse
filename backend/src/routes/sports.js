/**
 * Pulse API — routes/sports.js
 * Version: v0.1.3
 * Purpose: Public sports listing + admin management (add/remove).
 *
 * Endpoints:
 *   GET  /api/v2/sports              -> public list [{ id, name, icon }]
 *   POST /api/v2/sports   (admin)    -> add/update by name { name, icon? }
 *   DELETE /api/v2/sports/:id (admin)-> remove a sport by id
 */

import { Router } from "express";
import Database from "better-sqlite3";
import { requireAdmin } from "../middleware/auth.js"; // adjust path if your auth middleware lives elsewhere

const DB_PATH = process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;
const router = Router();

function db() {
  return new Database(DB_PATH, { fileMustExist: true });
}

// Basic slug from name: ascii, lowercase, underscores
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** GET /sports — public */
router.get("/sports", (_req, res) => {
  try {
    const d = db();
    const rows = d.prepare("SELECT id,name,icon FROM sports ORDER BY name").all();
    d.close();
    return res.json({ ok: true, data: rows, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

/** POST /sports — admin: add or update by name */
router.post("/sports", requireAdmin, (req, res) => {
  const { name, icon = "" } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ ok: false, error: "name is required" });
  }
  const id = slugify(name);
  try {
    const d = db();
    // Upsert by unique name: insert if new; update icon if it exists
    d.prepare(`
      INSERT INTO sports (id,name,icon)
      VALUES (@id,@name,@icon)
      ON CONFLICT(name) DO UPDATE SET icon=excluded.icon
    `).run({ id, name: name.trim(), icon });

    const row = d.prepare("SELECT id,name,icon FROM sports WHERE name = ?").get(name.trim());
    d.close();
    return res.json({ ok: true, data: row, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

/** DELETE /sports/:id — admin: remove by id */
router.delete("/sports/:id", requireAdmin, (req, res) => {
  try {
    const d = db();
    const info = d.prepare("DELETE FROM sports WHERE id = ?").run(req.params.id);
    d.close();
    return res.json({ ok: true, data: { deleted: info.changes }, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db error" });
  }
});

export default router;
