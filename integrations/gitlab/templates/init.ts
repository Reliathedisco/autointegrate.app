// GitLab API Initialization Template

const GITLAB_API = "https://gitlab.com/api/v4";

export async function gitlabFetch(path: string, options: RequestInit = {}) {
  return fetch(`${GITLAB_API}${path}`, {
    ...options,
    headers: {
      "PRIVATE-TOKEN": process.env.GITLAB_TOKEN!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  }).then((res) => res.json());
}
