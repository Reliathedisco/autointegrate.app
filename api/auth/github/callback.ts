import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../../../server/db.js';
import { users } from '../../../shared/models/auth.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRY = '30d';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query;

  if (error) {
    console.error('[GitHub Callback] OAuth error:', error);
    return res.redirect('/?error=auth_denied');
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?error=no_code');
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[GitHub Callback] Missing GitHub credentials');
    return res.redirect('/?error=config_error');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[GitHub Callback] No access token received:', tokenData);
      return res.redirect('/?error=token_error');
    }

    // Get user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const githubUser: GitHubUser = await userResponse.json();

    // Get user emails (in case primary email is private)
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });

      const emails: GitHubEmail[] = await emailsResponse.json();
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email || `${githubUser.login}@github.local`;
    }

    // Upsert user in database
    const githubId = String(githubUser.id);
    
    // Check if user exists by GitHub ID first, then by email
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId))
      .then(rows => rows[0]);

    if (!existingUser && email) {
      existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .then(rows => rows[0]);
    }

    let user;

    if (existingUser) {
      // Update existing user
      [user] = await db
        .update(users)
        .set({
          githubId,
          profileImageUrl: githubUser.avatar_url || existingUser.profileImageUrl,
          firstName: githubUser.name?.split(' ')[0] || existingUser.firstName,
          lastName: githubUser.name?.split(' ').slice(1).join(' ') || existingUser.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      console.log(`[GitHub Callback] Updated user ${user.id} (${user.email})`);
    } else {
      // Create new user
      [user] = await db
        .insert(users)
        .values({
          email,
          githubId,
          firstName: githubUser.name?.split(' ')[0] || githubUser.login,
          lastName: githubUser.name?.split(' ').slice(1).join(' ') || null,
          profileImageUrl: githubUser.avatar_url || null,
          hasPaid: false,
        })
        .returning();

      console.log(`[GitHub Callback] Created user ${user.id} (${user.email})`);
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Set auth cookie
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const cookieOptions = [
      `auth_session=${sessionToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${30 * 24 * 60 * 60}`, // 30 days
    ];
    
    if (isProduction) {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    // Redirect based on payment status
    const redirectUrl = user.hasPaid ? '/' : '/billing';
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('[GitHub Callback] Error:', error);
    return res.redirect('/?error=auth_error');
  }
}
