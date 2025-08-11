/* 
 * Pulse Backend — routes/auth.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Register / Login (demo; replace with bcrypt in 0.1.2).
 */
import express from "express";
import jwt from "jsonwebtoken";
import { get, run } from "../db/index.js";
import { config } from "../config.js";
import { ok, fail } from "../utils/respond.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);

export const router = express.Router();

router.post("/register", (req, res) => {
  const { username, name, email, password } = req.body || {}
  if (!username || !email || !password) return fail(res, 400, "username, email, password are required");
  if (get("SELECT 1 FROM users WHERE username=? OR email=?", [username, email])) {
    return fail(res, 409, "username or email already exists");
  }
  const id = nanoid();
  run("INSERT INTO users (id, username, name, email, password, status) VALUES (?,?,?,?,?,?)",
      [id, username, name || username, email, password, "approved"]);
  const token = jwt.sign({ id, username, is_admin: 0 }, config.JWT_SECRET, { expiresIn: "7d" });
  return ok(res, { token, user: { id, username, name: name || username, email } });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return fail(res, 400, "username and password required");
  const user = get("SELECT * FROM users WHERE username=? OR email=?", [username, username]);
  if (!user || user.password !== password) return fail(res, 401, "invalid credentials");
  if (user.status !== "approved") return fail(res, 403, `user status is ${user.status}`);
  const token = jwt.sign({ id: user.id, username: user.username, is_admin: !!user.is_admin }, config.JWT_SECRET, { expiresIn: "7d" });
  return ok(res, { token, user: { id: user.id, username: user.username, name: user.name, email: user.email, is_admin: !!user.is_admin } });
});
