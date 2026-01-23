export const s3Config = {
  name: "AWS S3",
  requiredEnv: [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET",
  ],
  description: "Upload and list files using AWS SDK v3.",
};
