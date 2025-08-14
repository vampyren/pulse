/**
 * Pulse Web — lib/api.ts
 * Version: v0.3.0
 * Purpose: Typed API client + JWT storage
 * Notes:
 *  - Adds read-only groups/venues/activities methods
 *  - Keeps login/me/logout
 */

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  is_admin: boolean;
  status: string;
  city?: string | null;
  language?: string | null;
  theme?: string | null;
};

export type Group = {
  id: string;
  name: string;
  sport_id: string;
  privacy: "public" | "friends" | "invite";
  join_mode: "instant" | "request" | "invite_only";
  city: string | null;
  owner_id: string;
  status: "active" | "archived" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  group_id: string;
  title: string;
  starts_at: string;
  price_cents: number;
  currency: string;
  privacy: "public" | "private";
  details?: string | null;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  approved: number;
  created_by: string;
};

// NEW — single source of truth
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v2";

type Ok<T> = { ok: true; data: T; meta: any };
type Fail = { ok: false; error?: string | null };

const tokenKey = "pulse.jwt";

export function getToken() {
  return localStorage.getItem(tokenKey) || "";
}
export function setToken(t: string) {
  localStorage.setItem(tokenKey, t);
}
export function clearToken() {
  localStorage.removeItem(tokenKey);
}

// Core fetch wrapper
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init.headers as any),
  };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

// Auth
export async function login(username: string, password: string) {
  const r = await api<Ok<{ token: string; user: User }>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(r.data.token);
  return r.data.user;
}

export async function me() {
  const r = await api<Ok<{ user: User }>>("/auth/me");
  return r.data.user;
}

export async function logout() {
  clearToken();
}

// Sports (kept)
export async function getSports() {
  const r = await api<Ok<Array<{ id: string; name: string; icon?: string }>>>("/sports");
  return r.data;
}

// NEW: Groups / Group
export async function getGroups(params: Partial<{ city: string; sport: string; privacy: string; status: string }> = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
  const r = await api<Ok<Group[]>>(`/groups${q.toString() ? `?${q.toString()}` : ""}`);
  return r.data;
}
export async function getGroup(id: string) {
  const r = await api<Ok<{ group: Group; members: Array<{ user_id: string; role: string; status: string; username: string; name: string }>; activities: Activity[] }>>(`/groups/${id}`);
  return r.data;
}

// NEW: Venues
export async function getVenues() {
  const r = await api<Ok<Venue[]>>(`/venues`);
  return r.data;
}

// NEW: Activities
export async function getActivities(group?: string) {
  const qs = group ? `?group=${encodeURIComponent(group)}` : "";
  const r = await api<Ok<Activity[]>>(`/activities${qs}`);
  return r.data;
}
