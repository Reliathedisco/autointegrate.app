// Job Creation API Endpoint

import { NextResponse } from "next/server";
import { createJob } from "@/server/jobs/jobStorage";
import { generateJobId } from "@/server/utils/id";
import { Job, JobCreateInput } from "@/server/jobs/jobTypes";

export async function POST(req: Request) {
  try {
    const body: JobCreateInput = await req.json();

    // Validate required fields
    if (!body.repo) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    if (!body.integrations || body.integrations.length === 0) {
      return NextResponse.json(
        { error: "At least one integration is required" },
        { status: 400 }
      );
    }

    // Create job object
    const job: Job = {
      id: generateJobId(),
      repo: body.repo,
      integrations: body.integrations,
      addons: body.addons || [],
      createdAt: Date.now(),
      status: "pending",
    };

    // Save job - worker will pick it up automatically
    await createJob(job);

    console.log(`[API] Created job: ${job.id}`);
    console.log(`[API] Repo: ${job.repo}`);
    console.log(`[API] Integrations: ${job.integrations.join(", ")}`);

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      message: "Job created. Worker will process it automatically.",
    });
  } catch (err: any) {
    console.error("[API] Error creating job:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create job" },
      { status: 500 }
    );
  }
}
