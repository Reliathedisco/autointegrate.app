// GitLab Issues Example

import { gitlabFetch } from "./init";

export async function createIssue(projectId: string, title: string, description?: string) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/issues`, {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export async function listIssues(projectId: string) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/issues`);
}

export async function closeIssue(projectId: string, issueIid: number) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`, {
    method: "PUT",
    body: JSON.stringify({ state_event: "close" }),
  });
}
