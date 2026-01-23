// Vercel Domains Example

import { vercelFetch } from "./init";

export async function listDomains(projectId: string) {
  return vercelFetch(`/v9/projects/${projectId}/domains`);
}

export async function addDomain(projectId: string, domain: string) {
  return vercelFetch(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
}

export async function removeDomain(projectId: string, domain: string) {
  return vercelFetch(`/v9/projects/${projectId}/domains/${domain}`, {
    method: "DELETE",
  });
}

export async function verifyDomain(projectId: string, domain: string) {
  return vercelFetch(`/v9/projects/${projectId}/domains/${domain}/verify`, {
    method: "POST",
  });
}
