import { Router } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

export const userRouter = Router();

// POST /api/user/init — idempotent; creates user+key on first call, returns existing on subsequent calls.
// Called by the dashboard after Clerk sign-in. Auth: service key + X-Clerk-User-Id header.
userRouter.post('/init', requireApiKey, async (req, res) => {
  const clerkUserId = req.headers['x-clerk-user-id'] as string | undefined;

  if (!clerkUserId) {
    res.status(400).json({ error: 'X-Clerk-User-Id header required' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { clerk_user_id: clerkUserId } });

    if (existing) {
      res.json({ api_key: existing.api_key });
      return;
    }

    const apiKey = `lw_live_${randomBytes(20).toString('hex')}`;
    const user = await prisma.user.create({
      data: { clerk_user_id: clerkUserId, api_key: apiKey },
    });

    res.status(201).json({ api_key: user.api_key });
  } catch (err) {
    console.error('[loglens] user init error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
