/**
 * Pulse Web — components/ui/ClampText.tsx
 * Version: v0.2.0
 * Purpose: Cross-browser multi-line clamp with optional tap-to-expand
 * Notes:
 *  - Defaults: 2 lines (mobile), 3 lines (≥768px)
 *  - Set clickToExpand=true (default) to allow tap/click to toggle expanded state.
 */

import React, { useMemo, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  mobileLines?: number;   // default 2
  desktopLines?: number;  // default 3
  clickToExpand?: boolean; // default true
};

export default function ClampText({
  children,
  className = "",
  title,
  mobileLines = 2,
  desktopLines = 3,
  clickToExpand = true,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Inline styles for clamp; disable when expanded
  const style: React.CSSProperties = useMemo(() => {
    if (expanded) return { overflow: "visible" };
    return {
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      WebkitLineClamp: mobileLines,
    };
  }, [expanded, mobileLines]);

  function toggle() {
    if (!clickToExpand) return;
    setExpanded((v) => !v);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!clickToExpand) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded((v) => !v);
    }
  }

  return (
    <span
      className={`block ${clickToExpand ? "cursor-pointer select-none" : ""} ${className}`}
      title={title}
      style={style as any}
      data-desktop-lines={desktopLines}
      aria-expanded={expanded}
      role={clickToExpand ? "button" : undefined}
      tabIndex={clickToExpand ? 0 : undefined}
      onClick={toggle}
      onKeyDown={onKey}
    >
      {children}
      {/* Desktop: override to 3 lines when not expanded */}
      {!expanded && (
        <style>{`
          @media (min-width: 768px) {
            [data-desktop-lines] {
              -webkit-line-clamp: var(--clamp-desktop, ${desktopLines});
            }
          }
        `}</style>
      )}
    </span>
  );
}
