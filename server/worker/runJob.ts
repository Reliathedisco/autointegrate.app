// Run Job - Full Pipeline Execution

import { Job } from "../jobs/jobTypes.js";
import { cloneRepository, cleanupRepository, parseRepoUrl, getDefaultBranch } from "./clone.js";
import { createBranch, commitAndPush } from "./git.js";
import { commitFiles, generateDiffSummary } from "./commit.js";
import { createPullRequest, generatePRBody, PRResult } from "./pr.js";
import { generateFilesForIntegrations } from "../integrations/generator.js";
import { sendJobStarted, sendJobCompleted, sendJobFailed } from "../notifications/webhook.js";

export interface RunJobResult {
  success: boolean;
  prUrl?: string;
  filesGenerated: number;
  error?: string;
}

export async function runJob(job: Job): Promise<RunJobResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN is required");
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`[RunJob] Starting job: ${job.id}`);
  console.log(`[RunJob] Repository: ${job.repo}`);
  console.log(`[RunJob] Integrations: ${job.integrations.join(", ")}`);
  console.log(`${"=".repeat(50)}\n`);

  // Notify job started
  await sendJobStarted(job);

  let repoDir: string | null = null;

  try {
    // Parse repo URL
    const { owner, repo } = parseRepoUrl(job.repo);
    console.log(`[RunJob] Owner: ${owner}, Repo: ${repo}`);

    // Step 1: Clone repository
    console.log(`\n[RunJob] Step 1: Cloning repository...`);
    repoDir = await cloneRepository(job.repo, job.id, token);

    // Step 2: Get default branch and create new branch
    console.log(`\n[RunJob] Step 2: Creating branch...`);
    const baseBranch = await getDefaultBranch(repoDir);
    const branchName = `autointegrate/${job.id}`;
    await createBranch(repoDir, branchName);

    // Step 3: Generate integration files
    console.log(`\n[RunJob] Step 3: Generating integration files...`);
    const files = await generateFilesForIntegrations(job.integrations);

    if (files.length === 0) {
      throw new Error("No files generated. Check integration names.");
    }

    // Step 4: Write files to repository
    console.log(`\n[RunJob] Step 4: Writing files...`);
    const writeResults = commitFiles(repoDir, files);
    const successCount = writeResults.filter((r) => r.success).length;

    if (successCount === 0) {
      throw new Error("Failed to write any files");
    }

    // Step 5: Commit and push
    console.log(`\n[RunJob] Step 5: Committing and pushing...`);
    const commitMessage = `AutoIntegrate: Add ${job.integrations.join(", ")}`;
    const pushResult = await commitAndPush(repoDir, branchName, commitMessage);

    if (!pushResult.success) {
      throw new Error(`Failed to push: ${pushResult.error}`);
    }

    // Step 6: Create Pull Request
    console.log(`\n[RunJob] Step 6: Creating Pull Request...`);
    const prBody = generatePRBody(job.integrations, files.length);

    const prResult: PRResult = await createPullRequest({
      owner,
      repo,
      branch: branchName,
      base: baseBranch,
      title: `AutoIntegrate: Add ${job.integrations.join(", ")}`,
      body: prBody,
      token,
    });

    if (!prResult.success) {
      throw new Error(`Failed to create PR: ${prResult.error}`);
    }

    // Step 7: Cleanup
    console.log(`\n[RunJob] Step 7: Cleaning up...`);
    await cleanupRepository(job.id);

    // Notify completion
    await sendJobCompleted({ ...job, status: "completed" }, prResult.prUrl!);

    console.log(`\n${"=".repeat(50)}`);
    console.log(`[RunJob] ✅ Job completed successfully!`);
    console.log(`[RunJob] PR: ${prResult.prUrl}`);
    console.log(`[RunJob] Files: ${files.length}`);
    console.log(`${"=".repeat(50)}\n`);

    return {
      success: true,
      prUrl: prResult.prUrl,
      filesGenerated: files.length,
    };
  } catch (err: any) {
    console.error(`\n[RunJob] ❌ Job failed: ${err.message}`);

    // Cleanup on failure
    if (repoDir) {
      await cleanupRepository(job.id);
    }

    // Notify failure
    await sendJobFailed({ ...job, status: "error", error: err.message });

    return {
      success: false,
      filesGenerated: 0,
      error: err.message,
    };
  }
}
