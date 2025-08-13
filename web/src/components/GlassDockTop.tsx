/**
 * Pulse Web — components/GlassDockTop.tsx
 * Version: v0.1.3
 * Purpose: Glassy top dock — horizontal, airy, responsive.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";

type Item = { to: string; icon: string; label: string };
const NAV: Item[] = [
  { to: "/discover", icon: "🏠", label: "Discover" },
  { to: "/map",      icon: "🗺️", label: "Map" },
  { to: "/friends",  icon: "👥", label: "Friends" },
  { to: "/chat",     icon: "💬", label: "Chat" },
  { to: "/me",       icon: "👤", label: "Me" },
];

export default function GlassDockTop() {
  const loc = useLocation();
  return (
    <div className="sticky top-3 z-40 mx-auto max-w-5xl px-4">
      <nav className="flex items-center justify-between gap-2 rounded-2xl border border-gray-200/70 bg-white/70 p-2 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {NAV.map((it) => {
          const active = loc.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
                active ? "bg-white font-medium shadow-sm" : "hover:bg-white/80",
              ].join(" ")}
            >
              <span className="text-base">{it.icon}</span>
              <span className="hidden sm:inline">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
