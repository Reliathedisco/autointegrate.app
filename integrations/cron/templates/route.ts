// Cron API Route Handler

import { cronJobs } from "./init";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobName = url.searchParams.get("job");

  if (!jobName) {
    return new Response(JSON.stringify({ jobs: cronJobs.map((j) => j.name) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const job = cronJobs.find((j) => j.name === jobName);

  if (!job) {
    return new Response(JSON.stringify({ error: "Job not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await job.handler();
    return new Response(JSON.stringify({ ok: true, job: jobName }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
