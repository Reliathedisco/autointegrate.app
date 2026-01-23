// GitHub Releases Example

import { githubFetch } from "./init";

export async function createRelease(owner: string, repo: string, tag: string, name: string, body?: string) {
  return githubFetch(`/repos/${owner}/${repo}/releases`, {
    method: "POST",
    body: JSON.stringify({
      tag_name: tag,
      name,
      body,
      draft: false,
      prerelease: false,
    }),
  });
}

export async function listReleases(owner: string, repo: string) {
  return githubFetch(`/repos/${owner}/${repo}/releases`);
}
