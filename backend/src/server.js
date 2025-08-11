/* Pulse Backend — server.js
 * v0.1.0 — boot the API
 */
import "dotenv/config";
import { config } from "./config.js";
import { app } from "./app.js";

// DB init (opens the SQLite file so queries work)
import "./db/index.js";

// Routes
import { router as groupsRouter } from "./routes/groups.js";
app.use("/api/v2/groups", groupsRouter);

const PORT = Number(process.env.PORT || config.PORT || 4000);
app.listen(PORT, () => {
  console.log(`[Pulse] API v0.1.0 listening on :${PORT}`);
});
