import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

const LogPayloadSchema = z.object({
  timestamp:     z.string().datetime({ message: 'timestamp must be an ISO 8601 datetime' }),
  model:         z.string().min(1).max(100),
  prompt:        z.string().max(500_000),
  completion:    z.string().max(100_000),
  latency_ms:    z.number().int().nonnegative(),
  tokens_used:   z.number().int().nonnegative(),
  input_tokens:  z.number().int().nonnegative().optional(),
  output_tokens: z.number().int().nonnegative().optional(),
  cost_usd:      z.number().nonnegative(),
  project_id:    z.string().max(100).optional(),
  user_id:       z.string().max(100).optional(),
  session_id:    z.string().max(100).optional(),
  tags:          z.array(z.string().max(50)).max(20).optional(),
});

export const ingestRouter = Router();

ingestRouter.post('/', requireApiKey, async (req, res) => {
  const result = LogPayloadSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid payload',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  const d = result.data;

  try {
    await prisma.log.create({
      data: {
        timestamp:     new Date(d.timestamp),
        model:         d.model,
        prompt:        d.prompt,
        completion:    d.completion,
        latency_ms:    d.latency_ms,
        tokens_used:   d.tokens_used,
        input_tokens:  d.input_tokens  ?? null,
        output_tokens: d.output_tokens ?? null,
        cost_usd:      d.cost_usd,
        project_id:    d.project_id    ?? null,
        user_id:       d.user_id       ?? null,
        session_id:    d.session_id    ?? null,
        tags:          d.tags          ?? [],
      },
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[loglens] DB write error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
