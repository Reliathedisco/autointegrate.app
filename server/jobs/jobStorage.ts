// Job Storage Module (JSON-based for simplicity)

import fs from "fs";
import path from "path";
import { Job, JobStatus, JobUpdateInput } from "./jobTypes.js";

const JOBS_FILE = path.join(process.cwd(), "data", "jobs.json");

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(JOBS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadJobs(): Job[] {
  ensureDataDir();
  if (!fs.existsSync(JOBS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(JOBS_FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function saveJobs(jobs: Job[]): Promise<void> {
  ensureDataDir();
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

export async function createJob(job: Job): Promise<Job> {
  const jobs = loadJobs();
  jobs.push(job);
  await saveJobs(jobs);
  console.log(`[JobStorage] Created job: ${job.id}`);
  return job;
}

export async function updateJob(id: string, updates: JobUpdateInput): Promise<Job | null> {
  const jobs = loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;

  jobs[idx] = {
    ...jobs[idx],
    ...updates,
    updatedAt: Date.now(),
  };

  await saveJobs(jobs);
  console.log(`[JobStorage] Updated job: ${id} -> ${updates.status || "updated"}`);
  return jobs[idx];
}

export function getJob(id: string): Job | null {
  const jobs = loadJobs();
  return jobs.find((j) => j.id === id) || null;
}

export function getPendingJob(): Job | null {
  const jobs = loadJobs();
  return jobs.find((j) => j.status === "pending") || null;
}

export function getJobsByStatus(status: JobStatus): Job[] {
  const jobs = loadJobs();
  return jobs.filter((j) => j.status === status);
}

export function getAllJobs(): Job[] {
  return loadJobs();
}

export async function deleteJob(id: string): Promise<boolean> {
  const jobs = loadJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;
  await saveJobs(filtered);
  return true;
}
