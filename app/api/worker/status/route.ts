// Worker Status API Endpoint

import { NextResponse } from "next/server";
import { getJobsByStatus, getAllJobs } from "@/server/jobs/jobStorage";

export async function GET() {
  try {
    const allJobs = getAllJobs();
    const pending = getJobsByStatus("pending");
    const processing = getJobsByStatus("processing");
    const completed = getJobsByStatus("completed");
    const errors = getJobsByStatus("error");

    return NextResponse.json({
      ok: true,
      stats: {
        total: allJobs.length,
        pending: pending.length,
        processing: processing.length,
        completed: completed.length,
        errors: errors.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to get status" },
      { status: 500 }
    );
  }
}
