/* Pulse Backend — server.js
 * Version: v0.2.3
 * Purpose: Boot the API (app.js handles all route mounting)
 */

import "dotenv/config";
import app from "./app.js";          // default export plus named available
import "./db/index.js";              // open DB and PRAGMAs

const PORT = Number(process.env.PORT || 4010);
app.listen(PORT, () => {
  console.log(`[Pulse] API v0.2.3 listening on :${PORT}`);
});
