// Ably Subscribe Example

import { ably } from "./init";

export function subscribe(channel: string, cb: (msg: any) => void) {
  const c = ably.channels.get(channel);
  c.subscribe("event", (msg) => cb(msg.data));
}
