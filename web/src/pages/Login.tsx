
/**
 * Pulse Web — pages/Login.tsx
 * File version: 0.1.0
 * Purpose: Minimal login form using /auth/login.
 */
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/state/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const login = useAuthStore(s => s.login);
  const [username, setUsername] = useState("test");
  const [password, setPassword] = useState("test");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await api.post("/auth/login", { username, password });
      const { token, user } = r.data.data;
      login(token, user);
      nav("/");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={onSubmit} className="card">
        <div className="card-body space-y-3">
          <div className="text-lg font-semibold">Login</div>
          <label className="block text-sm">
            <span>Username or Email</span>
            <input className="mt-1 w-full rounded-xl border p-2" value={username} onChange={e=>setUsername(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span>Password</span>
            <input type="password" className="mt-1 w-full rounded-xl border p-2" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? "…" : "Sign in"}</button>
        </div>
      </form>
    </div>
  );
}
