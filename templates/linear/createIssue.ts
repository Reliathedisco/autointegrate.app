import { linearRequest } from "./client";

export const createLinearIssue = async (
  teamId: string,
  title: string,
  description?: string
) => {
  return linearRequest(
    `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id title }
        }
      }
    `,
    { input: { teamId, title, description } }
  );
};
