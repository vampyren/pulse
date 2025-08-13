/**
 * Pulse Web — components/DevErrorBoundary.tsx
 * Version: v0.1.0
 * Purpose: Show runtime React errors instead of a blank page.
 */

import React from "react";

type State = { hasError: boolean; error?: any };

export default class DevErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Still log to console for details
    console.error("App crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, maxWidth: 800, margin: "24px auto", fontFamily: "ui-sans-serif,system-ui" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#b91c1c", background: "#fff", border: "1px solid #fee2e2", borderRadius: 8, padding: 12 }}>
            {String(this.state.error)}
          </pre>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Open DevTools → Console for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
