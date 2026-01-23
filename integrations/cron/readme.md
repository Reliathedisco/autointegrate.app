# Cron Worker Integration

Scheduled tasks and background jobs.

## Templates

- `init.ts` - Task registry
- `task.ts` - Example tasks and API route

## Scheduling Options

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    { "path": "/api/cron?task=cleanup", "schedule": "0 0 * * *" }
  ]
}
```

### GitHub Actions
```yaml
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://yourapp.com/api/cron?task=cleanup
```
