# 🚀 AutoIntegrate

AutoIntegrate is a full automated integration engine for developers.
It generates code, creates PRs, manages templates, and provides a live sandbox.

## Features

### ✅ Integration Job Engine  
Create jobs, process templates, generate code, commit branches, create PRs.

### ✅ GitHub Automation  
Branch creation, file injection, pull request creation.

### ✅ Template System  
Built-in templates (Stripe, Clerk, OpenAI, Supabase, Resend) + 50+ custom templates.

### ✅ Worker Queue  
Processes tasks in the background with automatic retries.

### ✅ AI Assistant  
Explains integration errors and gives environment variable instructions.

### ✅ Sandbox Viewer  
Preview all generated files via a browser-based IDE with:
- Repository tree viewer
- Code diff previewer
- Integration sidebar
- Export to ZIP
- Apply changes with visual diff

### ✅ Full UI Dashboard  
React + Tailwind + Vite frontend with:
- Dashboard with stats and quick actions
- Jobs management
- Templates browser
- Integrations picker
- Settings page
- Billing management (Stripe)

### ✅ Authentication  
Clerk-ready authentication wrapper with social logins.

### ✅ Billing  
Stripe integration with checkout, subscription management, and customer portal.

---

## Development

- Server runs on **http://localhost:5005**
- Client runs on **http://localhost:5001**

### Scripts

- `npm install` — install dependencies.
- `npm run dev` — run Express API and Vite dev server together.
- `npm run build` — build client (Vite) and server (tsc) into `dist/`.
- `npm start` — serve compiled API from `dist/server`.

### Folder structure

```
autointegrate/
├── server/                    # Express API (TypeScript)
│   ├── routes/               # API endpoints
│   │   ├── api.ts
│   │   ├── jobs.ts
│   │   ├── templates.ts
│   │   ├── github.ts
│   │   ├── ai.ts
│   │   ├── sandbox.ts        # Sandbox session management
│   │   ├── integrations.ts   # Integration listing
│   │   └── billing.ts        # Stripe billing
│   ├── sandbox/              # Sandbox services
│   │   ├── service.ts        # Core sandbox logic
│   │   ├── temp.ts           # Temp directory management
│   │   └── diff.ts           # Diff engine
│   ├── worker/               # Background job processing
│   ├── integrations/         # Integration generation
│   └── utils/                # Utilities
├── client/                   # React + Vite + Tailwind UI
│   └── src/
│       ├── routes/           # Page components
│       │   ├── Dashboard.tsx
│       │   ├── Jobs.tsx
│       │   ├── Templates.tsx
│       │   ├── Sandbox.tsx
│       │   ├── Integrations.tsx
│       │   ├── Settings.tsx
│       │   └── Billing.tsx
│       └── components/       # Reusable components
│           ├── FileTree.tsx
│           ├── DiffViewer.tsx
│           ├── IntegrationSidebar.tsx
│           ├── AuthWrapper.tsx
│           └── UserMenu.tsx
├── shared/                   # Shared utilities and types
├── templates/                # Integration templates
├── integrations/             # Integration definitions
└── sandbox/                  # Generated output and previews
```

---

## Environment Variables

Create a `.env` file with (or copy `env.example` → `.env`):

```env
# Server
PORT=5005

# GitHub
GITHUB_TOKEN=ghp_xxx

# OpenAI (for AI assistant)
OPENAI_API_KEY=sk-xxx

# Stripe (optional, for billing)
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PAYMENT_PRICE_ID=price_xxx

# Clerk (optional, for auth)
VITE_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx

# App URL (for redirects)
APP_URL=http://localhost:5001
```

---

## API Endpoints

### Sandbox
- `POST /api/sandbox/load` - Load a repository into sandbox
- `POST /api/sandbox/apply` - Apply integrations (preview diffs)
- `POST /api/sandbox/commit` - Commit changes to sandbox
- `GET /api/sandbox/session/:id` - Get session info
- `GET /api/sandbox/session/:id/file` - Read file from session
- `GET /api/sandbox/session/:id/export` - Export as ZIP
- `DELETE /api/sandbox/session/:id` - Delete session

### Integrations
- `GET /api/integrations` - List all integrations
- `GET /api/integrations/categories` - List categories
- `GET /api/integrations/:name` - Get integration details
- `POST /api/integrations/generate` - Generate files

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job status

### Billing
- `POST /api/billing/checkout` - Create Stripe checkout
- `POST /api/stripe/webhook` - Stripe webhook (raw body)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT
