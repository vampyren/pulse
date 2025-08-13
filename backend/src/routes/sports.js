/**
 * Pulse API — routes/sports.js
 * v0.1.2 (ESM)
 * GET /api/v2/sports -> { ok:true, data:[{id,name,icon}], meta:null }
 */
import { Router } from "express";
import Database from "better-sqlite3";

const DB_PATH =
  process.env.PULSE_DB_PATH || `${process.env.HOME}/App/pulse/data/pulse.db`;

const router = Router();

router.get("/sports", (_req, res) => {
  try {
    const db = new Database(DB_PATH, { fileMustExist: true });
    const rows = db
      .prepare("SELECT id,name,icon FROM sports ORDER BY name")
      .all();
    db.close();
    res.json({ ok: true, data: rows, meta: null });
  } catch {
    res.status(500).json({ ok: false, error: "db error" });
  }
});

export default router;
