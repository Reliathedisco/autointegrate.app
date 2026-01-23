# UploadThing Integration

Minimal setup for file uploads.

## Environment Variables

```env
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Usage

```typescript
import { ourFileRouter } from "./router";

// Use in your Next.js API route
export { ourFileRouter as GET, ourFileRouter as POST } from "uploadthing/next";
```
