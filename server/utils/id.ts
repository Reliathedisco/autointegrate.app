// ID Generator Utility

import crypto from "crypto";

export function generateId(prefix: string = "id"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}

export function generateShortId(): string {
  return crypto.randomBytes(6).toString("hex");
}

export function generateJobId(): string {
  return generateId("job");
}

export function generateBranchName(jobId: string): string {
  return `autointegrate/${jobId}`;
}
