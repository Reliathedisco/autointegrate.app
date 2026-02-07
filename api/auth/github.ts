import type { VercelRequest, VercelResponse } from '@vercel/node';

function getCallbackURL(req: VercelRequest): string {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  // Use production URL in production
  if (isProduction && process.env.PRODUCTION_URL) {
    return `${process.env.PRODUCTION_URL}/api/auth/github/callback`;
  }
  
  // Use APP_URL if set
  if (process.env.APP_URL) {
    return `${process.env.APP_URL}/api/auth/github/callback`;
  }
  
  // Fallback to request host
  const host = req.headers.host || 'localhost:4000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/api/auth/github/callback`;
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

// GitHub OAuth - Initiate flow
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    return res.status(503).json({ error: 'GitHub OAuth not configured' });
  }

  const callbackUrl = getCallbackURL(req);

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'user:email');
  githubAuthUrl.searchParams.set('state', generateState());

  return res.redirect(302, githubAuthUrl.toString());
}
