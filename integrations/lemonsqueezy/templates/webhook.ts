// Lemon Squeezy Webhook Handler

export async function lemonWebhook(req: Request) {
  const body = await req.json();
  console.log("Lemon Webhook Event:", body);
  return new Response("OK", { status: 200 });
}
