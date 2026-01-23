# 🎯 START HERE

Welcome to **AutoIntegrate**! This guide will get you up and running quickly.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Run the Setup Script
```bash
./setup.sh
```

This will:
- Create your `.env` file
- Install dependencies
- Check PostgreSQL
- Guide you through database setup

### Step 2: Add Your API Keys

Edit the `.env` file that was created:

```bash
# Open in your editor
open .env
# or
code .env
# or
nano .env
```

Add these **required** keys:
```env
DATABASE_URL=postgresql://localhost/autointegrate
GITHUB_TOKEN=ghp_your_token_here          # Get from github.com/settings/tokens
OPENAI_API_KEY=sk_your_key_here           # Get from platform.openai.com/api-keys
SESSION_SECRET=random_string_here         # Generate: openssl rand -base64 32
```

### Step 3: Start the App
```bash
npm run dev
```

Visit **http://localhost:5000** 🎉

---

## 📚 Need More Help?

### By Experience Level

**Beginner?** → Read `QUICK_START.md` (5-minute guide)

**Intermediate?** → Read `SETUP.md` (detailed instructions)

**Advanced?** → Check `CONFIG_CHECKLIST.md` (complete reference)

### By Task

| I want to... | Read this |
|--------------|-----------|
| Get running fast | `QUICK_START.md` |
| Understand everything | `SETUP.md` |
| Check my configuration | `CONFIG_CHECKLIST.md` |
| See what's configured | `CONFIGURATION_SUMMARY.md` |
| Learn about the project | `README.md` |

---

## 🔑 Where to Get API Keys

### GitHub Token (Required)
https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select scopes: `repo`, `workflow`

### OpenAI API Key (Required)
https://platform.openai.com/api-keys
- Click "Create new secret key"

### Stripe (Optional - for billing)
https://dashboard.stripe.com/apikeys

### Clerk (Optional - for auth)
https://dashboard.clerk.com/

---

## ⚡ Common Commands

```bash
# Start development (both server & client)
npm run dev

# Start only server
npm run dev:server

# Start only client
npm run dev:client

# Build for production
npm run build

# Run database migrations
npm run db:push
```

---

## 🆘 Troubleshooting

### "Port already in use"
```bash
kill -9 $(lsof -ti:3001)  # Kill API server
kill -9 $(lsof -ti:5000)  # Kill client dev server
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@15
```

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verify Everything Works

After setup:

1. **API is running:**
   ```bash
   curl http://localhost:3001/api
   ```
   Should return: `{"ok": true, ...}`

2. **Frontend loads:**
   Open http://localhost:5000

3. **Database connected:**
   ```bash
   npm run db:push
   ```
   Should complete without errors

---

## 🎯 What You Get

- ✨ Integration job engine
- 🔧 50+ built-in templates
- 🌲 Code preview sandbox
- 🚀 Automated GitHub PRs
- 🤖 AI-powered assistant
- 💳 Stripe billing (optional)
- 🔐 Clerk auth (optional)

---

## 📖 Full Documentation

- `QUICK_START.md` - 5-minute quick start
- `SETUP.md` - Detailed setup guide
- `CONFIG_CHECKLIST.md` - Configuration checklist
- `CONFIGURATION_SUMMARY.md` - Overview of all config
- `README.md` - Project documentation & API reference

---

## 🎉 Ready to Go!

Once your `.env` is configured:

```bash
npm run dev
```

Then visit:
- **Dashboard:** http://localhost:5000
- **API:** http://localhost:3001

**Happy coding!** 🚀

---

*Last updated: January 2026*
