/**
 * Pulse — Glass helpers
 * Version: v0.1.1
 * Fix: narrow types to HTMLDivElement only (remove polymorphic `as`)
 * to avoid SVG props inference errors.
 */
import * as React from "react";
import { GLASS } from "@/styles/tokens";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/** GlassPanel: use as a container for popovers/sheets. */
export function GlassPanel({ className = "", ...props }: PanelProps) {
  return <div className={`${GLASS.panel} rounded-2xl ${className}`} {...props} />;
}

// Convenience tokens for inner surfaces/buttons
export const glassSurface = `${GLASS.surface} rounded-lg`;
export const glassButton = `${GLASS.button} rounded-md`;
