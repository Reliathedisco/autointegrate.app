// Cron Worker Initialization Template

export interface CronJob {
  name: string;
  schedule: string; // cron expression
  handler: () => Promise<void>;
}

export const cronJobs: CronJob[] = [];

export function registerCronJob(job: CronJob) {
  cronJobs.push(job);
  console.log(`Registered cron job: ${job.name} (${job.schedule})`);
}
