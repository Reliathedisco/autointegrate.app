import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Clear auth cookie
  res.setHeader('Set-Cookie', 'auth_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  
  if (req.method === 'GET') {
    // Redirect-based logout
    return res.redirect('/');
  }
  
  return res.json({ ok: true });
}
