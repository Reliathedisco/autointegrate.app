import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check for now
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({ ok: true, server: 'AutoIntegrate', timestamp: Date.now() });
  }
  
  return res.status(404).json({ error: 'Not found' });
}
