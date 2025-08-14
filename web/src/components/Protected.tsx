/**
 * Pulse — components/Protected.tsx
 * Version: v0.1.3
 * Author: Team Pulse
 * Summary: Guard routes requiring a signed-in user. Uses AuthProvider context.
 * Last-Changed: 2025-08-13
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export default function Protected({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  // While we don't know yet, render nothing (prevents flicker)
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
