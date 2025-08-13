/**
 * Pulse Web — components/GlassMiniDrawer.tsx
 * Version: v0.1.2
 * Purpose: Floating glass "mini variant" drawer. Collapsed = icons-only; expands on click.
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/** NavItem
 * v0.1.2 — Menu item model.
 */
type NavItem = { to: string; icon: string; label: string };

const NAV: NavItem[] = [
  { to: "/discover", icon: "🏠", label: "Discover" },
  { to: "/map",      icon: "🗺️", label: "Map" },
  { to: "/friends",  icon: "👥", label: "Friends" },
  { to: "/chat",     icon: "💬", label: "Chat" },
  { to: "/me",       icon: "👤", label: "Me" },
];

/** GlassMiniDrawer
 * v0.1.2 — Default OPEN for visibility; glassy background + strong outline.
 */
export default function GlassMiniDrawer() {
  const [open, setOpen] = useState<boolean>(true); // <- open by default
  const loc = useLocation();

  return (
    <aside
      className={[
        "fixed left-4 top-1/2 -translate-y-1/2 z-50",
        "backdrop-blur-md bg-white/70 border border-gray-200/70",
        "shadow-[0_12px_40px_rgba(0,0,0,0.10)]",
        "rounded-2xl",
        "transition-all duration-200",
        open ? "w-56" : "w-14",
      ].join(" ")}
      aria-label="Mini drawer"
    >
      {/* toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="absolute -right-3 top-4 grid h-7 w-7 place-items-center rounded-full border bg-white text-xs shadow-md"
        title={open ? "Collapse" : "Expand"}
      >
        {open ? "«" : "»"}
      </button>

      {/* items */}
      <nav className="flex flex-col gap-1 p-2">
        {NAV.map(it => {
          const active = loc.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                active ? "bg-white font-medium shadow-sm" : "hover:bg-white/80",
              ].join(" ")}
            >
              <span className="text-base">{it.icon}</span>
              {open && <span className="text-sm">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
