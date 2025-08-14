/**
 * Pulse Web — providers/AuthProvider.tsx
 * Version: v0.3.0
 * Purpose: Auth context with refresh-proof rehydration
 * Notes:
 *  - On mount: if token in localStorage, calls /auth/me to revalidate
 *  - Exposes user, loading, login, logout
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as api from "../lib/api";

type AuthCtx = {
  user: api.User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate on mount (if token exists)
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const u = await api.me();
        setUser(u);
      } catch {
        api.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function doLogin(username: string, password: string) {
    setLoading(true);
    try {
      const u = await api.login(username, password);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }

  function doLogout() {
    api.logout();
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login: doLogin, logout: doLogout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
