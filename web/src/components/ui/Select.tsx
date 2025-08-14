/**
 * Pulse Web — components/ui/Select.tsx
 * Version: v0.1.0
 * Purpose: Unified select styling for consistent dropdowns
 * Notes:
 *  - Native <select> but styled to match the app (rounded-2xl, border, ring).
 */

import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  rightIcon?: React.ReactNode;
};

export default function Select({
  className = "",
  rightIcon,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative inline-block">
      <select
        className={`appearance-none rounded-2xl border border-gray-300 bg-white pr-8 pl-3 h-9 text-sm text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
        {rightIcon ?? <span>▾</span>}
      </div>
    </div>
  );
}
