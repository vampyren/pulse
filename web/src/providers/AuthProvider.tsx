/**
 * Pulse Web — providers/AuthProvider.tsx
 * Version: v0.1.3
 * Purpose: Central auth state from JWT; loads /auth/me on app start; exposes login/logout.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";

type AuthCtx = {
  user: api.User | null;
  loading: boolean;
  /** login
   * v0.1.3 — calls API login (stores JWT) and sets user in context.
   */
  login: (username: string, password: string) => Promise<void>;
  /** logout
   * v0.1.3 — clears token + user state.
   */
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(true);

  /** on mount: if a token exists, resolve /auth/me */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (api.getToken()) {
          const { user } = await api.me();
          if (mounted) setUser(user);
        }
      } catch {
        // 401 or network → ensure clean state
        api.logout();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /** listen for token changes from other tabs/windows */
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "pulse_jwt") return;
      // token added → try to fetch user; removed → clear user
      (async () => {
        if (api.getToken()) {
          try {
            const { user } = await api.me();
            setUser(user);
          } catch {
            api.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      })();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function doLogin(username: string, password: string) {
    const { user } = await api.login(username, password); // api.login saves JWT
    setUser(user);
  }

  function doLogout() {
    api.logout();
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login: doLogin, logout: doLogout }}>
      {children}
    </Ctx.Provider>
  );
}

/** useAuth
 * v0.1.3 — access user/loading/login/logout
 */
export function useAuth() {
  return useContext(Ctx);
}
