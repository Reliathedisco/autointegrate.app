// Worker Start API Endpoint

import { NextResponse } from "next/server";
import { startWorker } from "@/server/worker/worker";

export async function POST() {
  try {
    await startWorker();
    return NextResponse.json({
      ok: true,
      message: "Worker started",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to start worker" },
      { status: 500 }
    );
  }
}
