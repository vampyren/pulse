/* Pulse Backend — middleware/auth.js
 * v0.1.2
 * JWT helpers: optional auth, required auth, admin guard.
 */
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const SECRET = process.env.JWT_SECRET || config.JWT_SECRET;

/**
 * authOptional
 * Parses Bearer token if present; continues either way.
 */
export function authOptional(req, _res, next) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) {
    try { req.user = jwt.verify(h.slice(7), SECRET); } catch { /* ignore */ }
  }
  next();
}

/**
 * requireAuth
 * Requires a valid Bearer token; 401 otherwise.
 */
export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "missing bearer token" });
  }
  try {
    req.user = jwt.verify(h.slice(7), SECRET); // { sub, u, a }
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
}

/**
 * requireAdmin
 * Allows only JWTs with admin flag (req.user.a === true).
 */
export function requireAdmin(req, res, next) {
  if (!req.user?.a) return res.status(403).json({ ok: false, error: "admin only" });
  next();
}

/* Back-compat alias for older routes */
export const optionalAuth = authOptional;
