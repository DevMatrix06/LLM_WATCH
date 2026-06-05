import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.get('/overview', requireApiKey, async (_req, res) => {
  try {
    const [totalVisits, totalSignups, signups] = await Promise.all([
      prisma.pageVisit.count({ where: { page: '/' } }),
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.findMany({
        orderBy: { created_at: 'desc' },
        select: { id: true, email: true, created_at: true },
      }),
    ]);
    res.json({ totalVisits, totalSignups, signups });
  } catch (err) {
    console.error('[loglens] admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
