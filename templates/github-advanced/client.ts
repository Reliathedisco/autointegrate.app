export const ghRequest = async (path: string, method = "GET", body?: any) => {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};
