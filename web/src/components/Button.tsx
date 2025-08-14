/**
 * Pulse Web — components/ui/Button.tsx
 * Version: v0.1.0
 * Purpose: Unified button styling across the app
 */

import React from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center rounded-2xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed";

const sizeMap: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
};

const variantMap: Record<Variant, string> = {
  solid:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm",
  outline:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
};

export default function Button({
  className = "",
  size = "sm",
  variant = "outline",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      {...props}
    />
  );
}
