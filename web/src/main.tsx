/**
 * Pulse Web — main.tsx
 * Version: v0.1.1
 * Purpose: App entry; wraps with BrowserRouter and AuthProvider.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import DevErrorBoundary from "@/components/DevErrorBoundary";
import { AuthProvider } from "@/providers/AuthProvider";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DevErrorBoundary><App /></DevErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
