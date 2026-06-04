import { createHash, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Hash both sides before comparing so timingSafeEqual always gets equal-length buffers,
// which also prevents length-based timing leaks on the raw key.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const provided = auth.slice(7).trim();
  const expected = process.env.API_KEY!; // guaranteed set by startup check in index.ts

  if (!safeEqual(provided, expected)) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
}
