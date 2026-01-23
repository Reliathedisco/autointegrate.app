export const rateLimitConfig = {
  name: "Ratelimit",
  requiredEnv: [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN"
  ],
  description: "Per-user or per-IP rate limiting.",
};

