# AWS S3 Integration

Upload handler + example API route.

## Environment Variables

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

## Usage

```typescript
import { uploadToS3 } from "./upload";

const url = await uploadToS3("my-file.png", fileBuffer);
```
