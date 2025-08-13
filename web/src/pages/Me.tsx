/**
 * Pulse Web — pages/Me.tsx
 * Version: v0.1.1
 * Purpose: Minimal profile page: shows user if signed in, else link to /login.
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout as apiLogout } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

/** Me
 * v0.1.1 — Profile placeholder with Logout.
 */
export default function Me() {
  const { user, logout } = useAuth();
  const authed = !!user;
  const navigate = useNavigate();
  const doLogout = () => { apiLogout(); logout(); navigate("/login"); };

  if (!authed) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-xl font-semibold">Me</h1>
        <div className="rounded-xl border bg-white p-4">
          <p className="mb-3 text-sm text-gray-600">You’re not signed in.</p>
          <Link
            to="/login"
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-3 text-xl font-semibold">Me</h1>
      <div className="rounded-xl border bg-white p-4">
        <div className="font-medium">{user?.name || user?.username}</div>
        <div className="text-sm text-gray-500">{user?.email ?? "no email"}</div>
      </div>
      <button
        onClick={doLogout}
        className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Logout
      </button>
    </div>
  );
}
