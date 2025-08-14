/**
 * Pulse Web — components/PrivacyBadge.tsx
 * Version: v0.2.0
 * Purpose: Badge/icon to indicate group/activity visibility with tooltip
 */

import React from "react";

type P = { privacy: "public" | "friends" | "invite" | "private" };

export function PrivacyBadge({ privacy }: P) {
  const map: Record<string, { emoji: string; label: string; title: string; bg: string; text: string }> = {
    public:  { emoji: "🌐", label: "Public",  title: "Visible to everyone",               bg: "bg-emerald-100", text: "text-emerald-700" },
    friends: { emoji: "👥", label: "Friends", title: "Visible to friends of members",     bg: "bg-blue-100",    text: "text-blue-700" },
    invite:  { emoji: "🔒", label: "Invite",  title: "Invite-only (not discoverable)",    bg: "bg-amber-100",   text: "text-amber-700" },
    private: { emoji: "🔒", label: "Private", title: "Private (restricted visibility)",   bg: "bg-amber-100",   text: "text-amber-700" },
  };
  const s = map[privacy] || map.public;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${s.bg} ${s.text}`}
      title={`${s.label} — ${s.title}`}
    >
      <span aria-hidden>{s.emoji}</span>
      <span>{s.label}</span>
    </span>
  );
}
