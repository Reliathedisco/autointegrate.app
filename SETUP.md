# AutoIntegrate Setup Guide

## Quick Start

Follow these steps to configure and run AutoIntegrate:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Copy this template and fill in your actual values
cp .env.example .env
```

Then edit `.env` with your actual credentials:

#### Required Variables:

**Database (PostgreSQL)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/autointegrate
```
- Install PostgreSQL if you haven't already
- Create a database named `autointegrate`
- Update the connection string with your credentials

**Server Configuration**
```env
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:5000
API_URL=http://localhost:3001
SESSION_SECRET=generate_a_random_32_character_string_here
```

**GitHub Integration**
```env
GITHUB_TOKEN=ghp_your_github_token_here
```
- Get your token from: https://github.com/settings/tokens
- Required scopes: `repo`, `workflow`

**OpenAI (for AI Assistant)**
```env
OPENAI_API_KEY=sk_your_openai_key_here
```
- Get your API key from: https://platform.openai.com/api-keys

#### Optional Variables (for additional features):

**Stripe (for billing)**
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here
```
- Get your keys from: https://dashboard.stripe.com/apikeys

**Clerk (for authentication)**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```
- Get your keys from: https://dashboard.clerk.com/

### 3. Set Up Database

Run Drizzle migrations to set up your database schema:

```bash
npm run db:push
```

### 4. Run the Application

Start both the server and client in development mode:

```bash
npm run dev
```

This will start:
- **API Server** on http://localhost:3001
- **Client UI** on http://localhost:5000

### 5. Access the Application

Open your browser and navigate to:
- **Dashboard**: http://localhost:5000
- **API Health**: http://localhost:3001/api/health

---

## Production Deployment

### Build the Application

```bash
npm run build
```

This creates production-ready files in the `dist/` directory.

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Make sure to update these in your production `.env`:

```env
NODE_ENV=production
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com
DATABASE_URL=postgresql://user:password@production-host:5432/autointegrate
SESSION_SECRET=use_a_strong_random_secret_here
```

---

## Troubleshooting

### Database Connection Issues

If you get database errors:
1. Make sure PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Verify the database exists: `psql -l`

### Port Already in Use

If port 3001 or 5000 is in use, update the PORT in `.env`:
```env
PORT=8080  # or any available port
```

And update the Vite proxy in `vite.config.ts` to match.

### GitHub Token Issues

If GitHub integration fails:
1. Verify your token has the correct scopes: `repo`, `workflow`
2. Check the token hasn't expired
3. Test the token: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

### OpenAI API Issues

If AI features aren't working:
1. Verify your API key is valid
2. Check you have credits in your OpenAI account
3. Test the key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

---

## Additional Configuration

### Tailwind CSS

The project uses Tailwind CSS. Configuration is in:
- `tailwind.config.ts` (root level)
- `client/components.json` (shadcn/ui components)

### TypeScript

TypeScript configuration:
- `tsconfig.json` (server-side)
- `client/tsconfig.json` (client-side)

### Vite

Vite configuration for the client build:
- `vite.config.ts`

---

## Support

For issues or questions:
1. Check the main README.md
2. Review the API documentation in README.md
3. Check the logs in the console for error messages

---

## Next Steps

After setup:
1. Visit the Dashboard at http://localhost:5000
2. Create your first integration job
3. Explore the templates library
4. Try the sandbox viewer
5. Configure billing (optional)
6. Set up authentication (optional)
