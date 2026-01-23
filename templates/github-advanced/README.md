# GitHub Advanced Integration

Create issues, releases, and comment on PRs.

## Environment Variables

```env
GITHUB_TOKEN=ghp_xxx
```

## Usage

### Create Issue
```typescript
import { createIssue } from "./issues";

const issue = await createIssue("owner", "repo", "Bug: Login broken", "Steps to reproduce...");
```

### Create Release
```typescript
import { createRelease } from "./releases";

const release = await createRelease("owner", "repo", "v1.0.0", "## What's New\n- Feature A\n- Bug fix B");
```

### Comment on Issue/PR
```typescript
import { commentOnIssue } from "./comments";

await commentOnIssue("owner", "repo", 123, "Thanks for reporting! Fixed in #124");
```

## Token Permissions

Required scopes:
- `repo` - Full control of private repositories
- `public_repo` - Access public repositories only
