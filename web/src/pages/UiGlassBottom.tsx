/**
 * Pulse Web — pages/UiGlassBottom.tsx
 * Version: v0.1.3
 * Purpose: Preview of bottom glass dock + floating cards.
 */

import React from "react";
import GlassDockBottom from "@/components/GlassDockBottom";

export default function UiGlassBottom() {
  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-50 via-sky-50 to-amber-50 pb-24">
      <div className="mx-auto pt-4 grid max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-1 text-sm text-gray-600">Card {i}</div>
            <div className="text-base font-medium">Bottom dock layout</div>
            <p className="mt-2 text-sm text-gray-700">Glass dock sits above content; we pad the bottom to avoid overlap.</p>
          </div>
        ))}
      </div>
      <GlassDockBottom />
    </div>
  );
}
