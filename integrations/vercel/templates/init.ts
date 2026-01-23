// Vercel API Initialization Template

const VERCEL_API = "https://api.vercel.com";

export async function vercelFetch(path: string, options: RequestInit = {}) {
  return fetch(`${VERCEL_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN!}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  }).then((res) => res.json());
}
