import { fetchOverviewStats } from '@/lib/api';
import { StatsGrid } from '@/components/overview/stats-grid';
import { RequestsChart } from '@/components/overview/requests-chart';
import { ModelBreakdown } from '@/components/overview/model-breakdown';
import { RecentTable } from '@/components/overview/recent-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic'; // never cache — always fresh metrics

export default async function OverviewPage() {
  const stats = await fetchOverviewStats(30);

  return (
    <div className="min-h-full">
      <div className="border-b border-zinc-800/60 px-8 py-5">
        <h1 className="text-base font-semibold text-zinc-100">Overview</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Last 30 days · Live data</p>
      </div>

      <div className="space-y-6 p-8">
        <StatsGrid stats={stats} />

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between pb-1">
                <CardTitle>Requests over time</CardTitle>
                <span className="text-[11px] text-zinc-600">Daily · last 30 days</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <RequestsChart data={stats?.daily_stats ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model usage</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ModelBreakdown stats={stats?.model_stats ?? []} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between pb-1">
              <CardTitle>Recent requests</CardTitle>
              <span className="text-[11px] text-zinc-600">Latest 6 entries</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <RecentTable logs={stats?.recent_logs ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
