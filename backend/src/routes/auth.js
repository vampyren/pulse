/* 
 * Pulse Backend — routes/auth.js
 * File version: 0.1.1
 * Date: 2025-08-11
 * Purpose: Register / Login with bcrypt + JWT
 */
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { get, run } from "../db/index.js";
import { config } from "../config.js";
import { ok, fail } from "../utils/respond.js";
import { customAlphabet } from "nanoid";
import { requireAuth } from "../middleware/auth.js";

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);

export const router = express.Router();

// POST /auth/register  (demo; admin UI will replace)
router.post("/register", (req, res) => {
  const { username, name, email, password } = req.body || {};
  if (!username || !email || !password) return fail(res, 400, "username, email, password are required");
  if (get("SELECT 1 FROM users WHERE username=? OR email=?", [username, email])) {
    return fail(res, 409, "username or email already exists");
  }
  const id = nanoid();
  const hash = bcrypt.hashSync(password, 10);
  run("INSERT INTO users (id, username, name, email, password, status) VALUES (?,?,?,?,?,?)",
      [id, username, name || username, email, hash, "approved"]);
  const token = jwt.sign(
    { sub: id, u: username, a: 0 },
    process.env.JWT_SECRET || config.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return ok(res, { token, user: { id, username, name: name || username, email, is_admin: false } });
});

// POST /auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res, 400, "username and password required");

  const user = get(
    "SELECT id, username, name, email, password, is_admin, status FROM users WHERE username=? OR email=? LIMIT 1",
    [username, username]
  );
  if (!user) return fail(res, 401, "invalid credentials");

  const okPw = bcrypt.compareSync(password, user.password);
  if (!okPw) return fail(res, 401, "invalid credentials");
  if (user.status !== "approved") return fail(res, 403, `user status is ${user.status}`);

  const token = jwt.sign(
    { sub: user.id, u: user.username, a: !!user.is_admin },
    process.env.JWT_SECRET || config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _pw, ...safe } = user;
  return ok(res, { token, user: { ...safe, is_admin: !!user.is_admin } });
});

/**
 * GET /auth/me
 * v0.1.1
 * Returns the current authenticated user's safe profile.
 * Auth: Bearer <JWT> in the Authorization header.
 */
router.get("/me", requireAuth, (req, res) => {
  // requireAuth decoded the JWT → req.user = { sub, u, a }
  // Use server-side lookup; never trust client-sent ids.
  const u = get(
    `SELECT id, username, name, email, is_admin, status, city, language, theme
     FROM users WHERE id = ?`,
    [req.user.sub]
  );
  if (!u) return fail(res, 404, "not found");

  // Normalize booleans & return only safe fields
  const user = { ...u, is_admin: !!u.is_admin };
  return ok(res, { user });
});

/**
 * GET /auth/admin/ping
 * v0.1.1
 * Example admin-only endpoint (for testing middleware).
 */
import { requireAdmin } from "../middleware/auth.js";

router.get("/admin/ping", requireAuth, requireAdmin, (_req, res) => {
  return ok(res, { pong: true, scope: "admin" });
});
