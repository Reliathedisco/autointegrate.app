// Webhook Queue Handler (for async processing)

interface QueuedWebhook {
  id: string;
  event: string;
  payload: any;
  receivedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

const webhookQueue: QueuedWebhook[] = [];

export function queueWebhook(event: string, payload: any): string {
  const id = crypto.randomUUID();
  webhookQueue.push({
    id,
    event,
    payload,
    receivedAt: new Date(),
    status: "pending",
  });
  return id;
}

export async function processQueue() {
  const pending = webhookQueue.filter((w) => w.status === "pending");

  for (const webhook of pending) {
    webhook.status = "processing";
    try {
      // Process the webhook
      console.log(`Processing webhook ${webhook.id}: ${webhook.event}`);
      webhook.status = "completed";
    } catch (err) {
      webhook.status = "failed";
      console.error(`Failed to process webhook ${webhook.id}:`, err);
    }
  }
}

export function getQueueStatus() {
  return {
    total: webhookQueue.length,
    pending: webhookQueue.filter((w) => w.status === "pending").length,
    processing: webhookQueue.filter((w) => w.status === "processing").length,
    completed: webhookQueue.filter((w) => w.status === "completed").length,
    failed: webhookQueue.filter((w) => w.status === "failed").length,
  };
}
