# Notion Integration

Add pages + append content blocks.

## Environment Variables

```env
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxx
```

## Usage

### Create Page
```typescript
import { createPage } from "./createPage";

const page = await createPage("Meeting Notes - Dec 2024");
```

### Append Block
```typescript
import { appendBlock } from "./appendBlock";

await appendBlock(pageId, "This is a new paragraph added to the page.");
```

## Setup

1. Create integration at https://www.notion.so/my-integrations
2. Share database with your integration
3. Copy Database ID from the URL
