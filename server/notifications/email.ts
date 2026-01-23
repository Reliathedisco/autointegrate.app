// Email Notifications (using Resend)

import { Resend } from "resend";
import { Job } from "../jobs/jobTypes.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendJobCompletedEmail(
  job: Job,
  prUrl: string,
  recipientEmail: string
): Promise<void> {
  if (!resend) {
    console.log("[Email] No RESEND_API_KEY configured, skipping");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "AutoIntegrate <noreply@autointegrate.dev>",
      to: recipientEmail,
      subject: `✅ AutoIntegrate Job Complete: ${job.id}`,
      html: `
        <h2>Your integration job is complete!</h2>
        <p><strong>Job ID:</strong> ${job.id}</p>
        <p><strong>Repository:</strong> ${job.repo}</p>
        <p><strong>Integrations:</strong> ${job.integrations.join(", ")}</p>
        <p><strong>Pull Request:</strong> <a href="${prUrl}">${prUrl}</a></p>
        <p>Review and merge the PR to complete the integration.</p>
      `,
    });
    console.log(`[Email] Sent completion email to ${recipientEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

export async function sendJobFailedEmail(
  job: Job,
  recipientEmail: string
): Promise<void> {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "AutoIntegrate <noreply@autointegrate.dev>",
      to: recipientEmail,
      subject: `❌ AutoIntegrate Job Failed: ${job.id}`,
      html: `
        <h2>Your integration job failed</h2>
        <p><strong>Job ID:</strong> ${job.id}</p>
        <p><strong>Repository:</strong> ${job.repo}</p>
        <p><strong>Error:</strong> ${job.error || "Unknown error"}</p>
        <p>Please check your configuration and try again.</p>
      `,
    });
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}
