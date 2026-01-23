// GitHub API Initialization Template

const GITHUB_API = "https://api.github.com";

export async function githubFetch(path: string, options: RequestInit = {}) {
  return fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`,
      Accept: "application/vnd.github.v3+json",
      ...options.headers,
    },
  }).then((res) => res.json());
}
