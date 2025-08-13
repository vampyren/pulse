/* Pulse Backend — app.js
 * v0.1.0
 * Express app setup (minimal: JSON, helmet, logs, health).
 */
import express from "express";
import sportsRouter from "./routes/sports.js";
import helmet from "helmet";
import morgan from "morgan";

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan("tiny"));

// Health
app.get("/api/v2/health", (req, res) => {
  res.json({ ok: true, service: "Pulse API", version: "0.1.0" });
});

app.use("/api/v2", sportsRouter); // v0.1.2 sports
export default app;
