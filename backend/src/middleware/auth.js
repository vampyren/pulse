/* 
 * Pulse Backend — middleware/auth.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Minimal JWT auth middleware.
 */
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { fail } from "../utils/respond.js";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return fail(res, 401, "Missing bearer token");
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return fail(res, 401, "Invalid or expired token");
  }
}

export function optionalAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, config.JWT_SECRET); } catch { /* ignore */ }
  }
  next();
}
