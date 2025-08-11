
/**
 * Pulse Web — api.ts
 * File version: 0.1.0
 * Purpose: Axios instance with auth and base URL config.
 */
import axios from "axios";
import { useAuthStore } from "@/state/auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v2";
export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);
