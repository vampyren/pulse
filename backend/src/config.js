/* 
 * Pulse Backend — config.js
 * Version: v0.2.1
 * Purpose: Central configuration for API and DB locations.
 */
export const config = {
  // Server
  PORT: Number(process.env.PORT || 4010),

  // Database (unified): prefer PULSE_DB_PATH for clarity, fallback to repo data/
  DB_FILE:
    process.env.PULSE_DB_PATH ||
    new URL("../../data/pulse.db", import.meta.url).pathname,

  // JWT (dev default; override in prod)
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
};
