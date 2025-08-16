/**
 * Pulse API — routes/sports.js
 * Version: v0.1.6
 * Purpose: Public sports listing plus admin add/remove with icon.
 * Mounted at /api/v2/sports
 */

import { Router } from "express";
import { db } from "../db/index.js";
import { authOptional, requireAdmin } from "../middleware/auth.js";

const router = Router();

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

/** GET / — public list */
router.get("/", (_req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, icon FROM sports ORDER BY name").all();
    return res.json({ ok: true, data: rows, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

/** POST / — admin add/update by name { name, icon? } */
router.post("/", authOptional, requireAdmin, (req, res) => {
  const { name, icon = "" } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ ok: false, error: "name_required" });
  }
  const id = slugify(name);
  try {
    db.prepare(
      `INSERT INTO sports (id, name, icon)
       VALUES (@id, @name, @icon)
       ON CONFLICT(name) DO UPDATE SET icon = excluded.icon`
    ).run({ id, name: name.trim(), icon });

    const row = db.prepare("SELECT id, name, icon FROM sports WHERE id = ?").get(id);
    return res.json({ ok: true, data: row, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

/** DELETE /:id — admin remove */
router.delete("/:id", authOptional, requireAdmin, (req, res) => {
  try {
    const info = db.prepare("DELETE FROM sports WHERE id = ?").run(req.params.id);
    return res.json({ ok: true, data: { deleted: info.changes }, meta: null });
  } catch {
    return res.status(500).json({ ok: false, error: "db_error" });
  }
});

export default router;
