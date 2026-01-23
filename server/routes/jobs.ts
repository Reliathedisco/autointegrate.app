import { Router } from "express";
import { createJob, getJob, getAllJobs, retryJob, deleteJob } from "../utils/jobStorage.js";
import { log } from "../utils/logger.js";

const router = Router();

// CREATE JOB
router.post("/", async (req, res) => {
  const { repo, integrations } = req.body;

  if (!repo || !integrations?.length) {
    return res.status(400).json({ error: "Missing repo or integrations." });
  }

  const job = await createJob(repo, integrations);
  log.info(`Job created → ${job.id}`);

  return res.json({ ok: true, job });
});

// JOB STATUS
router.get("/:id", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  return res.json(job);
});

// LIST JOBS
router.get("/", async (req, res) => {
  const jobs = await getAllJobs();
  return res.json(jobs);
});

// RETRY JOB
router.post("/retry/:id", async (req, res) => {
  const job = await retryJob(req.params.id);
  return res.json(job);
});

// DELETE JOB
router.delete("/:id", async (req, res) => {
  await deleteJob(req.params.id);
  return res.json({ ok: true });
});

export default router;

