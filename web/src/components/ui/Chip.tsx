/**
 * Pulse Web — components/ui/Chip.tsx
 * Version: v0.1.0
 * Purpose: Small label chip used for skills, roles, filters, etc.
 */

import React from "react";

type Tone = "neutral" | "emerald" | "blue" | "amber" | "rose";

const toneMap: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
};

export default function Chip({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${toneMap[tone]} ${className}`}>
      {children}
    </span>
  );
}
