import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_KEY!),
});

export const bucket = storage.bucket(process.env.GCS_BUCKET!);
