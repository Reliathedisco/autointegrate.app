// Vercel Environment Variables Example

import { vercelFetch } from "./init";

export async function listEnvVars(projectId: string) {
  return vercelFetch(`/v10/projects/${projectId}/env`);
}

export async function createEnvVar(
  projectId: string,
  key: string,
  value: string,
  target: ("production" | "preview" | "development")[] = ["production"]
) {
  return vercelFetch(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify({ key, value, target, type: "encrypted" }),
  });
}

export async function deleteEnvVar(projectId: string, envId: string) {
  return vercelFetch(`/v10/projects/${projectId}/env/${envId}`, {
    method: "DELETE",
  });
}
