import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireApiKey } from '../middleware/auth';

export const statsRouter = Router();

function changePct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

statsRouter.get('/overview', requireApiKey, async (req, res) => {
  const days = Math.min(parseInt(String(req.query.days ?? 30), 10) || 30, 90);
  const now = new Date();
  const currentStart  = new Date(now.getTime() - days * 86_400_000);
  const previousStart = new Date(currentStart.getTime() - days * 86_400_000);
  const ownerId = req.headers['x-clerk-user-id'] as string | undefined;

  const ownerFilter = ownerId ? { owner_id: ownerId } : {};

  try {
    type DailyRow = {
      date: string;
      requests: unknown;
      cost: unknown;
      tokens: unknown;
      avg_latency: unknown;
    };

    const dailyRows = ownerId
      ? await prisma.$queryRaw<DailyRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('day', timestamp), 'YYYY-MM-DD') AS date,
            COUNT(*)::int                                        AS requests,
            COALESCE(SUM(cost_usd),      0)                     AS cost,
            COALESCE(SUM(tokens_used)::int, 0)                  AS tokens,
            COALESCE(AVG(latency_ms)::int, 0)                   AS avg_latency
          FROM logs
          WHERE timestamp >= ${currentStart} AND owner_id = ${ownerId}
          GROUP BY DATE_TRUNC('day', timestamp)
          ORDER BY DATE_TRUNC('day', timestamp) ASC
        `
      : await prisma.$queryRaw<DailyRow[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('day', timestamp), 'YYYY-MM-DD') AS date,
            COUNT(*)::int                                        AS requests,
            COALESCE(SUM(cost_usd),      0)                     AS cost,
            COALESCE(SUM(tokens_used)::int, 0)                  AS tokens,
            COALESCE(AVG(latency_ms)::int, 0)                   AS avg_latency
          FROM logs
          WHERE timestamp >= ${currentStart}
          GROUP BY DATE_TRUNC('day', timestamp)
          ORDER BY DATE_TRUNC('day', timestamp) ASC
        `;

    const [currentAgg, previousAgg, modelGroups, recentLogs] = await Promise.all([
      prisma.log.aggregate({
        where: { timestamp: { gte: currentStart }, ...ownerFilter },
        _count: { id: true },
        _sum:   { cost_usd: true, tokens_used: true },
        _avg:   { latency_ms: true },
      }),
      prisma.log.aggregate({
        where: { timestamp: { gte: previousStart, lt: currentStart }, ...ownerFilter },
        _count: { id: true },
        _sum:   { cost_usd: true, tokens_used: true },
        _avg:   { latency_ms: true },
      }),
      prisma.log.groupBy({
        by: ['model'],
        where: { timestamp: { gte: currentStart }, ...ownerFilter },
        _count: { id: true },
        _sum:   { cost_usd: true, tokens_used: true },
        _avg:   { latency_ms: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.log.findMany({
        where:   { timestamp: { gte: currentStart }, ...ownerFilter },
        orderBy: { timestamp: 'desc' },
        take: 6,
      }),
    ]);

    const curReqs  = currentAgg._count.id;
    const prevReqs = previousAgg._count.id;
    const curCost  = currentAgg._sum.cost_usd    ?? 0;
    const prevCost = previousAgg._sum.cost_usd   ?? 0;
    const curLat   = currentAgg._avg.latency_ms  ?? 0;
    const prevLat  = previousAgg._avg.latency_ms ?? 0;
    const curTok   = currentAgg._sum.tokens_used ?? 0;
    const prevTok  = previousAgg._sum.tokens_used ?? 0;

    res.json({
      total_requests:    curReqs,
      total_cost:        curCost,
      avg_latency_ms:    Math.round(curLat),
      total_tokens:      curTok,
      request_change_pct: changePct(curReqs, prevReqs),
      cost_change_pct:    changePct(curCost, prevCost),
      latency_change_pct: changePct(curLat, prevLat),
      token_change_pct:   changePct(curTok, prevTok),
      daily_stats: dailyRows.map(r => ({
        date:        String(r.date),
        requests:    Number(r.requests),
        cost:        Number(r.cost),
        tokens:      Number(r.tokens),
        avg_latency: Number(r.avg_latency),
      })),
      model_stats: modelGroups.map(g => ({
        model:       g.model,
        requests:    g._count.id,
        tokens:      g._sum.tokens_used ?? 0,
        cost:        g._sum.cost_usd    ?? 0,
        avg_latency: Math.round(g._avg.latency_ms ?? 0),
      })),
      recent_logs: recentLogs,
    });
  } catch (err) {
    console.error('[loglens] stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
