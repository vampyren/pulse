/* Pulse Backend — server.js
 * Version: v0.2.0
 * Purpose: Boot the API (app.js handles all route mounting)
 */

import "dotenv/config";
import { config } from "./config.js";
import { app } from "./app.js"; // named export from app.js

// DB init
import "./db/index.js";

// Start server
const PORT = Number(process.env.PORT || config.PORT || 4010);
app.listen(PORT, () => {
  console.log(`[Pulse] API v0.2.0 listening on :${PORT}`);
});
