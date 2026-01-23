export async function sendWebhook(event: string, payload: any) {
  // you can add Slack, Discord, or custom webhook support later
  console.log("WEBHOOK:", event, payload);
}

