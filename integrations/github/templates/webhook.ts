// GitHub Webhook Handler

import crypto from "crypto";

export async function handleGitHubWebhook(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";
  const event = req.headers.get("x-github-event");

  // Verify signature
  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!);
  const expectedSig = `sha256=${hmac.update(body).digest("hex")}`;

  if (signature !== expectedSig) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(body);

  switch (event) {
    case "push":
      console.log("Push event:", payload.repository.full_name);
      break;
    case "pull_request":
      console.log("PR event:", payload.action, payload.pull_request.title);
      break;
    case "issues":
      console.log("Issue event:", payload.action, payload.issue.title);
      break;
    default:
      console.log("GitHub event:", event);
  }

  return new Response("OK", { status: 200 });
}
