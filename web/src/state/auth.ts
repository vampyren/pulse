
/**
 * Pulse Web — state/auth.ts
 * File version: 0.1.0
 * Purpose: Auth store (Zustand) for token & user.
 */
import { create } from "zustand";

type User = {
  id: string;
  username: string;
  name?: string;
  email?: string;
  is_admin?: boolean;
}

type AuthState = {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  login: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
