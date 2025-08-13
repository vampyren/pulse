/**
 * Pulse Web — components/ActivityCard.tsx
 * Version: v0.1.1
 * Purpose: Reusable activity/group card used by Discover and StyleGuide.
 */

import React from "react";

/** ActivityCardProps
 * v0.1.1 — Data shown on the card.
 */
export type ActivityCardProps = {
  title: string;
  meta: string;           // e.g., "Malmö • Tomorrow 18:00"
  privacy?: "Public" | "Private";
  actionLabel?: string;   // e.g., "Join", "View"
  onAction?: () => void;
};

export default function ActivityCard({
  title,
  meta,
  privacy = "Public",
  actionLabel = "View",
  onAction,
}: ActivityCardProps) {
  return (
    <div className="rounded-xl border p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">{meta}</div>
        </div>
        <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
          {privacy}
        </span>
      </div>
      <div className="mt-3">
        <button
          onClick={onAction}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
