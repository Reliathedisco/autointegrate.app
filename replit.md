# AutoIntegrate

## Overview
AutoIntegrate is a full-stack web application that helps developers quickly integrate various APIs and services into their projects. It provides a dashboard for managing integration jobs, code templates, and a sandbox environment for previewing integrations.

## Project Architecture

### Frontend (Vite + React)
- **Location**: `client/`
- **Port**: 5000 (development)
- **Technology**: React 18, React Router, TailwindCSS, Monaco Editor

### Backend (Express.js)
- **Location**: `server/`
- **Port**: 3001 (development)
- **Technology**: Express.js, TypeScript

### Key Directories
- `client/src/` - React frontend components and routes
- `server/` - Express backend with API routes
- `integrations/` - Integration definitions and templates
- `templates/` - Code templates for various services
- `landing/` - Landing page (separate Vite app)
- `sandbox/` - Sandbox environment for testing integrations

## Scripts
- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:client` - Run frontend only
- `npm run dev:server` - Run backend only
- `npm run build` - Build for production
- `npm run start` - Start production server

## Configuration
- Frontend proxies `/api` requests to the backend
- Backend serves API routes under `/api/*`

## Compatibility System
The application includes an integration compatibility and conflict detection system:

### How it works
1. Each integration can optionally define a `compatibility.json` file with:
   - `supportedFrameworks`: List of supported frameworks (nextjs, express, etc.)
   - `incompatibleIntegrations`: List of integrations that conflict
   - `overlappingFeatures`: Features that overlap with other integrations
   - `requires`: Required frameworks/ORM/auth providers
   - `softDependencies`: Suggested companion integrations

2. The system analyzes the target repo to detect:
   - Framework (via package.json dependencies)
   - Existing integrations
   - ORM, auth, and database usage

3. API endpoints:
   - `POST /api/integrations/compatibility` - Check compatibility for selected integrations
   - `POST /api/integrations/generate` - Now includes compatibility warnings
   - `POST /api/integrations/summary` - Now includes compatibility warnings

4. Warnings are displayed in the frontend before applying integrations

### Adding compatibility rules
Create a `compatibility.json` file in the integration folder (e.g., `integrations/stripe/compatibility.json`)

## Stack Mode
Stack Mode allows users to quickly select pre-configured bundles of integrations.

### How it works
1. Predefined stacks are defined in the `stacks/` directory as JSON files
2. Each stack includes:
   - `id`: Unique identifier (matches filename)
   - `name`: Display name
   - `description`: What this stack is for
   - `category`: Category (starter, ai, ecommerce, etc.)
   - `integrations`: Array of integration IDs to include
   - `configDefaults`: Optional default configuration values

### Available Stacks
- **SaaS Starter**: stripe, clerk, resend - For building SaaS applications
- **AI App**: openai, anthropic - For AI-powered applications
- **Full Stack**: supabase, clerk, stripe - Complete full-stack setup
- **E-Commerce**: stripe, sendgrid - For online stores

### API endpoint
- `GET /api/stacks` - List all available stacks
- `GET /api/stacks/:id` - Get a specific stack

### Frontend behavior
- Stacks are shown in a "Quick Start Stacks" section on the Integrations page
- "Preview" button shows included integrations, files to be generated, and compatibility warnings
- "Use Stack" button adds all stack integrations to the current selection (additive)
- Stack mode works alongside individual integration selection

### Adding new stacks
Create a JSON file in the `stacks/` directory (e.g., `stacks/my-stack.json`)

## Environment Variable Validation
The system validates environment variables after generating integration code.

### How it works
1. Extended metadata is defined in `integrations/env-requirements.json` with:
   - `description`: What the variable is for
   - `required`: Whether it's required or optional
   - `format`: Optional regex pattern for validation (e.g., `regex:^sk_test_.*$`)
   - `example`: Example value format
   - `setupSteps`: Array of instructions for getting the value
   - `dashboardUrl`: Link to the provider's dashboard

2. Validation is triggered:
   - After generating integration code via `/api/integrations/generate`
   - After applying integrations in sandbox via `/api/sandbox/apply`
   - Standalone via `POST /api/integrations/env/validate`

3. The system reads `.env`, `.env.local`, `.env.development` files from the target repo

4. Returns structured report with:
   - Per-variable status (missing, invalid, ok)
   - Setup instructions and dashboard links
   - Summary counts

5. UI displays validation panel in stack preview modal and sandbox diff view

### Important
- Validation is non-blocking - informs but doesn't prevent generation
- No secret values are ever logged - only presence/absence is checked
- Format validation is optional and light-touch

## Recent Changes
- Configured for Replit environment
- Frontend bound to 0.0.0.0:5000 with proxy support
- Backend running on localhost:3001
- Fixed /integrations page: removed duplicate hardcoded route in server/routes/api.ts that was overriding the proper integrations route
- Added error state, empty state, and loading animation to Integrations component
- Added defensive coding for malformed integration data
- Added integration compatibility and conflict detection system
- Added compatibility.json files for stripe, clerk, supabase, openai, anthropic, mongodb, redis
- Added Stack Mode with 4 predefined stacks (SaaS Starter, AI App, Full Stack, E-Commerce)
- Stack preview modal shows included integrations, files to be generated, and compatibility warnings
- Added environment variable validation system with setup guidance and dashboard links
- EnvValidation component displays in stack preview modal and sandbox diff view
- Added "Explain This Code" feature with AI-powered explanations and caching
- Added integration version awareness with upgrade suggestions and breaking change warnings
- Added public sandbox demo mode with sample repos for instant value without auth

## Explain This Code
AI-powered explanations for generated files in the sandbox.

### How it works
1. Click "Explain This Code" button when viewing a generated file
2. AI explains: why the file exists, what it does, what's safe to modify
3. Explanations are cached per file content (MD5 hash) to avoid repeated API calls

### API endpoint
- `POST /api/sandbox/explain` - Takes sessionId, filePath; returns cached or new explanation

## Integration Version Awareness
Detects outdated integrations and provides safe upgrade previews.

### How it works
1. Each integration has a "version" field in integrations.json
2. Breaking changes documented in `integrations/upgrade-notes.json`
3. Upgrade badges appear on outdated integration cards
4. Click badge to see: before/after diff, breaking change warnings, migration notes

### API endpoints
- `POST /api/integrations/check-upgrades` - Check for outdated integrations
- `GET /api/integrations/:id/upgrade-preview` - Get upgrade diff preview

### Important
- No auto-apply: upgrades require explicit user confirmation
- Breaking changes prominently displayed with warning styling

## Demo Mode
Public sandbox demo for instant value without GitHub authentication.

### How it works
1. Sample repos defined in `demo/sample-repos.json`
2. Users can try demo mode without any authentication
3. Demo sessions disable commit/PR functionality
4. Diff preview and ZIP export work normally

### Sample repos
- Next.js Starter, Express API, React+Vite, Flask API

### API endpoints
- `GET /api/demo/repos` - List available sample repos
- `POST /api/demo/load` - Create demo sandbox session

### Golden Path (Auto-load)
- Dashboard "Try Demo" links to `/sandbox?demo=true&autoload=nextjs-starter`
- Auto-loads Next.js Starter repo without showing selector
- Pre-selects Stripe integration as recommended first choice
- Stripe shows "Recommended" badge and time-saved hint

### Micro-copy
- Near Apply button: "This integration usually takes ~2 hours to do by hand."
- After diff renders: "AutoIntegrate generated this in seconds. Review every line before committing."

### UI behavior
- "Try Demo Mode" button on sandbox page
- Demo Mode badge clearly visible in header
- Commit button hidden/disabled with helpful message

## Usage Metrics
Tracks integrations generated and estimated time saved.

### How it works
1. Metrics recorded when integrations are generated or applied in sandbox
2. Stored in metrics/data.json (no PII - just integration IDs and timestamps)
3. Time saved is configurable per integration type in server/metrics/config.ts

### Default time estimates
- Stripe: 45 minutes
- Clerk: 60 minutes
- Supabase: 40 minutes
- OpenAI: 30 minutes
- Default: 30 minutes

### API endpoints
- `GET /api/metrics/public` - Returns aggregated public stats (read-only)
- `GET /api/metrics/config` - Returns time saved configuration

### Dashboard display
- Integrations added this week
- Hours saved this month
- Total integrations (all time)
- Total hours saved (all time)

## Authentication (Replit Auth)
User authentication powered by Replit's OpenID Connect.

### How it works
1. Replit Auth uses OIDC with the canonical domain `https://autointegrate--reli2.replit.app`
2. AuthGuard component protects routes and shows login for unauthenticated users
3. User data stored in database with `hasPaid` field for payment status
4. `/api/me` is the single source of truth for user and payment status

### Key files
- `server/replit_integrations/auth/replitAuth.ts` - OIDC setup and auth middleware
- `server/replit_integrations/auth/storage.ts` - User database operations (protects hasPaid field)
- `server/replit_integrations/auth/routes.ts` - `/api/me` and `/api/me/refresh` endpoints
- `client/src/components/AuthGuard.tsx` - Auth protection, shows login or dashboard+banner
- `client/src/hooks/use-auth.ts` - React hook fetching from `/api/me`
- `client/src/components/PaymentBanner.tsx` - Banner shown to unpaid users

### API endpoints
- `GET /api/me` - Returns `{ user, hasPaid: boolean }` - single source of truth
- `POST /api/me/refresh` - Re-checks payment status from database

### Usage in components
```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, hasPaid, isLoading, isAuthenticated, refreshPaymentStatus, logout } = useAuth();
  // ... render based on auth state
}
```

### Payment gating
- Authenticated users can always access the dashboard
- Unpaid users see a PaymentBanner at the top of the page (soft gating)
- Billing page has "Refresh Access" escape hatch for users who paid but are stuck
- Payment status tracked via `users.hasPaid` database field (varchar "true"/"false")
- CRITICAL: Only Stripe webhook can set `hasPaid = "true"` - auth system NEVER touches this field

### Stripe Integration
- Payment Link: `https://buy.stripe.com/7sYaEZ1lP5KX9N0gQ47g401` ($29 one-time)
- Webhook handles `checkout.session.completed` events
- Webhook uses `client_reference_id` (user ID) or email fallback to find user
- Webhook logs: timestamps, event type, session ID, user ID, payment status
