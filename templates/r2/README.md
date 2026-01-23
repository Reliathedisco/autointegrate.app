# Cloudflare R2 Integration

S3-compatible file storage.

## Environment Variables

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

## Usage

```typescript
import { r2 } from "./client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

await r2.send(
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: "my-file.png",
    Body: fileBuffer,
  })
);
```
