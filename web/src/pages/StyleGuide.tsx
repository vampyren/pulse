/**
 * Pulse Web — pages/StyleGuide.tsx
 * Version: v0.1.1
 * Purpose: Lightweight UI preview (mock) to agree on look/feel.
 */

import React from "react";
import ActivityCard from "@/components/ActivityCard";

/** Section
 * v0.1.1 — Simple wrapper for grouped examples.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-600">{title}</h2>
      <div className="rounded-xl border bg-white p-4">{children}</div>
    </section>
  );
}

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-6 text-xl font-semibold">UI Preview</h1>

      <Section title="Typography">
        <div className="space-y-2">
          <div className="text-xl font-semibold">Title (text-xl / semibold)</div>
          <div className="text-base">Body (text-base)</div>
          <div className="text-sm text-gray-600">Meta (text-sm / gray-600)</div>
          <div className="text-xs text-gray-500">Caption (text-xs / gray-500)</div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
            Primary
          </button>
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            Secondary
          </button>
          <button className="rounded-md border px-3 py-2 text-sm opacity-60" disabled>
            Disabled
          </button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex gap-3">
          <span className="rounded-full border px-2 py-0.5 text-xs">Public</span>
          <span className="rounded-full border px-2 py-0.5 text-xs">Private</span>
        </div>
      </Section>

      <Section title="Activity Card">
        <div className="grid gap-3">
          <ActivityCard
            title="Five-a-side Football"
            meta="Malmö • Tomorrow 18:00"
            privacy="Public"
            actionLabel="Join"
          />
          <ActivityCard
            title="Padel Doubles"
            meta="Lund • Sat 10:00"
            privacy="Private"
            actionLabel="Request"
          />
        </div>
      </Section>

      <Section title="Form field">
        <div className="space-y-2">
          <label className="block text-sm">Label</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Placeholder"
          />
          <p className="text-xs text-gray-500">Helper text or validation.</p>
        </div>
      </Section>
    </div>
  );
}
