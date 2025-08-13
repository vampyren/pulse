/**
 * Pulse Web — components/Protected.tsx
 * Version: v0.1.2
 * Purpose: Guard routes requiring a signed-in user. Token is source of truth.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed as tokenPresent } from "@/lib/api";

export default function Protected({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const authed = tokenPresent(); // JWT present in localStorage?

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
