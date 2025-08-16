/**
 * Pulse — components/WelcomeUser.tsx
 * Version: v0.1.4
 * Purpose: "Welcome, <name>" that updates immediately on login/logout via 'authchange' event.
 */
import React, { useEffect, useState } from "react";
import { me as apiMe } from "@/lib/api";

export default function WelcomeUser(): JSX.Element | null {
  const [name, setName] = useState<string | null>(null);

  async function refreshUser() {
    try {
      const data: any = await apiMe(); // throws if not authed
      const n = data?.name || data?.username || data?.user?.name || data?.user?.username || null;
      setName(n);
    } catch {
      setName(null);
    }
  }

  useEffect(() => {
    refreshUser();
    const onFocus = () => refreshUser();
    const onVis = () => { if (document.visibilityState === "visible") refreshUser(); };
    const onHash = () => refreshUser();
    const onAuth = () => refreshUser(); // custom app event, fired in login/logout
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

  if (!name) return null;

  return (
    <span className="ml-3 text-sm text-gray-700">
      Welcome, <span className="font-semibold">{name}</span>
    </span>
  );
}
