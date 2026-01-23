// Redis Operations Example
import { getRedis } from "./init";

export async function get(key: string) {
  const client = await getRedis();
  return client.get(key);
}

export async function set(key: string, value: string, ttlSeconds?: number) {
  const client = await getRedis();
  if (ttlSeconds) {
    return client.setEx(key, ttlSeconds, value);
  }
  return client.set(key, value);
}

export async function del(key: string) {
  const client = await getRedis();
  return client.del(key);
}

export async function incr(key: string) {
  const client = await getRedis();
  return client.incr(key);
}

// Cache helper
export async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const client = await getRedis();
  const cached = await client.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await fn();
  await client.setEx(key, ttl, JSON.stringify(result));
  return result;
}
