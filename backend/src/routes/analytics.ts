import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.post('/visit', requireApiKey, async (req, res) => {
  const page = String(req.body?.page ?? '/').slice(0, 200);
  try {
    await prisma.pageVisit.create({ data: { page } });
    const total = await prisma.pageVisit.count({ where: { page } });
    res.json({ total });
  } catch (err) {
    console.error('[loglens] analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

analyticsRouter.get('/count', requireApiKey, async (req, res) => {
  const page = String(req.query.page ?? '/');
  const total = await prisma.pageVisit.count({ where: { page } });
  res.json({ total });
});
