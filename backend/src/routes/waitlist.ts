import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

const EmailSchema = z.object({
  email: z.string().email().max(254),
});

export const waitlistRouter = Router();

waitlistRouter.post('/', requireApiKey, async (req, res) => {
  const result = EmailSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Valid email address required' });
    return;
  }

  try {
    await prisma.waitlistEntry.create({ data: { email: result.data.email } });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const count = await prisma.waitlistEntry.count();
      res.status(409).json({ error: 'Already on the waitlist', count });
      return;
    }
    console.error('[loglens] waitlist error:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  const count = await prisma.waitlistEntry.count();
  res.json({ ok: true, count });
});

waitlistRouter.get('/count', requireApiKey, async (_req, res) => {
  const count = await prisma.waitlistEntry.count();
  res.json({ count });
});
