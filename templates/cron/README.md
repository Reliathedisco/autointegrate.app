# Cron Jobs Template

Scheduled tasks using API endpoints + external cron.

## How It Works

1. Deploy this route as `/api/cron`
2. Use an external scheduler to hit the endpoint
3. Tasks run on schedule

## Usage

```bash
# Run cleanup task
curl https://yourapp.com/api/cron?task=cleanup

# Run reports task
curl https://yourapp.com/api/cron?task=reports
```

## Scheduling Options

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron?task=cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### GitHub Actions
```yaml
name: Nightly Cleanup
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://yourapp.com/api/cron?task=cleanup
```

### Cronitor / EasyCron
Just add your endpoint URL and set the schedule.

## Adding New Tasks

1. Create a task in `/tasks/`:
```typescript
export const myTask = async () => {
  // Your logic here
  return { ok: true };
};
```

2. Add to `route.ts` switch statement
