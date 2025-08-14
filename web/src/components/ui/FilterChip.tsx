/**
 * Pulse Web — components/ui/FilterChip.tsx
 * Version: v0.1.0
 * Purpose: Compact filter chip that opens a popover with custom content.
 */

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";

export default function FilterChip({
  label,
  value,
  children,
  className = "",
  contentClassName = "w-72 p-3",
}: {
  label: string;
  value: string;
  children: React.ReactNode;    // popover body
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`rounded-full border border-gray-300 bg-white px-3 py-2 text-sm hover:shadow-sm transition ${className}`}
          type="button"
        >
          <span className="opacity-70">{label}:</span> <span className="font-medium">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className={`rounded-2xl border border-gray-200 bg-white shadow-lg ${contentClassName}`}>
        {children}
      </PopoverContent>
    </Popover>
  );
}
