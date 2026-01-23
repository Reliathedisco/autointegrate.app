// Cron Task Examples
import { registerTask } from "./init";

// Daily cleanup task
registerTask({
  name: "cleanup",
  schedule: "0 0 * * *", // Every day at midnight
  handler: async () => {
    console.log("Running cleanup task at", new Date().toISOString());
    // Add your cleanup logic here
  },
});

// Hourly report task
registerTask({
  name: "hourly-report",
  schedule: "0 * * * *", // Every hour
  handler: async () => {
    console.log("Generating hourly report at", new Date().toISOString());
    // Add your reporting logic here
  },
});

// Weekly digest task
registerTask({
  name: "weekly-digest",
  schedule: "0 9 * * 1", // Every Monday at 9 AM
  handler: async () => {
    console.log("Sending weekly digest at", new Date().toISOString());
    // Add your digest logic here
  },
});

// API route handler
import { NextRequest, NextResponse } from "next/server";
import { runTask } from "./init";

export async function GET(req: NextRequest) {
  const taskName = req.nextUrl.searchParams.get("task");
  
  if (!taskName) {
    return NextResponse.json({ error: "Task name required" }, { status: 400 });
  }

  try {
    await runTask(taskName);
    return NextResponse.json({ ok: true, task: taskName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
