/**
 * Pulse — components/AuthGate.tsx
 * Version: v0.1.1
 * Author: Team Pulse
 * Summary: Global guard. On any route change, if path is protected and no user, redirect to /login.
 * Last-Changed: 2025-08-13
 */

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

const PROTECTED_PREFIXES = ["/me", "/wallet", "/settings", "/friends", "/favorites", "/book", "/chat"];

export default function AuthGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // on route change: if protected and not authed (after loading), go to login
  useEffect(() => {
    if (loading) return;
    const needsAuth = PROTECTED_PREFIXES.some((p) => location.pathname.startsWith(p));
    if (needsAuth && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } as any });
    }
  }, [location.pathname, navigate, user, loading]);

  return null;
}
