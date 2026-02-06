# Setup New Credentials

## Current Status
✅ Security fixes deployed
✅ Clerk removed from Vercel
✅ JWT_SECRET, RESEND_API_KEY, FROM_EMAIL added to Vercel
✅ Git history cleaned
✅ Frontend and API working

## What You Need to Update

### 1. Neon Database Password (URGENT)

**Reset in Neon:**
1. Go to https://console.neon.tech
2. Select your project
3. Go to **Settings** → **Reset password**
4. Copy the new `DATABASE_URL`

**Then update Vercel:**
```bash
# Remove old DATABASE_URL
vercel env rm DATABASE_URL

# Add new one (I'll help you with this - just paste the new URL)
```

### 2. Resend API Key (URGENT)

**Reset in Resend:**
1. Go to https://resend.com/api-keys
2. Delete old key: `re_d3Jy2isD_dDyLYTG9LaVn37D6mjDNgwCU`
3. Create new API key
4. Copy it

**Then update Vercel:**
```bash
# Remove old RESEND_API_KEY
vercel env rm RESEND_API_KEY

# Add new one (I'll help you with this - just paste the new key)
```

### 3. Verify FROM_EMAIL

Your Resend account needs to verify the sender email. Options:

**Option A: Use Resend default (works immediately)**
- `FROM_EMAIL=onboarding@resend.dev`
- No verification needed
- Good for testing

**Option B: Use your domain (requires DNS setup)**
- `FROM_EMAIL=noreply@autointegrate.app`
- Requires adding Resend DNS records
- Better for production

I can help you set either option.

## What's Already Configured

✅ `JWT_SECRET` - For secure session tokens
✅ `SESSION_SECRET` - For Express sessions
✅ `STRIPE_SECRET_KEY` - For payments
✅ `STRIPE_WEBHOOK_SECRET` - For webhooks
✅ `STRIPE_PRO_PRICE_ID` - For checkout
✅ `STRIPE_PAYMENT_LINK` - Fallback payment link
✅ `APP_URL` - Your app URL
✅ `GITHUB_TOKEN` - For GitHub integration
✅ `OPENAI_API_KEY` - For AI features

## Next Steps

1. **Give me your new credentials:**
   - New `DATABASE_URL` from Neon
   - New `RESEND_API_KEY` from Resend

2. **I'll update Vercel for you**

3. **Test the complete flow:**
   - Magic link login
   - Payment with promo codes
   - Dashboard access

Ready when you are!
