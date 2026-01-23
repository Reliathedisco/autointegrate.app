import { ghRequest } from "./client";

export const createIssue = async (
  owner: string,
  repo: string,
  title: string,
  body?: string
) => {
  return ghRequest(`/repos/${owner}/${repo}/issues`, "POST", {
    title,
    body,
  });
};
