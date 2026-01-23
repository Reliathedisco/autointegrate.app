// Redis Cache Example

import { redis } from "./init";

export async function cacheValue(key: string, value: any) {
  await redis.set(key, JSON.stringify(value), { EX: 60 });
}
