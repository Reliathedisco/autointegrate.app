import { ghRequest } from "./client";

export const commentOnIssue = async (
  owner: string,
  repo: string,
  issueNumber: number,
  message: string
) => {
  return ghRequest(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    "POST",
    { body: message }
  );
};
