// Replicate Webhook Handler

export async function replicateWebhook(req: Request) {
  const body = await req.json();

  console.log("Replicate prediction complete:", body.id);
  console.log("Output:", body.output);

  return new Response("OK", { status: 200 });
}
