// GitHub Issues Example

import { githubFetch } from "./init";

export async function createIssue(owner: string, repo: string, title: string, body?: string) {
  return githubFetch(`/repos/${owner}/${repo}/issues`, {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
}

export async function listIssues(owner: string, repo: string) {
  return githubFetch(`/repos/${owner}/${repo}/issues`);
}

export async function closeIssue(owner: string, repo: string, issueNumber: number) {
  return githubFetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}
