/* Pulse Backend — routes/facilities.js
 * Version: v0.1.2
 * Change: add /import/preview and /import/commit endpoints (JSON body) for Admin UI.
 * Notes: Table is created lazily if missing; additive only.
 */
import { Router } from "express";
import { db } from "../db/index.js";
const router = Router();

function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT, city TEXT, address TEXT, zip TEXT,
      lat REAL, lng REAL,
      sports_json TEXT DEFAULT '[]',
      indoor TEXT CHECK (indoor IN ('indoor','outdoor','mixed')),
      phone TEXT, email TEXT, website TEXT,
      opening_hours_json TEXT DEFAULT '{}',
      amenities_json TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active', notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_fac_city ON facilities(city);
    CREATE INDEX IF NOT EXISTS idx_fac_status ON facilities(status);
  `);
}
ensureSchema();

const toNumber = (v) => (v === null || v === undefined || v === "" ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const toArray  = (s) => String(s ?? "").split(",").map(v=>v.trim()).filter(Boolean);
const isObj    = (v) => v && typeof v === "object" && !Array.isArray(v);
const dto = (r) => ({ ...r, sports: JSON.parse(r.sports_json||"[]"), opening_hours: JSON.parse(r.opening_hours_json||"{}"), amenities: JSON.parse(r.amenities_json||"{}") });

router.get("/", (req,res)=>{
  const { city_like, sport, q, indoor, status } = req.query;
  const w = []; const p = {};
  if (city_like) { w.push("LOWER(city) LIKE LOWER(@city_like)"); p.city_like = `${city_like}%`; }
  if (sport) {
    const arr = toArray(sport);
    if (arr.length) { w.push(`EXISTS (SELECT 1 FROM json_each(sports_json) je WHERE je.value IN (${arr.map((_,i)=>`@s${i}`).join(",")}))`); arr.forEach((v,i)=>p[`s${i}`]=v); }
  }
  if (q) { w.push("(LOWER(name) LIKE LOWER(@q) OR LOWER(address) LIKE LOWER(@q))"); p.q = `%${q}%`; }
  if (indoor && ["indoor","outdoor","mixed"].includes(String(indoor))) { w.push("indoor=@indoor"); p.indoor=String(indoor); }
  if (status) { w.push("status=@status"); p.status=String(status); }
  const rows = db.prepare(`SELECT * FROM facilities ${w.length?`WHERE ${w.join(" AND ")}`:""} ORDER BY city,name LIMIT 200`).all(p).map(dto);
  res.json({ ok:true, data: rows });
});

router.get("/:id", (req,res)=>{
  const r = db.prepare("SELECT * FROM facilities WHERE id=?").get(req.params.id);
  if (!r) return res.status(404).json({ ok:false, error:"not_found" });
  res.json({ ok:true, data: dto(r) });
});

router.post("/", (req,res)=>{
  const b = req.body||{};
  if (!b.name) return res.status(400).json({ ok:false, error:"name_required" });
  const id = b.id?.trim() || String(b.name).toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,64);
  const stmt = db.prepare(`INSERT INTO facilities
    (id,name,type,city,address,zip,lat,lng,sports_json,indoor,phone,email,website,opening_hours_json,amenities_json,status,notes,created_at,updated_at)
    VALUES (@id,@name,@type,@city,@address,@zip,@lat,@lng,@sports_json,@indoor,@phone,@email,@website,@opening_hours_json,@amenities_json,@status,@notes,datetime('now'),datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, type=excluded.type, city=excluded.city, address=excluded.address, zip=excluded.zip,
      lat=excluded.lat, lng=excluded.lng, sports_json=excluded.sports_json, indoor=excluded.indoor,
      phone=excluded.phone, email=excluded.email, website=excluded.website,
      opening_hours_json=excluded.opening_hours_json, amenities_json=excluded.amenities_json,
      status=excluded.status, notes=excluded.notes, updated_at=datetime('now')`);
  stmt.run({
    id,
    name:b.name, type:b.type??null, city:b.city??null, address:b.address??null, zip:b.zip??null,
    lat: toNumber(b.lat), lng: toNumber(b.lng),
    sports_json: JSON.stringify(Array.isArray(b.sports)?b.sports:toArray(b.sports)),
    indoor: b.indoor??null, phone:b.phone??null, email:b.email??null, website:b.website??null,
    opening_hours_json: JSON.stringify(isObj(b.opening_hours)?b.opening_hours:{}),
    amenities_json: JSON.stringify(isObj(b.amenities)?b.amenities:{}),
    status:b.status??"active", notes:b.notes??null
  });
  const r = db.prepare("SELECT * FROM facilities WHERE id=?").get(id);
  res.json({ ok:true, data: dto(r) });
});

// --- import helpers ---
function parseCSV(text) {
  const rows = []; let cur = "", inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (ch === '"') { if (inQ && next === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (ch === "," && !inQ) { row.push(cur); cur = ""; }
    else if ((ch === "\n" || ch === "\r") && !inQ) {
      if (cur.length || row.length) { row.push(cur); rows.push(row.map(c=>c.trim())); row = []; cur = ""; }
    } else cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row.map(c=>c.trim())); }
  return rows;
}

// POST /import/preview  { csv }
router.post("/import/preview", (req,res)=>{
  const text = String(req.body?.csv||"");
  if (!text) return res.status(400).json({ ok:false, error:"csv_required" });
  const rows = parseCSV(text);
  const [header, ...data] = rows;
  const wanted = ["id","name","city","address","lat","lng","sports","courts","indoor","phone","website","status","notes","email","zip","type"];
  if (!header) return res.status(400).json({ ok:false, error:"bad_header" });
  const map = Object.fromEntries(header.map((h,i)=>[h.trim().toLowerCase(), i]));
  const out=[]; const errors=[];
  for (let i=0;i<data.length;i++) {
    const r = data[i]; if(!r || r.every(c=>!c)) continue;
    const obj = {}; wanted.forEach(k=>obj[k]= r[map[k] ?? -1] ?? "");
    obj.lat = toNumber(obj.lat); obj.lng = toNumber(obj.lng);
    obj.sports = toArray(obj.sports);
    if (!obj.id || !obj.name) errors.push({ row:i+2, error:"id_or_name_missing" });
    out.push(obj);
  }
  res.json({ ok:true, data:{ rows: out, errors } });
});

// POST /import/commit { rows: [...] }
router.post("/import/commit", (req,res)=>{
  const rows = Array.isArray(req.body?.rows)? req.body.rows : [];
  if (!rows.length) return res.status(400).json({ ok:false, error:"rows_required" });
  const stmt = db.prepare(`INSERT INTO facilities
    (id,name,type,city,address,zip,lat,lng,sports_json,indoor,phone,email,website,opening_hours_json,amenities_json,status,notes,created_at,updated_at)
    VALUES (@id,@name,@type,@city,@address,@zip,@lat,@lng,@sports_json,@indoor,@phone,@email,@website,@opening_hours_json,@amenities_json,@status,@notes,datetime('now'),datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, type=excluded.type, city=excluded.city, address=excluded.address, zip=excluded.zip,
      lat=excluded.lat, lng=excluded.lng, sports_json=excluded.sports_json, indoor=excluded.indoor,
      phone=excluded.phone, email=excluded.email, website=excluded.website,
      opening_hours_json=excluded.opening_hours_json, amenities_json=excluded.amenities_json,
      status=excluded.status, notes=excluded.notes, updated_at=datetime('now')`);
  let ok=0, fail=0;
  const tx = db.transaction((arr)=>{
    for (const r of arr) {
      try {
        stmt.run({
          id: r.id,
          name: r.name, type: r.type ?? null, city: r.city ?? null, address: r.address ?? null, zip: r.zip ?? null,
          lat: toNumber(r.lat), lng: toNumber(r.lng),
          sports_json: JSON.stringify(Array.isArray(r.sports)? r.sports : toArray(r.sports)),
          indoor: r.indoor ?? null, phone: r.phone ?? null, email: r.email ?? null, website: r.website ?? null,
          opening_hours_json: "{}", amenities_json: "{}", status: r.status ?? "active", notes: r.notes ?? null
        });
        ok++;
      } catch { fail++; }
    }
  });
  tx(rows);
  res.json({ ok:true, data:{ inserted_or_updated: ok, failed: fail } });
});

export default router;
