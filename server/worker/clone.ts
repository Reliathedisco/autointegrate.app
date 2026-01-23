// Repository Cloning

import simpleGit from "simple-git";
import path from "path";
import fs from "fs";

const TMP_DIR = path.join(process.cwd(), "tmp");

// Ensure tmp directory exists
function ensureTmpDir(): void {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

// Normalize GitHub URL to clean HTTPS format
function normalizeGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Trim whitespace
  url = url.trim();
  
  // Match various GitHub URL formats
  const patterns = [
    // https://github.com/owner/repo.git
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/\s]+?)(\.git)?$/,
    // git@github.com:owner/repo.git
    /^git@github\.com:([^\/]+)\/([^\/\s]+?)(\.git)?$/,
    // github.com/owner/repo
    /^github\.com\/([^\/]+)\/([^\/\s]+?)(\.git)?$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  
  return null;
}

// Parse repo URL to get owner and repo name
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const parsed = normalizeGitHubUrl(repoUrl);
  if (parsed) {
    return parsed;
  }
  
  // Fallback: old method
  const cleaned = repoUrl
    .replace("https://github.com/", "")
    .replace("git@github.com:", "")
    .replace(".git", "")
    .trim();

  const [owner, repo] = cleaned.split("/");
  return { owner, repo };
}

// Clone a repository
export async function cloneRepository(
  repoUrl: string,
  jobId: string,
  token?: string
): Promise<string> {
  ensureTmpDir();

  const targetDir = path.join(TMP_DIR, jobId);

  // Clean up if exists
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`[Clone] Cleaned existing directory: ${targetDir}`);
  }

  // Normalize the URL to clean HTTPS format
  const parsed = normalizeGitHubUrl(repoUrl);
  
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }
  
  // Build clean HTTPS URL
  let cloneUrl: string;
  if (token) {
    cloneUrl = `https://${token}@github.com/${parsed.owner}/${parsed.repo}.git`;
  } else {
    cloneUrl = `https://github.com/${parsed.owner}/${parsed.repo}.git`;
  }

  console.log(`[Clone] Cloning repository to: ${targetDir}`);
  console.log(`[Clone] URL: https://github.com/${parsed.owner}/${parsed.repo}.git`);

  // Create git instance
  const git = simpleGit();
  
  await git.clone(cloneUrl, targetDir);

  console.log(`[Clone] Successfully cloned to: ${targetDir}`);

  return targetDir;
}

// Cleanup cloned repository
export async function cleanupRepository(jobId: string): Promise<void> {
  const targetDir = path.join(TMP_DIR, jobId);

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`[Clone] Cleaned up: ${targetDir}`);
  }
}

// Get the default branch of a repository
export async function getDefaultBranch(repoDir: string): Promise<string> {
  const git = simpleGit(repoDir);

  try {
    // Try to get remote HEAD
    const remote = await git.remote(["show", "origin"]);
    const match = remote?.match(/HEAD branch: (.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch {
    // Fallback
  }

  return "main";
}
