/**
 * Pulse Web — providers/AuthProvider.tsx
 * Version: v0.1.1
 * Purpose: Global auth context: loads /auth/me on start, exposes login/logout/refresh.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import {
  me as apiMe,
  login as apiLogin,
  logout as apiLogout,
  isAuthed as apiIsAuthed,
  type User,
} from "@/lib/api";

/** AuthContextValue
 * v0.1.1 — Public shape for consumers.
 */
export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  isAuthed: false,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
});

/** AuthProvider
 * v0.1.1 — Wrap app to enable auth state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** refresh
   * v0.1.1 — Re-fetch /auth/me if a JWT exists.
   */
  const refresh = useCallback(async () => {
    if (!apiIsAuthed()) {
      setUser(null);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiMe(); // { user }
      setUser(res.user);
    } catch (e: any) {
      setUser(null);
      setError(e?.message ?? "Failed to load current user");
    } finally {
      setLoading(false);
    }
  }, []);

  /** login
   * v0.1.1 — Do /auth/login, store token (handled in api), then refresh.
   */
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiLogin(username, password);
      await refresh();
    } catch (e: any) {
      setUser(null);
      setError(e?.message ?? "Login failed");
      setLoading(false);
      throw e;
    }
  }, [refresh]);

  /** logout
   * v0.1.1 — Clear token & reset state.
   */
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (apiIsAuthed()) void refresh();
    else setLoading(false);
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, error, isAuthed: !!user, login, logout, refresh,
  }), [user, loading, error, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** useAuth
 * v0.1.1 — Hook to consume auth context.
 */
export function useAuth() {
  return useContext(AuthContext);
}
