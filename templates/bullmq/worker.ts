import { Worker } from "bullmq";

export const demoWorker = new Worker(
  "demo",
  async job => {
    console.log("Processing job", job.id, job.data);
    return { status: "done" };
  },
  { connection: { url: process.env.REDIS_URL } }
);

