// Job Type Definitions

export type JobStatus = "pending" | "processing" | "completed" | "error" | "cancelled";

export interface Job {
  id: string;
  repo: string;
  integrations: string[];
  addons: string[];
  createdAt: number;
  updatedAt?: number;
  status: JobStatus;
  error?: string;
  prUrl?: string;
  branch?: string;
  filesGenerated?: number;
  completedAt?: number;
}

export interface JobCreateInput {
  repo: string;
  integrations: string[];
  addons?: string[];
}

export interface JobUpdateInput {
  status?: JobStatus;
  error?: string;
  prUrl?: string;
  branch?: string;
  filesGenerated?: number;
  completedAt?: number;
}
