/**
 * Pulse Web — pages/GroupDetail.tsx
 * Version: v0.1.0
 * Purpose: Group detail view with Members & Activities sections.
 * Notes:
 *  - Uses /api/v2/groups/:id returning { group, members, activities }.
 *  - Members: shows name, (optional) skill chip, role chip, quick actions placeholders (Rate, Flag).
 *  - Activities: shows recent activities with price and privacy badge.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import ClampText from "@/components/ui/ClampText";

type Member = {
  user_id: string;
  username?: string;
  name?: string;
  role: "owner" | "admin" | "member";
  status: string;
  skill_level?: string | null; // not always present in seed; show if exists
};

type Activity = {
  id: string;
  title: string;
  starts_at: string;
  price_cents?: number | null;
  currency?: string | null;
  privacy: "public" | "friends" | "invite" | "private";
  details?: string | null;
};

type Group = {
  id: string;
  name: string;
  sport_id: string;
  privacy: "public" | "friends" | "invite" | "private";
  join_mode: "INSTANT" | "REQUEST" | "INVITE_ONLY" | string;
  city?: string | null;
  owner_id: string;
  status: string;
};

type Loaded = {
  group: Group;
  members: Member[];
  activities: Activity[];
};

function formatPrice(cents?: number | null, currency?: string | null) {
  if (cents == null || isNaN(cents)) return "Free";
  const v = (cents / 100).toFixed(2);
  return `${v} ${currency || ""}`.trim();
}

export default function GroupDetail() {
  const { id = "" } = useParams();
  const [data, setData] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"members" | "activities">("members");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/v2/groups/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "Unknown error");
        if (alive) setData(json.data as Loaded);
      } catch (e: any) {
        console.error("GroupDetail load failed:", e);
        if (alive) setErr(e?.message || "Failed to load group");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const count = useMemo(() => data?.members?.length ?? 0, [data]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-9 w-40 rounded-2xl border bg-white/60 animate-pulse" />
        <div className="h-20 rounded-2xl border bg-white/60 animate-pulse" />
        <div className="h-24 rounded-2xl border bg-white/60 animate-pulse" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="p-4">
        <div className="rounded-2xl border bg-red-50 p-4 text-red-700">
          <div className="font-semibold">Couldn’t load group</div>
          <div className="text-sm opacity-80">{err || "Not found"}</div>
          <div className="mt-3">
            <Link className="text-sm underline" to="/discover">← Back to Discover</Link>
          </div>
        </div>
      </div>
    );
  }

  const g = data.group;

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h1 className="font-semibold text-lg">
            <ClampText clickToExpand title={g.name}>{g.name}</ClampText>
          </h1>
          <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-2">
            <span>Sport: <strong>{g.sport_id}</strong></span>
            <span>·</span>
            <span>City: {g.city || "—"}</span>
            <span>·</span>
            <span>Join: <span className="uppercase">{g.join_mode}</span></span>
            <span>·</span>
            <span>Status: <span className="uppercase">{g.status}</span></span>
          </div>
        </div>
        <div className="shrink-0">
          <PrivacyBadge privacy={g.privacy} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === "members" ? "solid" : "outline"} onClick={() => setTab("members")}>Members ({count})</Button>
        <Button variant={tab === "activities" ? "solid" : "outline"} onClick={() => setTab("activities")}>Activities ({data.activities.length})</Button>
        <div className="ml-auto">
          <Link to="/discover" className="text-sm underline">← Back</Link>
        </div>
      </div>

      {tab === "members" ? (
        <section className="rounded-2xl border bg-white/60 p-3">
          <ul className="divide-y">
            {data.members.map((m) => (
              <li key={m.user_id} className="py-2 flex items-center gap-3">
                {/* Avatar (initials fallback) */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                  {(m.name || m.username || "?").slice(0, 1).toUpperCase()}
                </div>

                {/* Main */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium leading-none">{m.name || m.username}</span>
                    {m.skill_level ? <Chip tone="blue">{m.skill_level}</Chip> : null}
                    {m.role === "owner" ? <Chip tone="emerald">Owner</Chip> :
                     m.role === "admin" ? <Chip tone="amber">Admin</Chip> : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Status: <span className="uppercase">{m.status}</span></div>
                </div>

                {/* Quick actions (placeholders for now) */}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" title="Rate (coming soon)" disabled>⭐</Button>
                  <Button size="sm" variant="ghost" title="Flag (coming soon)" disabled>🚩</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border bg-white/60 p-3 space-y-2">
          {data.activities.length === 0 && (
            <div className="text-sm text-gray-600">No activities yet.</div>
          )}
          {data.activities.map((a) => (
            <article key={a.id} className="rounded-xl border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium leading-snug max-w-[80%]">
                  <ClampText title={a.title}>{a.title}</ClampText>
                </h3>
                <PrivacyBadge privacy={a.privacy} />
              </div>
              <div className="mt-1 text-sm text-gray-700">
                <span>{new Date(a.starts_at.replace(" ", "T")).toLocaleString()}</span>
                <span className="mx-2">·</span>
                <span>{formatPrice(a.price_cents, a.currency)}</span>
              </div>
              {a.details ? (
                <div className="mt-2 text-sm text-gray-600">
                  <ClampText mobileLines={2} desktopLines={4} clickToExpand title={a.details || undefined}>
                    {a.details}
                  </ClampText>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
