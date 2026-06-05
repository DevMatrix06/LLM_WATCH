import cron from 'node-cron';
import { prisma } from './prisma';

export function startCronJobs(): void {
  // Runs every day at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    try {
      const settings = await prisma.settings.findUnique({ where: { id: 1 } });
      if (!settings?.retention_days) return; // null = forever, skip

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - settings.retention_days);

      const { count } = await prisma.log.deleteMany({
        where: { created_at: { lt: cutoff } },
      });

      if (count > 0) {
        console.log(`[loglens] retention: deleted ${count} logs older than ${settings.retention_days}d`);
      }
    } catch (err) {
      console.error('[loglens] retention cron error:', err);
    }
  });

  console.log('[loglens] retention cron scheduled (daily at midnight UTC)');
}
