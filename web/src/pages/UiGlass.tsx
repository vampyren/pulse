/**
 * Pulse Web — pages/UiGlass.tsx
 * Version: v0.1.2
 * Purpose: Preview glass + floating layout with a mini drawer (no real data).
 */

import React from "react";
import GlassMiniDrawer from "@/components/GlassMiniDrawer";

/** UiGlass
 * v0.1.2 — Adds a soft gradient background and open mini-drawer.
 */
export default function UiGlass() {
  return (
    <div className="relative min-h-[90vh] bg-gradient-to-br from-slate-50 via-sky-50 to-amber-50">
      <GlassMiniDrawer />

      {/* floating glass header */}
      <div className="mx-auto mt-6 max-w-5xl px-4">
        <div className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Glass Preview</div>
            <div className="text-xs text-gray-600">v0.1.2</div>
          </div>
        </div>
      </div>

      {/* sample content cards */}
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-1 text-sm text-gray-600">Card {i}</div>
            <div className="text-base font-medium">Floating glass card</div>
            <p className="mt-2 text-sm text-gray-700">
              Soft shadow, subtle border, blurred background → airy feel.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white">
                Primary
              </button>
              <button className="rounded-md border border-gray-200/70 bg-white/80 px-3 py-1.5 text-sm hover:bg-white">
                Secondary
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
