# NextAuth Email (Magic Link) Setup

This doc describes the environment variables and deployment notes for the NextAuth email (magic link) integration.

Required environment variables:

- NEXTAUTH_URL: e.g. https://your-deployed-url.example
- NEXTAUTH_SECRET: a long random hex string (e.g. `openssl rand -hex 32`)
- EMAIL_SERVER_HOST: SMTP host (e.g. smtp.sendgrid.net)
- EMAIL_SERVER_PORT: SMTP port (e.g. 587)
- EMAIL_SERVER_USER: SMTP username (for SendGrid use "apikey")
- EMAIL_SERVER_PASSWORD: SMTP password or API key
- EMAIL_FROM: sender (e.g. "AutoIntegrate <no-reply@yourdomain.com>")

Replit Spark deployment notes:

- Add the above env vars to the Replit secrets panel.
- Ensure NEXTAUTH_URL matches the public URL users will click links from.
- Make sure `/api/auth/*` is not intercepted by other middleware or express routes (the repo contains a Replit OIDC express middleware that redirects to a canonical domain; allowlist `/api/auth` or adjust that middleware accordingly).
- Ensure HTTPS is enabled (cookies with secure flag require https).

Optional:
- Add an adapter (Prisma) if you want persistent user/account storage.
- Customize the email template by providing a `sendVerificationRequest` in the EmailProvider config.
