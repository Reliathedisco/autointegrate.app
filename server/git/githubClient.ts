// GitHub Client Initialization

import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function verifyGitHubConnection(): Promise<boolean> {
  try {
    const { data } = await octokit.users.getAuthenticated();
    console.log(`[GitHub] Authenticated as: ${data.login}`);
    return true;
  } catch (err) {
    console.error("[GitHub] Authentication failed:", err);
    return false;
  }
}

export async function getRepoInfo(owner: string, repo: string) {
  const { data } = await octokit.repos.get({ owner, repo });
  return data;
}

export async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const { data } = await octokit.repos.get({ owner, repo });
  return data.default_branch;
}
