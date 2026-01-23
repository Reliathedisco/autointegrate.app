// Cron Jobs Definition Example

import { registerCronJob } from "./init";

// Daily cleanup at midnight
registerCronJob({
  name: "daily-cleanup",
  schedule: "0 0 * * *",
  handler: async () => {
    console.log("Running daily cleanup...");
    // Add cleanup logic here
  },
});

// Hourly sync
registerCronJob({
  name: "hourly-sync",
  schedule: "0 * * * *",
  handler: async () => {
    console.log("Running hourly sync...");
    // Add sync logic here
  },
});

// Weekly report every Monday at 9 AM
registerCronJob({
  name: "weekly-report",
  schedule: "0 9 * * 1",
  handler: async () => {
    console.log("Generating weekly report...");
    // Add report generation logic here
  },
});
