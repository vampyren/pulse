/**
 * Pulse Web — pages/Discover.tsx
 * Version: v0.8.0
 * Purpose: Discover with a simplified header:
 *   - Row 1: [All] [Privacy ▼] [Activity ▼]
 *     • All resets privacy -> "all" and clears selected sports
 *     • Privacy popover: single-select (All/Public/Friends/Invite)
 *     • Activity popover: multi-select sports
 *   - Row 2: [ City input ............... ]  [Clear]
 * Notes:
 *   - Debounced city_like; no flicker (shows tiny spinner)
 *   - Filters persisted in localStorage
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import ClampText from "@/components/ui/ClampText";
import Button from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";

type Group = {
  id: string;
  name: string;
  sport_id: string;
  privacy: "public" | "friends" | "invite" | "private";
  join_mode: string;
  city?: string | null;
  status: string;
};

type Sport = { id: string; name: string };

const LS_KEY = "pulse.discover.filters.v6";

type Filters = {
  cityLike: string; // single input (no city chips)
  privacy: "all" | "public" | "friends" | "invite";
  sports: string[]; // multi
};

function buildQuery(f: Filters) {
  const p = new URLSearchParams();
  if (f.cityLike) p.set("city_like", f.cityLike);
  if (f.privacy !== "all") p.set("privacy", f.privacy);
  if (f.sports.length) p.set("sport", f.sports.join(","));
  const qs = p.toString();
  return qs ? `/api/v2/groups?${qs}` : `/api/v2/groups`;
}

const PRIVACY_ITEMS = [
  { id: "all", label: "All", icon: "✨" },
  { id: "public", label: "Public", icon: "🌐" },
  { id: "friends", label: "Friends", icon: "👥" },
  { id: "invite", label: "Invite", icon: "🔒" },
] as const;

export default function Discover() {
  const { user } = useAuth();

  // Filters (persisted)
  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw) as Filters;
    } catch {}
    return { cityLike: "", privacy: "all", sports: [] };
  });

  // Data
  const [sports, setSports] = useState<Sport[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce city typing to reduce fetches
  const debTimer = useRef<number | null>(null);
  useEffect(() => {
    if (debTimer.current) window.clearTimeout(debTimer.current);
    debTimer.current = window.setTimeout(() => {
      setFilters((f) => ({ ...f })); // trigger effect by identity change
    }, 300);
    return () => { if (debTimer.current) window.clearTimeout(debTimer.current); };
  }, [filters.cityLike]);

  // Persist
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(filters)); }, [filters]);

  // Load sports once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/v2/sports"); const j = await r.json();
        if (alive && j?.ok) setSports(j.data as Sport[]);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  // Load groups on filters change
  useEffect(() => {
    let alive = true;
    (async () => {
      setError(null); setFetching(true);
      try {
        const res = await fetch(buildQuery(filters));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        if (!j?.ok) throw new Error("Bad payload");
        if (alive) { setGroups(j.data as Group[]); setInitialLoading(false); }
      } catch (e: any) {
        if (alive) { setError(e?.message || "Failed to load groups"); setInitialLoading(false); }
      } finally { if (alive) setFetching(false); }
    })();
    return () => { alive = false; };
  }, [filters]);

  // Handlers
  const setPrivacy = (p: Filters["privacy"]) => setFilters(f => ({ ...f, privacy: p }));
  const toggleSport = (id: string) =>
    setFilters(f => {
      const s = new Set(f.sports);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...f, sports: Array.from(s) };
    });
  const clearAll = () => setFilters({ cityLike: "", privacy: "all", sports: [] });

  const countLabel = useMemo(() => {
    const bits: string[] = [];
    if (filters.privacy !== "all") bits.push(filters.privacy);
    if (filters.sports.length) bits.push(`sports:${filters.sports.join(",")}`);
    if (filters.cityLike) bits.push(`city:${filters.cityLike}`);
    return `${groups.length} groups${bits.length ? " · " + bits.join(" · ") : ""}`;
  }, [groups.length, filters]);

  // Early returns AFTER all hooks
  if (initialLoading) {
    return (
      <div className="p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border bg-white/60 animate-pulse" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-2xl border bg-red-50 p-4 text-red-700">
          <div className="font-semibold">Couldn’t load groups</div>
          <div className="text-sm opacity-80">{error}</div>
        </div>
      </div>
    );
  }

  const privacyLabel =
    PRIVACY_ITEMS.find(p => p.id === filters.privacy)?.label ?? "All";
  const activityLabel =
    filters.sports.length ? `${filters.sports.length} selected` : "All sports";

  return (
    <div className="p-4 space-y-3">
      {/* Filter card */}
      <section className="rounded-2xl border bg-white/60 p-3 space-y-2">
        {/* Row 1 — 3 compact controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All (resets privacy + sports) */}
          <Button
            size="sm"
            variant={filters.privacy === "all" && filters.sports.length === 0 ? "solid" : "outline"}
            className="rounded-full"
            onClick={clearAll}
          >
            ✨ All
          </Button>

          {/* Privacy popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full">
                <span className="mr-1">🌐</span> {privacyLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="flex flex-wrap gap-2">
                {PRIVACY_ITEMS.map((p) => {
                  const active = filters.privacy === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPrivacy(p.id as Filters["privacy"])}
                      className={`rounded-full px-3 py-1 text-sm border ${
                        active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="mr-1">{p.icon}</span>{p.label}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Activity popover (sports multi-select) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full">
                {activityLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[20rem] p-2">
              <div className="flex flex-wrap gap-2 max-h-64 overflow-auto no-scrollbar">
                {sports.map((s) => {
                  const active = filters.sports.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSport(s.id)}
                      className={`rounded-full px-3 py-1 text-sm border ${
                        active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2 — city input + Clear on the right */}
        <div className="flex items-center gap-2">
          <input
            value={filters.cityLike}
            onChange={(e) => setFilters(f => ({ ...f, cityLike: e.target.value }))}
            placeholder="City (type to filter)…"
            className="h-10 flex-1 rounded-2xl border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
          {(filters.cityLike || filters.privacy !== "all" || filters.sports.length) && (
            <Button size="sm" onClick={clearAll}>Clear</Button>
          )}
        </div>
      </section>

      {/* Count + spinner */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        {countLabel}
        {fetching && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />}
      </div>

      {/* Cards */}
      {groups.length === 0 ? (
        <div className="text-sm text-gray-600">No groups match your filters.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="block rounded-2xl border p-4 shadow-sm bg-white/60 backdrop-blur hover:shadow transition"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug max-w-[88%]">
                  {user ? (
                    <ClampText title={g.name} clickToExpand>{g.name}</ClampText>
                  ) : (
                    <ClampText title="Join to see the title" clickToExpand>Join to see the title</ClampText>
                  )}
                </h3>
                <PrivacyBadge privacy={g.privacy} />
              </div>
              <div className="mt-2 text-sm text-gray-600 grid grid-cols-2">
                <div>Sport: {g.sport_id}</div>
                <div className="text-right">City: {g.city || "—"}</div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Join: <span className="uppercase">{g.join_mode}</span> · Status:{" "}
                <span className="uppercase">{g.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
