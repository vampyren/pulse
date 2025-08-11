/* 
 * Pulse Backend — config.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Central configuration.
 */
export const config = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  DB_FILE: process.env.DB_FILE || new URL("../../data/pulse.db", import.meta.url).pathname
};
