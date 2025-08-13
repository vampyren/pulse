/**
 * Pulse Web — pages/Discover.tsx
 * Version: v0.1.2
 * Purpose: Public feed. When logged out, show teasers (masked details). When authed, show normal list.
 */

import React from "react";
import { isAuthed as tokenPresent } from "@/lib/api";

type Item = {
  id: string;
  title: string;
  sport: string;
  city: string;
  when: string;
  privacy: "PUBLIC" | "PRIVATE";
  joined: string; // "3/8 joined"
};

const demo: Item[] = [
  { id: "1", title: "Morning Run", sport: "Running", city: "Malmö", when: "Today 07:30", privacy: "PUBLIC", joined: "3/8 joined" },
  { id: "2", title: "Basketball Pickup", sport: "Basketball", city: "Lund", when: "Thu 19:00", privacy: "PRIVATE", joined: "5/10 joined" },
];

export default function Discover() {
  const authed = tokenPresent();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-xl font-semibold">Discover</h1>

      {!authed && (
        <div className="mb-3 rounded-xl border bg-white px-3 py-2 text-sm text-gray-700">
          Sign in to see full details and join activities.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {demo.map((a) => (
          <Card key={a.id} item={a} authed={authed} />
        ))}
      </div>
    </div>
  );
}

/** Card — masks city/title when logged out */
function Card({ item, authed }: { item: Item; authed: boolean }) {
  const city = authed ? item.city : "City hidden";
  const title = authed ? item.title : `${item.sport} — preview`;
  const meta = authed ? `${item.city} • ${item.when}` : `${item.when}`;
  const button = authed ? (
    <button className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white">View</button>
  ) : (
    <a href="/login" className="rounded-md border px-3 py-1.5 text-sm">Sign in</a>
  );

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <span className="rounded-full border px-2 py-0.5 text-[11px]">{item.privacy}</span>
      </div>
      <div className="mb-3 text-sm text-gray-600">{meta}</div>
      <div className="text-xs text-gray-500 mb-3">{authed ? item.joined : "Join count hidden"}</div>
      {button}
    </div>
  );
}
