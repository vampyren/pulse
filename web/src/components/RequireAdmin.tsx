/**
 * Pulse — components/RequireAdmin.tsx
 * Version: v0.1.1
 * Purpose: Guard children so only admins can view. Non-admin → redirect to /discover.
 * Notes: Uses only me() from lib/api; no isAuthed dependency.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me as apiMe } from "@/lib/api";

function isAdmin(data: any): boolean {
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

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await apiMe(); // throws if not authed
        if (live && isAdmin(data)) setOk(true);
        else if (live) { setOk(false); nav("/discover", { replace: true }); }
      } catch {
        if (live) { setOk(false); nav("/discover", { replace: true }); }
      }
    })();
    return () => { live = false; };
  }, [nav]);

  if (ok === null) return null; // render nothing during check
  return <>{ok ? children : null}</>;
}
