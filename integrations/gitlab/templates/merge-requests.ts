// GitLab Merge Requests Example

import { gitlabFetch } from "./init";

export async function createMergeRequest(
  projectId: string,
  sourceBranch: string,
  targetBranch: string,
  title: string
) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/merge_requests`, {
    method: "POST",
    body: JSON.stringify({
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
    }),
  });
}

export async function listMergeRequests(projectId: string, state = "opened") {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/merge_requests?state=${state}`);
}

export async function mergeMergeRequest(projectId: string, mrIid: number) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/merge`, {
    method: "PUT",
  });
}
