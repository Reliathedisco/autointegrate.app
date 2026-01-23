import { bucket } from "./client";

export const uploadToGCS = async (filename: string, data: Buffer) => {
  const file = bucket.file(filename);
  await file.save(data);

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
};
