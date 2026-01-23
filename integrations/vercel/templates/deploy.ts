// Vercel Deployments Example

import { vercelFetch } from "./init";

export async function listProjects() {
  return vercelFetch("/v9/projects");
}

export async function getProject(projectId: string) {
  return vercelFetch(`/v9/projects/${projectId}`);
}

export async function listDeployments(projectId: string) {
  return vercelFetch(`/v6/deployments?projectId=${projectId}`);
}

export async function getDeployment(deploymentId: string) {
  return vercelFetch(`/v13/deployments/${deploymentId}`);
}

export async function triggerRedeploy(deploymentId: string) {
  return vercelFetch(`/v13/deployments/${deploymentId}/redeploy`, {
    method: "POST",
  });
}
