/**
 * Pulse Backend — app.js
 * Version: v0.3.1
 * Purpose: Express app composition and routes mounting
 * Pattern:
 *  - Export `app` as a named export for server.js.
 *  - All route files must `export default router`.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes (all export default router)
import authRoutes from "./routes/auth.js";
import sportsRoutes from "./routes/sports.js";
import groupsRoutes from "./routes/groups.js";
import venuesRoutes from "./routes/venues.js";
import activitiesRoutes from "./routes/activities.js";

export const app = express(); // named export for server.js

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/v2/health", (_req, res) =>
  res.json({ ok: true, data: { status: "ok" }, meta: null })
);

// Routes (all mounted here)
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/sports", sportsRoutes);
app.use("/api/v2/groups", groupsRoutes);
app.use("/api/v2/venues", venuesRoutes);
app.use("/api/v2/activities", activitiesRoutes);
