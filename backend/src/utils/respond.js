/* 
 * Pulse Backend — utils/respond.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Standard JSON response helpers.
 */
export function ok(res, data, meta) { return res.json({ ok: true, data, meta: meta || null }); }
export function fail(res, status, error, meta) { return res.status(status).json({ ok: false, error, meta: meta || null }); }
