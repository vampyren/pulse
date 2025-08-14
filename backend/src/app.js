/**
 * Pulse Backend — app.js
 * Version: v0.2.1
 * Purpose: Compose Express app, middlewares, and mount routes (read APIs).
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes (each file exports `export default router`)
import authRoutes from "./routes/auth.js";
import sportsRoutes from "./routes/sports.js";
import groupsRoutes from "./routes/groups.js";
import venuesRoutes from "./routes/venues.js";
import activitiesRoutes from "./routes/activities.js";

const app = express();

// Security & basics
app.use(
  helmet({
    contentSecurityPolicy: false, // align with nginx CSP
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/v2/health", (_req, res) =>
  res.json({ ok: true, data: { status: "ok" }, meta: null })
);

// Mount routes (read-only surfaces used by the web today)
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/sports", sportsRoutes);
app.use("/api/v2/groups", groupsRoutes);
app.use("/api/v2/venues", venuesRoutes);
app.use("/api/v2/activities", activitiesRoutes);

export default app;
