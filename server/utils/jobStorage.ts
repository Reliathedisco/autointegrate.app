import fs from "fs-extra";
import { v4 as uuid } from "uuid";
import { JOB_DATA_FILE } from "../config.js";

export async function loadJobs() {
  await fs.ensureFile(JOB_DATA_FILE);
  return (await fs.readJson(JOB_DATA_FILE).catch(() => [])) as any[];
}

export async function saveJobs(jobs: any[]) {
  await fs.writeJson(JOB_DATA_FILE, jobs, { spaces: 2 });
}

export async function createJob(repo: string, integrations: string[]) {
  const jobs = await loadJobs();
  const job = {
    id: uuid(),
    repo,
    integrations,
    status: "pending",
    createdAt: Date.now()
  };

  jobs.push(job);
  await saveJobs(jobs);

  return job;
}

export async function getJob(id: string) {
  const jobs = await loadJobs();
  return jobs.find((j) => j.id === id);
}

export async function getAllJobs() {
  return loadJobs();
}

export async function retryJob(id: string) {
  const jobs = await loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) return null;

  job.status = "pending";
  await saveJobs(jobs);

  return job;
}

export async function deleteJob(id: string) {
  const jobs = await loadJobs();
  const filtered = jobs.filter((j) => j.id !== id);

  await saveJobs(filtered);
}

