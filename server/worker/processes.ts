// Job Processor - Wrapper for runJob

import { Job } from "../jobs/jobTypes.js";
import { runJob, RunJobResult } from "./runJob.js";

export interface ProcessResult {
  success: boolean;
  prUrl?: string;
  filesGenerated: number;
  error?: string;
}

// Main process function - called by worker
export async function processJob(job: Job): Promise<ProcessResult> {
  console.log(`[Processor] Processing job: ${job.id}`);

  try {
    const result = await runJob(job);

    return {
      success: result.success,
      prUrl: result.prUrl,
      filesGenerated: result.filesGenerated,
      error: result.error,
    };
  } catch (err: any) {
    console.error(`[Processor] Unexpected error:`, err);

    return {
      success: false,
      filesGenerated: 0,
      error: err.message || "Unknown error",
    };
  }
}

// Re-export for convenience
export { runJob, RunJobResult };
