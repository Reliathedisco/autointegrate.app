import { ghRequest } from "./client";

export const createRelease = async (
  owner: string,
  repo: string,
  tag: string,
  notes: string
) => {
  return ghRequest(`/repos/${owner}/${repo}/releases`, "POST", {
    tag_name: tag,
    name: tag,
    body: notes,
  });
};
