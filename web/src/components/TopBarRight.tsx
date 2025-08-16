/**
 * Pulse Web — components/TopBarRight.tsx
 * Version: v0.3.8
 * Purpose: Theme + Language + Admin button. Updates immediately on login/logout via 'authchange' event.
 */
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import LanguageMenu from "@/components/LanguageMenu";
import { me as apiMe } from "@/lib/api";

const THEME_KEY = "pulse.theme";

function applyTheme(t: string) { document.documentElement.dataset.theme = t; }

function isAdminFromMe(data: any): boolean {
  if (!data) return false;
  const check = (u: any) => {
    if (!u) return false;
    if (typeof u.role === "string" && u.role.toLowerCase() === "admin") return true;
    if (u.is_admin === true) return true;
    if (Array.isArray(u.roles) && u.roles.some((r: any) => String(r).toLowerCase() === "admin")) return true;
    return false;
  };
  return check(data) || check((data as any).user);
}

export function TopBarRight() {
  // Theme
  const [theme, setTheme] = useState<string>(localStorage.getItem(THEME_KEY) || "system");
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }, [theme]);
  const themeIcon = theme === "dark" ? "🌙" : theme === "light" ? "☀" : "🌓";
  const themeTitle = `Theme: ${theme}`;

  // Admin visibility
  const [showAdmin, setShowAdmin] = useState<boolean>(false);

  async function refreshAdmin() {
    try {
      const data = await apiMe(); // throws if not authed
      setShowAdmin(isAdminFromMe(data));
    } catch {
      setShowAdmin(false);
    }
  }

  useEffect(() => {
    // initial load & fast reactions
    refreshAdmin();
    const onFocus = () => refreshAdmin();
    const onVis = () => { if (document.visibilityState === "visible") refreshAdmin(); };
    const onHash = () => refreshAdmin();
    const onAuth = () => refreshAdmin(); // custom app event, fired in login/logout
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("authchange", onAuth as EventListener);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("authchange", onAuth as EventListener);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Toggle theme"
        title={themeTitle}
        onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
        variant="outline"
        size="sm"
      >
        <span className="mr-1">{themeIcon}</span>
        <span className="hidden sm:inline">Theme</span>
      </Button>

      <LanguageMenu />

      {showAdmin && (
        <Button
          aria-label="Admin"
          title="Admin"
          variant="outline"
          size="sm"
          onClick={() => { window.location.hash = "/admin/facilities"; }}
        >
          <span className="hidden sm:inline">Admin</span>
        </Button>
      )}
    </div>
  );
}
