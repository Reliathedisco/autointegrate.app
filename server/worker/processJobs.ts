import { loadJobs, saveJobs } from "../utils/jobStorage.js";
import { loadTemplates } from "../utils/templateStorage.js";
import { writeGeneratedFiles } from "./fileWriter.js";
import { createBranch, commitFiles, createPR } from "../utils/githubAPI.js";
import { log } from "../utils/logger.js";

export async function processJobs() {
  const jobs = await loadJobs();
  const templates = await loadTemplates();

  const pending = jobs.filter((job) => job.status === "pending");
  if (pending.length === 0) return;

  for (const job of pending) {
    log.info(`⚙️ Processing job ${job.id}`);

    job.status = "processing";
    await saveJobs(jobs);

    try {
      const toGenerate: Record<string, string> = {};

      // Match templates
      for (const integration of job.integrations) {
        const template = templates.find((t) => t.name === integration);
        if (!template) {
          log.warn(`Template missing: ${integration}`);
          continue;
        }

        Object.assign(toGenerate, template.files);
      }

      // Write to local sandbox
      const sandboxFiles = await writeGeneratedFiles(job.id, toGenerate);

      // GitHub workflow (only if repo is configured)
      if (job.repo && job.repo.includes("/")) {
        try {
          await createBranch(job.repo);

          // convert sandbox files into GitHub commit objects
          const commitFilesPayload = sandboxFiles.map((f) => ({
            path: f.path,
            content: f.contents
          }));

          await commitFiles(job.repo, commitFilesPayload);

          const pr = await createPR(job.repo);
          job.pr = pr;
        } catch (ghErr) {
          log.warn(`GitHub operations skipped: ${ghErr}`);
        }
      }

      job.status = "done";
      await saveJobs(jobs);

      log.success(`🎉 Job ${job.id} completed`);
    } catch (err) {
      job.status = "error";
      job.error = String(err);
      await saveJobs(jobs);

      log.error(`❌ Job ${job.id} failed: ${err}`);
    }
  }
}

