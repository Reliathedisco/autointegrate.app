// Git Operations - Branch, Commit, Push

import simpleGit, { SimpleGit } from "simple-git";

export interface GitResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Initialize git instance for a directory
export function getGit(repoDir: string): SimpleGit {
  return simpleGit(repoDir);
}

// Create and checkout a new branch
export async function createBranch(
  repoDir: string,
  branchName: string
): Promise<GitResult> {
  try {
    const git = getGit(repoDir);
    await git.checkoutLocalBranch(branchName);
    console.log(`[Git] Created branch: ${branchName}`);
    return { success: true, message: `Created branch: ${branchName}` };
  } catch (err: any) {
    console.error(`[Git] Failed to create branch:`, err.message);
    return { success: false, error: err.message };
  }
}

// Stage all changes
export async function stageAll(repoDir: string): Promise<GitResult> {
  try {
    const git = getGit(repoDir);
    await git.add(".");
    console.log(`[Git] Staged all changes`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Create a commit
export async function commit(
  repoDir: string,
  message: string
): Promise<GitResult> {
  try {
    const git = getGit(repoDir);
    await git.commit(message);
    console.log(`[Git] Committed: ${message}`);
    return { success: true, message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Push to remote
export async function push(
  repoDir: string,
  branch: string
): Promise<GitResult> {
  try {
    const git = getGit(repoDir);
    await git.push("origin", branch, ["--set-upstream"]);
    console.log(`[Git] Pushed branch: ${branch}`);
    return { success: true, message: `Pushed to ${branch}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Combined: stage, commit, and push
export async function commitAndPush(
  repoDir: string,
  branch: string,
  message: string
): Promise<GitResult> {
  const git = getGit(repoDir);

  try {
    // Stage all changes
    await git.add(".");
    console.log(`[Git] Staged all changes`);

    // Commit
    await git.commit(message);
    console.log(`[Git] Committed: ${message}`);

    // Push
    await git.push("origin", branch, ["--set-upstream"]);
    console.log(`[Git] Pushed to: ${branch}`);

    return { success: true, message: `Committed and pushed to ${branch}` };
  } catch (err: any) {
    console.error(`[Git] commitAndPush failed:`, err.message);
    return { success: false, error: err.message };
  }
}

// Get current branch
export async function getCurrentBranch(repoDir: string): Promise<string> {
  const git = getGit(repoDir);
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  return branch.trim();
}

// Get status
export async function getStatus(repoDir: string): Promise<any> {
  const git = getGit(repoDir);
  return git.status();
}
