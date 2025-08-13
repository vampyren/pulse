/**
 * Pulse Web — pages/Login.tsx
 * Version: v0.1.2
 * Purpose: Sign-in form; redirects to intended `state.from` (or /me) on success.
 */

import React, { useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

/** Login
 * v0.1.2 — Minimal, robust login with redirect handling.
 */
export default function Login() {
  const { login, isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/me";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isAuthed) {
    // Already signed in → go to profile
    return <Navigate to="/me" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
            autoComplete="current-password"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          disabled={submitting}
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-500">
        Try <code>test / test</code> or <code>admin / admin</code>.
      </p>
      <p className="mt-1 text-xs">
        <Link to="/discover" className="underline">Back to Discover</Link>
      </p>
    </div>
  );
}
