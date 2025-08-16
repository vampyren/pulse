/**
 * Admin Facilities — Page
 * Version: v0.1.0
 * Purpose: CSV upload → Preview → Commit, plus list/search/edit.
 * Notes:
 * - Hash route expectation: use at #/admin/facilities (add route in App.tsx).
 * - Endpoints used:
 *   GET  /api/v2/facilities?city_like=&sport=&q=&status=
 *   POST /api/v2/facilities/import/preview { csv }
 *   POST /api/v2/facilities/import/commit  { rows }
 *   PATCH /api/v2/facilities/:id { ...partial fields }
 */

import React, { useEffect, useMemo, useState } from "react";

type Facility = {
  id: string;
  name: string;
  type?: string | null;
  city?: string | null;
  address?: string | null;
  zip?: string | null;
  lat?: number | null;
  lng?: number | null;
  sports?: string[];
  indoor?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  opening_hours?: Record<string, { from: string; to: string }[]>;
  amenities?: Record<string, any>;
  status?: string;
  notes?: string | null;
};

type PreviewRow = Facility & { __row?: number };

export default function AdminFacilities(): JSX.Element {
  const [q, setQ] = useState("");
  const [cityLike, setCityLike] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<{rows: PreviewRow[]; errors: {row:number; error:string}[]} | null>(null);
  const [committing, setCommitting] = useState(false);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (cityLike) qs.set("city_like", cityLike);
    if (sport) qs.set("sport", sport);
    if (status) qs.set("status", status);
    const res = await fetch(`/api/v2/facilities${qs.toString() ? `?${qs}` : ""}`);
    const j = await res.json();
    setRows(j?.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onPreview() {
    const res = await fetch("/api/v2/facilities/import/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ csv: csvText }),
    });
    const j = await res.json();
    if (j?.ok) setPreview({ rows: j.data.rows, errors: j.data.errors });
    else alert("Preview failed");
  }

  async function onCommit() {
    if (!preview) return;
    setCommitting(true);
    const res = await fetch("/api/v2/facilities/import/commit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows: preview.rows }),
    });
    const j = await res.json();
    setCommitting(false);
    if (j?.ok) {
      setPreview(null);
      setCsvText("");
      await load();
      alert(`Imported: ${j.data.inserted_or_updated}, Failed: ${j.data.failed}`);
    } else {
      alert("Commit failed");
    }
  }

  async function onInlineEdit(id: string, patch: Partial<Facility>) {
    const res = await fetch(`/api/v2/facilities/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json();
    if (j?.ok) load();
    else alert("Update failed");
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">Admin › Facilities</h1>

      {/* Search */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name/address" className="border rounded px-3 py-2" />
        <input value={cityLike} onChange={e=>setCityLike(e.target.value)} placeholder="City starts with…" className="border rounded px-3 py-2" />
        <input value={sport} onChange={e=>setSport(e.target.value)} placeholder="Sport ids (comma)" className="border rounded px-3 py-2" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Any status</option>
          <option value="active">active</option>
          <option value="pending">pending</option>
        </select>
        <button onClick={load} className="px-3 py-2 border rounded bg-white hover:bg-gray-50">Search</button>
      </div>

      {/* Upload */}
      <div className="border rounded-lg p-3 mb-4 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Import CSV</h2>
          <div className="text-sm text-gray-500">Preview → Commit</div>
        </div>
        <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} rows={6} className="w-full border rounded mt-2 p-2 font-mono text-xs" placeholder="Paste CSV with header: id,name,city,address,lat,lng,sports,courts,indoor,phone,website,status,notes" />
        <div className="mt-2 flex gap-2">
          <button onClick={onPreview} className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50">Preview</button>
          <button onClick={onCommit} disabled={!preview || committing} className="px-3 py-1.5 border rounded bg-white hover:bg-gray-50 disabled:opacity-50">Commit</button>
        </div>
        {preview && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-1">Preview rows: {preview.rows.length} {preview.errors?.length ? `• Errors: ${preview.errors.length}` : ""}</div>
            {preview.errors?.length ? (
              <ul className="text-sm text-red-600 list-disc pl-5">{preview.errors.map((e,i)=>(<li key={i}>Row {e.row}: {e.error}</li>))}</ul>
            ) : null}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <div className="px-3 py-2 text-sm text-gray-600 border-b">Name • City • Sports • Courts • Status • Actions</div>
        {rows.map((r)=> (
          <div className="px-3 py-2 border-b flex items-center gap-2 text-sm" key={r.id}>
            <div className="w-1/4 font-medium">{r.name}</div>
            <div className="w-1/6">{r.city}</div>
            <div className="w-1/3 truncate">{r.sports?.join(", ")}</div>
            <div className="w-1/12 text-center">{(r as any).courts ?? ""}</div>
            <div className="w-1/12">{r.status}</div>
            <div className="w-1/6 flex gap-2 justify-end">
              <button onClick={()=>onInlineEdit(r.id, { status: r.status === "active" ? "pending" : "active" })} className="px-2 py-1 border rounded bg-white hover:bg-gray-50">
                {r.status === "active" ? "Disable" : "Activate"}
              </button>
              <button onClick={()=>onInlineEdit(r.id, { city: prompt("City", r.city || "") || r.city })} className="px-2 py-1 border rounded bg-white hover:bg-gray-50">Edit</button>
            </div>
          </div>
        ))}
        {!rows.length && !loading && <div className="p-3 text-sm text-gray-500">No facilities found.</div>}
        {loading && <div className="p-3 text-sm">Loading…</div>}
      </div>
    </div>
  );
}
