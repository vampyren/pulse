/**
 * Pulse Backend — app.js
 * Version: v0.2.4
 * Purpose: Compose Express app, middlewares, and mount routes (read APIs).
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import sportsRoutes from "./routes/sports.js";
import groupsRoutes from "./routes/groups.js";
import venuesRoutes from "./routes/venues.js";
import activitiesRoutes from "./routes/activities.js";
import facilitiesRoutes from "./routes/facilities.js";

// Create app (exported both as default and named)
export const app = express();
const isProd = process.env.NODE_ENV === "production";

// Security and basics
app.use(
  helmet({
    contentSecurityPolicy: false, // align with Nginx SPA; tighten later
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan(isProd ? "combined" : "dev"));

// Health
app.get("/api/v2/health", (_req, res) =>
  res.json({ ok: true, data: { status: "ok" }, meta: null })
);

// Mount routes
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/sports", sportsRoutes);
app.use("/api/v2/groups", groupsRoutes);
app.use("/api/v2/venues", venuesRoutes);
app.use("/api/v2/activities", activitiesRoutes);
app.use("/api/v2/facilities", facilitiesRoutes);

export default app;
