// Worker - Continuous Job Processing Loop

import { getPendingJob, updateJob } from "../jobs/jobStorage.js";
import { processJob, ProcessResult } from "./processes.js";

const POLL_INTERVAL = 5000; // 5 seconds
let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export async function startWorker(): Promise<void> {
  if (isRunning) {
    console.log("[Worker] Already running");
    return;
  }

  isRunning = true;
  console.log(`[Worker] Started - polling every ${POLL_INTERVAL / 1000}s`);

  // Initial check
  await checkForJobs();

  // Start polling
  intervalId = setInterval(checkForJobs, POLL_INTERVAL);
}

export function stopWorker(): void {
  if (!isRunning) return;

  isRunning = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  console.log("[Worker] Stopped");
}

async function checkForJobs(): Promise<void> {
  const job = getPendingJob();

  if (!job) {
    // No pending jobs - silent
    return;
  }

  console.log(`[Worker] Found pending job: ${job.id}`);

  // Mark as processing
  await updateJob(job.id, { status: "processing" });

  try {
    // Process the job
    const result: ProcessResult = await processJob(job);

    if (result.success) {
      // Mark as completed
      await updateJob(job.id, {
        status: "completed",
        prUrl: result.prUrl,
        filesGenerated: result.filesGenerated,
        completedAt: Date.now(),
      });
    } else {
      // Mark as error
      await updateJob(job.id, {
        status: "error",
        error: result.error,
      });
    }
  } catch (err: any) {
    console.error(`[Worker] Unexpected error processing job ${job.id}:`, err);
    await updateJob(job.id, {
      status: "error",
      error: err.message || "Unknown error",
    });
  }
}

// Export for testing
export { checkForJobs };
