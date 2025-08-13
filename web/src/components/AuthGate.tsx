/**
 * Pulse Web — components/AuthGate.tsx
 * Version: v0.1.0
 * Purpose: Global guard. On any route change, if path is protected and no JWT, redirect to /login.
 */

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthed } from "@/lib/api";

const PROTECTED_PREFIXES = ["/me", "/wallet", "/settings", "/friends", "/favorites", "/book", "/chat"];

export default function AuthGate() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const needsAuth = PROTECTED_PREFIXES.some((p) => location.pathname.startsWith(p));
    if (needsAuth && !isAuthed()) {
      navigate("/login", { replace: true, state: { from: location.pathname } as any });
    }
  }, [location.pathname, navigate]);

  return null;
}
