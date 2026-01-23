// Single Job API Endpoint

import { NextResponse } from "next/server";
import { getJob, updateJob, deleteJob } from "@/server/jobs/jobStorage";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = getJob(params.id);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, job });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const job = await updateJob(params.id, body);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, job });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteJob(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}
