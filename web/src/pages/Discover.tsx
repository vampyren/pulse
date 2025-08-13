/**
 * Pulse Web — pages/Discover.tsx
 * Version: v0.1.7
 * Purpose: Sports filters w/ mobile dropdown & persistence; reads auth from provider.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

/** MockCard
 * v0.1.3 — tiny mock feed so we can validate layout/UX before real data.
 */
type MockCard = {
  id: string;
  title: string;
  sport_id: string;
  teaser: string;
  when: string;
};

const MOCK: MockCard[] = [
  { id: "a1", title: "Morning Run 5K", sport_id: "running",    teaser: "Easy pace along the canal", when: "Tomorrow 07:30" },
  { id: "a2", title: "Padel Doubles",   sport_id: "padel",      teaser: "Intermediate ladder night", when: "Fri 19:00" },
  { id: "a3", title: "Open Scrimmage",  sport_id: "basketball", teaser: "Casual full-court",         when: "Sat 18:00" },
  { id: "a4", title: "After-work Badminton", sport_id: "badminton", teaser: "Bring your own racket", when: "Thu 17:30" },
];

// LocalStorage key for saved filters
const LS_KEY = "pulse_discover_filters_v1";

export default function Discover() {
  const { user } = useAuth();
  const authed = !!user;

  const [sports, setSports] = useState<api.Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // empty = All
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  /** load saved filters (once) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setSelected(new Set(arr.filter((x) => typeof x === "string")));
      }
    } catch {
      /* ignore bad LS */
    }
  }, []);

  /** fetch sports */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await api.getSports();
        if (mounted) setSports(list);
      } catch {
        if (mounted) setSports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /** persist selection to localStorage whenever it changes */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(selected)));
    } catch {
      /* ignore LS errors (private mode, etc.) */
    }
  }, [selected]);

  /** close dropdown when clicking outside */
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  /** filtered view of mock feed */
  const filtered = useMemo(() => {
    if (selected.size === 0) return MOCK;
    return MOCK.filter((m) => selected.has(m.sport_id));
  }, [selected]);

  /** toggle a sport id */
  function toggleSport(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** clear to "All" */
  function clearAll() {
    setSelected(new Set());
  }

  function applyAndClose() {
    setOpen(false);
  }

  function prettySport(id: string) {
    const s = sports.find((x) => x.id === id);
    return s ? `${s.icon || "•"} ${s.name}` : id;
  }

  const selectedCount = selected.size;
  const isAll = selectedCount === 0;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Discover</h1>
        <div className="text-xs text-gray-500">{authed ? "Signed in" : "Guest"}</div>
      </div>

      {/* Mobile: filter dropdown */}
      <div className="sm:hidden relative mb-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={open ? "true" : "false"}
          className={[
            "w-full inline-flex items-center justify-between rounded-full border px-4 py-2 text-sm",
            "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
            "border-gray-200 text-gray-800 shadow-sm active:scale-[0.99]",
          ].join(" ")}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🏷️</span>
            <span>Filter sports</span>
          </span>
          <span className="text-xs text-gray-500">
            {isAll ? "All" : `${selectedCount} selected`}
          </span>
        </button>

        {open && (
          <div
            ref={panelRef}
            className="absolute inset-x-0 z-20 mt-2 rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Select sports</div>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Pill label="All" icon="✨" active={isAll} onClick={clearAll} />
              {!loading &&
                sports.map((s) => (
                  <Pill
                    key={s.id}
                    label={s.name}
                    icon={s.icon || "•"}
                    active={selected.has(s.id)}
                    onClick={() => toggleSport(s.id)}
                  />
                ))}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyAndClose}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: chip row */}
      <section aria-label="Filter by sport" className="mb-4 hidden sm:block">
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex flex-wrap gap-2">
            <Chip label="All" icon="✨" active={isAll} onClick={clearAll} />
            {!loading &&
              sports.map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  icon={s.icon || "•"}
                  active={selected.has(s.id)}
                  onClick={() => toggleSport(s.id)}
                />
              ))}
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <section aria-label="Activities" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((card) => (
          <article
            key={card.id}
            className="group rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:shadow-md"
          >
            <div className="mb-1 text-sm text-gray-500">{prettySport(card.sport_id)}</div>
            <h3 className="text-base font-semibold">{card.title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {authed ? card.teaser : "Sign in to see details…"}
            </p>
            <div className="mt-2 text-xs text-gray-500">{card.when}</div>
          </article>
        ))}

        {!filtered.length && (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
            No items for this sport yet. Try “All”.
          </div>
        )}
      </section>
    </div>
  );
}

/** Chip
 * v0.1.5 — desktop chip toggle (multi-select). Active = blue ring.
 */
function Chip(props: { label: string; icon?: string; active?: boolean; onClick?: () => void }) {
  const { label, icon, active, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? "true" : "false"}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-white/60",
        active
          ? "border-blue-500 text-blue-700 ring-2 ring-blue-200"
          : "border-gray-200 text-gray-800 hover:border-gray-300 active:scale-[0.98]",
      ].join(" ")}
    >
      <span className="text-base leading-none">{icon || "•"}</span>
      <span className="leading-none">{label}</span>
    </button>
  );
}

/** Pill
 * v0.1.5 — mobile dropdown pill; same visual language as Chip.
 */
function Pill(props: { label: string; icon?: string; active?: boolean; onClick?: () => void }) {
  const { label, icon, active, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? "true" : "false"}
      className={[
        "inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm",
        "bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        active
          ? "border-blue-500 text-blue-700 ring-2 ring-blue-200"
          : "border-gray-200 text-gray-800 hover:border-gray-300 active:scale-[0.98]",
      ].join(" ")}
    >
      <span className="text-base leading-none">{icon || "•"}</span>
      <span className="leading-none">{label}</span>
    </button>
  );
}
