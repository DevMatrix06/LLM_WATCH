import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

const SettingsSchema = z.object({
  alert_email:    z.string().email().max(254).nullable().optional(),
  cost_alert_usd: z.number().positive().nullable().optional(),
  retention_days: z.union([z.literal(7), z.literal(30), z.literal(90)]).nullable().optional(),
});

export const settingsRouter = Router();

settingsRouter.get('/', requireApiKey, async (_req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json(settings ?? { id: 1, alert_email: null, cost_alert_usd: null, retention_days: null });
  } catch (err) {
    console.error('[loglens] settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

settingsRouter.put('/', requireApiKey, async (req, res) => {
  const result = SettingsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid payload', details: result.error.flatten() });
    return;
  }
  try {
    const settings = await prisma.settings.upsert({
      where:  { id: 1 },
      update: result.data,
      create: { id: 1, ...result.data },
    });
    res.json(settings);
  } catch (err) {
    console.error('[loglens] settings update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
