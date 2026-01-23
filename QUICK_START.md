# ⚡ Quick Start Guide

Get AutoIntegrate up and running in 5 minutes!

---

## 🎯 One-Command Setup

```bash
./setup.sh
```

This automated script will:
- ✅ Create `.env` from template
- ✅ Install all npm dependencies  
- ✅ Check PostgreSQL installation
- ✅ Optionally create database
- ✅ Guide you through configuration

---

## 📋 Manual Setup (Alternative)

If you prefer manual setup or the script doesn't work:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Then edit `.env` and add your credentials (minimum required):
```env
DATABASE_URL=postgresql://localhost/autointegrate
GITHUB_TOKEN=ghp_your_token_here
OPENAI_API_KEY=sk_your_key_here
SESSION_SECRET=your_random_secret
```

### 3. Set Up Database
```bash
# Create database (PostgreSQL must be running)
createdb autointegrate

# Run migrations
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 🌐 Access the Application

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5000 | Main application UI |
| **API** | http://localhost:3001 | REST API server |
| **Sandbox** | http://localhost:3001/sandbox | Code preview sandbox |

---

## 🔑 Getting API Keys

### GitHub Token (Required)
1. Visit https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo`, `workflow`
4. Copy token → Add to `.env` as `GITHUB_TOKEN`

### OpenAI API Key (Required)
1. Visit https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy key → Add to `.env` as `OPENAI_API_KEY`

### Stripe (Optional - for billing)
1. Visit https://dashboard.stripe.com/apikeys
2. Copy **"Secret key"** → Add to `.env` as `STRIPE_SECRET_KEY`

### Clerk (Optional - for auth)
1. Visit https://dashboard.clerk.com/
2. Create application
3. Copy keys → Add to `.env`

---

## 🎨 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client in dev mode |
| `npm run dev:server` | Start only the API server (port 3001) |
| `npm run dev:client` | Start only the frontend (port 5000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Run database migrations |

---

## ✅ Verify Setup

After starting the dev server, check:

1. **API Health Check**
   ```bash
   curl http://localhost:3001/api
   ```
   Should return: `{"ok": true, ...}`

2. **Frontend Loads**
   - Open http://localhost:5000
   - You should see the dashboard

3. **Database Connection**
   ```bash
   npm run db:push
   ```
   Should complete without errors

---

## 🆘 Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
kill -9 $(lsof -ti:3001)

# Kill process on port 5000
kill -9 $(lsof -ti:5000)
```

### PostgreSQL Not Running
```bash
# macOS with Homebrew
brew services start postgresql@15

# Check status
pg_isready
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Ensure database exists: `psql -l | grep autointegrate`

---

## 📚 More Information

- **Detailed Setup:** See `SETUP.md`
- **Configuration Checklist:** See `CONFIG_CHECKLIST.md`
- **API Documentation:** See `README.md`

---

## 🎉 You're Ready!

Once running, you can:
- ✨ Create integration jobs
- 🔧 Browse templates
- 🎯 Generate code
- 🌲 Preview in sandbox
- 🚀 Create GitHub PRs

**Happy coding!** 🚀
