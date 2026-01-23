import { NextResponse } from "next/server";
import { demoQueue } from "./queue";

export const POST = async () => {
  const job = await demoQueue.add("task", { time: Date.now() });
  return NextResponse.json({ ok: true, jobId: job.id });
};

