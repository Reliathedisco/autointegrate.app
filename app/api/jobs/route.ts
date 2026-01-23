// Jobs List API Endpoint

import { NextResponse } from "next/server";
import { getAllJobs, getJobsByStatus } from "@/server/jobs/jobStorage";
import { JobStatus } from "@/server/jobs/jobTypes";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as JobStatus | null;

    let jobs;
    if (status) {
      jobs = getJobsByStatus(status);
    } else {
      jobs = getAllJobs();
    }

    // Sort by createdAt descending (newest first)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      ok: true,
      count: jobs.length,
      jobs,
    });
  } catch (err: any) {
    console.error("[API] Error fetching jobs:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
