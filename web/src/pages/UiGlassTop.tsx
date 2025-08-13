/**
 * Pulse Web — pages/UiGlassTop.tsx
 * Version: v0.1.3
 * Purpose: Preview of top glass dock + floating cards.
 */

import React from "react";
import GlassDockTop from "@/components/GlassDockTop";

export default function UiGlassTop() {
  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-50 via-sky-50 to-amber-50">
      <GlassDockTop />
      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-1 text-sm text-gray-600">Card {i}</div>
            <div className="text-base font-medium">Top dock layout</div>
            <p className="mt-2 text-sm text-gray-700">Sticky glass bar at the top; content scrolls underneath.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
