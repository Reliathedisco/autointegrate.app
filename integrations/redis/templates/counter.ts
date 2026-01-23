// Redis Counter Example

import { redis } from "./init";

export async function incrementCounter(key: string) {
  return redis.incr(key);
}
