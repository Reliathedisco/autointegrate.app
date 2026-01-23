# Configuration Checklist for AutoIntegrate

## ✅ Configuration Status

Use this checklist to ensure all files are properly configured.

---

## 1. Environment Variables (.env)

**Status:** ⚠️ **ACTION REQUIRED** - You need to create this file manually

**Location:** `/Users/shirrelziv/.cursor/worktrees/Autointegrate/exq/.env`

**Action:**
```bash
# Copy the example file and edit with your values
cp .env.example .env
```

Then edit `.env` and replace the placeholder values with your actual credentials.

### Required Variables:
- [  ] `DATABASE_URL` - PostgreSQL connection string
- [  ] `GITHUB_TOKEN` - GitHub personal access token
- [  ] `OPENAI_API_KEY` - OpenAI API key
- [  ] `SESSION_SECRET` - Random string for session encryption

### Optional Variables (enable specific features):
- [  ] `STRIPE_SECRET_KEY` - For billing features
- [  ] `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- [  ] `CLERK_SECRET_KEY` - For authentication
- [  ] `VITE_CLERK_PUBLISHABLE_KEY` - For authentication

---

## 2. Database Setup

**Status:** ⚠️ **ACTION REQUIRED** - Database must be created and configured

### Steps:

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS with Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   
   # Or use PostgreSQL.app from postgresapp.com
   ```

2. **Create Database**
   ```bash
   createdb autointegrate
   ```

3. **Update DATABASE_URL in .env**
   ```env
   DATABASE_URL=postgresql://your_username@localhost:5432/autointegrate
   ```

4. **Run Migrations**
   ```bash
   npm run db:push
   ```

---

## 3. Package Dependencies

**Status:** ✅ **CONFIGURED** - package.json exists

**Action:**
```bash
npm install
```

---

## 4. TypeScript Configuration

**Status:** ✅ **CONFIGURED**

Files configured:
- ✅ `tsconfig.json` - Server TypeScript config
- ✅ `client/tsconfig.json` - Client TypeScript config

---

## 5. Build Tools Configuration

**Status:** ✅ **CONFIGURED**

Files configured:
- ✅ `vite.config.ts` - Vite build configuration
- ✅ `tailwind.config.ts` - Tailwind CSS configuration
- ✅ `postcss.config.cjs` - PostCSS configuration
- ✅ `drizzle.config.ts` - Database ORM configuration

---

## 6. Git Configuration

**Status:** ✅ **CONFIGURED**

Files configured:
- ✅ `.gitignore` - Git ignore patterns

---

## 7. Server Configuration

**Status:** ✅ **CONFIGURED**

Files configured:
- ✅ `server/config.ts` - Server configuration
- ✅ `server/index.ts` - Express server setup

**Note:** Server reads from environment variables automatically.

---

## 8. API Credentials Setup

### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy token and add to `.env` as `GITHUB_TOKEN`

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key and add to `.env` as `OPENAI_API_KEY`

### Stripe (Optional)
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Secret key" and add to `.env` as `STRIPE_SECRET_KEY`
3. For webhooks: Install Stripe CLI and run `stripe listen`

### Clerk (Optional)
1. Go to https://dashboard.clerk.com/
2. Create a new application
3. Copy publishable and secret keys to `.env`

---

## 9. Port Configuration

**Status:** ✅ **CONFIGURED**

Current configuration:
- **API Server:** Port 3001 (configured in `.env` via `PORT`)
- **Client Dev Server:** Port 5000 (configured in `vite.config.ts`)
- **Client Proxy:** Proxies `/api` requests to `http://localhost:3001`

To change ports:
1. Update `PORT` in `.env` for API server
2. Update `server.port` in `vite.config.ts` for client
3. Update `proxy.target` in `vite.config.ts` to match API port

---

## 10. Running the Application

After completing the above steps:

### Development Mode
```bash
# Start both server and client
npm run dev

# Or start separately
npm run dev:server  # API on port 3001
npm run dev:client  # Client on port 5000
```

### Production Mode
```bash
# Build
npm run build

# Start
npm start
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)
```

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `psql -l | grep autointegrate`

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors
```bash
# Rebuild TypeScript
npm run build:server
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Then edit .env with your credentials

# 3. Set up database
npm run db:push

# 4. Start development server
npm run dev
```

Access the app at:
- **Frontend:** http://localhost:5000
- **API:** http://localhost:3001/api

---

## Files Created/Updated in This Configuration

✅ `.env.example` - Environment variables template
✅ `.gitignore` - Git ignore patterns
✅ `SETUP.md` - Detailed setup guide
✅ `CONFIG_CHECKLIST.md` - This checklist

**Next step:** Create your `.env` file with actual credentials!
