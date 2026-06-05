import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

const QuerySchema = z.object({
  model:     z.string().optional(),
  search:    z.string().optional(),
  date_from: z.string().optional(),
  date_to:   z.string().optional(),
  limit:     z.coerce.number().int().positive().max(500).default(50),
  offset:    z.coerce.number().int().nonnegative().default(0),
});

export const logsRouter = Router();

logsRouter.get('/', requireApiKey, async (req, res) => {
  const result = QuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid query params', details: result.error.flatten() });
    return;
  }

  const { model, search, date_from, date_to, limit, offset } = result.data;

  // Build as an AND array so each condition is fully typed independently.
  const conditions: Prisma.LogWhereInput[] = [];

  if (model) {
    conditions.push({ model });
  }

  if (search) {
    conditions.push({
      OR: [
        { prompt:     { contains: search, mode: Prisma.QueryMode.insensitive } },
        { completion: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { project_id: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { user_id:    { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    });
  }

  if (date_from || date_to) {
    conditions.push({
      timestamp: {
        ...(date_from && { gte: new Date(date_from) }),
        ...(date_to   && { lte: new Date(date_to)   }),
      },
    });
  }

  const where: Prisma.LogWhereInput = conditions.length ? { AND: conditions } : {};

  try {
    const [data, total] = await Promise.all([
      prisma.log.findMany({ where, orderBy: { timestamp: 'desc' }, take: limit, skip: offset }),
      prisma.log.count({ where }),
    ]);
    res.json({ data, total, limit, offset });
  } catch (err) {
    console.error('[loglens] logs query error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
