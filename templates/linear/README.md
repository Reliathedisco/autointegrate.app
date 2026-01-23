# Linear Integration

Create issues and comments using the Linear GraphQL API.

## Environment Variables

```env
LINEAR_API_KEY=lin_api_xxx
```

## Usage

### Create Issue
```typescript
import { createLinearIssue } from "./createIssue";

const issue = await createLinearIssue(
  "team-id-here",
  "Fix authentication bug",
  "Users are getting logged out unexpectedly"
);
```

### Custom GraphQL Query
```typescript
import { linearRequest } from "./client";

const teams = await linearRequest(`
  query {
    teams {
      nodes {
        id
        name
      }
    }
  }
`);
```

## Setup

1. Go to Linear Settings → API
2. Create Personal API Key
3. Copy your Team ID from the URL
