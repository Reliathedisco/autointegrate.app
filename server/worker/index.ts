import { processJobs } from "./processJobs.js";
import { log } from "../utils/logger.js";

// Start processing every 10 seconds
setInterval(() => {
  processJobs().catch((err) => log.error(String(err)));
}, 10_000);

log.info("🛠 Worker started: checking for pending jobs every 10s");

