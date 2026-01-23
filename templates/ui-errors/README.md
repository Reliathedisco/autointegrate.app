# Error + Maintenance Pages

Clean error handling UI for Next.js.

## Usage

```
app/error.tsx       → ErrorPage (catches runtime errors)
app/not-found.tsx   → NotFound (404 page)
app/maintenance.tsx → Maintenance (during deployments)
```

## Error Boundary

Next.js automatically uses `error.tsx` as an error boundary.
The `reset` function allows users to retry the failed operation.

## Maintenance Mode

To enable maintenance mode, redirect all traffic to `/maintenance`:

```typescript
// middleware.ts
export function middleware(req) {
  if (process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }
}
```
