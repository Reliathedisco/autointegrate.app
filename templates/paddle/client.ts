export const paddleRequest = async (path: string, body: any) => {
  const res = await fetch(`https://api.paddle.com${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  return res.json();
};
