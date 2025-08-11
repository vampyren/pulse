/* 
 * Pulse Backend — routes/sports.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Sports listing and admin management.
 */
import express from "express";
import { all, run } from "../db/index.js";
import { ok, fail } from "../utils/respond.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);

export const router = express.Router();

router.get("/", (req,res)=> ok(res, all("SELECT id,name,icon FROM sports ORDER BY name")));

router.post("/", (req,res)=> {
  const { name, icon } = req.body || {};
  if (!name) return fail(res, 400, "name is required");
  try {
    run("INSERT INTO sports (id,name,icon) VALUES (?,?,?)", [nanoid(), name, icon || ""]);
    return ok(res, true);
  } catch (e) { return fail(res, 409, "sport exists?"); }
});

router.delete("/:id", (req,res)=> {
  run("DELETE FROM sports WHERE id=?", [req.params.id]);
  return ok(res, true);
});
