/* 
 * Pulse Backend — db/index.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: SQLite connection via better-sqlite3 and helpers.
 */
import Database from "better-sqlite3";
import { config } from "../config.js";

export const db = new Database(config.DB_FILE);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function run(sql, params = []) { return db.prepare(sql).run(params); }
export function get(sql, params = []) { return db.prepare(sql).get(params); }
export function all(sql, params = []) { return db.prepare(sql).all(params); }
