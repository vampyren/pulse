/* 
 * Pulse Backend — db/index.js
 * Version: v0.2.1
 * Purpose: Singleton better-sqlite3 connection plus tiny helpers.
 */
import Database from "better-sqlite3";
import { config } from "../config.js";

// Single process-wide connection (safe with better-sqlite3)
export const db = new Database(config.DB_FILE);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Helpers (typed-ish)
export function run(sql, params = {}) { return db.prepare(sql).run(params); }
export function get(sql, params = {}) { return db.prepare(sql).get(params); }
export function all(sql, params = {}) { return db.prepare(sql).all(params); }
