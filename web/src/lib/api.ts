/** 
 * Pulse Web — lib/api.ts
 * v0.1.2
 * Purpose: Typed fetch client, JWT storage, auth calls, and sports read.
 */

type ApiOk<T> = { ok: true; data: T; meta?: unknown };
type ApiErr = { ok: false; error: string; meta?: unknown };
type ApiResp<T> = ApiOk<T> | ApiErr;

export type User = {
  id: string;
  username: string;
  name: string | null;
  email: string;
  is_admin: boolean;
  status: "pending" | "approved" | "suspended" | "rejected";
  city?: string | null;
  language?: string | null;
  theme?: "light" | "dark" | "system";
};

export type Sport = {
  id: string;
  name: string;
  icon?: string;
};

const BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v2").replace(/\/+$/, "");
const TOKEN_KEY = "pulse_jwt";

/** getToken
 * v0.1.1
 * Returns the stored JWT or null.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** setToken
 * v0.1.1
 * Saves or clears the JWT.
 */
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/** request
 * v0.1.1
 * Minimal fetch wrapper that attaches Authorization if a token exists.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(init?.body ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as ApiResp<T>;

  if (!("ok" in json)) {
    throw new Error(`Unexpected API response from ${path}`);
  }
  if (!json.ok) {
    // Clear token on auth failures to force re-login
    if (res.status === 401) setToken(null);
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json.data;
}

/** login
 * v0.1.1
 * Authenticates and stores JWT. Returns { token, user }.
 */
export async function login(username: string, password: string) {
  const data = await request<{ token: string; user: User }>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

/** me
 * v0.1.1
 * Returns the current authenticated user.
 */
export async function me() {
  return request<{ user: User }>(`/auth/me`, { method: "GET" });
}

/** logout
 * v0.1.1
 * Clears token (client only).
 */
export function logout() {
  setToken(null);
}

/** isAuthed
 * v0.1.1
 * Quick client-side check for presence of JWT.
 */
export function isAuthed() {
  return !!getToken();
}

/** getSports
 * v0.1.2
 * Returns array of sports [{ id, name, icon }]
 */
export async function getSports(): Promise<Sport[]> {
  return request<Sport[]>(`/sports`, { method: "GET" });
}
