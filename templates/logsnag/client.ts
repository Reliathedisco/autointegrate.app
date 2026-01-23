export const logsnag = async (
  channel: string,
  event: string,
  description: string
) => {
  const res = await fetch("https://api.logsnag.com/v1/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOGSNAG_TOKEN}`,
    },
    body: JSON.stringify({
      project: process.env.LOGSNAG_PROJECT!,
      channel,
      event,
      description,
      icon: "⚡",
    }),
  });

  return res.json();
};
