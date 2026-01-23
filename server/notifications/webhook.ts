// Webhook Notifications

import { Job } from "../jobs/jobTypes.js";

export interface WebhookPayload {
  event: string;
  jobId: string;
  prUrl?: string;
  integrations: string[];
  status: string;
  timestamp: number;
  error?: string;
}

export async function sendJobWebhook(
  job: Job,
  event: string,
  prUrl?: string
): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[Webhook] No WEBHOOK_URL configured, skipping");
    return;
  }

  const payload: WebhookPayload = {
    event,
    jobId: job.id,
    prUrl,
    integrations: job.integrations,
    status: job.status,
    timestamp: Date.now(),
    error: job.error,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Webhook] Sent: ${event} for job ${job.id}`);
    } else {
      console.error(`[Webhook] Failed: ${response.status}`);
    }
  } catch (err) {
    console.error("[Webhook] Error:", err);
  }
}

export async function sendJobStarted(job: Job): Promise<void> {
  await sendJobWebhook(job, "job.started");
}

export async function sendJobCompleted(job: Job, prUrl: string): Promise<void> {
  await sendJobWebhook(job, "job.completed", prUrl);
}

export async function sendJobFailed(job: Job): Promise<void> {
  await sendJobWebhook(job, "job.failed");
}
