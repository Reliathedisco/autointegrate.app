// Ably Publish Example

import { ably } from "./init";

export async function publishMessage(channel: string, message: any) {
  const c = ably.channels.get(channel);
  return c.publish("event", message);
}
