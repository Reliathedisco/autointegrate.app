# Supabase Storage Integration

Upload files to Supabase buckets.

## Environment Variables

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

## Bucket Configuration

This template uses a bucket named `uploads`. Make sure to create it in your Supabase dashboard.

## Usage

```typescript
import { supabase } from "./client";

const { data, error } = await supabase.storage
  .from("uploads")
  .upload("my-file.png", fileBuffer, {
    contentType: "image/png",
  });
```
