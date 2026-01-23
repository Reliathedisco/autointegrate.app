export const r2Config = {
  name: "Cloudflare R2",
  requiredEnv: [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET"
  ],
  description: "S3-compatible storage using Cloudflare R2.",
};
