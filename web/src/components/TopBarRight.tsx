/**
 * Pulse Web — components/TopBarRight.tsx
 * Version: v0.3.0
 * Purpose: Theme + Language controls using unified UI primitives (popover language)
 */

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import LanguageMenu from "@/components/LanguageMenu";

const THEME_KEY = "pulse.theme";

function applyTheme(t: string) {
  document.documentElement.dataset.theme = t;
}

export function TopBarRight() {
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || "system");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }, [theme]);

  const themeIcon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🌓";
  const themeTitle = `Theme: ${theme}`;

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Toggle theme"
        title={themeTitle}
        onClick={() =>
          setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")
        }
        variant="outline"
        size="sm"
      >
        <span className="mr-1">{themeIcon}</span>
        <span className="hidden sm:inline">Theme</span>
      </Button>

      {/* New popover-based language picker */}
      <LanguageMenu />
    </div>
  );
}
