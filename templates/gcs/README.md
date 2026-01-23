# Google Cloud Storage Integration

Signed uploads using Google Cloud Storage.

## Environment Variables

```env
GCS_BUCKET=
GCP_KEY= # entire JSON key as a string
```

## Usage

```typescript
import { uploadToGCS } from "./upload";

const url = await uploadToGCS("my-file.png", fileBuffer);
```
