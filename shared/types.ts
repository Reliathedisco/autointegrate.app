export type IntegrationName =
  | "stripe"
  | "clerk"
  | "openai"
  | "supabase"
  | "resend"
  | "nextauth"
  | "firebase-auth"
  | "auth0"
  | "prisma"
  | "mongodb"
  | "postgres"
  | "planetscale"
  | "redis"
  | "upstash-redis"
  | "ratelimit"
  | "bullmq"
  | "kv";

export type JobStatus = "pending" | "processing" | "done" | "error";

export interface JobRecord {
  id: string;
  repo: string;
  integrations: IntegrationName[];
  status: JobStatus;
  createdAt: number;
  pr?: {
    html_url: string;
  };
  error?: string;
}

export interface Template {
  name: string;
  files: Record<string, string>;
}

