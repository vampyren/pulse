/**
 * Pulse Web — main.tsx
 * Version: v0.1.4
 * Purpose: App bootstrap + global styles import (HashRouter for hash-based routing)
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "@/providers/AuthProvider";

// Tailwind & global styles
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
